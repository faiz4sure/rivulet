use reqwest::header::{HeaderMap, HeaderName, HeaderValue, CONTENT_TYPE, RANGE};
use tauri::http::Response as HttpResponse;

const SCHEME: &str = "stream";

pub fn register<R: tauri::Runtime>(builder: tauri::Builder<R>) -> tauri::Builder<R> {
    let client = reqwest::Client::builder()
        .redirect(reqwest::redirect::Policy::limited(10))
        .build()
        .expect("failed to build http client");

    builder.register_asynchronous_uri_scheme_protocol(SCHEME, move |_ctx, request, responder| {
        let client = client.clone();
        tauri::async_runtime::spawn(async move {
            let response = handle_request(&client, &request).await;
            responder.respond(response);
        });
    })
}

async fn handle_request(
    client: &reqwest::Client,
    request: &tauri::http::Request<Vec<u8>>,
) -> HttpResponse<Vec<u8>> {
    let uri_string = request.uri().to_string();
    let (remote_url, b64_headers, custom_headers) = match parse_request_uri(&uri_string) {
        Some(parsed) => parsed,
        None => return error_response(400, b"invalid request uri"),
    };

    let mut headers = HeaderMap::new();
    for (key, value) in custom_headers {
        if let (Ok(name), Ok(val)) = (
            HeaderName::from_bytes(key.as_bytes()),
            HeaderValue::from_str(&value),
        ) {
            headers.insert(name, val);
        }
    }

    let is_m3u8_url = remote_url.contains(".m3u8");

    if let Some(range) = request.headers().get(RANGE) {
        let range_str = range.to_str().unwrap_or("");
        if !is_m3u8_url && range_str.starts_with("bytes=") {
            let parts: Vec<&str> = range_str["bytes=".len()..].split('-').collect();
            if parts.len() == 2 {
                let start = parts[0].parse::<u64>().unwrap_or(0);
                let end_str = parts[1];
                let max_chunk = 5 * 1024 * 1024 - 1;
                let end = if end_str.is_empty() {
                    start + max_chunk
                } else {
                    let end_val = end_str.parse::<u64>().unwrap_or(start + max_chunk);
                    if end_val >= start && end_val - start > max_chunk {
                        start + max_chunk
                    } else {
                        end_val
                    }
                };
                let new_range = format!("bytes={}-{}", start, end);
                if let Ok(new_val) = HeaderValue::from_str(&new_range) {
                    headers.insert(RANGE, new_val);
                } else {
                    headers.insert(RANGE, range.clone());
                }
            } else {
                headers.insert(RANGE, range.clone());
            }
        } else {
            headers.insert(RANGE, range.clone());
        }
    } else if !is_m3u8_url {
        if let Ok(new_val) = HeaderValue::from_str("bytes=0-5242879") {
            headers.insert(RANGE, new_val);
        }
    }

    let upstream = match client.get(&remote_url).headers(headers).send().await {
        Ok(resp) => resp,
        Err(e) => {
            eprintln!("[Stream Proxy] Upstream request failed for {}: {}", remote_url, e);
            return error_response(502, b"upstream request failed");
        }
    };

    let status = upstream.status().as_u16();

    let content_type = upstream
        .headers()
        .get(CONTENT_TYPE)
        .and_then(|v| v.to_str().ok())
        .unwrap_or("application/octet-stream")
        .to_string();

    let mut builder = HttpResponse::builder()
        .status(status)
        .header("Content-Type", &content_type)
        .header("Access-Control-Allow-Origin", "*")
        .header("Accept-Ranges", "bytes");

    for key in &["Content-Range"] {
        if let Some(val) = upstream.headers().get(*key) {
            builder = builder.header(*key, val);
        }
    }
    
    let is_m3u8 = content_type.contains("mpegurl") || remote_url.ends_with(".m3u8");
    if !is_m3u8 {
        if let Some(val) = upstream.headers().get("Content-Length") {
            builder = builder.header("Content-Length", val);
        }
    }

    let mut body = upstream.bytes().await.unwrap_or_default().to_vec();

    if is_m3u8 {
        body = rewrite_m3u8(&body, &remote_url, &b64_headers);
    }

    builder.body(body).unwrap_or_else(|e| {
        eprintln!("[Stream Proxy] Failed to build response body: {}", e);
        error_response(500, b"response build failed")
    })
}

fn parse_request_uri(uri: &str) -> Option<(String, String, Vec<(String, String)>)> {
    let stripped = uri
        .strip_prefix(&format!("{SCHEME}://localhost/"))
        .or_else(|| uri.strip_prefix(&format!("{SCHEME}://")))?;

    let (b64_headers, remote_url) = match stripped.find('/') {
        Some(idx) => (&stripped[..idx], &stripped[idx + 1..]),
        None => return None,
    };

    let mut headers = Vec::new();
    if !b64_headers.is_empty() && b64_headers != "e30" {
        let b64 = b64_headers.replace('-', "+").replace('_', "/");
        use base64::Engine;
        if let Ok(decoded) = base64::engine::general_purpose::STANDARD.decode(b64.as_bytes()) {
            if let Ok(json_str) = String::from_utf8(decoded) {
                if let Ok(parsed) = serde_json::from_str::<serde_json::Value>(&json_str) {
                    if let Some(obj) = parsed.as_object() {
                        for (k, v) in obj {
                            if let Some(v_str) = v.as_str() {
                                headers.push((k.clone(), v_str.to_string()));
                            }
                        }
                    }
                }
            }
        }
    }

    let final_url = if remote_url.starts_with("http://") || remote_url.starts_with("https://") {
        remote_url.to_string()
    } else {
        format!("https://{remote_url}")
    };

    Some((final_url, b64_headers.to_string(), headers))
}

fn percent_decode(input: &str) -> String {
    percent_encoding::percent_decode_str(input)
        .decode_utf8_lossy()
        .into_owned()
}

fn error_response(status: u16, body: &[u8]) -> HttpResponse<Vec<u8>> {
    HttpResponse::builder()
        .status(status)
        .header("Content-Type", "text/plain")
        .header("Access-Control-Allow-Origin", "*")
        .body(body.to_vec())
        .unwrap()
}

fn rewrite_m3u8(body: &[u8], remote_url: &str, b64_headers: &str) -> Vec<u8> {
    let text = match String::from_utf8(body.to_vec()) {
        Ok(t) => t,
        Err(_) => return body.to_vec(),
    };

    let base_url = match remote_url.rfind('/') {
        Some(idx) => &remote_url[..=idx],
        None => remote_url,
    };

    let mut output = String::new();
    for line in text.lines() {
        let trimmed = line.trim();
        if trimmed.is_empty() {
            output.push('\n');
        } else if trimmed.starts_with('#') {
            output.push_str(&rewrite_uri_attr(trimmed, base_url, remote_url, b64_headers));
            output.push('\n');
        } else {
            let absolute = resolve_url(trimmed, base_url, remote_url);
            output.push_str(&to_proxy_url(&absolute, b64_headers));
            output.push('\n');
        }
    }

    output.into_bytes()
}

fn rewrite_uri_attr(line: &str, base_url: &str, remote_url: &str, b64_headers: &str) -> String {
    let start = match line.find("URI=\"") {
        Some(pos) => pos,
        None => return line.to_string(),
    };

    let url_begin = start + 5;
    let rest = &line[url_begin..];
    let url_end = match rest.find('"') {
        Some(pos) => pos,
        None => return line.to_string(),
    };

    let url = &rest[..url_end];
    let absolute = resolve_url(url, base_url, remote_url);
    let proxy = to_proxy_url(&absolute, b64_headers);

    format!("{}URI=\"{}\"{}", &line[..start], proxy, &rest[url_end + 1..])
}

fn resolve_url(url: &str, base_url: &str, remote_url: &str) -> String {
    if url.starts_with("http://") || url.starts_with("https://") {
        url.to_string()
    } else if url.starts_with('/') {
        let root = remote_url
            .find("://")
            .and_then(|i| remote_url[i + 3..].find('/').map(|j| &remote_url[..i + 3 + j]))
            .unwrap_or(remote_url);
        format!("{}{}", root, url)
    } else {
        format!("{}{}", base_url, url)
    }
}

fn to_proxy_url(absolute_url: &str, b64_headers: &str) -> String {
    format!("{}://localhost/{}/{}", SCHEME, b64_headers, absolute_url)
}

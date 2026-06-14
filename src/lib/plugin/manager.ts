import { appDataDir, join } from "@tauri-apps/api/path";
import {
  exists,
  mkdir,
  writeFile,
  readTextFile,
  remove,
  BaseDirectory,
} from "@tauri-apps/plugin-fs";
import { invoke } from "@tauri-apps/api/core";
import { listen, UnlistenFn } from "@tauri-apps/api/event";

import type {
  PluginManifest,
  PluginProviderMeta,
  InstalledPlugin,
  InstallStep,
  InstallProgress,
} from "./types";

export type {
  PluginManifest,
  PluginProviderMeta,
  InstalledPlugin,
  InstallStep,
  InstallProgress,
};

const PLUGINS_DIR = "plugins";
const INSTALLED_FILE = "plugins/installed.json";

async function ensurePluginsDir(): Promise<void> {
  const dirExists = await exists(PLUGINS_DIR, {
    baseDir: BaseDirectory.AppData,
  });
  if (!dirExists) {
    await mkdir(PLUGINS_DIR, {
      baseDir: BaseDirectory.AppData,
      recursive: true,
    });
  }
}

async function readInstalledJson(): Promise<InstalledPlugin[]> {
  try {
    const fileExists = await exists(INSTALLED_FILE, {
      baseDir: BaseDirectory.AppData,
    });
    if (!fileExists) return [];
    const content = await readTextFile(INSTALLED_FILE, {
      baseDir: BaseDirectory.AppData,
    });
    return JSON.parse(content);
  } catch {
    return [];
  }
}

async function writeInstalledJson(plugins: InstalledPlugin[]): Promise<void> {
  const data = new TextEncoder().encode(JSON.stringify(plugins, null, 2));
  await writeFile(INSTALLED_FILE, data, {
    baseDir: BaseDirectory.AppData,
  });
}

function parseGitHubUrl(manifestUrl: string): {
  owner: string;
  repo: string;
  branch: string;
} {
  const url = new URL(manifestUrl);
  const parts = url.pathname.split("/").filter(Boolean);

  if (
    url.hostname !== "raw.githubusercontent.com" ||
    parts.length < 4 ||
    !parts[parts.length - 1].endsWith(".json")
  ) {
    throw new Error(
      "Invalid manifest URL. Expected a raw.githubusercontent.com URL pointing to manifest.json"
    );
  }

  return {
    owner: parts[0],
    repo: parts[1],
    branch: parts[2],
  };
}

function buildZipUrl(owner: string, repo: string, branch: string): string {
  return `https://github.com/${owner}/${repo}/archive/refs/heads/${branch}.zip`;
}


export async function getInstalledPlugins(): Promise<InstalledPlugin[]> {
  await ensurePluginsDir();
  return readInstalledJson();
}


export async function getPluginEntryPath(
  plugin: InstalledPlugin
): Promise<string> {
  const base = await appDataDir();
  return await join(base, PLUGINS_DIR, plugin.id, plugin.entry);
}


export async function getPluginDir(pluginId: string): Promise<string> {
  const base = await appDataDir();
  return await join(base, PLUGINS_DIR, pluginId);
}


export async function resolveManifest(
  manifestUrl: string
): Promise<PluginManifest> {
  parseGitHubUrl(manifestUrl);

  const bytes: number[] = await invoke("download_bytes", { url: manifestUrl });
  const text = new TextDecoder().decode(new Uint8Array(bytes));
  const manifest: PluginManifest = JSON.parse(text);

  if (!manifest.id || !manifest.name || !manifest.entry) {
    throw new Error(
      "Invalid manifest: missing required fields (id, name, entry)"
    );
  }
  if (
    !manifest.providers ||
    !Array.isArray(manifest.providers) ||
    manifest.providers.length === 0
  ) {
    throw new Error("Invalid manifest: must contain at least one provider");
  }

  return manifest;
}


export async function installPlugin(
  manifestUrl: string,
  onProgress: (progress: InstallProgress) => void
): Promise<InstalledPlugin> {
  try {
    onProgress({ step: "resolving", message: "Resolving manifest..." });
    const manifest = await resolveManifest(manifestUrl);

    const installed = await getInstalledPlugins();
    const existing = installed.find((p) => p.id === manifest.id);
    if (existing) {
      throw new Error(
        `Plugin "${manifest.name}" is already installed (v${existing.version})`
      );
    }

    onProgress({
      step: "validated",
      message: `Found "${manifest.name}" with ${manifest.providers.length} provider(s)`,
      pluginName: manifest.name,
      providerCount: manifest.providers.length,
    });

    await new Promise((r) => setTimeout(r, 800));

    const { owner, repo, branch } = parseGitHubUrl(manifestUrl);
    const zipUrl = buildZipUrl(owner, repo, branch);

    let unlisten: UnlistenFn | null = null;
    try {
      unlisten = await listen<InstallProgress>("install-status", (event) => {
        onProgress(event.payload);
      });

      await invoke("install_plugin_bundle", {
        manifestId: manifest.id,
        downloadUrl: zipUrl,
        entry: manifest.entry,
      });
    } finally {
      if (unlisten) unlisten();
    }

    const pluginRecord: InstalledPlugin = {
      id: manifest.id,
      name: manifest.name,
      version: manifest.version,
      author: manifest.author,
      description: manifest.description,
      entry: manifest.entry,
      installedAt: new Date().toISOString(),
      source: manifestUrl,
      providers: manifest.providers.map((p) => ({ ...p, enabled: true })),
    };

    const currentPlugins = await readInstalledJson();
    currentPlugins.push(pluginRecord);
    await writeInstalledJson(currentPlugins);

    onProgress({
      step: "ready",
      message: `"${manifest.name}" installed successfully!`,
      pluginName: manifest.name,
      providerCount: manifest.providers.length,
    });

    return pluginRecord;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    onProgress({
      step: "error",
      message: `Installation failed: ${message}`,
      error: message,
    });
    throw err;
  }
}


export async function removePlugin(pluginId: string): Promise<void> {
  const pluginDir = `${PLUGINS_DIR}/${pluginId}`;
  const dirExists = await exists(pluginDir, {
    baseDir: BaseDirectory.AppData,
  });
  if (dirExists) {
    await remove(pluginDir, {
      baseDir: BaseDirectory.AppData,
      recursive: true,
    });
  }

  const plugins = await readInstalledJson();
  const filtered = plugins.filter((p) => p.id !== pluginId);
  await writeInstalledJson(filtered);
}


export async function toggleProvider(
  pluginId: string,
  providerId: string,
  enabled: boolean
): Promise<void> {
  const plugins = await readInstalledJson();
  const plugin = plugins.find((p) => p.id === pluginId);
  if (!plugin) throw new Error(`Plugin ${pluginId} not found`);

  const provider = plugin.providers.find((p) => p.id === providerId);
  if (!provider) throw new Error(`Provider ${providerId} not found`);

  provider.enabled = enabled;
  await writeInstalledJson(plugins);
}

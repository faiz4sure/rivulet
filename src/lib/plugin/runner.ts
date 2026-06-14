import { spawn, createChannel, kill, onStdout, onStderr } from "tauri-plugin-js-api";
import type { RivuletPlugin } from "./types";

export class PluginRunner {
  private static instances = new Map<string, PluginRunner>();
  
  private api: RivuletPlugin | null = null;
  private channel: any = null;
  private initPromise: Promise<RivuletPlugin> | null = null;
  private idleTimeout: ReturnType<typeof setTimeout> | null = null;
  private activeTasks = 0;

  constructor(private pluginId: string, private scriptPath: string) {
    const existing = PluginRunner.instances.get(pluginId);
    if (existing) {
      return existing;
    }
    PluginRunner.instances.set(pluginId, this);
  }

  private async getApi(): Promise<RivuletPlugin> {
    if (this.api) return this.api;
    if (this.initPromise) return this.initPromise;
    const pluginDir = this.scriptPath.substring(0, this.scriptPath.lastIndexOf("/"));
    const storageDir = `${pluginDir}/storage`;

    this.initPromise = (async () => {
      try {
        await spawn(this.pluginId, {
          sidecar: "deno",
          args: [
            "run", 
            "--node-modules-dir=auto",
            "--allow-net", 
            `--allow-read=${pluginDir}`, 
            `--allow-write=${storageDir}`, 
            this.scriptPath
          ]
        });
      } catch (err) {
        if (!String(err).includes("process already exists")) {
          throw err;
        }
      }

      onStdout(this.pluginId, (line) => console.log(`[Deno: ${this.pluginId}] ${line}`));
      onStderr(this.pluginId, (line) => console.error(`[Deno ERROR: ${this.pluginId}] ${line}`));

      const { api, channel } = await createChannel<Record<string, never>, RivuletPlugin>(this.pluginId);
      this.api = api;
      this.channel = channel;
      return api;
    })();

    return this.initPromise;
  }

  private async execute<T>(action: (api: RivuletPlugin) => Promise<T>): Promise<T> {
    const api = await this.getApi();
    
    this.activeTasks++;
    if (this.idleTimeout) {
      clearTimeout(this.idleTimeout);
      this.idleTimeout = null;
    }
    
    try {
      const result = await action(api);
      return result;
    } catch (err) {
      console.error(`[PluginRunner] RPC Execution failed for ${this.pluginId}, forcing cleanup.`, err);
      await this.destroy();
      throw err;
    } finally {
      this.activeTasks--;
      if (this.activeTasks < 0) this.activeTasks = 0;
      
      if (this.activeTasks === 0 && this.api) {
        this.idleTimeout = setTimeout(() => {
          console.log(`[PluginRunner] Idle timeout reached for ${this.pluginId}, killing process safely.`);
          this.destroy();
        }, 2000);
      }
    }
  }

  async destroy() {
    if (this.idleTimeout) {
      clearTimeout(this.idleTimeout);
      this.idleTimeout = null;
    }
    this.activeTasks = 0;
    if (this.channel) {
      this.channel.destroy();
      this.channel = null;
    }
    this.api = null;
    this.initPromise = null;
    await kill(this.pluginId).catch(() => {});
  }

  getProviders() {
    return this.execute(api => api.getProviders());
  }

  getHomePage(provider: string, page: number, request?: any) {
    return this.execute(api => api.getHomePage(provider, page, request));
  }

  search(provider: string, query: string, page?: number) {
    return this.execute(api => api.search(provider, query, page));
  }

  load(provider: string, url: string) {
    return this.execute(api => api.load(provider, url));
  }

  loadLinks(provider: string, data: string) {
    return this.execute(api => api.loadLinks(provider, data));
  }
}

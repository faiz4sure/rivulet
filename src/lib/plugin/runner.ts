import { spawn, createChannel, kill, onStdout, onStderr } from "tauri-plugin-js-api";
import type { RivuletPlugin } from "./types";

export class PluginRunner {
  private static instances = new Map<string, PluginRunner>();
  
  private api: RivuletPlugin | null = null;
  private channel: any = null;
  private initPromise: Promise<RivuletPlugin> | null = null;

  constructor(private pluginId: string, private scriptPath: string) {
    const existing = PluginRunner.instances.get(pluginId);
    if (existing) {
      return existing;
    }
    PluginRunner.instances.set(pluginId, this);
  }

  async installDependencies(): Promise<void> {
    await spawn(`${this.pluginId}-install`, {
      sidecar: "deno",
      args: ["cache", "--node-modules-dir=auto", this.scriptPath]
    }).catch(err => {
      if (!String(err).includes("process already exists")) throw err;
    });
  }

  private async getApi(): Promise<RivuletPlugin> {
    if (this.api) return this.api;
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      try {
        await spawn(this.pluginId, {
          sidecar: "deno",
          args: [
            "run", 
            "--node-modules-dir=auto",
            "--allow-net", 
            "--allow-read=../dummy/storage", 
            "--allow-write=../dummy/storage", 
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
    return action(api);
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

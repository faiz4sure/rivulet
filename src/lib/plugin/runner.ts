import { spawn, createChannel, kill, onStdout, onStderr } from "tauri-plugin-js-api";
import type { RivuletExtension } from "./types";

export class PluginRunner {
  constructor(private pluginId: string, private scriptPath: string) {}

  async installDependencies(): Promise<void> {
    await spawn(`${this.pluginId}-install`, {
      sidecar: "deno",
      args: ["cache", "--node-modules-dir=auto", this.scriptPath]
    });
  }

  private async execute<T>(action: (api: RivuletExtension) => Promise<T>): Promise<T> {
    try {
      await spawn(this.pluginId, {
        sidecar: "deno",
        args: [
          "run", 
          "--node-modules-dir=auto",
          "--allow-net", 
          "--allow-read=dummy/storage/", 
          "--allow-write=dummy/storage/", 
          this.scriptPath
        ]
      });

      onStdout(this.pluginId, (line) => console.log(`[Deno: ${this.pluginId}] ${line}`));
      onStderr(this.pluginId, (line) => console.error(`[Deno ERROR: ${this.pluginId}] ${line}`));

      const { api, channel } = await createChannel<Record<string, never>, RivuletExtension>(this.pluginId);

      const result = await action(api);

      channel.destroy();

      return result;
    } finally {
      await kill(this.pluginId).catch(() => {});
    }
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

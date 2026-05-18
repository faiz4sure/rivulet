import { spawn, createChannel, kill } from "tauri-plugin-js-api";
import type { RivuletExtension } from "./types";

export class PluginRunner {
  constructor(private pluginId: string, private scriptPath: string) {}

  private async execute<T>(action: (api: RivuletExtension) => Promise<T>): Promise<T> {
    try {
      await spawn(this.pluginId, {
        sidecar: "deno",
        args: ["run", "--allow-all", this.scriptPath]
      });

      const { api, channel } = await createChannel<Record<string, never>, RivuletExtension>(this.pluginId);

      const result = await action(api);

      channel.destroy();

      return result;
    } finally {
      await kill(this.pluginId).catch(() => {});
    }
  }

  getHomePage(page: number, request?: any) {
    return this.execute(api => api.getHomePage(page, request));
  }

  search(query: string, page?: number) {
    return this.execute(api => api.search(query, page));
  }

  load(url: string) {
    return this.execute(api => api.load(url));
  }

  loadLinks(data: string) {
    return this.execute(api => api.loadLinks(data));
  }
}

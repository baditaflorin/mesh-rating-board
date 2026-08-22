import { createMeshConfig } from "@baditaflorin/mesh-common";

export const config = createMeshConfig({
  appName: "mesh-rating-board",
  description: "A shared five-star room temperature check.",
  accentHex: "#d97706",
  version: __APP_VERSION__,
  commit: __GIT_COMMIT__,
});

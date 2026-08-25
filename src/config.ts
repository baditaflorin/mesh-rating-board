import { createMeshConfig } from "@baditaflorin/mesh-common";

export const config = createMeshConfig({
  appName: "mesh-rating-board",
  displayName: "Room Pulse",
  visualProfile: "utility",
  shellLayout: "inset",
  description: "A shared, one-tap signal for reading the room together.",
  accentHex: "#d97706",
  version: __APP_VERSION__,
  commit: __GIT_COMMIT__,
});

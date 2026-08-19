export const logger = Object.freeze({
  info(message) {
    console.info(`[MeshDrop] ${message}`);
  },
  error(message) {
    console.error(`[MeshDrop] ${message}`);
  }
});


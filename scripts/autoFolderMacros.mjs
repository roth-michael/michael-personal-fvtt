export function initialize() {
  function toFolder(doc) {
    if (game.user.isGM) return;
    const folder = game.macros.folders.getName("zzPlayers");
    if (folder) doc.updateSource({ folder });
  }
  Hooks.on("preCreateMacro", toFolder);
}
const hoverMap = {};
export function initialize() {
  Hooks.on('hoverToken', (hoveredToken, hovering) => {
    if (!hovering) {
      let textElem = hoverMap[hoveredToken.id];
      if (textElem) {
        hoveredToken.removeChild(textElem);
        delete hoverMap[hoveredToken.id];
      }
      return;
    }
    let controlledToken = canvas.tokens.controlled[0];
    if (!controlledToken) return;
    if (hoveredToken === controlledToken) return;
    let distance = canvas.grid.measurePath([controlledToken.document, hoveredToken.document]).distance;
    distance = `${distance.toFixed(2)} ${canvas.grid.units}`;
    let textElem = new foundry.canvas.containers.PreciseText(distance, CONFIG.canvasTextStyle);
    textElem.anchor.x = 0.5;
    textElem.anchor.y = 1;
    textElem.x = hoveredToken.document.width * canvas.grid.size / 2;
    if (hoveredToken.document.elevation !== 0) {
      textElem.y = -20;
    }
    hoverMap[hoveredToken.id] = textElem;
    hoveredToken.addChild(textElem);
  });
}
export function initialize(newStatus) {
  const shouldEnable = newStatus ?? game.settings.get("michaelPersonal", "noHighlightHitMiss");
  if (shouldEnable) {
    const el = document.createElement("style");
    el.id = "michael-no-highlight-hit-miss";
    el.innerText = `
      .dice-total.success {
        background: var(--dnd5e-background-5);
        color: black;
      }
  
      .dice-total.failure {
        background: var(--dnd5e-background-5);
        color: black;
      }
    `;
    document.head.appendChild(el);
  } else {
    const el = document.querySelector("#michael-no-highlight-hit-miss");
    if (el) el.remove();
  }
}
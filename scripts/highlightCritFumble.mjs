export function initialize(newStatus) {
  const shouldEnable = newStatus ?? game.settings.get("michaelPersonal", "highlightCritFumble");
  if (shouldEnable) {
    const el = document.createElement("style");
    el.id = "michael-highlight-crit-fumble";
    el.innerText = `
      div.dice-result:has(.d20.max:not(.rerolled, .discarded)) > .dice-total {
      background: var(--dnd5e-color-success-background);
      border: 1px solid var(--dnd5e-color-success);
      color: var(--dnd5e-color-success-critical);
    }
    div.dice-result:has(.d20.min:not(.rerolled, .discarded)) > .dice-total {
      background: var(--dnd5e-color-failure-background);
      border: 1px solid var(--dnd5e-color-failure);
      color: var(--dnd5e-color-failure-critical);
    }
    `;
    document.head.appendChild(el);
  } else {
    const el = document.querySelector("#michael-highlight-crit-fumble");
    if (el) el.remove();
  }
}
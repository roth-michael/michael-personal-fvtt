class CustomTokenHUD extends foundry.applications.hud.TokenHUD {
  static PARTS = {
    hud: {
      root: true,
      template: 'modules/michaelPersonal/templates/token-hud.hbs'
    }
  };

  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    if (context.statusEffects?.coverThreeQuarters) {
      context.statusEffects.coverThreeQuarters.title = "¾ Cover"
    }
    return context;
  }
}

export function initialize() {
  CONFIG.Token.hudClass = CustomTokenHUD;
  const el = document.createElement("style");
  el.id = "michael-custom-hud-style";
  el.innerText = `
    #token-hud .status-effects {
      --effect-size: 48px;

      grid-template-columns: repeat(2, 200px);

      .effect-control {
        display: flex;
        width: auto;
      }

      p {
        margin-left: 5px;
        font-size: x-large;
      }
    }
  `;
  document.head.appendChild(el);
}
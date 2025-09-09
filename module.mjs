import * as hoverDistance from "./scripts/hoverDistance.mjs";
// import * as elevationRegion from "./scripts/elevationRegion.mjs";
import * as tokenHUD from "./scripts/tokenHUD.mjs";
import * as gestalt from "./scripts/gestalt.mjs";
import * as optionalBonuses from "./scripts/optionalBonuses.mjs";
import * as masteries from "./scripts/masteries.mjs";
import * as noHighlightHitMiss from "./scripts/noHighlightHitMiss.mjs";
import * as highlightCritFumble from "./scripts/highlightCritFumble.mjs";
import * as queries from "./scripts/queries.mjs";
import * as autoFolderMacros from "./scripts/autoFolderMacros.mjs";

// Settings for each uh, thing
Hooks.on("init", () => {
  queries.initialize();
  const is5e = game.system.id === "dnd5e";
  const settings = {
    useHoverDistance: {
      requirement: () => true,
      config: {
        name: "Use Hover Distance",
        hint: "Shows distance between selected & hovered token.",
        scope: "world",
        config: true,
        type: Boolean,
        default: false,
        requiresReload: true
      },
      importedClass: hoverDistance
    },
    // useElevationRegion: {
    //   requirement: () => true,
    //   config: {
    //     name: "Use Elevation Region",
    //     hint: "Creates a region behavior for changing elevation on enter/exit.",
    //     scope: "world",
    //     config: true,
    //     type: Boolean,
    //     default: false,
    //     requiresReload: true
    //   },
    //   importedClass: elevationRegion
    // },
    useTokenHUD: {
      requirement: () => true,
      config: {
        name: "Use Custom Token HUD",
        hint: "Increases size of status effects, shows effect name beside them.",
        scope: "world",
        config: true,
        type: Boolean,
        default: false,
        requiresReload: true
      },
      importedClass: tokenHUD
    },
    gestalt: {
      requirement: () => is5e,
      config: {
        name: "Use Gestalt Rules",
        hint: "Implements Gestalt rules for overall level, hit dice, and spell slots.",
        scope: "world",
        config: is5e,
        type: Boolean,
        default: false,
        requiresReload: true
      },
      importedClass: gestalt
    },
    optionalBonuses: {
      requirement: () => is5e,
      config: {
        name: "Use Optional Bonuses",
        hint: "Has custom handling for things like sneak attack, dreadful strike, etc.",
        scope: "world",
        config: is5e,
        type: Boolean,
        default: false,
        requiresReload: true
      },
      importedClass: optionalBonuses
    },
    masteries: {
      requirement: () => is5e,
      config: {
        name: "Use Mastery Automation",
        hint: "Has custom handling for Graze and Topple, and for Vex, Sap, and Slow (the first three of which require AC5e, the final two an active GM).",
        scope: "world",
        config: is5e,
        type: Boolean,
        default: false,
        requiresReload: true
      },
      importedClass: masteries
    },
    noHighlightHitMiss: {
      requirement: () => is5e,
      config: {
        name: "Don't Highlight Hit/Miss",
        hint: "Disable red/green highlighting of non-crit/fumble attack rolls.",
        scope: "world",
        config: is5e,
        type: Boolean,
        default: false,
        requiresReload: false,
        onChange: noHighlightHitMiss.initialize
      },
      importedClass: noHighlightHitMiss
    },
    highlightCritFumble: {
      requirement: () => is5e,
      config: {
        name: "Highlight Crit/Fumbles on non-attack rolls",
        hint: "Enable red/green highlighting on natural 20s/1s for non-attack rolls.",
        scope: "world",
        config: is5e,
        type: Boolean,
        requiresReload: false,
        onChange: highlightCritFumble.initialize
      },
      importedClass: highlightCritFumble
    },
    autoFolderMacros: {
      requirement: () => true,
      config: {
        name: "Auto-Folder macros",
        hint: "Automatically puts player-created macros into the \"zzPlayers\" folder - if it exists.",
        scope: "world",
        config: true,
        type: Boolean,
        requiresReload: true
      },
      importedClass: autoFolderMacros
    }
  };

  for (const [k, {config}] of Object.entries(settings)) {
    game.settings.register("michaelPersonal", k, config);
  }

  function getSetting(key) {
    return settings[key].requirement() && game.settings.get("michaelPersonal", key);
  }

  for (const [key, {importedClass}] of Object.entries(settings)) {
    if (getSetting(key)) importedClass.initialize();
  }
});
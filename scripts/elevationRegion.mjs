class ElevationRegionBehaviorType extends foundry.data.regionBehaviors.RegionBehaviorType {
    static LOCALIZATION_PREFIXES = ["BEHAVIOR.TYPES.base", "BEHAVIOR.TYPES.elevation"];
    static events = {
        tokenEnter: this.#onTokenEnter,
        tokenExit: this.#onTokenExit
    }
    static defineSchema() {
        return {
            startElevation: new foundry.data.fields.NumberField({required: true, blank: false, initial: 0}),
            endElevation: new foundry.data.fields.NumberField({required: true, blank: false, initial: 0})
        }
    };

    static async #onTokenEnter(event) {
        if (!event.data.token.actor.testUserPermission(game.user, CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER)) return;
        await event.data.token.update({ elevation: this.endElevation });
    }
    static async #onTokenExit(event) {
        if (!event.data.token.actor.testUserPermission(game.user, CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER)) return;
        await event.data.token.update({ elevation: this.startElevation });
    }
}

export function initialize() {
  CONFIG.RegionBehavior.dataModels["michaelPersonal.elevation"] = ElevationRegionBehaviorType;
  CONFIG.RegionBehavior.typeIcons["michaelPersonal.elevation"] = "fa-solid fa-elevator";
}
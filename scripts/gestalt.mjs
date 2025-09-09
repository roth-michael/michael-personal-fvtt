class CharacterDataGestalt extends dnd5e.dataModels.actor.CharacterData {
  prepareBaseData() {
    this.attributes.hd = new dnd5e.documents.HitDice(this.parent);
    this.details.level = 0;
    this.attributes.attunement.value = 0;

    for ( const item of this.parent.items ) {
      const canAttune = !item.system.validProperties?.has?.("mgc") || item.system.properties?.has?.("mgc");
      if ( item.system.attuned && canAttune ) this.attributes.attunement.value += 1;
      if ( item.type === "class" ) this.details.level += item.system.levels;
  }

    // THIS IS THE GESTALT LINE
    this.details.level = Math.floor(this.details.level / 2);

    this.attributes.prof = dnd5e.documents.Proficiency.calculateMod(this.details.level);

    const { xp, level } = this.details;
    xp.max = level >= CONFIG.DND5E.maxLevel ? Infinity : this.parent.getLevelExp(level || 1);
    xp.min = level ? this.parent.getLevelExp(level - 1) : 0;
    if ( Number.isFinite(xp.max) ) {
      const required = xp.max - xp.min;
      const pct = Math.round((xp.value - xp.min) * 100 / required);
      xp.pct = Math.clamp(pct, 0, 100);
    } else if ( game.settings.get("dnd5e", "levelingMode") === "xpBoons" ) {
      const overflow = xp.value - this.parent.getLevelExp(CONFIG.DND5E.maxLevel);
      xp.boonsEarned = Math.max(0, Math.floor(overflow / CONFIG.DND5E.epicBoonInterval));
      const progress = overflow - (CONFIG.DND5E.epicBoonInterval * xp.boonsEarned);
      xp.pct = Math.clamp(Math.round((progress / CONFIG.DND5E.epicBoonInterval) * 100), 0, 100);
    } else {
      xp.pct = 100;
    }

    dnd5e.dataModels.actor.AttributesFields.prepareBaseArmorClass.call(this);
    dnd5e.dataModels.actor.AttributesFields.prepareBaseEncumbrance.call(this);
  }
}

class ClassDataGestalt extends dnd5e.dataModels.item.ClassData {
  prepareFinalData() {
    super.prepareFinalData();
    if (!this.parent.actor) return;
    const maxHdSize = Math.max(...this.parent.actor.system.attributes.hd.sizes);
    const bestClass = Object.values(this.parent.actor.classes).find(i => Number(i.system.hd.denomination.slice(1)) === maxHdSize);
    if (bestClass === this.parent) return;
    this.hd.max = Math.max(0, this.hd.additional);
    this.hd.value = Math.max(this.hd.max - this.hd.spent, 0);
  }
}

export function initialize() {
  dnd5e.dataModels.actor.config.character = CharacterDataGestalt;
  dnd5e.dataModels.item.config.class = ClassDataGestalt;

  Hooks.on("dnd5e.computeLeveledProgression", (progression, actor, cls, spellcasting, count) => {
    // Stop if already did this type of caster
    if (count > 1 && progression.slot > 0) return false;
    const allProgressions = Object.values(actor.spellcastingClasses).map(i => i.spellcasting?.progression).filter(i => i);
    // Anything's better than third
    if (spellcasting.progression === "third" && allProgressions.some(i => i !== "third")) return false;
    // Otherwise go for it, unless "full" is out there
    if (spellcasting.progression !== "full" && allProgressions.includes("full")) return false;
  });
}
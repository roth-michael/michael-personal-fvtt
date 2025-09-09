function funNewConfigureDamage({ critical={} }={}) {
  critical = foundry.utils.mergeObject(critical, this.options.critical ?? {}, { inplace: false });

  // Remove previous critical bonus damage
  this.terms = this.terms.filter(t => !t.options.criticalBonusDamage && !t.options.criticalFlatBonus);

  const flatBonus = new Map();
  for ( let [i, term] of this.terms.entries() ) {
    // Multiply dice terms
    if ( term instanceof foundry.dice.terms.DiceTerm ) {
      if ( term._number instanceof Roll ) {
        // Complex number term.
        if ( !term._number.isDeterministic ) continue;
        if ( !term._number._evaluated ) term._number.evaluateSync();
      }
      term.options.baseNumber = term.options.baseNumber ?? term.number; // Reset back
      term.number = term.options.baseNumber;
      if ( this.isCritical ) {
        let cm = critical.multiplier ?? 2;

        // Powerful critical - maximize damage and reduce the multiplier by 1
        if ( critical.powerfulCritical ) {
          const bonus = Roll.create(term.formula).evaluateSync({ maximize: true }).total;
          if ( bonus > 0 ) {
            const flavor = term.flavor?.toLowerCase().trim() ?? game.i18n.localize("DND5E.PowerfulCritical");
            flatBonus.set(flavor, (flatBonus.get(flavor) ?? 0) + bonus);
          }
          cm = Math.max(1, cm-1);
        }

        // Alter the damage term
        let cb = (critical.bonusDice && (i === 0)) ? critical.bonusDice : 0;
        term.alter(cm, cb);
        term.options.critical = true;
      }
    }

    else if ( term instanceof foundry.dice.terms.NumericTerm ) {
      // Multiply numeric terms
      if ( critical.multiplyNumeric ) {
        term.options.baseNumber = term.options.baseNumber ?? term.number; // Reset back
        term.number = term.options.baseNumber;
        if ( this.isCritical ) {
          term.number *= (critical.multiplier ?? 2);
          term.options.critical = true;
        }
      }
    }

    // NEW
    else if ( term instanceof foundry.dice.terms.PoolTerm ) {
      if (!(term.rolls[0] instanceof dnd5e.dice.DamageRoll)) {
        term.rolls = term.rolls.map(i => new dnd5e.dice.DamageRoll(i.formula, this.data, this.options));
        term.rolls.forEach(i => i.configureDamage({ critical }));
        term.terms = term.rolls.map(i => i.formula);
      }
    }
    // END NEW
  }

  // Add powerful critical bonus
  if ( critical.powerfulCritical && flatBonus.size ) {
    for ( const [type, number] of flatBonus.entries() ) {
      this.terms.push(new OperatorTerm({ operator: "+", options: { criticalFlatBonus: true } }));
      this.terms.push(new NumericTerm({ number, options: { flavor: type, criticalFlatBonus: true } }));
    }
  }

  // Add extra critical damage term
  if ( this.isCritical && critical.bonusDamage ) {
    let extraTerms = new Roll(critical.bonusDamage, this.data).terms;
    if ( !(extraTerms[0] instanceof OperatorTerm) ) extraTerms.unshift(new OperatorTerm({ operator: "+" }));
    extraTerms.forEach(t => t.options.criticalBonusDamage = true);
    this.terms.push(...extraTerms);
  }

  // Re-compile the underlying formula
  this.resetFormula();

  // Mark configuration as complete
  this.options.configured = true;
}
export function initialize() {
  dnd5e.dice.DamageRoll.prototype.configureDamage = funNewConfigureDamage;
  
  Hooks.on("dnd5e.buildDamageRollConfig", (dialog, rollConfig, formData, rollIndex) => {
    if (rollIndex > 0) return;
    const opts = formData?.object ?? {};
    const usedItemIds = [];
    const actor = dialog.config.subject?.actor;
    if (!actor) return;
    if (opts.sneakAttack) {
      rollConfig.parts.push("@scale.rogue.sneak-attack");
      usedItemIds.push(actor.items.getName("Sneak Attack")?.id);
    }
    if (opts.dreadfulStrikes) {
      rollConfig.parts.push("@scale.fey.dreadful-strike[psychic]");
      usedItemIds.push(actor.items.getName("Dreadful Strikes")?.id);
    }
    if (opts.savageAttacker) {
      rollConfig.parts[0] = `{${rollConfig.parts[0]}, ${rollConfig.parts[0]}}kh`;
      usedItemIds.push(actor.items.getName("Savage Attacker"));
    }
    foundry.utils.setProperty(rollConfig, "options.michaelPersonal.usedItemIds", usedItemIds.filter(i => i));
  });

  Hooks.on("renderDamageRollConfigurationDialog", (app, elements) => {
    const activity = app.config.subject;
    const item = activity?.item;
    const actor = item?.actor;
    if (!actor) return;
    const configFieldset = elements.querySelector("fieldset");
    if (configFieldset.querySelector(".michael-inject")) return;

    let toInject = "";
    // Sneak Attack
    const sneakAttack = actor.items.getName("Sneak Attack");
    if (sneakAttack) {
      const ranged = activity.actionType === "rwak" || app.config.attackMode?.includes("thrown");
      const finesse = item.system.properties.has("fin");
      if ((ranged || finesse) && (sneakAttack.system.uses.max == 0 || sneakAttack.system.uses.value > 0)) {
        const checkbox = dnd5e.applications.fields.createCheckboxInput(null, {name: "sneakAttack"});
        toInject += `<div class="form-fields"><label>Sneak Attack</label>${checkbox.outerHTML}</div>`;
      }
    }

    // Dreadful Strikes
    const dreadfulStrikes = actor.items.getName("Dreadful Strikes");
    if (dreadfulStrikes) {
      if (item.type === "weapon") {
        if (dreadfulStrikes.system.uses.max == 0 || dreadfulStrikes.system.uses.value > 0) {
          const checkbox = dnd5e.applications.fields.createCheckboxInput(null, {name: "dreadfulStrikes"});
          toInject += `<div class="form-fields"><label>Dreadful Strikes</label>${checkbox.outerHTML}</div>`;
        }
      }
    }

    // Savage Attacker
    const savageAttacker = actor.items.getName("Savage Attacker");
    if (savageAttacker) {
      if (item.type === "weapon") {
        if (savageAttacker.system.uses.max == 0 || savageAttacker.system.uses.value > 0) {
          const checkbox = dnd5e.applications.fields.createCheckboxInput(null, {name: "savageAttacker"});
          toInject += `<div class="form-fields"><label>Savage Attacker</label>${checkbox.outerHTML}</div>`;
        }
      }
    }

    if (toInject.length) configFieldset.insertAdjacentHTML("afterbegin", `<div class="form-group michael-inject">${toInject}</div>`);
  });

  Hooks.on("dnd5e.postDamageRollConfiguration", (rolls, {subject}) => {
    const actor = subject?.actor;
    if (!actor) return;
    const usedItemIds = rolls.flatMap(i => foundry.utils.getProperty(i, "options.michaelPersonal.usedItemIds") ?? []);
    const updates = []
    for (const id of usedItemIds) {
      const item = actor.items.get(id);
      if (!item) continue;
      if (item.system.uses.max == 0) continue;
      updates.push({ _id: id, "system.uses.spent": item.system.uses.spent + 1});
    }
    actor.updateEmbeddedDocuments("Item", updates);
  });
}
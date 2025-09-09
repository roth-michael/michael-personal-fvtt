const gmQueue = new foundry.utils.Semaphore();

async function createEffects({actorUuid, effectData, options={}}) {
  await gmQueue.add(async () => {
    const actor = await fromUuid(actorUuid);
    if (!actor) return;
    return actor.createEmbeddedDocuments("ActiveEffect", effectData, options);
  });
  return true;
}

async function updateEntity({entityUuid, update, options={}}) {
  await gmQueue.add(async () => {
    const entity = await fromUuid(entityUuid);
    if (!entity) return;
    return entity.update(update, options);
  });
  return true;
}

export function initialize() {
  CONFIG.queries["michaelPersonal.createEffects"] = createEffects;
  CONFIG.queries["michaelPersonal.updateEntity"] = updateEntity;
}

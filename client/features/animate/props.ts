import { DEFAULT_ANIM_PROP } from "../../config";
import { Model, PropOptions, ePedBoneId, rotationOrders } from "../../types";
import { shouldThreadExpire } from "../../utils";

function cleanUp(model: Model) {
  // SetModelAsNoLongerNeeded(model);
  //   SetEntityAsNoLongerNeeded(entity);
}

function spawn(model: Model, options?: Partial<PropOptions>) {
  const pos = options?.pos || [1.0, 1.0, 1.0];
  const rot = options?.rot || [0.0, 0.0, 0.0];
  const propHandle = CreateObject(model, ...pos, true, true, false);

  if (options?.hasCollision) {
    SetEntityCollision(
      typeof model === "string" ? GetHashKey(model) : model,
      false,
      false
    );
  }

  AttachEntityToEntity(
    propHandle,
    PlayerPedId(),
    GetPedBoneIndex(PlayerPedId(), options?.bone || ePedBoneId.SKEL_ROOT),
    ...pos,
    ...rot,
    true,
    true,
    true,
    false,
    rotationOrders.ZXY,
    true
  );

  cleanUp(model);
  return propHandle;
}

function handleSpawn(model: Model, options?: Partial<PropOptions>) {
  return new Promise<number>(function (resolve, reject) {
    const startTime = Date.now();
    const tick = setTick(() => {
      if (HasModelLoaded(model)) {
        resolve(spawn(model, options));
        return clearTick(tick);
      }
      const elapsedTime = Date.now() - startTime;
      if (shouldThreadExpire(elapsedTime)) {
        reject(`Max execution time elapsed in handleSpawn`);
        return clearTick(tick);
      }
    });
  });
}

export function handleAttachDefaultProp() {
  return handleAttachProp(DEFAULT_ANIM_PROP, {
    bone: ePedBoneId.SKEL_R_Hand,
    pos: [0.14, 0.01, -0.02],
    rot: [110.0, 120.0, -15.0],
    hasCollision: false,
  });
}

export function handleAttachProp(model: Model, options?: Partial<PropOptions>) {
  if (!IsModelInCdimage(model))
    throw new Error(`Prop model ${model} not found`);
  RequestModel(model);
  return handleSpawn(model, options);
}

export function handleRemoveProp(propHandle: number) {
  if (!DoesEntityExist(propHandle)) return;
  DeleteEntity(propHandle);
}

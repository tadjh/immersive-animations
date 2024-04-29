import {
  Model,
  PropOptions,
  PedBoneId,
  RotationOrders,
  Vector3,
  AnimHandles,
} from "../../types";
import { shouldThreadExpire } from "../../utils";
import { debugPrint } from "../../utils/debug";
import { attachPtfx, detachPtfx } from "../particle";
import { editProp } from "./edit";

let curPos: Vector3 = { x: 1.0, y: 1.0, z: 1.0 };
let curRot: Vector3 = { x: 0.0, y: 0.0, z: 0.0 };
export let isEditingProp = false;

async function spawnProp(options: PropOptions) {
  const propHandle = CreateObject(
    options.model,
    options.pos.x,
    options.pos.y,
    options.pos.z,
    true,
    true,
    false
  );
  debugPrint(`Spawning prop ${options.model} with id ${propHandle}`);

  curPos = { ...options.pos };
  curRot = { ...options.rot };

  if (options?.hasCollision) {
    SetEntityCollision(
      typeof options.model === "string"
        ? GetHashKey(options.model)
        : options.model,
      false,
      false
    );
  }

  AttachEntityToEntity(
    propHandle,
    PlayerPedId(),
    GetPedBoneIndex(PlayerPedId(), options.bone),
    options.pos.x,
    options.pos.y,
    options.pos.z,
    options.rot.x,
    options.rot.y,
    options.rot.z,
    true,
    true,
    true,
    false,
    RotationOrders.ZXY,
    true
  );

  // TODO does this break "e c"
  SetModelAsNoLongerNeeded(options.model);

  // TODO create env flag for edit mode:
  editProp(propHandle, curPos, curRot);

  let handles = {
    prop: propHandle,
    particle: 0,
  };

  if (options.particle) {
    handles = await attachPtfx(propHandle, options.particle);
  }

  return handles;
}

export function attachProp(options: PropOptions) {
  if (!IsModelInCdimage(options.model))
    debugPrint(`Prop model ${options.model} not found`);

  RequestModel(options.model);

  return new Promise<AnimHandles>(function (resolve, reject) {
    const startTime = Date.now();
    const tick = setTick(async () => {
      if (HasModelLoaded(options.model)) {
        resolve(await spawnProp(options));
        return clearTick(tick);
      }
      const elapsedTime = Date.now() - startTime;
      if (shouldThreadExpire(elapsedTime)) {
        reject(`Max execution time elapsed in handleProp`);
        return clearTick(tick);
      }
    });
  });
}

export function detachProp(handles: AnimHandles) {
  if (DoesEntityExist(handles.prop)) {
    debugPrint(`Deleting prop with id ${handles.prop}`);

    if (handles.particle) {
      detachPtfx(handles);
    }

    DetachEntity(handles.prop, false, false);
    DeleteEntity(handles.prop);
  }

  return { prop: 0, particle: 0 };
}

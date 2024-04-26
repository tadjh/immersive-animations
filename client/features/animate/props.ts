import { DEFAULT_ANIM_PROP } from "../../config";
import { Model, PropOptions, PedBoneId, RotationOrders } from "../../types";
import { shouldThreadExpire } from "../../utils";

export let propHandle = 0;
let curPos: [number, number, number] = [1.0, 1.0, 1.0];
let curRot: [number, number, number] = [0.0, 0.0, 0.0];
let isEditing = false;

function cleanUp(model: Model) {
  // SetModelAsNoLongerNeeded(model);
  //   SetEntityAsNoLongerNeeded(entity);
}

const CONTROL_TYPE = 0;
const DELTA = 0.01;

enum INPUTS {
  // ANGLE_INIT : 243, // `~
  INPUT_SPRINT = 21, // Left Shift
  INPUT_LOOK_LR = 1, // Mouse Right
  INPUT_LOOK_UD = 2, // Mouse Down
  ANGLE_1 = 157, // 1
  ANGLE_2 = 158, // 2
  ANGLE_3 = 160, // 3
  ANGLE_4 = 164, // 4
  ANGLE_5 = 165, // 5
  ANGLE_6 = 159, // 6
  ANGLE_7 = 161, // 7
  ANGLE_8 = 162, // 8
  ANGLE_9 = 163, // 9
  FLIP_ANGLE = 26, // C
  CAMERA_LOCK = 29, // B
  PLAYER_FORWARD = 32, // W
  PLAYER_BACKWARD = 33, // S
  PLAYER_LEFT = 34, // A
  PLAYER_RIGHT = 35, // D
  LEFT_ARROW = 174, // Left Arrow
  RIGHT_ARROW = 175, // Right Arrow
  PAGE_UP = 10, // Page Up
  PAGE_DOWN = 11, // Page Down
  UP_ARROW = 172, // Up Arrow
  DOWN_ARROW = 173, // Down Arrow
  PAN_LEFT = 108, // Numpad 4
  PAN_RIGHT = 109, // Numpad 6
  ZOOM_IN = 314, // Numpad +
  ZOOM_OUT = 315, // Numpad -
  TILT_UP = 111, // Numpad 8
  TILT_DOWN = 112, // Numpad 5
  FIELD_OF_VIEW_NARROW = 117, // Numpad 7
  FIELD_OF_VIEW_WIDEN = 118, // Numpad 9
  FOCUS_POINT_IN = 39, // [
  FOCUS_POINT_OUT = 40, // ]
}

function edit() {
  let nextPos = curPos;
  let nextRot = curRot;
  let updated = false;

  const tick = setTick(() => {
    if (!isEditing) return clearTick(tick);

    if (IsControlJustPressed(CONTROL_TYPE, INPUTS.LEFT_ARROW)) {
      nextPos[0] -= DELTA;
      updated = true;
    } else if (IsControlJustPressed(CONTROL_TYPE, INPUTS.RIGHT_ARROW)) {
      nextPos[0] += DELTA;
      updated = true;
    } else if (IsControlJustPressed(CONTROL_TYPE, INPUTS.DOWN_ARROW)) {
      nextPos[1] -= DELTA;
      updated = true;
    } else if (IsControlJustPressed(CONTROL_TYPE, INPUTS.UP_ARROW)) {
      nextPos[1] += DELTA;
      updated = true;
    } else if (IsControlJustPressed(CONTROL_TYPE, INPUTS.PAGE_DOWN)) {
      nextPos[2] -= DELTA;
      updated = true;
    } else if (IsControlJustPressed(CONTROL_TYPE, INPUTS.PAGE_UP)) {
      nextPos[2] += DELTA;
      updated = true;
    }

    if (IsControlJustPressed(CONTROL_TYPE, INPUTS.ANGLE_4)) {
      nextRot[0] -= DELTA;
      updated = true;
    } else if (IsControlJustPressed(CONTROL_TYPE, INPUTS.ANGLE_6)) {
      nextRot[0] += DELTA;
      updated = true;
    } else if (IsControlJustPressed(CONTROL_TYPE, INPUTS.ANGLE_2)) {
      nextRot[1] -= DELTA;
      updated = true;
    } else if (IsControlJustPressed(CONTROL_TYPE, INPUTS.ANGLE_8)) {
      nextRot[1] += DELTA;
      updated = true;
    } else if (IsControlJustPressed(CONTROL_TYPE, INPUTS.ANGLE_7)) {
      nextRot[2] -= DELTA;
      updated = true;
    } else if (IsControlJustPressed(CONTROL_TYPE, INPUTS.ANGLE_9)) {
      nextRot[2] += DELTA;
      updated = true;
    }

    if (updated) {
      AttachEntityToEntity(
        propHandle,
        PlayerPedId(),
        GetPedBoneIndex(PlayerPedId(), PedBoneId.PH_R_Hand),
        ...nextPos,
        ...nextRot,
        true,
        true,
        true,
        false,
        RotationOrders.ZXY,
        true
      );
      console.log(...nextPos, ...nextRot);
    }
  });
}

function spawn(model: Model, options?: Partial<PropOptions>) {
  const pos = options?.pos || [1.0, 1.0, 1.0];
  const rot = options?.rot || [0.0, 0.0, 0.0];
  propHandle = CreateObject(model, ...pos, true, true, false);
  console.log(`Spawning prop ${model} with id ${propHandle}`);

  curPos = pos;
  curRot = rot;

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
    GetPedBoneIndex(PlayerPedId(), options?.bone || PedBoneId.SKEL_ROOT),
    ...pos,
    ...rot,
    true,
    true,
    true,
    false,
    RotationOrders.ZXY,
    true
  );

  cleanUp(model);
  edit();

  return propHandle;
}

function handleProp(model: Model, options?: Partial<PropOptions>) {
  return new Promise<number>(function (resolve, reject) {
    const startTime = Date.now();
    const tick = setTick(() => {
      if (HasModelLoaded(model)) {
        resolve(spawn(model, options));
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

export function handleAttachDefaultProp() {
  return handleAttachProp(DEFAULT_ANIM_PROP, {
    bone: PedBoneId.SKEL_R_Hand,
    pos: [0.14, 0.01, -0.02],
    rot: [110.0, 120.0, -15.0],
    hasCollision: false,
  });
}

export function handleAttachProp(model: Model, options?: Partial<PropOptions>) {
  if (!IsModelInCdimage(model))
    throw new Error(`Prop model ${model} not found`);
  RequestModel(model);
  return handleProp(model, options);
}

export function handleRemoveProp(propHandle: number) {
  console.log(`Deleting prop with id ${propHandle}`);
  if (!DoesEntityExist(propHandle)) return;
  DetachEntity(propHandle, false, false);
  DeleteEntity(propHandle);
}

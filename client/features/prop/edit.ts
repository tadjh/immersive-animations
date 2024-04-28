import { isEditingProp } from ".";
import { PedBoneId, RotationOrders, Vector3 } from "../../types";

let nextPos: Vector3 = { x: 0.0, y: 0.0, z: 0.0 };
let nextRot: Vector3 = { x: 0.0, y: 0.0, z: 0.0 };
let isUpdated = false;

const DELTA = 0.01;
const CONTROL_TYPE = 0;
enum INPUTS {
  LEFT_ARROW = 174, // Left Arrow
  RIGHT_ARROW = 175, // Right Arrow
  PAGE_UP = 10, // Page Up
  PAGE_DOWN = 11, // Page Down
  UP_ARROW = 172, // Up Arrow
  DOWN_ARROW = 173, // Down Arrow
  NUMPAD_4 = 108, // Numpad 4
  NUMPAD_5 = 112, // Numpad 5
  NUMPAD_6 = 109, // Numpad 6
  NUMPAD_7 = 117, // Numpad 7
  NUMPAD_8 = 111, // Numpad 8
  NUMPAD_9 = 118, // Numpad 9
}

function cleanUp() {
  isUpdated = false;
  nextPos = { x: 0.0, y: 0.0, z: 0.0 };
  nextRot = { x: 0.0, y: 0.0, z: 0.0 };
}

export function editProp(propHandle: number, curPos: Vector3, curRot: Vector3) {
  // nextPos = { ...curPos };
  // nextRot = { ...curRot };

  const tick = setTick(() => {
    if (!isEditingProp) {
      cleanUp();
      return clearTick(tick);
    }

    if (IsControlJustPressed(CONTROL_TYPE, INPUTS.LEFT_ARROW)) {
      nextPos.x -= DELTA;
      isUpdated = true;
    } else if (IsControlJustPressed(CONTROL_TYPE, INPUTS.RIGHT_ARROW)) {
      nextPos.x += DELTA;
      isUpdated = true;
    } else if (IsControlJustPressed(CONTROL_TYPE, INPUTS.DOWN_ARROW)) {
      nextPos.y -= DELTA;
      isUpdated = true;
    } else if (IsControlJustPressed(CONTROL_TYPE, INPUTS.UP_ARROW)) {
      nextPos.y += DELTA;
      isUpdated = true;
    } else if (IsControlJustPressed(CONTROL_TYPE, INPUTS.PAGE_DOWN)) {
      nextPos.z -= DELTA;
      isUpdated = true;
    } else if (IsControlJustPressed(CONTROL_TYPE, INPUTS.PAGE_UP)) {
      nextPos.z += DELTA;
      isUpdated = true;
    }

    if (IsControlJustPressed(CONTROL_TYPE, INPUTS.NUMPAD_4)) {
      nextRot.x -= DELTA;
      isUpdated = true;
    } else if (IsControlJustPressed(CONTROL_TYPE, INPUTS.NUMPAD_6)) {
      nextRot.y += DELTA;
      isUpdated = true;
    } else if (IsControlJustPressed(CONTROL_TYPE, INPUTS.NUMPAD_5)) {
      nextRot.y -= DELTA;
      isUpdated = true;
    } else if (IsControlJustPressed(CONTROL_TYPE, INPUTS.NUMPAD_8)) {
      nextRot.y += DELTA;
      isUpdated = true;
    } else if (IsControlJustPressed(CONTROL_TYPE, INPUTS.NUMPAD_9)) {
      nextRot.z -= DELTA;
      isUpdated = true;
    } else if (IsControlJustPressed(CONTROL_TYPE, INPUTS.NUMPAD_7)) {
      nextRot.z += DELTA;
      isUpdated = true;
    }

    if (isUpdated) {
      AttachEntityToEntity(
        propHandle,
        PlayerPedId(),
        GetPedBoneIndex(PlayerPedId(), PedBoneId.PH_R_Hand),
        nextPos.x,
        nextPos.y,
        nextPos.z,
        nextRot.x,
        nextRot.y,
        nextRot.z,
        true,
        true,
        true,
        false,
        RotationOrders.ZXY,
        true
      );
      console.log(
        nextPos.x,
        nextPos.y,
        nextPos.z,
        nextRot.x,
        nextRot.y,
        nextRot.z
      );
      isUpdated = false;
    }
  });
}

import { PedBoneId, RotationOrders, Vector3 } from "../../types";

let nextPos: Vector3 = { x: 0.0, y: 0.0, z: 0.0 };
let nextRot: Vector3 = { x: 0.0, y: 0.0, z: 0.0 };
let isUpdated = false;
export let isEditingProp = true;

const DELTA = 0.001;
const CONTROL_TYPE = 0;
enum INPUTS {
  ARROW_LEFT = 189, // Left Arrow
  ARROW_RIGHT = 190, // Right Arrow
  PAGE_UP = 10, // Page Up
  PAGE_DOWN = 11, // Page Down
  ARROW_UP = 188, // Up Arrow
  ARRO_DOWN = 187, // Down Arrow
  NUMPAD_4 = 108, // Numpad 4
  NUMPAD_5 = 110, // Numpad 5
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

export function editProp(
  propHandle: number,
  curPos: Vector3,
  curRot: Vector3,
  bone: PedBoneId
) {
  nextPos = { ...curPos };
  nextRot = { ...curRot };
  console.log(JSON.stringify({ curPos, curRot }));

  const tick = setTick(() => {
    if (!isEditingProp) {
      cleanUp();
      return clearTick(tick);
    }

    const POSDELTA = IsControlPressed(CONTROL_TYPE, 21) ? DELTA * 10 : DELTA;

    if (IsControlPressed(CONTROL_TYPE, INPUTS.ARROW_LEFT)) {
      nextPos.x -= POSDELTA;
      isUpdated = true;
    } else if (IsControlPressed(CONTROL_TYPE, INPUTS.ARROW_RIGHT)) {
      nextPos.x += POSDELTA;
      isUpdated = true;
    }

    if (IsControlPressed(CONTROL_TYPE, INPUTS.ARRO_DOWN)) {
      nextPos.y -= POSDELTA;
      isUpdated = true;
    } else if (IsControlPressed(CONTROL_TYPE, INPUTS.ARROW_UP)) {
      nextPos.y += POSDELTA;
      isUpdated = true;
    }

    if (IsControlPressed(CONTROL_TYPE, INPUTS.PAGE_DOWN)) {
      nextPos.z -= POSDELTA;
      isUpdated = true;
    } else if (IsControlPressed(CONTROL_TYPE, INPUTS.PAGE_UP)) {
      nextPos.z += POSDELTA;
      isUpdated = true;
    }

    if (IsControlPressed(CONTROL_TYPE, INPUTS.NUMPAD_4)) {
      nextRot.x -= 0.1;
      isUpdated = true;
    } else if (IsControlPressed(CONTROL_TYPE, INPUTS.NUMPAD_6)) {
      nextRot.x += 0.1;
      isUpdated = true;
    }

    if (IsControlPressed(CONTROL_TYPE, INPUTS.NUMPAD_5)) {
      nextRot.y -= 0.1;
      isUpdated = true;
    } else if (IsControlPressed(CONTROL_TYPE, INPUTS.NUMPAD_8)) {
      nextRot.y += 0.1;
      isUpdated = true;
    }

    if (IsControlPressed(CONTROL_TYPE, INPUTS.NUMPAD_9)) {
      nextRot.z -= 0.1;
      isUpdated = true;
    } else if (IsControlPressed(CONTROL_TYPE, INPUTS.NUMPAD_7)) {
      nextRot.z += 0.1;
      isUpdated = true;
    }

    if (isUpdated) {
      AttachEntityToEntity(
        propHandle,
        PlayerPedId(),
        GetPedBoneIndex(PlayerPedId(), bone),
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

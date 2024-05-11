import {
  // Model,
  PropOptions,
  // PedBoneId,
  RotationOrders,
  Vector3,
  AnimHandles,
  AnimOptions,
  PropHandles,
} from "../../types";
import { shouldThreadExpire } from "../../utils";
import { debugPrint } from "../../utils/debug";
import { attachPtfx, detachPtfx } from "../particle";
import { editProp } from "./edit";

let curPos: Vector3 = { x: 1.0, y: 1.0, z: 1.0 };
let curRot: Vector3 = { x: 0.0, y: 0.0, z: 0.0 };

async function spawnProp(
  options: PropOptions,
  prevHandles?: Omit<PropHandles, "propModel">
) {
  let nextPropHandle = 0;

  if (prevHandles) {
    nextPropHandle = prevHandles.propHandle;
  }

  if (!nextPropHandle) {
    nextPropHandle = CreateObject(
      options.model,
      options.pos.x,
      options.pos.y,
      options.pos.z,
      true,
      true,
      false
    );
  }
  debugPrint(`Spawning prop ${options.model} with id ${nextPropHandle}`);

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
    nextPropHandle,
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

  SetModelAsNoLongerNeeded(options.model);

  if (options.debug) {
    editProp(nextPropHandle, curPos, curRot, options.bone);
  }

  let nextHandles: PropHandles = {
    propHandle: nextPropHandle,
    propModel: options.model,
    particleHandle: 0,
    particleName: "",
  };

  if (prevHandles && prevHandles.particleHandle) {
    if (
      options.particle?.name === prevHandles.particleName &&
      !options.particle?.forceRespawn
    ) {
      nextHandles = {
        ...nextHandles,
        particleHandle: prevHandles.particleHandle,
        particleName: prevHandles.particleName,
      };
    } else {
      detachPtfx(prevHandles);
    }
  }

  if (options.particle && !nextHandles.particleName) {
    attachPtfx(nextPropHandle, options.particle);
    // const particleHandles = await
    // nextHandles = { ...nextHandles, ...particleHandles };
  }

  return nextHandles;
}

function attachProp(
  options: PropOptions,
  prevHandles?: Omit<PropHandles, "propModel">
) {
  if (!IsModelInCdimage(options.model))
    debugPrint(`Prop model ${options.model} not found`);

  RequestModel(options.model);

  return new Promise<PropHandles>(function (resolve, reject) {
    const startTime = Date.now();
    const tick = setTick(async () => {
      if (HasModelLoaded(options.model)) {
        resolve(await spawnProp(options, prevHandles));
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

// TODO This is gross all to handle secondary props... Switch to arrays of props and this becomes way simpler
export async function attachProps(
  options: Pick<AnimOptions, "prop" | "propTwo">,
  prevHandles: AnimHandles
) {
  let nextHandles: AnimHandles = { ...prevHandles };

  if (options.prop) {
    if (options.prop.model === prevHandles.propModel) {
      const resHandles = await attachProp(options.prop, {
        propHandle: prevHandles.propHandle,
        particleHandle: prevHandles.particleHandle,
        particleName: prevHandles.particleName,
      });
      nextHandles = { ...nextHandles, ...resHandles };
    } else {
      detachProp({
        propHandle: prevHandles.propHandle,
        propModel: prevHandles.propModel,
        particleHandle: prevHandles.particleHandle,
        particleName: prevHandles.particleName,
      });
      const resHandles = await attachProp(options.prop);
      nextHandles = { ...nextHandles, ...resHandles };
    }
  }

  if (options.propTwo) {
    if (options.propTwo.model === prevHandles.propTwoModel) {
      const resHandles = await attachProp(options.propTwo, {
        propHandle: prevHandles.propTwoHandle,
        particleHandle: prevHandles.particleTwoHandle,
        particleName: prevHandles.particleTwoName,
      });
      nextHandles = {
        ...nextHandles,
        propTwoHandle: resHandles.propHandle,
        propTwoModel: prevHandles.propTwoModel,
        particleTwoHandle: resHandles.particleHandle,
      };
    } else {
      detachProp({
        propHandle: prevHandles.propTwoHandle,
        propModel: prevHandles.propTwoModel,
        particleHandle: prevHandles.particleTwoHandle,
        particleName: prevHandles.particleTwoName,
      });
      const resHandles = await attachProp(options.propTwo);
      nextHandles = {
        ...nextHandles,
        propTwoHandle: resHandles.propHandle,
        propTwoModel: options.propTwo.model,
        particleTwoHandle: resHandles.particleHandle,
      };
    }
  }

  return nextHandles;
}

function waitForDeletedNetworkedPtfx(particleHandle: number) {
  return new Promise<boolean>(function (resolve, reject) {
    const startTime = Date.now();
    const tick = setTick(() => {
      if (!DoesParticleFxLoopedExist(particleHandle)) {
        resolve(true);
        return clearTick(tick);
      }
      const elapsedTime = Date.now() - startTime;
      if (shouldThreadExpire(elapsedTime)) {
        debugPrint("Max execution time elapsed in waitForNetworkedPtfx");
        reject(false);
        return clearTick(tick);
      }
    });
  });
}

export async function detachProp(
  prevHandles: PropHandles
): Promise<PropHandles> {
  let nextHandles = { ...prevHandles };

  if (DoesEntityExist(prevHandles.propHandle)) {
    debugPrint(`Deleting prop with id ${prevHandles.propHandle}`);

    if (
      prevHandles.particleHandle ||
      DoesParticleFxLoopedExist(prevHandles.particleHandle)
    ) {
      detachPtfx(prevHandles);
    }

    await waitForDeletedNetworkedPtfx(prevHandles.particleHandle);

    DetachEntity(prevHandles.propHandle, false, false);
    DeleteEntity(prevHandles.propHandle);

    nextHandles.propHandle = 0;
    nextHandles.propModel = 0;
  }

  return nextHandles;
}

export async function detachProps(handles: AnimHandles): Promise<AnimHandles> {
  let nextHandles = { ...handles };

  if (handles.propHandle) {
    const resHandles = await detachProp({
      propHandle: handles.propHandle,
      propModel: handles.propModel,
      particleHandle: handles.particleHandle,
      particleName: handles.particleName,
    });
    nextHandles = { ...nextHandles, ...resHandles };
  }
  if (handles.propTwoHandle) {
    const resHandles = await detachProp({
      propHandle: handles.propTwoHandle,
      propModel: handles.propTwoModel,
      particleHandle: handles.particleTwoHandle,
      particleName: handles.particleTwoName,
    });
    nextHandles = {
      ...nextHandles,
      propTwoHandle: resHandles.propHandle,
      propTwoModel: resHandles.propModel,
      particleTwoHandle: resHandles.particleHandle,
      particleTwoName: resHandles.particleName,
    };
  }

  return nextHandles;
}

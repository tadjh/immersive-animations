import { AnimHandles, PtfxOptions } from "../../types";
import { shouldThreadExpire } from "../../utils";
import { debugPrint } from "../../utils/debug";

export function detachPtfx(handles: AnimHandles) {
  debugPrint(`Deleting particle ${handles.particle} from prop ${handles.prop}`);
  debugPrint(
    "DoesParticleFxLoopedExist",
    DoesParticleFxLoopedExist(handles.particle)
  );
  if (DoesParticleFxLoopedExist(handles.particle)) {
    RemoveParticleFxFromEntity(handles.prop);
    StopParticleFxLooped(handles.particle, false);
  }

  // if (handles.prop === 0 || handles.prop === 1) {
  // TODO handle Non-looped
  // }

  return { prop: handles.prop, particle: 0 };
}

function spawn(propHandle: number, options: PtfxOptions) {
  // const isNonLooped = false; // TODO support looped particles

  // if (isNonLooped) {
  //   let i = 0;
  //   const tick = setTick(() => {
  //     UseParticleFxAsset(asset);
  //     const particleHandle = StartParticleFxNonLoopedOnEntity(
  //       particle,
  //       propHandle,
  //       offset.x,
  //       offset.y,
  //       offset.z,
  //       rotation.x,
  //       rotation.y,
  //       rotation.z,
  //       scale,
  //       lock.x,
  //       lock.y,
  //       lock.z
  //     );

  //     if (i === 0) {
  //       console.log(
  //         `Non-looped Particle spawning with handle ${particleHandle} with propHandle ${propHandle}`
  //       );
  //       particleMap.set(propHandle, Number(particleHandle));
  //       i++;
  //     } else if (!particleMap.has(propHandle)) {
  //       return clearTick(tick);
  //     }
  //   });
  // }

  UseParticleFxAsset(options.asset);
  const particleHandle = StartParticleFxLoopedOnEntity(
    options.particle,
    propHandle,
    options.offset.x,
    options.offset.y,
    options.offset.z,
    options.rotation.x,
    options.rotation.y,
    options.rotation.z,
    options.scale,
    options.invert.x,
    options.invert.y,
    options.invert.z
  );
  debugPrint(
    `Looped Particle spawning with handle ${particleHandle} with propHandle ${propHandle}`
  );
  return { prop: propHandle, particle: particleHandle };
}

export function attachPtfx(propHandle: number, options: PtfxOptions) {
  debugPrint(`Spawning particle onto prop with id ${propHandle}`);

  RequestNamedPtfxAsset(options.asset);

  return new Promise<AnimHandles>(function (resolve, reject) {
    const startTime = Date.now();
    const tick = setTick(() => {
      if (HasNamedPtfxAssetLoaded(options.asset)) {
        resolve(spawn(propHandle, options));
        return clearTick(tick);
      }
      const elapsedTime = Date.now() - startTime;
      if (shouldThreadExpire(elapsedTime)) {
        reject(`Max execution time elapsed in handleAsset`);
        return clearTick(tick);
      }
    });
  });
}

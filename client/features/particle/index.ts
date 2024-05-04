import { ParticleHandles, PropHandles, PtfxOptions } from "../../types";
import { shouldThreadExpire } from "../../utils";
import { debugPrint } from "../../utils/debug";

export function detachPtfx(
  prevHandles: Omit<PropHandles, "propModel">
): ParticleHandles {
  debugPrint(
    `Deleting particle ${prevHandles.particleHandle} from prop ${prevHandles.propHandle}`
  );

  let nextHandles = {
    particleHandle: prevHandles.particleHandle,
    particleName: prevHandles.particleName,
  };

  if (DoesParticleFxLoopedExist(prevHandles.particleHandle)) {
    RemoveParticleFxFromEntity(prevHandles.propHandle);
    StopParticleFxLooped(prevHandles.particleHandle, false);
    nextHandles.particleHandle = 0;
    nextHandles.particleName = "";
  }

  // if (handles.prop === 0 || handles.prop === 1) {
  // TODO handle Non-looped
  // }

  return nextHandles;
}

function spawnParticle(
  propHandle: number,
  options: PtfxOptions
): ParticleHandles {
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
    options.name,
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
    `Looped Particle ${options.name} spawning with handle ${particleHandle} with propHandle ${propHandle}`
  );
  return { particleHandle, particleName: options.name };
}

export function attachPtfx(propHandle: number, options: PtfxOptions) {
  debugPrint(`Spawning particle onto prop with id ${propHandle}`);

  RequestNamedPtfxAsset(options.asset);

  return new Promise<ParticleHandles>(function (resolve, reject) {
    const startTime = Date.now();
    const tick = setTick(() => {
      if (HasNamedPtfxAssetLoaded(options.asset)) {
        resolve(spawnParticle(propHandle, options));
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

import { CURRENT_RESOURCE_NAME } from "../../config";
import { ParticleHandles, PropHandles, PtfxOptions } from "../../types";
import { shouldThreadExpire } from "../../utils";
import { debugPrint } from "../../utils/debug";

export function networkedDetachPtfx(
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

  return nextHandles;
}

export function detachPtfx(prevHandles: Omit<PropHandles, "propModel">) {
  const propNetId = NetworkGetNetworkIdFromEntity(prevHandles.propHandle);

  emitNet(`${CURRENT_RESOURCE_NAME}:dispatchRemoveParticle`, {
    ...prevHandles,
    propHandle: propNetId,
  });
}

function spawnParticle(
  propHandle: number,
  options: PtfxOptions
): ParticleHandles {
  UseParticleFxAsset(options.asset);
  const particleHandle = StartNetworkedParticleFxLoopedOnEntity(
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

export function networkedAttachPtfx(propHandle: number, options: PtfxOptions) {
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

export function attachPtfx(propHandle: number, options: PtfxOptions) {
  const propNetId = NetworkGetNetworkIdFromEntity(propHandle);
  emitNet(`${CURRENT_RESOURCE_NAME}:dispatchAddParticle`, propNetId, options);
}

import { shouldThreadExpire } from "../../utils";

let particleMap = new Map<number, number>();

export function handleParticleOff(propHandle: number) {
  if (particleMap.has(propHandle)) {
    const particleHandle = particleMap.get(propHandle)!;
    if (DoesParticleFxLoopedExist(particleHandle)) {
      RemoveParticleFxFromEntity(propHandle);
      StopParticleFxLooped(particleHandle, false);
      particleMap.delete(propHandle);
      console.log(`Deleting particle ${particleHandle}`);
    }

    if (particleHandle === 0 || particleHandle === 1) {
      // TODO handle Non-looped
    }
  }
}

interface ParticleOptions {
  particle: string;
  propHandle: number;
  offset: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  scale: number;
  lock: { x: boolean; y: boolean; z: boolean };
}

function spawn(
  asset: string,
  { particle, propHandle, offset, rotation, scale, lock }: ParticleOptions
) {
  const isNonLooped = false; // TODO support looped particles

  if (isNonLooped) {
    let i = 0;
    const tick = setTick(() => {
      UseParticleFxAsset(asset);
      const particleHandle = StartParticleFxNonLoopedOnEntity(
        particle,
        propHandle,
        offset.x,
        offset.y,
        offset.z,
        rotation.x,
        rotation.y,
        rotation.z,
        scale,
        lock.x,
        lock.y,
        lock.z
      );

      if (i === 0) {
        console.log(
          `Non-looped Particle spawning with handle ${particleHandle} with propHandle ${propHandle}`
        );
        particleMap.set(propHandle, Number(particleHandle));
        i++;
      } else if (!particleMap.has(propHandle)) {
        return clearTick(tick);
      }
    });
  }

  UseParticleFxAsset(asset);
  const particleHandle = StartParticleFxLoopedOnEntity(
    particle,
    propHandle,
    offset.x,
    offset.y,
    offset.z,
    rotation.x,
    rotation.y,
    rotation.z,
    scale,
    lock.x,
    lock.y,
    lock.z
  );
  console.log(
    `Looped Particle spawning with handle ${particleHandle} with propHandle ${propHandle}`
  );
  particleMap.set(propHandle, particleHandle);
}

function handleAsset(asset: string, options: ParticleOptions) {
  return new Promise(function (resolve, reject) {
    const startTime = Date.now();
    const tick = setTick(() => {
      if (HasNamedPtfxAssetLoaded(asset)) {
        resolve(spawn(asset, options));
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

export function handleParticleOn(asset: string, options: ParticleOptions) {
  console.log(`Spawning torch fire onto prop with id ${options.propHandle}`);

  // const asset = "core";
  // const particle = "amb_torch_fire";
  if (!HasNamedPtfxAssetLoaded(asset)) RequestNamedPtfxAsset(asset);
  return handleAsset(asset, options);
}

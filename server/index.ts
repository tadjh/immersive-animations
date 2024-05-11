const CURRENT_RESOURCE_NAME = GetCurrentResourceName();

interface PtfxOptions {
  asset: string;
  name: string;
  offset: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  scale: number;
  invert: { x: boolean; y: boolean; z: boolean };
  forceRespawn?: boolean;
}

type Model = string | number;

interface AnimHandles {
  animName: string;
  propHandle: number;
  propModel: Model;
  particleHandle: number;
  particleName: string;
  propTwoHandle: number;
  propTwoModel: Model;
  particleTwoHandle: number;
  particleTwoName: string;
}

type PropHandles = Pick<
  AnimHandles,
  "propHandle" | "propModel" | "particleHandle" | "particleName"
>;

onNet(
  `${CURRENT_RESOURCE_NAME}:dispatchAddParticle`,
  (propNetId: number, options: PtfxOptions) => {
    emitNet(
      `${CURRENT_RESOURCE_NAME}:broadcastAddParticle`,
      -1,
      propNetId,
      options,
      source
    );
  }
);

onNet(
  `${CURRENT_RESOURCE_NAME}:dispatchRemoveParticle`,
  (prevNetHandles: Omit<PropHandles, "propModel">) => {
    emitNet(
      `${CURRENT_RESOURCE_NAME}:broadcastRemoveParticle`,
      -1,
      prevNetHandles,
      source
    );
  }
);

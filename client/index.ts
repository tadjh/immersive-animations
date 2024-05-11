import { emotes } from "./config/emotes";
import {
  detachPtfx,
  attachPtfx,
  networkedAttachPtfx,
  networkedDetachPtfx,
} from "./features/particle";
import { preview } from "./features/animate/preview";
import { getArg, isEmpty, shouldThreadExpire } from "./utils";
import { debugPrint } from "./utils/debug";
import { startAnim, stopAnim } from "./features/animate";
import {
  AnimHandles,
  AnimOptions,
  PtfxOptions,
  ParticleHandles,
  PropHandles,
} from "./types";
import { attachProps, detachProps } from "./features/prop";
import { COMMAND_EMOTE, CURRENT_RESOURCE_NAME } from "./config";

// TODO switch to array of props instead of keys
let handles: AnimHandles = {
  animName: "",
  propHandle: 0,
  propModel: 0,
  particleHandle: 0,
  particleName: "",
  propTwoHandle: 0,
  propTwoModel: 0,
  particleTwoHandle: 0,
  particleTwoName: "",
};

export function setHandles(nextHandles: Partial<AnimHandles>) {
  handles = { ...handles, ...nextHandles };
}

/**
 * Sets ped model based on args
 * @param _source The source (unused)
 * @param args The args
 * @returns void
 */
export async function emote(_source: number, args: string[] | []) {
  if (isEmpty(args)) return;

  const arg = getArg(args);

  if (arg === "c") {
    const nextHandles = await stopAnim(handles);
    return setHandles(nextHandles);
  }

  if (arg === "p") {
    return preview();
  }

  try {
    if (emotes.has(arg)) {
      const nextHandles = await startAnim(emotes.get(arg)!, handles);
      setHandles(nextHandles);
    }
  } catch (error) {
    debugPrint(error);
  }
}

// TODO Removed so not to cause any conflicts with np animations
RegisterCommand(COMMAND_EMOTE, emote, false);

globalThis.exports(
  "startAnim",
  async (options: AnimOptions): Promise<AnimHandles> => {
    const nextHandles = await startAnim(options, handles);
    setHandles(nextHandles);
    return nextHandles;
  }
);

globalThis.exports("stopAnim", async (): Promise<AnimHandles> => {
  const nextHandles = await stopAnim(handles);
  setHandles(nextHandles);
  return nextHandles;
});

globalThis.exports(
  "attachProps",
  async (
    options: Pick<AnimOptions, "prop" | "propTwo">,
    prevHandles: AnimHandles
  ): Promise<PropHandles> => {
    const nextHandles = await attachProps(options, prevHandles);
    setHandles(nextHandles);
    return nextHandles;
  }
);

globalThis.exports("detachProps", async (): Promise<AnimHandles> => {
  const nextHandles = await detachProps(handles);
  setHandles(nextHandles);
  return nextHandles;
});

globalThis.exports(
  "attachPtfx",
  async (
    propHandle: number,
    options: PtfxOptions
  ): Promise<ParticleHandles | false> => {
    let nextHandles: ParticleHandles = {
      particleHandle: 0,
      particleName: "",
    };

    // if (propHandle === handles.propHandle) {
    attachPtfx(propHandle, options);
    // setHandles(nextHandles);
    // return nextHandles;
    // }

    // if (propHandle === handles.propTwoHandle) {
    // attachPtfx(propHandle, options);
    // setHandles({
    //   particleTwoHandle: nextHandles.particleHandle,
    //   particleTwoName: nextHandles.particleName,
    // });
    // return nextHandles;
    // }

    // debugPrint(`Argument propHandle with id ${propHandle} not recognized.`);
    return false;
  }
);

globalThis.exports("detachPtfx", detachPtfx);

globalThis.exports("getHandles", (): AnimHandles => handles);

globalThis.exports("setHandles", setHandles);

globalThis.exports("getEmotes", () =>
  JSON.stringify(Array.from(emotes.entries()), null, 2)
);

globalThis.exports("hasEmote", (key: string) => emotes.has(key));

globalThis.exports("addEmote", (key: string, value: AnimOptions) =>
  emotes.set(key, value)
);

let networkedHandles = new Map<number, number>();

function waitForNetId(propNetId: number) {
  return new Promise<boolean>(function (resolve, reject) {
    const startTime = Date.now();
    const tick = setTick(() => {
      console.log(NetworkDoesEntityExistWithNetworkId(propNetId));

      if (NetworkDoesEntityExistWithNetworkId(propNetId)) {
        resolve(true);
        return clearTick(tick);
      }
      const elapsedTime = Date.now() - startTime;
      if (shouldThreadExpire(elapsedTime)) {
        debugPrint("Max execution time elapsed in waitForNetId");
        reject(false);
        return clearTick(tick);
      }
    });
  });
}

onNet(
  `${CURRENT_RESOURCE_NAME}:broadcastAddParticle`,
  async (propNetId: number, options: PtfxOptions, source: number) => {
    console.log(NetworkDoesEntityExistWithNetworkId(propNetId));

    const result = await waitForNetId(propNetId);

    if (result) {
      const propHandle = NetToObj(propNetId);

      const nextHandles = await networkedAttachPtfx(propHandle, options);

      // cache propHandle and particleHandle to detatch later
      if (PlayerId() === GetPlayerFromServerId(source)) {
        if (propHandle === handles.propHandle) {
          setHandles(nextHandles);
          return;
        }
        if (propHandle === handles.propTwoHandle) {
          setHandles({
            particleTwoHandle: nextHandles.particleHandle,
            particleTwoName: nextHandles.particleName,
          });
          return;
        }
        debugPrint(`Argument propHandle with id ${propHandle} not recognized.`);
      } else {
        console.log(
          "networkedHandles",
          propHandle,
          nextHandles.particleHandle,
          nextHandles.particleName
        );

        networkedHandles.set(propHandle, nextHandles.particleHandle);
      }
    } else {
      debugPrint(`Argument propNetId with id ${propNetId} not recognized.`);
    }
  }
);

onNet(
  `${CURRENT_RESOURCE_NAME}:broadcastRemoveParticle`,
  (prevNetHandles: Omit<PropHandles, "propModel">, source: number) => {
    const propHandle = NetToObj(prevNetHandles.propHandle);

    const clientHandles: Omit<PropHandles, "propModel"> = {
      propHandle,
      particleHandle: 0,
      particleName: prevNetHandles.particleName,
    };

    if (PlayerId() === GetPlayerFromServerId(source)) {
      if (propHandle === handles.propHandle) {
        clientHandles.particleHandle = handles.particleHandle;
        const nextHandles = networkedDetachPtfx(clientHandles);
        setHandles(nextHandles);
        return;
      }

      if (propHandle === handles.propTwoHandle) {
        clientHandles.particleHandle = handles.particleTwoHandle;
        const nextHandles = networkedDetachPtfx(clientHandles);
        setHandles({
          particleTwoHandle: nextHandles.particleHandle,
          particleTwoName: nextHandles.particleName,
        });
        return;
      }

      debugPrint(`Argument propHandle with id ${propHandle} not recognized.`);
    } else {
      clientHandles.particleHandle = networkedHandles.get(propHandle) || 0;

      if (!clientHandles.particleHandle) {
        return debugPrint(
          `Argument particleHandle with id ${clientHandles.particleHandle} not set.`
        );
      }

      networkedDetachPtfx(clientHandles);

      networkedHandles.delete(propHandle);
    }
  }
);

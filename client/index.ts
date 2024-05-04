import { COMMAND_EMOTE } from "./config";
import { emotes } from "./config/emotes";
import { detachPtfx, attachPtfx } from "./features/particle";
import { preview } from "./features/animate/preview";
import { getArg, isEmpty } from "./utils";
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

let handles: AnimHandles = {
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
    const nextHandles = stopAnim(handles);
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

RegisterCommand(COMMAND_EMOTE, emote, false);

globalThis.exports(
  "startAnim",
  async (options: AnimOptions): Promise<AnimHandles> => {
    const nextHandles = await startAnim(options, handles);
    setHandles(nextHandles);
    return nextHandles;
  }
);

globalThis.exports("stopAnim", (): AnimHandles => {
  const nextHandles = stopAnim(handles);
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

globalThis.exports("detachProps", (): AnimHandles => {
  const nextHandles = detachProps(handles);
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

    if (propHandle === handles.propHandle) {
      nextHandles = await attachPtfx(propHandle, options);
      setHandles(nextHandles);
      return nextHandles;
    }

    if (propHandle === handles.propTwoHandle) {
      nextHandles = await attachPtfx(propHandle, options);
      setHandles({
        particleTwoHandle: nextHandles.particleHandle,
        particleTwoName: nextHandles.particleName,
      });
      return nextHandles;
    }

    debugPrint(`Argument propHandle with id ${propHandle} not recognized.`);
    return false;
  }
);

globalThis.exports(
  "detachPtfx",
  (prevHandles: Omit<PropHandles, "propModel">): ParticleHandles | false => {
    let nextHandles: ParticleHandles = {
      ...prevHandles,
    };
    if (prevHandles.propHandle === handles.propHandle) {
      nextHandles = detachPtfx(prevHandles);
      setHandles(nextHandles);
      return nextHandles;
    }

    if (prevHandles.propHandle === handles.propTwoHandle) {
      nextHandles = detachPtfx(prevHandles);
      setHandles({
        particleTwoHandle: nextHandles.particleHandle,
        particleTwoName: nextHandles.particleName,
      });
      return nextHandles;
    }

    debugPrint(
      `Argument propHandle with id ${prevHandles.propHandle} not recognized.`
    );
    return false;
  }
);

globalThis.exports("getHandles", (): AnimHandles => handles);

globalThis.exports("setHandles", setHandles);

globalThis.exports("getEmotes", () =>
  JSON.stringify(Array.from(emotes.entries()), null, 2)
);

globalThis.exports("hasEmote", (key: string) => emotes.has(key));

globalThis.exports("addEmote", (key: string, value: AnimOptions) =>
  emotes.set(key, value)
);

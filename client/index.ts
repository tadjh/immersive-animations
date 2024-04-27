import { COMMAND_EMOTE } from "./config";
import { emotes } from "./config/emotes";
import { detachPtfx, attachPtfx } from "./features/particle";
import { preview } from "./features/animate/preview";
import { getArg, isEmpty } from "./utils";
import { debugPrint } from "./utils/debug";
import { startAnim, stopAnim } from "./features/animate";
import { AnimHandles, AnimOptions, PtfxOptions, PropOptions } from "./types";
import { attachProp, detachProp } from "./features/prop";

let handles: AnimHandles = { prop: 0, particle: 0 };

export function setHandles(nextHandles: AnimHandles) {
  handles = { ...nextHandles };
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
    return (handles = stopAnim(handles));
  }

  if (arg === "p") {
    return preview();
  }

  try {
    if (emotes.has(arg)) {
      handles = await startAnim(emotes.get(arg)!);
    }
  } catch (error) {
    debugPrint(error);
  }
}

RegisterCommand(COMMAND_EMOTE, emote, false);

globalThis.exports("startAnim", async (options: AnimOptions) => {
  const nextHandles = await startAnim(options);
  setHandles(nextHandles);
});

globalThis.exports("stopAnim", () => {
  const nextHandles = stopAnim(handles);
  setHandles(nextHandles);
});

globalThis.exports("attachProp", async (options: PropOptions) => {
  const nextHandles = await attachProp(options);
  setHandles(nextHandles);
});

globalThis.exports("detachProp", () => {
  const nextHandles = detachProp(handles);
  setHandles(nextHandles);
});

globalThis.exports(
  "attachPtfx",
  async (propHandle: number, options: PtfxOptions) => {
    const nextHandles = await attachPtfx(propHandle, options);
    setHandles(nextHandles);
  }
);

globalThis.exports("detachPtfx", () => {
  const nextHandles = detachPtfx(handles);
  setHandles(nextHandles);
});

globalThis.exports("getHandles", () => handles);

globalThis.exports("setHandles", setHandles);

globalThis.exports("getEmotes", () =>
  JSON.stringify(Array.from(emotes.entries()), null, 2)
);

globalThis.exports("hasEmote", (key: string) => emotes.has(key));

globalThis.exports("addEmote", (key: string, value: AnimOptions) =>
  emotes.set(key, value)
);

import { COMMAND_EMOTE } from "./config";
import { emotes } from "./config/emotes";
import { detachPtfx, attachPtfx } from "./features/particle";
import { preview } from "./features/animate/preview";
import { getArg, isEmpty } from "./utils";
import { debugPrint } from "./utils/debug";
import { startAnim, stopAnim } from "./features/animate";
import { AnimationHandles, AnimationOptions } from "./types";
import { attachProp, detachProp } from "./features/prop";

let handles: AnimationHandles = { prop: 0, particle: 0 };

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

globalThis.exports("startAnim", startAnim);
globalThis.exports("stopAnim", stopAnim);
globalThis.exports("attachProp", attachProp);
globalThis.exports("detachProp", detachProp);
globalThis.exports("attachParticle", attachPtfx);
globalThis.exports("detachParticle", detachPtfx);
globalThis.exports("getHandles", () => handles);
globalThis.exports("setHandles", (nextHandles: AnimationHandles) => {
  handles = nextHandles;
});
globalThis.exports("getEmotes", () => emotes);
globalThis.exports("hasEmote", (key: string) => emotes.has(key));
globalThis.exports("addEmote", (key: string, value: AnimationOptions) =>
  emotes.set(key, value)
);

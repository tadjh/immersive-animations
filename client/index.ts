import { myRandomData } from "./MyOther.client";
import { COMMAND_EMOTE } from "./config";
import { emotes } from "./config/emotes";
import { preview } from "./features/animate/preview";
import { extinguishTorch, lightTorch } from "./features/animate/props";
import { print, getArg, isEmpty } from "./utils";
import { SetPedAnim, StopPedAnim } from "./utils/natives";

on("onResourceStart", (resName: string) => {
  if (resName === GetCurrentResourceName()) {
    console.log(myRandomData);
    console.log("Immersive Animations started!");
  }
});

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
    return StopPedAnim();
  }

  if (arg === "p") {
    return preview();
  }

  if (!emotes.hasOwnProperty(arg)) return;

  try {
    await SetPedAnim(emotes[arg]);
  } catch (error) {
    print(error);
  }
}

RegisterCommand(COMMAND_EMOTE, emote, false);
RegisterCommand("survival:torch:on", lightTorch, false);
RegisterCommand("survival:torch:off", extinguishTorch, false);

globalThis.exports("SetPedAnimDict", SetPedAnim);

import { myRandomData } from "./MyOther.client";
import { COMMAND_EMOTE } from "./config";
import { emotes } from "./config/emotes";
import {
  handleParticleOff,
  handleParticleOn,
} from "./features/animate/particle";
import { preview } from "./features/animate/preview";
import { propHandle } from "./features/animate/props";
import { getArg, isEmpty } from "./utils";
import { debugPrint } from "./utils/debug";
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
    debugPrint(error);
  }
}

RegisterCommand(COMMAND_EMOTE, emote, false);

RegisterCommand(
  "survival:torch:on",
  () => {
    handleParticleOn("core", {
      particle: "ent_amb_torch_fire",
      propHandle,
      offset: { x: 0.0, y: 0.0, z: 2.0 },
      rotation: { x: 0.0, y: 0.0, z: 0.0 },
      scale: 1.0,
      lock: { x: false, y: false, z: false },
    });
  },
  false
);
RegisterCommand(
  "survival:torch:off",
  () => handleParticleOff(propHandle),
  false
);

setTick(() => {
  if (IsControlJustPressed(0, 174)) {
    handleParticleOn("core", {
      particle: "ent_amb_torch_fire",
      propHandle,
      offset: { x: 0.0, y: 0.0, z: 2.0 },
      rotation: { x: 0.0, y: 0.0, z: 0.0 },
      scale: 1.0,
      lock: { x: false, y: false, z: false },
    });
  } else if (IsControlJustPressed(0, 175)) {
    handleParticleOff(propHandle);
  }
});

globalThis.exports("SetPedAnimDict", SetPedAnim);

import { CURRENT_RESOURCE_NAME } from "../../config";
import { AnimOptions, AnimFlags, AnimHandles } from "../../types";
import { shouldThreadExpire } from "../../utils";
import { attachProps, detachProps } from "../prop";

let lastDict = "";
let lastAnim = "";

function cleanUp() {
  ClearPedTasksImmediately(PlayerPedId());
  ClearPedSecondaryTask(PlayerPedId());
  RemoveAnimDict(lastDict);
  lastDict = "";
  lastAnim = "";
}

export async function stopAnim(prevHandles: AnimHandles): Promise<AnimHandles> {
  const ped = PlayerPedId();

  let nextHandles = { ...prevHandles, animName: "" };
  StopAnimTask(PlayerPedId(), lastDict, lastAnim, 1.0);

  if (prevHandles.propHandle || prevHandles.propTwoHandle) {
    nextHandles = await detachProps(prevHandles);
  }

  cleanUp();

  emit(`${CURRENT_RESOURCE_NAME}:animStopped`, prevHandles.animName);

  return nextHandles;
}

async function animate(options: AnimOptions, prevHandles: AnimHandles) {
  const ped = PlayerPedId();

  let nextHandles = { ...prevHandles };

  lastDict = options.dictionary;
  lastAnim = options.name;
  TaskPlayAnim(
    ped,
    options.dictionary,
    options.name,
    options.blendInSpeed || 8.0,
    options.blendOutSpeed || 8.0,
    options.duration || -1,
    options?.flag || AnimFlags.AF_LOOPING,
    options.playbackRate || 0.0,
    options.invert?.x || false,
    options.invert?.y || false,
    options.invert?.z || false
  );

  nextHandles = {
    ...nextHandles,
    animName: `${options.dictionary}@${options.name}`,
  };

  const resHandles = await attachProps(
    { prop: options.prop, propTwo: options.propTwo },
    prevHandles
  );

  emit(`${CURRENT_RESOURCE_NAME}:animStarted`, nextHandles.animName);

  return { ...nextHandles, ...resHandles };
}

export function startAnim(options: AnimOptions, prevHandles: AnimHandles) {
  if (!DoesAnimDictExist(options.dictionary)) {
    throw new Error(`Animation dictionary ${options.dictionary} not found`);
  }

  RequestAnimDict(options.dictionary);

  return new Promise<AnimHandles>(function (resolve, reject) {
    const startTime = Date.now();
    const tick = setTick(() => {
      if (HasAnimDictLoaded(options.dictionary)) {
        resolve(animate(options, prevHandles));
        return clearTick(tick);
      }
      const elapsedTime = Date.now() - startTime;
      if (shouldThreadExpire(elapsedTime)) {
        reject(`Max execution time elapsed in handleAnimate`);
        return clearTick(tick);
      }
    });
  });
}

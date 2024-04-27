import {
  AnimationOptions,
  AnimationFlags,
  AnimationData,
  AnimationHandles,
} from "../../types";
import { shouldThreadExpire } from "../../utils";
import { debugPrint } from "../../utils/debug";
import { attachProp, detachProp } from "../prop";

let lastDict = "";
let lastAnim = "";
let lastType = "";
let exitAnim: AnimationData = { name: "" };

function cleanUp() {
  ClearPedTasksImmediately(PlayerPedId());
  // ClearPedSecondaryTask(ped);
  RemoveAnimDict(lastDict);

  lastDict = "";
  lastAnim = "";
  exitAnim = { name: "" };
}

export function stopAnim(handles: AnimationHandles): AnimationHandles {
  const ped = PlayerPedId();

  switch (lastType) {
    case "single":
      StopAnimTask(PlayerPedId(), lastDict, lastAnim, 1.0);

      if (handles.prop) detachProp(handles);

      const startTime = Date.now();
      const tick = setTick(() => {
        const elapsedTime = Date.now() - startTime;

        if (elapsedTime > 2000) {
          cleanUp();
          return clearTick(tick);
        }
      });

      break;
    case "inAndOut":
      if (exitAnim.name) {
        ClearPedTasks(ped);
        TaskPlayAnim(
          ped,
          lastDict,
          exitAnim.name,
          exitAnim.blendInSpeed || 1.0,
          exitAnim.blendOutSpeed || 1.0,
          exitAnim.duration || -1,
          exitAnim.flag ||
            AnimationFlags.AF_LOOPING +
              AnimationFlags.AF_UPPERBODY +
              AnimationFlags.AF_SECONDARY,
          exitAnim.playbackRate || 0.0,
          exitAnim.lock?.x || false,
          exitAnim.lock?.y || false,
          exitAnim.lock?.z || false
        );

        if (handles.prop) detachProp(handles);

        const tick = setTick(() => {
          if (GetEntityAnimCurrentTime(ped, lastDict, exitAnim.name) === 1) {
            cleanUp();
            return clearTick(tick);
          }
        });
      }
      break;
    default:
      if (handles.prop) detachProp(handles);
      ClearPedTasksImmediately(ped);
      break;
  }

  return {
    prop: 0,
    particle: 0,
  };
}

async function animate(options: AnimationOptions) {
  const ped = PlayerPedId();

  // Reset animation blending before starting a new animation.
  ClearPedTasks(ped);

  switch (options.type) {
    case "inAndOut":
      lastType = "inAndOut";
      lastDict = options.dictionary;
      lastAnim = options.anim.enter.name;
      exitAnim = options.anim.exit;

      TaskPlayAnim(
        ped,
        options.dictionary,
        options.anim.enter.name,
        options.anim.enter.blendInSpeed || 8.0,
        options.anim.enter.blendOutSpeed || 0.0,
        options.anim.enter.duration || -1,
        options.anim.enter.flag ||
          AnimationFlags.AF_HOLD_LAST_FRAME + AnimationFlags.AF_UPPERBODY,
        options.anim.enter.playbackRate || 0.0,
        options.anim.enter.lock?.x || false,
        options.anim.enter.lock?.y || false,
        options.anim.enter.lock?.z || false
      );

      const tick = setTick(() => {
        if (GetEntityAnimCurrentTime(ped, options.dictionary, lastAnim) === 1) {
          ClearPedTasks(ped);
          lastAnim = options.anim.idle.name;
          TaskPlayAnim(
            ped,
            options.dictionary,
            options.anim.idle.name,
            options.anim.idle.blendInSpeed || 8.0,
            options.anim.idle.blendOutSpeed || 0.0,
            options.anim.idle.duration || -1,
            options.anim.idle.flag ||
              AnimationFlags.AF_LOOPING +
                AnimationFlags.AF_UPPERBODY +
                AnimationFlags.AF_SECONDARY,
            options.anim.idle.playbackRate || 0.0,
            options.anim.idle.lock?.x || false,
            options.anim.idle.lock?.y || false,
            options.anim.idle.lock?.z || false
          );

          return clearTick(tick);
        }
      });
      break;
    case "single":
      lastType = "single";
      lastDict = options.dictionary;
      lastAnim = options.name;
      TaskPlayAnim(
        ped,
        options.dictionary,
        options.name,
        options.blendInSpeed || 8.0,
        options.blendOutSpeed || 1.0,
        options.duration || -1,
        options?.flag || AnimationFlags.AF_LOOPING,
        options.playbackRate || 0.0,
        options.lock?.x || false,
        options.lock?.y || false,
        options.lock?.z || false
      );
      break;
    default:
      break;
  }

  let handles: AnimationHandles = {
    prop: 0,
    particle: 0,
  };

  if (options.prop) {
    handles = await attachProp(options.prop);
  }

  return handles;
}

export function startAnim(options: AnimationOptions) {
  if (!DoesAnimDictExist(options.dictionary)) {
    throw new Error(`Animation dictionary ${options.dictionary} not found`);
  }

  RequestAnimDict(options.dictionary);

  return new Promise<AnimationHandles>(function (resolve, reject) {
    const startTime = Date.now();
    const tick = setTick(() => {
      if (HasAnimDictLoaded(options.dictionary)) {
        resolve(animate(options));
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

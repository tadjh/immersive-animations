import { DEFAULT_ANIMATION } from "../../config";
import { AnimationOptions, AnimationFlags, AnimationData } from "../../types";
import { shouldThreadExpire } from "../../utils";
import { ClearPedAnimProp, SetPedAnimProp } from "../../utils/natives";

let lastDict = "";
let lastAnim = "";
let lastType = "";
let exitAnim: AnimationData = { name: "" };
let propHandle = 0;

export function handleStopAnimation() {
  const ped = PlayerPedId();

  switch (lastType) {
    case "single":
      StopAnimTask(PlayerPedId(), lastDict, lastAnim, 1.0);

      const startTime = Date.now();
      const tick = setTick(() => {
        const elapsedTime = Date.now() - startTime;

        if (elapsedTime > 2000) {
          // StopAnimTask(PlayerPedId(), lastDict, exitAnim, 8.0);
          // ClearPedTasks(ped);
          ClearPedTasksImmediately(ped);
          // ClearPedSecondaryTask(ped);
          RemoveAnimDict(lastDict);

          if (propHandle) ClearPedAnimProp(propHandle);

          lastDict = "";
          lastAnim = "";
          exitAnim = { name: "" };
          propHandle = 0;

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
          exitAnim.lockX || false,
          exitAnim.lockY || false,
          exitAnim.lockZ || false
        );

        const tick = setTick(() => {
          if (GetEntityAnimCurrentTime(ped, lastDict, exitAnim.name) === 1) {
            // StopAnimTask(PlayerPedId(), lastDict, exitAnim, 8.0);
            // ClearPedTasks(ped);
            ClearPedTasksImmediately(ped);
            // ClearPedSecondaryTask(ped);
            RemoveAnimDict(lastDict);

            if (propHandle) ClearPedAnimProp(propHandle);

            lastDict = "";
            lastAnim = "";
            exitAnim = { name: "" };
            propHandle = 0;

            return clearTick(tick);
          }
        });
      }
      break;
    default:
      if (propHandle) ClearPedAnimProp(propHandle);
      ClearPedTasksImmediately(ped);
      break;
  }
}

async function animate(options: AnimationOptions) {
  if (!options) return;

  const ped = PlayerPedId();

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
        options.anim.enter.lockX || false,
        options.anim.enter.lockY || false,
        options.anim.enter.lockZ || false
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
            options.anim.idle.lockX || false,
            options.anim.idle.lockY || false,
            options.anim.idle.lockZ || false
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
        options.lockX || false,
        options.lockY || false,
        options.lockZ || false
      );
      break;
    default:
      break;
  }

  if (options.prop) {
    propHandle = await SetPedAnimProp(options.prop.model, options.prop);
  }
}

function handleAnimate(options: AnimationOptions) {
  return new Promise<void>(function (resolve, reject) {
    const startTime = Date.now();
    const tick = setTick(() => {
      if (HasAnimDictLoaded(options.dictionary)) {
        resolve(animate(options));
        return clearTick(tick);
      }
      const elapsedTime = Date.now() - startTime;
      if (shouldThreadExpire(elapsedTime)) {
        reject(`Max execution time elapsed in handleSpawn`);
        return clearTick(tick);
      }
    });
  });
}

function shouldRequestAnimDict(animDict: string) {
  return DoesAnimDictExist(animDict);
}

export function handleStartAnimation(options: AnimationOptions) {
  if (!shouldRequestAnimDict(options.dictionary))
    return console.log("Animation dictionary %s not found", options.dictionary);
  RequestAnimDict(options.dictionary);
  return handleAnimate(options);
}

export function handleDefaultAnimation() {
  return handleStartAnimation(DEFAULT_ANIMATION);
}

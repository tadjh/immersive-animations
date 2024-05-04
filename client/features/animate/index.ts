import { CURRENT_RESOURCE_NAME } from "../../config";
import { AnimOptions, AnimFlags, AnimData, AnimHandles } from "../../types";
import { shouldThreadExpire } from "../../utils";
import { attachProps, detachProps } from "../prop";

let lastDict = "";
let lastAnim = "";
let lastType = "";
let exitAnim: AnimData = { name: "" };

function cleanUp() {
  ClearPedTasksImmediately(PlayerPedId());
  // ClearPedSecondaryTask(ped);
  RemoveAnimDict(lastDict);

  lastDict = "";
  lastAnim = "";
  exitAnim = { name: "" };
}

export function stopAnim(prevHandles: AnimHandles): AnimHandles {
  const ped = PlayerPedId();

  let nextHandles = { ...prevHandles, animName: "" };

  switch (lastType) {
    case "single":
      StopAnimTask(PlayerPedId(), lastDict, lastAnim, 1.0);

      if (prevHandles.propHandle || prevHandles.propTwoHandle) {
        nextHandles = detachProps(prevHandles);
      }

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
            AnimFlags.AF_LOOPING +
              AnimFlags.AF_UPPERBODY +
              AnimFlags.AF_SECONDARY,
          exitAnim.playbackRate || 0.0,
          exitAnim.invert?.x || false,
          exitAnim.invert?.y || false,
          exitAnim.invert?.z || false
        );

        if (prevHandles.propHandle || prevHandles.propTwoHandle) {
          nextHandles = detachProps(prevHandles);
        }

        const tick = setTick(() => {
          if (GetEntityAnimCurrentTime(ped, lastDict, exitAnim.name) === 1) {
            cleanUp();
            return clearTick(tick);
          }
        });
      }
      break;
    default:
      if (prevHandles.propHandle || prevHandles.propTwoHandle) {
        nextHandles = detachProps(prevHandles);
      }
      ClearPedTasksImmediately(ped);
      break;
  }

  emit(`${CURRENT_RESOURCE_NAME}:animCancelled`);

  return nextHandles;
}

async function animate(options: AnimOptions, prevHandles: AnimHandles) {
  const ped = PlayerPedId();

  let nextHandles = { ...prevHandles };

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
          AnimFlags.AF_HOLD_LAST_FRAME + AnimFlags.AF_UPPERBODY,
        options.anim.enter.playbackRate || 0.0,
        options.anim.enter.invert?.x || false,
        options.anim.enter.invert?.y || false,
        options.anim.enter.invert?.z || false
      );

      nextHandles = { ...nextHandles, animName: options.anim.enter.name };

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
              AnimFlags.AF_LOOPING +
                AnimFlags.AF_UPPERBODY +
                AnimFlags.AF_SECONDARY,
            options.anim.idle.playbackRate || 0.0,
            options.anim.idle.invert?.x || false,
            options.anim.idle.invert?.y || false,
            options.anim.idle.invert?.z || false
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
        options?.flag || AnimFlags.AF_LOOPING,
        options.playbackRate || 0.0,
        options.invert?.x || false,
        options.invert?.y || false,
        options.invert?.z || false
      );

      nextHandles = { ...nextHandles, animName: options.name };

      break;
    default:
      break;
  }

  const resHandles = await attachProps(
    { prop: options.prop, propTwo: options.propTwo },
    prevHandles
  );
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

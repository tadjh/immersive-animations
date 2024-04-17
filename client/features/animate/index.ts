import { DEFAULT_ANIM_DICT, DEFAULT_ANIM_EMOTE } from "../../config";
import { Options, eAnimationFlags } from "../../types";
import { shouldThreadExpire } from "../../utils";
import { ClearPedAnimProp, SetPedAnimProp } from "../../utils/natives";

let lastDict = "";
let lastAnim = "";
let lastType = "";
let exitAnim = "";
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
          exitAnim = "";
          propHandle = 0;

          return clearTick(tick);
        }
      });

      break;
    case "inAndOut":
      if (exitAnim) {
        ClearPedTasks(ped);
        TaskPlayAnim(
          ped,
          lastDict,
          exitAnim,
          1.0,
          1.0,
          -1,
          eAnimationFlags.ANIM_FLAG_STOP_LAST_FRAME +
            eAnimationFlags.ANIM_FLAG_UPPERBODY +
            eAnimationFlags.ANIM_FLAG_ENABLE_PLAYER_CONTROL,
          0.0,
          false,
          false,
          false
        );

        const tick = setTick(() => {
          if (GetEntityAnimCurrentTime(ped, lastDict, exitAnim) === 1) {
            // StopAnimTask(PlayerPedId(), lastDict, exitAnim, 8.0);
            // ClearPedTasks(ped);
            ClearPedTasksImmediately(ped);
            // ClearPedSecondaryTask(ped);
            RemoveAnimDict(lastDict);

            if (propHandle) ClearPedAnimProp(propHandle);

            lastDict = "";
            lastAnim = "";
            exitAnim = "";
            propHandle = 0;

            return clearTick(tick);
          }
        });
      }
      break;
    default:
      ClearPedTasksImmediately(ped);
      break;
  }
}

async function animate(
  animDict: string,
  animName: string,
  options?: Partial<Options>
) {
  if (!options?.animType) return;

  const ped = PlayerPedId();

  ClearPedTasks(ped);

  switch (options.animType) {
    case "single":
      TaskPlayAnim(
        ped,
        animDict,
        animName,
        8.0,
        1.0,
        -1,
        options?.animFlag || eAnimationFlags.ANIM_FLAG_REPEAT,
        0.0,
        false,
        false,
        false
      );
      break;
    case "inAndOut":
      lastType = "inAndOut";
      lastDict = animDict;
      exitAnim = options?.animExit || "";

      if (options?.animEnter) {
        lastAnim = options.animEnter;
        TaskPlayAnim(
          ped,
          animDict,
          options.animEnter,
          8.0,
          0.0,
          -1,
          eAnimationFlags.ANIM_FLAG_STOP_LAST_FRAME +
            eAnimationFlags.ANIM_FLAG_UPPERBODY,
          0.0,
          false,
          false,
          false
        );

        const tick = setTick(() => {
          if (GetEntityAnimCurrentTime(ped, animDict, lastAnim) === 1) {
            ClearPedTasks(ped);
            lastAnim = animName;
            TaskPlayAnim(
              ped,
              animDict,
              animName,
              8.0,
              0.0,
              -1,
              eAnimationFlags.ANIM_FLAG_REPEAT +
                eAnimationFlags.ANIM_FLAG_UPPERBODY +
                eAnimationFlags.ANIM_FLAG_ENABLE_PLAYER_CONTROL,
              0.0,
              false,
              false,
              false
            );

            return clearTick(tick);
          }
        });
      }
      break;
    default:
      TaskPlayAnim(
        ped,
        animDict,
        animName,
        8.0,
        8.0,
        -1,
        options?.animFlag || eAnimationFlags.ANIM_FLAG_REPEAT,
        0.0,
        false,
        false,
        false
      );
      break;
  }

  if (options?.prop) {
    propHandle = await SetPedAnimProp(options.prop.model, options.prop);
  }
}

function handleAnimate(
  animDict: string,
  animName: string,
  options?: Partial<Options>
) {
  return new Promise<void>(function (resolve, reject) {
    const startTime = Date.now();
    const tick = setTick(() => {
      if (HasAnimDictLoaded(animDict)) {
        resolve(animate(animDict, animName, options));
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

export function handleStartAnimation(
  animDict: string,
  animName: string,
  options?: Partial<Options>
) {
  if (!shouldRequestAnimDict(animDict))
    return console.log("Animation dictionary %s not found", animDict);
  RequestAnimDict(animDict);
  return handleAnimate(animDict, animName, options);
}

export function handleDefaultAnimation() {
  return handleStartAnimation(DEFAULT_ANIM_DICT, DEFAULT_ANIM_EMOTE, {});
}

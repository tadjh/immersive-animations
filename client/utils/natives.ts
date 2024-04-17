import {
  handleStartAnimation,
  handleDefaultAnimation,
  handleStopAnimation,
} from "../features/animate";
import {
  handleAttachDefaultProp,
  handleAttachProp,
  handleRemoveProp,
} from "../features/animate/props";
import { Model, Options, PropOptions } from "../types";

export function SetPedAnim(
  animDict?: string,
  animName?: string,
  options?: Partial<Options>
) {
  if (
    animDict === undefined ||
    animDict === "undefined" ||
    animName === undefined ||
    animName === "undefined"
  )
    return handleDefaultAnimation();
  return handleStartAnimation(animDict, animName, options);
}

export function StopPedAnim() {
  return handleStopAnimation();
}

export function SetPedAnimProp(model?: Model, options?: Partial<PropOptions>) {
  if (model === undefined || model === "undefined")
    return handleAttachDefaultProp();
  return handleAttachProp(model, options);
}

export function ClearPedAnimProp(propHandle: number) {
  return handleRemoveProp(propHandle);
}

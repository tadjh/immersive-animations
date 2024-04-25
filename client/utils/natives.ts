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
import { Model, AnimationOptions, PropOptions } from "../types";

export function SetPedAnim(options?: AnimationOptions) {
  if (options === undefined) return handleDefaultAnimation();
  return handleStartAnimation(options);
}

export function StopPedAnim() {
  return handleStopAnimation();
}

export function SetPedAnimProp(model?: Model, options?: PropOptions) {
  if (model === undefined || model === "undefined")
    return handleAttachDefaultProp();
  return handleAttachProp(model, options);
}

export function ClearPedAnimProp(propHandle: number) {
  return handleRemoveProp(propHandle);
}

import { AnimationOptions, AnimationFlags } from "../types";

export const CURRENT_RESOURCE_NAME = GetCurrentResourceName();
export const COMMAND_EMOTE = "e";

export const DEFAULT_ANIM_DICT = "random@domestic";
export const DEFAULT_ANIM_EMOTE = "pickup_low";

export const DEFAULT_ANIM_PROP = "prop_player_phone_01";

export const DEFAULT_ENTER_FLAGS =
  AnimationFlags.AF_HOLD_LAST_FRAME + AnimationFlags.AF_UPPERBODY;
export const DEFAULT_EXIT_FLAGS =
  AnimationFlags.AF_HOLD_LAST_FRAME +
  AnimationFlags.AF_UPPERBODY +
  AnimationFlags.AF_SECONDARY;

export const DEFAULT_ANIMATION: AnimationOptions = {
  dictionary: DEFAULT_ANIM_DICT,
  name: DEFAULT_ANIM_EMOTE,
  type: "single",
};

// missfam4

// anim@heists@humane_labs@finale@keycards :
// ped b pass
// ped a loop
// ped b enter loop
// ped a enter loop

// v_58_headdress
// prop_tool_shovel3
// xm_prop_x17_shovel_01a
// prop_tool_rake_l1
// prop_rub_carpart_04
// prop_pool_cue
// vfx_it1_11
// vfx_it2_39
// vfx_it2_36

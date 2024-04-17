import { Options, eAnimationFlags, ePedBoneId } from "../types";

export const emotes: { [key: string]: Options } = {
  bird: {
    animDict: "anim@mp_player_intselfiethe_bird",
    animEnter: "enter",
    animName: "idle_a",
    animExit: "exit",
    animType: "inAndOut",
    prop: {
      model: "prop_player_phone_01",
      bone: ePedBoneId.SKEL_R_Hand,
      hasCollision: false,
      pos: [0.0, 0.0, 0.0],
      rot: [0.0, 0.0, 0.0],
    },
  },
  torch: {
    animDict: "anim@heists@humane_labs@finale@keycards",
    animName: "ped_b_enter_loop",
    animType: "single",
    animFlag:
      eAnimationFlags.ANIM_FLAG_REPEAT +
      eAnimationFlags.ANIM_FLAG_UPPERBODY +
      eAnimationFlags.ANIM_FLAG_ENABLE_PLAYER_CONTROL,
    prop: {
      model: "prop_tool_shovel3",
      bone: ePedBoneId.SKEL_R_Hand,
      pos: [0.2, 0.5, 0.1],
      rot: [110.0, -10.0, 0.0],
    },
  },
  rake: {
    animDict: "anim@amb@drug_field_workers@rake@male_a@base",
    animName: "base",
    animType: "single",
    prop: {
      model: "prop_tool_rake",
      bone: ePedBoneId.PH_R_Hand,
      pos: [0.0, 0.0, -0.03],
      rot: [0.0, 0.0, 0.0],
    },
  },
  sweep: {
    animDict: "anim@amb@drug_field_workers@rake@male_a@base",
    animName: "base",
    animType: "single",
    animFlag:
      eAnimationFlags.ANIM_FLAG_REPEAT +
      eAnimationFlags.ANIM_FLAG_UPPERBODY +
      eAnimationFlags.ANIM_FLAG_ENABLE_PLAYER_CONTROL,
    prop: {
      model: "prop_tool_broom",
      bone: ePedBoneId.PH_R_Hand,
      pos: [-0.01, 0.04, -0.03],
      rot: [0.0, 0.0, 0.0],
    },
  },
};

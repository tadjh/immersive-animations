import { AnimationOptions, AnimationFlags, PedBoneId } from "../types";

export const emotes: { [key: string]: AnimationOptions } = {
  bird: {
    dictionary: "anim@mp_player_intselfiethe_bird",
    anim: {
      enter: { name: "enter" },
      idle: { name: "idle_a" },
      exit: { name: "exit" },
    },
    type: "inAndOut",
    prop: {
      model: "prop_player_phone_01",
      bone: PedBoneId.SKEL_R_Hand,
      hasCollision: false,
      pos: [0.0, 0.0, 0.0],
      rot: [0.0, 0.0, 0.0],
    },
  },
  torch: {
    dictionary: "anim@heists@humane_labs@finale@keycards",
    name: "ped_b_enter_loop",
    type: "single",
    flag:
      AnimationFlags.AF_LOOPING +
      AnimationFlags.AF_UPPERBODY +
      AnimationFlags.AF_SECONDARY,
    prop: {
      model: "survival_torch",
      bone: PedBoneId.PH_R_Hand,
      pos: [-0.27, 1.05, 0.59],
      rot: [120.0, 10.0, 0.0], // [chest, planar, ]
    },
  },
  rake: {
    dictionary: "anim@amb@drug_field_workers@rake@male_a@base",
    name: "base",
    type: "single",
    prop: {
      model: "prop_tool_rake",
      bone: PedBoneId.PH_R_Hand,
      pos: [0.0, 0.0, -0.03],
      rot: [0.0, 0.0, 0.0],
    },
  },
  sweep: {
    dictionary: "anim@amb@drug_field_workers@rake@male_a@base",
    name: "base",
    type: "single",
    flag:
      AnimationFlags.AF_LOOPING +
      AnimationFlags.AF_UPPERBODY +
      AnimationFlags.AF_SECONDARY,
    prop: {
      model: "prop_tool_broom",
      bone: PedBoneId.PH_R_Hand,
      pos: [-0.01, 0.04, -0.03],
      rot: [0.0, 0.0, 0.0],
    },
  },
};

import { AnimOptions, AnimFlags, PedBoneId } from "../types";

const defaultEmotes: { [key: string]: AnimOptions } = {
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
      pos: { x: 0.0, y: 0.0, z: 0.0 },
      rot: { x: 0.0, y: 0.0, z: 0.0 },
    },
  },
  rake: {
    dictionary: "anim@amb@drug_field_workers@rake@male_a@base",
    name: "base",
    type: "single",
    prop: {
      model: "prop_tool_rake",
      bone: PedBoneId.PH_R_Hand,
      pos: { x: 0.0, y: 0.0, z: -0.03 },
      rot: { x: 0.0, y: 0.0, z: 0.0 },
    },
  },
  sweep: {
    dictionary: "anim@amb@drug_field_workers@rake@male_a@base",
    name: "base",
    type: "single",
    flag:
      AnimFlags.AF_LOOPING + AnimFlags.AF_UPPERBODY + AnimFlags.AF_SECONDARY,
    prop: {
      model: "prop_tool_broom",
      bone: PedBoneId.PH_R_Hand,
      pos: { x: 0.0, y: 0.0, z: -0.03 },
      rot: { x: 0.0, y: 0.0, z: 0.0 },
    },
  },
};

export const emotes = new Map<string, AnimOptions>(
  Object.entries(defaultEmotes)
);

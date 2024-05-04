import { startAnim } from ".";

let active = false;
let tick = 0;
let loop: string | number | NodeJS.Timeout | undefined = 0;

export function preview() {
  const dictionary = "anim@heists@humane_labs@finale@keycards";
  const anims = [
    "ped_b_pass",
    "ped_a_enter_keycard",
    "ped_b_fail_d",
    "ped_b_fail_a_keycard",
    "ped_a_fail_b",
    "ped_a_exit_keycard",
    "ped_a_exit",
    "ped_a_fail_d_keycard",
    "ped_b_fail_b",
    "ped_b_enter_loop_keycard",
    "ped_b_fail_d_keycard",
    "ped_b_loop_keycard",
    "ped_b_exit",
    "ped_b_fail_a",
    "ped_b_fail_c_keycard",
    "ped_a_fail_d",
    "ped_b_exit_keycard",
    "ped_a_fail_c",
    "ped_b_fail_b_keycard",
    "ped_b_pass_keycard",
    "ped_a_enter_loop_keycard",
    "ped_a_enter",
    "ped_a_pass",
    "ped_a_loop",
    "ped_a_fail_a_keycard",
    "ped_a_fail_b_keycard",
    "ped_b_enter_loop",
    "ped_b_enter_keycard",
    "ped_a_intro_b_keycard",
    "ped_a_pass_keycard",
    "ped_b_loop",
    "ped_b_fail_c",
    "ped_a_intro_b",
    "ped_a_enter_loop",
    "ped_a_fail_c_keycard",
    "ped_a_fail_a",
    "ped_b_enter",
    "ped_b_intro_b_keycard",
    "ped_b_intro_b",
    "ped_a_loop_keycard",
  ];

  if (active) {
    clearTick(tick);
    clearInterval(loop);
    active = false;
    return console.log("Animation Preview stopped");
  }

  active = true;

  let i = 0;

  const CURR_ANIM_TEXT = "CURR_ANIM_TEXT";
  SetTextScale(0.0, 0.5);
  SetTextFont(0);
  SetTextColour(255, 255, 255, 255);
  SetTextCentre(false);
  AddTextEntry(CURR_ANIM_TEXT, "~a~");

  tick = setTick(() => {
    BeginTextCommandDisplayText(CURR_ANIM_TEXT);
    AddTextComponentSubstringPlayerName(anims[i]);
    EndTextCommandDisplayText(0.01, 0.9);

    if (i === anims.length) {
      clearTick(tick);
    }
  });

  console.log(i, anims[i]);

  const mockHandles = {
    animName: "",
    propHandle: 0,
    propModel: 0,
    particleHandle: 0,
    particleName: "",
    propTwoHandle: 0,
    propTwoModel: 0,
    particleTwoHandle: 0,
    particleTwoName: "",
  };

  startAnim({ dictionary, name: anims[i], type: "single" }, mockHandles);

  loop = setInterval(() => {
    if (i === anims.length - 1) clearInterval(loop);
    i++;
    console.log(i, anims[i]);
    startAnim({ dictionary, name: anims[i], type: "single" }, mockHandles);
  }, 3000);

  //   SetPedAnim(animDict, "ped_a_enter_loop", { animType: "single" });
}

// anim@heists@humane_labs@finale@keycards:ped_a_enter_loop

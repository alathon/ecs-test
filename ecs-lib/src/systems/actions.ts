export type MoveAction = BaseAction & {
  type: "move";
  jumping: boolean;
  moveX: number;
  moveY: number;
  moveZ: number;
  tick: number;
};

export type AbilityUseAction = BaseAction & {
  type: "ability_use";
};

export type AbilityCancelAction = BaseAction & {
  type: "ability_cancel";
};

export type BaseAction = {
  type: string;
  tick: number;
};

export type Action = MoveAction | AbilityUseAction | AbilityCancelAction;

// const BufferedAction: {
//   move: MoveAction[];
//   abilityUse: AbilityUseAction[];
//   abilityCancelAction: AbilityCancelAction[];
// };

export interface ActionBuffer {
  getActions(
    eid: number,
    tick: number,
    simulateMoveIfEmpty: boolean,
  ): {
    move: MoveAction;
    abilityUse: AbilityUseAction;
    abilityCancelAction: AbilityCancelAction;
  };
}

// export function actionSystem(world, buffer: ActionBuffer) {
//   for(const eid of query(world, ))
// }

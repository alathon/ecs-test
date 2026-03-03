import { query } from "bitecs";
import { MovementInput } from "~/components";
import { type ECSWorld } from "~/world";

export interface MovementInputBuffer {
  getInput(
    eid: number,
    tick: number,
  ): { jumping: boolean; moveX: number; moveY: number; moveZ: number };
}

export function movementInputSystem(world: ECSWorld) {
  if (!world.externalDeps.moveBuffer)
    throw new Error(
      "No moveBuffer set for world, cannot consume movement input",
    );

  for (const eid of query(world, [MovementInput])) {
    const input = world.externalDeps.moveBuffer.getInput(eid, world.time.tick);
    MovementInput.jumping[eid] = input.jumping;
    MovementInput.moveX[eid] = input.moveX;
    MovementInput.moveY[eid] = input.moveY;
    MovementInput.moveZ[eid] = input.moveZ;
  }
}

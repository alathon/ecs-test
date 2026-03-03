import { timeSystem } from "./time";
import { playerMovementSystem, movementInputSystem } from "./movement";
import type { ECSWorld } from "~/world";

export interface TimeStep {
  tick: number;
  deltaTimeMs: number;
  now: number;
}

//// SIMULATION STEP. Each one represents a single tick.
export const stepWorld = (world: ECSWorld, timeStep: TimeStep) => {
  // Advance time.
  timeSystem(world, timeStep);

  // Get movement input
  movementInputSystem(world);

  // Perform player movement
  playerMovementSystem(world);
};

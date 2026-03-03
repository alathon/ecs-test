import { type TimeStep } from "./simulate";
import { type ECSWorld } from "~/world";

// Advance time of world.
export const timeSystem = (
  { time }: ECSWorld,
  { tick, deltaTimeMs, now }: TimeStep,
) => {
  time.delta = deltaTimeMs;
  time.deltaSeconds = deltaTimeMs / 1000;
  time.then = now;
  time.tick = tick;
};

import { addPrefab, addComponent, IsA } from "bitecs";
import {
  Position,
  Vitals,
  Velocity,
  Movement,
  MovementInput,
} from "./components";
import { type ECSWorld } from "./world";

export type Prefabs = {
  Mob: number;
  Player: number;
  NPC: number;
};

export const createDefaultPrefabs = (world: ECSWorld) => {
  const Mob = addPrefab(world);
  addComponent(world, Mob, Position);
  addComponent(world, Mob, Vitals);
  addComponent(world, Mob, Velocity);

  const Player = addPrefab(world);
  addComponent(world, Player, IsA(Mob));
  addComponent(world, Player, MovementInput);
  addComponent(world, Player, Movement);

  const NPC = addPrefab(world);
  addComponent(world, NPC, IsA(Mob));

  world.prefabs = { Mob, Player, NPC };
};

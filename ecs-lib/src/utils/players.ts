import { addComponent, addEntity, IsA } from "bitecs";
import * as BABYLON from "@babylonjs/core";
import { Movement } from "~/components";
import { type ECSWorld } from "~/world";

export const createPlayer = (world: ECSWorld) => {
  if (!world.externalDeps.babylon) {
    throw new Error(
      "Cannot create player: external dependency babylon missing from ecs world",
    );
  }

  const player = addEntity(world);
  addComponent(world, player, IsA(world.prefabs.Player));

  // Initialize Movement vectors/stuff.
  const probe = BABYLON.MeshBuilder.CreateBox(
    `col_probe_entity_${player}`,
    { size: 1 },
    world.externalDeps.babylon.scene,
  );
  probe.isVisible = false;
  probe.isPickable = false;
  probe.checkCollisions = true;
  probe.ellipsoid = new BABYLON.Vector3(0.35, 0.9, 0.35);
  probe.ellipsoidOffset = new BABYLON.Vector3(0, 0.9, 0);

  Movement.collisionProbe[player] = probe;

  Movement.groundRay[player] = new BABYLON.Ray(
    BABYLON.Vector3.Zero(),
    BABYLON.Vector3.Down(),
    1000,
  );
  Movement.movementXZ[player] = new BABYLON.Vector3();
  Movement.movementY[player] = new BABYLON.Vector3();
  Movement.uncollided[player] = new BABYLON.Vector3();
  return player;
};

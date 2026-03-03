import { query, IsA, Not } from "bitecs";
import {
  Position,
  Stunned,
  MovementInput,
  Movement,
  PositionDataComponent,
  safeSetComponent,
} from "~/components";
import { type ECSWorld } from "~/world";

export const playerMovementSystem = (world: ECSWorld) => {
  const deltaSeconds = world.time.deltaSeconds;

  for (const eid of query(world, [IsA(world.prefabs.Player), Not(Stunned)])) {
    const { moveX, moveY, moveZ, jumping } = MovementInput;
    const pressedJump = jumping[eid];

    // Ignore if we aren't moving.
    if (moveX[eid] == 0 && moveY[eid] == 0 && moveZ[eid] == 0 && !pressedJump)
      continue;

    const collisionProbe = Movement.collisionProbe[eid];
    const movementXZ = Movement.movementXZ[eid];
    const movementY = Movement.movementY[eid];
    const uncollided = Movement.uncollided[eid];
    if (!collisionProbe || !movementXZ || !movementY || !uncollided) {
      throw new Error(`Movement not properly initialized for entity ${eid}`);
    }
    let horizontalCollision = false;
    let verticalCollision = false;

    // Set collisionProbe to current position.
    collisionProbe.position.set(
      Position.x[eid],
      Position.y[eid],
      Position.z[eid],
    );

    if (moveX[eid] != 0 || moveZ[eid] != 0) {
      movementXZ.set(moveX[eid] * deltaSeconds, 0, moveZ[eid] * deltaSeconds);
    }
    if (moveY[eid] != 0) {
      movementY.set(0, pressedJump ? 1 : 0, 0);
    }

    // Do horizontal move.
    if (movementXZ.lengthSquared() > 0) {
      uncollided.copyFrom(collisionProbe.position);
      collisionProbe.moveWithCollisions(movementXZ);
      collisionProbe.computeWorldMatrix(true);
      horizontalCollision = !collisionProbe.position.equalsWithEpsilon(
        uncollided,
        0.01,
      );
    }

    // Do vertical move.
    if (movementY.lengthSquared() > 0) {
      uncollided.copyFrom(collisionProbe.position);
      collisionProbe.moveWithCollisions(movementY);
      collisionProbe.computeWorldMatrix(true);
      verticalCollision = !collisionProbe.position.equalsWithEpsilon(
        uncollided,
        0.01,
      );
    }

    safeSetComponent(world, eid, PositionDataComponent, {
      x: collisionProbe.position.x,
      y: collisionProbe.position.y,
      z: collisionProbe.position.z,
    });
  }
};

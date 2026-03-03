import { MovementInputBuffer } from "ecs-lib";
import { DomInputManager } from "./dom-input-manager";

export class FakeMoveInputBuffer implements MovementInputBuffer {
  private playerMovement: {
    jumping: boolean;
    moveX: number;
    moveY: number;
    moveZ: number;
  } = {
    jumping: false,
    moveX: 0,
    moveY: 0,
    moveZ: 0,
  };

  bufferMovement(dim: DomInputManager) {
    const moveVector = dim.getMovementDirection();
    const jumping = dim.getJumping();
    this.playerMovement.jumping = jumping;
    this.playerMovement.moveX = moveVector.x;
    this.playerMovement.moveY = moveVector.y;
    this.playerMovement.moveZ = moveVector.z;
  }

  getInput(_eid: number, _tick: number) {
    return this.playerMovement;
  }
}

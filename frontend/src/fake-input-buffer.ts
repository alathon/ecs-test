import { MovementInputBuffer } from "ecs-lib";
import { DomInputManager } from "./dom-input-manager";

export interface MovementIntent {
  jumping: boolean;
  moveX: number;
  moveY: number;
  moveZ: number;
}

export class FakeMoveInputBuffer implements MovementInputBuffer {
  private movementIntentListeners: ((event: MovementIntent) => void)[] = [];

  private playerMovement: MovementIntent = {
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
    this._emitMovementIntent(this.playerMovement);
  }

  public onMovementIntent(
    listener: (event: MovementIntent) => void,
  ): () => void {
    if (this.movementIntentListeners.includes(listener)) {
      return () => {};
    }
    this.movementIntentListeners.push(listener);
    return () => {
      const index = this.movementIntentListeners.indexOf(listener);
      if (index != -1) {
        this.movementIntentListeners.splice(index, 1);
      }
    };
  }

  private _emitMovementIntent(intent: MovementIntent) {
    for (const listener of this.movementIntentListeners) {
      listener(intent);
    }
  }

  getInput(_eid: number, _tick: number) {
    return this.playerMovement;
  }
}

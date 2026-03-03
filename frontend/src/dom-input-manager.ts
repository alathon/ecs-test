import type { Observer } from "@babylonjs/core/Misc/observable";
import { Scene } from "@babylonjs/core/scene";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import {
  KeyboardEventTypes,
  type KeyboardInfo,
} from "@babylonjs/core/Events/keyboardEvents";

export class DomInputManager {
  private isInitialized = false;
  private scene?: Scene;
  private keyboardObserver?: Observer<KeyboardInfo>;
  private movementDirection = Vector3.Zero();

  public get initialized(): boolean {
    return this.isInitialized;
  }

  private keys = new Map<string, boolean>();
  private pressedKeys = new Set<string>();

  public initialize(scene: Scene): void {
    if (this.isInitialized) {
      return;
    }
    this.scene = scene;

    // Track keyboard input
    this.keyboardObserver = scene.onKeyboardObservable.add((kbInfo) => {
      const key = kbInfo.event.key.toLowerCase();

      if (kbInfo.type === KeyboardEventTypes.KEYDOWN) {
        if (!this.keys.get(key)) {
          this.pressedKeys.add(key);
        }
        this.keys.set(key, true);
      } else if (kbInfo.type === KeyboardEventTypes.KEYUP) {
        this.keys.set(key, false);
      }
    });

    this.isInitialized = true;
  }

  public dispose(): void {
    if (!this.isInitialized) {
      return;
    }

    if (this.scene && this.keyboardObserver) {
      this.scene.onKeyboardObservable.remove(this.keyboardObserver);
      this.keyboardObserver = undefined;
    }

    this.scene = undefined;
    this.keys.clear();
    this.pressedKeys.clear();
    this.isInitialized = false;
  }

  public isKeyDown(key: string): boolean {
    return this.keys.get(key.toLowerCase()) ?? false;
  }

  public consumeKeyPress(key: string): boolean {
    const normalized = key.toLowerCase();
    if (!this.pressedKeys.has(normalized)) {
      return false;
    }
    this.pressedKeys.delete(normalized);
    return true;
  }

  /**
   * Checks if the sprint key is currently held down.
   */
  public isSprinting(): boolean {
    return this.isKeyDown("shift");
  }

  public getJumping(): boolean {
    return this.isKeyDown("space");
  }

  public getMovementDirection(): Vector3 {
    this.movementDirection.setAll(0);
    // WASD movement only to avoid camera key conflicts
    if (this.isKeyDown("w")) {
      this.movementDirection.z = 1;
    }
    if (this.isKeyDown("s")) {
      this.movementDirection.z = -1;
    }
    if (this.isKeyDown("d")) {
      this.movementDirection.x = 1;
    }
    if (this.isKeyDown("a")) {
      this.movementDirection.x = -1;
    }

    return this.movementDirection;
  }
}

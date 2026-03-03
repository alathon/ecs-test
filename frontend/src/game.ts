import { observe, onSet } from "bitecs";
import { FakeMoveInputBuffer, MovementIntent } from "./fake-input-buffer";
import { TestRoomState } from "ecs-lib";
import * as BABYLON from "@babylonjs/core";

import {
  Position,
  stepWorld,
  createPlayer,
  getWorld,
  type ECSWorld,
  MovementInput,
} from "ecs-lib";

import { DomInputManager } from "./dom-input-manager";
import { ColyseusSDK, Room } from "@colyseus/sdk";

const TICK_MS = 50;

interface Entity {
  targetPosition: BABYLON.Vector3;
  mesh: BABYLON.Mesh;
}

export class Game {
  public currentTick = 0;
  public elapsedMs = 0;
  public playerId: number;
  public entities: Map<number, Entity> = new Map();
  public world: ECSWorld;
  public scene: BABYLON.Scene;
  public camera: BABYLON.Camera;
  public inputManager: DomInputManager;
  public moveInputBuffer: FakeMoveInputBuffer;
  public client: ColyseusSDK;
  public room?: Room<any, TestRoomState>;

  constructor(scene: BABYLON.Scene, camera: BABYLON.Camera) {
    this.scene = scene;
    this.camera = camera;
    this.world = getWorld();
    this.moveInputBuffer = new FakeMoveInputBuffer();

    this.inputManager = new DomInputManager();
    this.inputManager.initialize(this.scene);
    this.world.externalDeps.babylon = { scene, camera };
    this.world.externalDeps.moveBuffer = this.moveInputBuffer;
    this.playerId = createPlayer(this.world);
    this.entities.set(this.playerId, {
      mesh: BABYLON.MeshBuilder.CreateCapsule(
        "player",
        { height: 2, radius: 0.5 },
        scene,
      ),
      targetPosition: new BABYLON.Vector3(0, 0, 0),
    });

    const serverUrl = "ws://localhost:2567";
    this.client = new ColyseusSDK(serverUrl);
    this.observeECSUpdates();

    this.moveInputBuffer.onMovementIntent(this.onMovementIntent.bind(this));
  }

  private onMovementIntent(intent: MovementIntent): void {
    //console.log(`onMovementIntent tick ${this.world.time.tick}`);
    // Send to server.
    if (!this.world) return;
    const tick = this.world.time.tick;
    const msg = { moveIntent: intent, simTick: tick };
    //console.log(`Sending move: ${JSON.stringify(msg)}`);
    this.room?.send("move", msg);
  }

  public async connect(): Promise<boolean> {
    try {
      this.room = await this.client.joinOrCreate("test", {}, TestRoomState);
      console.log(`Connected to test room`);
      return true;
    } catch (err) {
      return false;
    }
  }

  private observeECSUpdates() {
    observe(this.world, onSet(Position), (eid: number, params) => {
      this.entities.get(eid)?.targetPosition.set(params.x, params.y, params.z);
    });

    // observe(this.world, onSet(MovementInput), (eid: number, params) => {
    //   console.log(
    //     `TODO: Add unACK'ed move for entity ${eid}: ${JSON.stringify(params)}`,
    //   );
    //   console.log(`Current world tick: ` + this.world.time.tick);
    // });
  }

  public fixedTick(deltaTimeMs: number, now: number) {
    this.currentTick++;
    stepWorld(this.world, {
      tick: this.currentTick,
      deltaTimeMs: deltaTimeMs,
      now,
    });
  }

  public update(deltaTimeMs: number, now: number): number {
    this.elapsedMs += deltaTimeMs;

    // Check input
    this.moveInputBuffer.bufferMovement(this.inputManager);

    // Process ticks.
    let processedTicks = 0;
    while (this.elapsedMs >= TICK_MS) {
      this.elapsedMs -= TICK_MS;
      this.fixedTick(TICK_MS, now);
      processedTicks += 1;
    }

    // Lerp entities towards their target position.
    for (const entity of this.entities.values()) {
      if (
        entity.mesh.position.equalsWithEpsilon(entity.targetPosition, 0.001)
      ) {
        continue;
      }

      const alpha = Math.min(1, this.elapsedMs / TICK_MS);
      entity.mesh.position = BABYLON.Vector3.Lerp(
        entity.mesh.position,
        entity.targetPosition,
        alpha,
      );
    }

    return processedTicks;
  }
}

import {
  defineServer,
  defineRoom,
  Room,
  validate,
  type Client,
} from "@colyseus/core";
import {
  createPlayer,
  getWorld,
  Position,
  stepWorld,
  TestRoomState,
  type ECSWorld,
  type MoveInput,
  type MovementInputBuffer,
} from "ecs-lib";
import { z } from "zod";
import * as BABYLON from "@babylonjs/core";
import { observe, onSet } from "bitecs";

export type MoveMessage = {
  moveIntent: {
    moveX: number;
    moveY: number;
    moveZ: number;
    jumping: boolean;
  };
  simTick: number;
};

export const TICK_MS = 50;

// The BufferedMovesConsumer keeps a window of -10 ticks before current, up to +10 ticks after
// current tick, for MAX_PLAYERS entries of MovementInput.
export class BufferedMovesConsumer implements MovementInputBuffer {
  private static readonly TICKS = 20;
  private static readonly MAX_PLAYERS = 300;
  private buffer: MoveInput[][] = new Array(BufferedMovesConsumer.TICKS)
    .fill(false)
    .map(() =>
      new Array(BufferedMovesConsumer.MAX_PLAYERS).fill({
        jumping: false,
        moveX: 0,
        moveY: 0,
        moveZ: 0,
      }),
    );

  setInput(eid: number, tick: number, move: MoveInput) {
    const bufferTick = this.tickToBufferEntry(tick);

    if (this.buffer[bufferTick]) {
      this.buffer[bufferTick][eid] = move;
      // console.log(`setInput: tick=${tick} bufferTick=${bufferTick} eid=${eid}`);
      return;
    }
  }

  // Return a number between 0 and TICKS-1.
  private tickToBufferEntry(tick: number): number {
    return (
      (tick - 1 + BufferedMovesConsumer.TICKS) % BufferedMovesConsumer.TICKS
    );
  }

  validTick(tick: number): { valid: true } | { valid: false; reason: string } {
    const translated = this.tickToBufferEntry(tick);
    if (translated < 0 || translated >= BufferedMovesConsumer.TICKS) {
      return { valid: false, reason: `tick out of range: ${tick}` };
    }
    return { valid: true };
  }

  // Retrieve move for tick for given entity.
  getInput(eid: number, tick: number): MoveInput {
    const bufferTick = this.tickToBufferEntry(tick);

    if (this.buffer[bufferTick] && this.buffer[bufferTick][eid]) {
      return this.buffer[bufferTick][eid];
    }

    throw new Error(
      `No move input for: eid=${eid} tick=${tick} bufferTick=${bufferTick}`,
    );
  }
}

export class TestRoom extends Room<{ state: TestRoomState }> {
  private world: ECSWorld;

  private clientIdToEntityId = new Map<string, number>();
  private moveInputBuffer: BufferedMovesConsumer;
  private engine: BABYLON.Engine;
  private scene: BABYLON.Scene;
  private camera: BABYLON.Camera;
  private elapsedTimeMs = 0;
  private currentTick = 0;

  override onJoin(
    client: Client<any>,
    _options?: any,
    _auth?: any,
  ): void | Promise<any> {
    // Create new entity.
    const entityId = createPlayer(this.world);
    this.clientIdToEntityId.set(client.sessionId, entityId);
  }

  override onCreate() {
    this.setSimulationInterval((deltaTime) => {
      const now = Date.now();
      this.elapsedTimeMs += deltaTime;
      while (this.elapsedTimeMs >= TICK_MS) {
        this.elapsedTimeMs -= TICK_MS;
        this.fixedTick(now, TICK_MS);
      }
    });
  }

  override messages = {
    move: validate(
      z.object({
        moveIntent: z.object({
          moveX: z.number(),
          moveY: z.number(),
          moveZ: z.number(),
          jumping: z.boolean(),
        }),
        simTick: z.number().min(0),
      }),
      (client, msg) => {
        const entityId = this.clientIdToEntityId.get(client.sessionId);
        if (entityId !== undefined) {
          const ok = this.moveInputBuffer.validTick(msg.simTick);
          if (!ok.valid) {
            console.log(`Invalid tick: ${msg.simTick} - ${ok.reason}`);
            return;
          }
          this.moveInputBuffer.setInput(entityId, msg.simTick, msg.moveIntent);
          // console.log(
          //   `Buffered move for ${client.sessionId} / eid ${entityId}:`,
          //   msg,
          // );
        }
      },
    ),
  };

  constructor() {
    super();
    this.engine = new BABYLON.NullEngine();
    this.scene = new BABYLON.Scene(this.engine);
    this.camera = new BABYLON.Camera(
      "camera",
      new BABYLON.Vector3(0, 0, -10),
      this.scene,
    );
    this.world = getWorld();
    this.moveInputBuffer = new BufferedMovesConsumer();
    this.world.externalDeps.babylon = {
      scene: this.scene,
      camera: this.camera,
    };
    this.world.externalDeps.moveBuffer = this.moveInputBuffer;
    this.state = new TestRoomState();

    observe(this.world, onSet(Position), (eid, params) => {
      const { x, y, z } = params;
      console.log(`TICK ${this.world.time.tick} x=${x} y=${y} z=${z}`);
    });
  }

  fixedTick(now: number, deltaTime: number) {
    this.currentTick++;
    stepWorld(this.world, {
      deltaTimeMs: deltaTime,
      tick: this.currentTick,
      now,
    });
  }
}

export const server = defineServer({
  rooms: {
    test: defineRoom(TestRoom),
  },
});

export default server;

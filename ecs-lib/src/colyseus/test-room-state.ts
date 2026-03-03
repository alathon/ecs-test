import { MapSchema, Schema, type } from "@colyseus/schema";
import { PlayerState } from "./player-state";

export class TestRoomState extends Schema {
  @type({ map: PlayerState }) players = new MapSchema<PlayerState>();
}

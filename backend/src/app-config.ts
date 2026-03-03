import { defineServer, defineRoom, Room } from "@colyseus/core";
import { TestRoomState } from "ecs-lib";

export class TestRoom extends Room<{ state: TestRoomState }> {}

export const server = defineServer({
  rooms: {
    test: defineRoom(TestRoom),
  },
});

export default server;

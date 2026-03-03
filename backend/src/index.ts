import { listen } from "@colyseus/tools";
import { matchMaker } from "@colyseus/core";
import app from "./app-config";

const bootServer = async () => {
  await matchMaker.createRoom("test", {});

  const server = await listen(app);
};

bootServer();

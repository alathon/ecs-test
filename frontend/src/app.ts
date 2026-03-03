import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import * as BABYLON from "@babylonjs/core";
import { Client } from "@colyseus/sdk";
import { Game } from "./game";

const ENDPOINT = "ws://localhost:2567";
const ROOM_NAME = "testroom";

class App {
  private _canvas: HTMLCanvasElement;
  private _engine: BABYLON.Engine;
  private _scene: BABYLON.Scene;
  private _camera: BABYLON.ArcRotateCamera;
  private _light: BABYLON.HemisphericLight;
  private _sphere: BABYLON.Mesh;
  private _colyseus: Client = new Client(ENDPOINT);
  private _game: Game;

  constructor() {
    // create the canvas html element and attach it to the webpage
    this._canvas = document.getElementById("gameCanvas") as HTMLCanvasElement;

    // initialize babylon scene and engine
    this._engine = new BABYLON.Engine(this._canvas, true);
    this._scene = new BABYLON.Scene(this._engine);

    this._camera = new BABYLON.ArcRotateCamera(
      "Camera",
      Math.PI / 2,
      Math.PI / 2,
      2,
      BABYLON.Vector3.Zero(),
      this._scene,
    );
    this._camera.attachControl(this._canvas, true);
    this._light = new BABYLON.HemisphericLight(
      "light1",
      new BABYLON.Vector3(1, 1, 0),
      this._scene,
    );
    this._sphere = BABYLON.MeshBuilder.CreateSphere(
      "sphere",
      { diameter: 1 },
      this._scene,
    );

    // hide/show the Inspector
    window.addEventListener("keydown", (ev) => {
      // Shift+Ctrl+Alt+I
      if (ev.shiftKey && ev.ctrlKey && ev.altKey && ev.keyCode === 73) {
        if (this._scene.debugLayer.isVisible()) {
          this._scene.debugLayer.hide();
        } else {
          this._scene.debugLayer.show();
        }
      }
    });

    this._game = new Game(this._scene, this._camera);

    // run the main render loop
    this._engine.runRenderLoop(() => {
      const deltaTimeMs = this._engine.getDeltaTime() ?? 0;
      const now = performance.now();
      this._game.update(deltaTimeMs, now);
      this._scene.render();
    });

    window.addEventListener("resize", () => {
      this._engine.resize();
    });
  }

  public connect() {
    return this._game.connect();
  }
}

const gogoGadget = async () => {
  const app = new App();
  await app.connect();
};

gogoGadget();

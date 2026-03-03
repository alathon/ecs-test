import { observe, onSet, onGet } from "bitecs";
import { Position, Velocity } from "./components";
import { type ECSWorld } from "~/world";

const _createVectorObserver = (
  world: ECSWorld,
  component: { x: number[]; y: number[]; z: number[] },
) => {
  observe(world, onSet(component), (eid, params) => {
    component.x[eid] = params.x;
    component.y[eid] = params.y;
    component.z[eid] = params.z;
  });

  observe(world, onGet(component), (eid) => ({
    x: component.x[eid],
    y: component.y[eid],
    z: component.z[eid],
  }));
};

// TODO: A bit unfortunate that this is disjointed from the components, and that you need to remember to do this and there
// isn't any compile-time safety for it!
export const createDefaultComponentObservers = (world: ECSWorld): void => {
  _createVectorObserver(world, Velocity);
  _createVectorObserver(world, Position);
};

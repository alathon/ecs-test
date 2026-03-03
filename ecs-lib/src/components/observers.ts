import { observe, onSet, onGet, setComponent } from "bitecs";
import { MovementInput, Position, Velocity } from "./components";
import { type ECSWorld } from "~/world";

type ComponentRef = object;

export type DataComponentAdapter<TSet, TGet = TSet> = {
  component: ComponentRef;
  name: string;
  set: (eid: number, params: TSet) => void;
  get: (eid: number) => TGet;
};

const writableComponentsByWorld = new WeakMap<ECSWorld, Set<ComponentRef>>();

const getWritableSet = (world: ECSWorld): Set<ComponentRef> => {
  let writable = writableComponentsByWorld.get(world);
  if (!writable) {
    writable = new Set<ComponentRef>();
    writableComponentsByWorld.set(world, writable);
  }

  return writable;
};

export const registerDataComponent = <TSet, TGet = TSet>(
  world: ECSWorld,
  adapter: DataComponentAdapter<TSet, TGet>,
): void => {
  observe(world, onSet(adapter.component), (eid, params) => {
    adapter.set(eid, params as TSet);
  });

  observe(world, onGet(adapter.component), (eid) => adapter.get(eid));
  getWritableSet(world).add(adapter.component);
};

export const safeSetComponent = <TSet, TGet = TSet>(
  world: ECSWorld,
  eid: number,
  adapter: DataComponentAdapter<TSet, TGet>,
  data: TSet,
): void => {
  if (!getWritableSet(world).has(adapter.component)) {
    throw new Error(
      `Component "${adapter.name}" is not registered for setComponent() writes. Register it with registerDataComponent() before calling safeSetComponent().`,
    );
  }

  setComponent(world, eid, adapter.component, data);
};

export const VelocityDataComponent: DataComponentAdapter<
  { x: number; y: number; z: number },
  { x?: number; y?: number; z?: number }
> = {
  component: Velocity,
  name: "Velocity",
  set: (eid, params) => {
    Velocity.x[eid] = params.x;
    Velocity.y[eid] = params.y;
    Velocity.z[eid] = params.z;
  },
  get: (eid) => ({
    x: Velocity.x[eid],
    y: Velocity.y[eid],
    z: Velocity.z[eid],
  }),
};

export const PositionDataComponent: DataComponentAdapter<
  { x: number; y: number; z: number },
  { x?: number; y?: number; z?: number }
> = {
  component: Position,
  name: "Position",
  set: (eid, params) => {
    Position.x[eid] = params.x;
    Position.y[eid] = params.y;
    Position.z[eid] = params.z;
  },
  get: (eid) => ({
    x: Position.x[eid],
    y: Position.y[eid],
    z: Position.z[eid],
  }),
};

export const MovementInputDataComponent: DataComponentAdapter<
  { jumping: boolean; moveX: number; moveY: number; moveZ: number },
  { jumping?: boolean; moveX?: number; moveY?: number; moveZ?: number }
> = {
  component: MovementInput,
  name: "MovementInput",
  set: (eid, params) => {
    MovementInput.jumping[eid] = params.jumping ? 1 : 0;
    MovementInput.moveX[eid] = params.moveX;
    MovementInput.moveY[eid] = params.moveY;
    MovementInput.moveZ[eid] = params.moveZ;
  },
  get: (eid) => ({
    jumping: MovementInput.jumping[eid] === 1,
    moveX: MovementInput.moveX[eid],
    moveY: MovementInput.moveY[eid],
    moveZ: MovementInput.moveZ[eid],
  }),
};

// TODO: Still disjointed from component declarations; the helper now centralizes registration and runtime checks.
export const createDefaultComponentObservers = (world: ECSWorld): void => {
  registerDataComponent(world, VelocityDataComponent);
  registerDataComponent(world, PositionDataComponent);
  registerDataComponent(world, MovementInputDataComponent);
};

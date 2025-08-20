declare module "three/examples/jsm/controls/OrbitControls" {
  import { Camera, EventDispatcher, MOUSE, Renderer, TOUCH, Vector3 } from "three";

  export class OrbitControls extends EventDispatcher {
    constructor(object: Camera, domElement?: HTMLElement);

    object: Camera;
    domElement: HTMLElement | Document;

    enabled: boolean;
    target: Vector3;

    minDistance: number;
    maxDistance: number;

    enableDamping: boolean;
    dampingFactor: number;

    update(): void;
    dispose(): void;
  }
}

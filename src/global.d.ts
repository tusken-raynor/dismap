import THREE from 'three';

declare global {
  interface Window {
    THREE: typeof THREE;
  }
  var THREE: typeof THREE;
}

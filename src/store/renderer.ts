// This file is for watching the values of the store and updating renderer canvas

import store from ".";
import renderer from "../renderer";

export default () => {
  store.watch((s) => s.mapWidth, updateDimensions);
  store.watch((s) => s.mapHeight, updateDimensions);
  store.watch((s) => s.mapWidth, updateMesh);
  store.watch((s) => s.mapHeight, updateMesh);
  store.watch((_, g) => g.meshCountX, updateMesh);
  store.watch((_, g) => g.meshCountY, updateMesh);
  store.watch((s) => s.offsetData, updateMesh);
  store.watch((s) => s.tempOffsetsMesh3D, updateMesh);
  store.watch((s) => s.displayMesh, updateMesh);
  store.watch((s) => s.displaceImageData, updateMaterial);
  store.watch((s) => s.backdropImageURL, updateBackdrop);
};

function updateMesh() {
  renderer
    .updateMesh(
      store.state.mapWidth,
      store.state.mapHeight,
      store.getters.meshCountX,
      store.getters.meshCountY,
      store.state.tempOffsetsMesh3D || store.state.offsetData,
      store.state.displayMesh
    )
    .renderScene();
}

function updateMaterial() {
  renderer.updateMaterial(store.state.displaceImageData).renderScene();
}

async function updateBackdrop() {
  (await renderer.updateBackdrop(store.state.backdropImageURL)).renderScene();
}

function updateDimensions() {
  renderer
    .updateDimensions(store.state.mapWidth, store.state.mapHeight)
    .renderScene();
}

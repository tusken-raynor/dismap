// Let's setup the vuex store

import { createStore } from "vuex";
import { setWorkHorseSize, workHorseCanvas, workHorseCtx } from "../workhorse";
import storage from "../storage";
import displacement from "../displacement";
import { ModalData, NodeOffset, SavedOffsetStore } from "../types";
import renderer from "../renderer";
import rendererWatch from "./renderer";
import utils from "../utils";
import nodesManager from "./nodes";
import params from "../params";

const undoLimit = params.isNumber("undoLimit") ? params.getNumber("undoLimit") : 10;

const store = createStore({
  state: {
    mapWidth: 1350,
    mapHeight: 516,
    displayMesh: true,
    meshDensity: 20,
    scaleX: 1.0,
    scaleY: 1.0,
    offsetData: {} as Record<string, NodeOffset>,
    tempOffsetsMesh3D: null as Record<string, NodeOffset> | null,
    offsetDataUndos: [] as Record<string, NodeOffset>[],
    offsetDataRedos: [] as Record<string, NodeOffset>[],
    displayDisplacementMap: false,
    reflectX: false,
    reflectY: false,
    backdropImageURL: "",
    displaceImageData: null as ImageData | null,
    displaceImageURL: "",
    displaceMapData: null as ImageData | null,
    modalData: null as ModalData | null,
  },
  getters: {
    meshCountX(state): number {
      return state.meshDensity + 1;
    },
    meshCountY(state) {
      return Math.max(Math.round(state.meshDensity / state.mapWidth * state.mapHeight) + 1, 2);
    }
  },
  mutations: {
    setMapWidth(state, payload: number) {
      state.mapWidth = payload;
    },
    setMapHeight(state, payload: number) {
      state.mapHeight = payload;
    },
    setMeshDensity(state, payload: number) {
      state.meshDensity = payload;
    },
    setScaleX(state, payload: number) {
      state.scaleX = payload;
    },
    setScaleY(state, payload: number) {
      state.scaleY = payload;
    },
    setOffsetData(state, payload: Record<string, NodeOffset>) {
      state.offsetData = payload;
    },
    setTempOffsetsMesh3D(state, payload: Record<string, NodeOffset> | null) {
      state.tempOffsetsMesh3D = payload;
    },
    setOffsetDataUndos(state, payload: Record<string, NodeOffset>[]) {
      state.offsetDataUndos = payload;
    },
    setOffsetDataRedos(state, payload: Record<string, NodeOffset>[]) {
      state.offsetDataRedos = payload;
    },
    setBackdropImageURL(state, payload: string) {
      state.backdropImageURL = payload;
    },
    setDisplaceImageData(state, payload: ImageData | null) {
      state.displaceImageData = payload;
    },
    setDisplaceMapData(state, payload: ImageData | null) {
      state.displaceMapData = payload;
    },
    setDisplayDisplacementMap(state, payload: boolean) {
      state.displayDisplacementMap = payload;
    },
    setDisplayMesh(state, payload: boolean) {
      state.displayMesh = payload;
    },
    setReflectX(state, payload: boolean) {
      state.reflectX = payload;
    },
    setReflectY(state, payload: boolean) {
      state.reflectY = payload;
    },
    setModalData(state, payload: ModalData | null) {
      state.modalData = payload;
    }
  },
  actions: {
    undoOffsetAction({ state, commit }) {
      if (state.offsetDataUndos.length === 0) return;
      // Grab the last item from the history
      const lastItem = state.offsetDataUndos.pop()!;
      // Add the current state to the redo history
      state.offsetDataRedos.push(Object.assign({}, state.offsetData));
      // If the length of the redo history is greater than the undo limit, remove the oldest item
      if (state.offsetDataRedos.length > undoLimit) {
        state.offsetDataRedos.shift();
      }
      // Triger an update of the undos and redos
      commit("setOffsetDataUndos", Array.from(state.offsetDataUndos));
      commit("setOffsetDataRedos", Array.from(state.offsetDataRedos));
      // Update the state
      commit("setOffsetData", lastItem);
      // Use the nodeManager to trigger a reset of the nodes
      // Which will align them to the new offsets
      nodesManager.triggerNodeRealignment(Object.assign(nodesManager.blankNodeOffsets(), lastItem));
    },
    redoOffsetAction({ state, commit }) {
      if (state.offsetDataRedos.length === 0) return;
      // Grab the last item from the redo history
      const lastItem = state.offsetDataRedos.pop()!;
      // Add the current state to the undo history
      state.offsetDataUndos.push(Object.assign({}, state.offsetData));
      // If the length of the undo history is greater than the undo limit, remove the oldest item
      if (state.offsetDataUndos.length > undoLimit) {
        state.offsetDataUndos.shift();
      }
      // Triger an update of the undos and redos
      commit("setOffsetDataUndos", Array.from(state.offsetDataUndos));
      commit("setOffsetDataRedos", Array.from(state.offsetDataRedos));
      // Update the state
      commit("setOffsetData", lastItem);
      // Use the nodeManager to trigger a reset of the nodes
      // Which will align them to the new offsets
      nodesManager.triggerNodeRealignment(Object.assign(nodesManager.blankNodeOffsets(), lastItem));
    },
    setOffsetData({ state, commit }, payload: Record<string, NodeOffset>) {
      // Add the current state to the undo history
      state.offsetDataUndos.push(Object.assign({}, state.offsetData));
      // If the length of the undo history is greater than the undo limit, remove the oldest item
      if (state.offsetDataUndos.length > undoLimit) {
        state.offsetDataUndos.shift();
      }
      // Trigger an update of the undos
      commit("setOffsetDataUndos", Array.from(state.offsetDataUndos));
      // Since we did a new custom action, clear the redo history
      state.offsetDataRedos = [];
      // Update the state
      commit("setOffsetData", payload);
    },
    createDisplacementMapOG({ state, getters, commit }) {
      const buffer = displacement.createMap(
        state.mapWidth,
        state.mapHeight,
        getters.meshCountX,
        getters.meshCountY,
        state.scaleX,
        state.scaleY, 
        state.offsetData
      );
      // Create an ImageData object from the buffer
      const imageData = new ImageData(buffer, state.mapWidth, state.mapHeight);
      // Save the imageData to the store
      commit("setDisplaceMapData", imageData);
    },
    createDisplacementMap({ state, commit }) {
      const maxX = 127 / (state.mapWidth * state.scaleX) * 2;
      const maxY = 127 / (state.mapHeight * state.scaleY) * 2;

      // Get the UV buffer from the renderer module
      const buffer = renderer.renderUV();

      // Convert the uv texture to a displacement map texture
      const displacementMap = new Uint8ClampedArray(buffer.length);
      for (let y = 0; y < state.mapHeight; y++) {
        // We are calculatiing certain values in the outer loop so that we only
        // have to calculate them once per row
        const row = y * state.mapWidth;
        for (let x = 0; x < state.mapWidth; x++) {
          const i = (row + x) * 4;
          // Always set the alpha channel to 255
          displacementMap[i + 3] = 255;
          // If the alpha channel has no value, then the displacement is discarded
          const alpha = buffer[i + 2];
          if (alpha === 0) {
            // Set the pixel to no offset
            displacementMap[i] = 127;
            displacementMap[i + 1] = 127;
            continue;
          }
          // Extract the intergeter version of the uv coordinates
          // They range from 0 to 4095, and are stored across all rgb channels
          const u = buffer[i] | ((buffer[i + 2] & 240) << 4);
          const v = buffer[i + 1] | ((buffer[i + 2] & 15) << 8);
          const disX = Math.round(u * (state.mapWidth - 1) / 4095);
          const disY = Math.round(v * (state.mapHeight - 1) / 4095);

          // Calc the offset and make sure to clamp it a i8 range
          const offsetU = Math.min(Math.max(-128, (x - disX) * maxX), 127);
          const offsetV = Math.min(Math.max(-128, (y - disY) * maxY), 127);
          // Set the pixel to the displacement
          displacementMap[i] = offsetU + 128;
          displacementMap[i + 1] = offsetV + 128;
        }
      }

      // Create an ImageData object from the buffer
      const imageData = new ImageData(displacementMap, state.mapWidth, state.mapHeight);
      // Save the imageData to the store
      commit("setDisplaceMapData", imageData);
    },
    async initRenderer({ state, getters }) {
      const parent = document.querySelector(".displace-img");
      if (!parent) return;
      renderer.initialze(state.mapWidth, state.mapHeight);
      // Set up functions to watch the store and update the renderer
      rendererWatch();
      // Run the first render
      renderer.
        updateMesh(
          state.mapWidth,
          state.mapHeight,
          getters.meshCountX,
          getters.meshCountY,
          state.offsetData,
          state.displayMesh
        )
        .updateMaterial(state.displaceImageData)
        .setParent(parent);

      // If there is a backdrop image, update the backdrop asynchonously
      (await renderer.updateBackdrop(state.backdropImageURL)).renderScene();
    },
    rememberMeshConfiguration({ state }) {
      const data = JSON.parse(localStorage.getItem("savedOffsets") || '{}');
      const key = utils.hashString(JSON.stringify(state.offsetData), 16);
      const compiledOffsets = nodesManager.compileNodeOffsets(state.offsetData);
      data[key] = {o: compiledOffsets, d: Date.now()};
      localStorage.setItem("savedOffsets", JSON.stringify(data));
    },
    loadMeshConfigurations(_, callback: (data: Record<string, SavedOffsetStore>) => void) {
      // Pull the saved offsets from localStorage
      const data = JSON.parse(localStorage.getItem("savedOffsets") || '{}');
      // Pass the data to the callback
      callback(data);
    },
    resetMeshNodesOffsets({ state, commit }) {
      nodesManager.triggerNodeRealignment(0, Object.keys(state.offsetData));
      commit("setOffsetData", {});
      // Clear the undo/redo history
      commit("setOffsetDataUndos", []);
      commit("setOffsetDataRedos", []);
    }
  },
  modules: {},
});

// Grab the displaceImageURL from localStorage on first load and use
// it to set the displaceImageData
const displaceImageURL = storage.getValue("displaceImageURL");
if (displaceImageURL) {
  const img = new Image();
  img.src = displaceImageURL;
  img.onload = () => {
    setWorkHorseSize(img.width, img.height);
    workHorseCtx.drawImage(img, 0, 0);
    const imageData = workHorseCtx.getImageData(0, 0, img.width, img.height);
    store.state.displaceImageData = imageData;
  }
}
// Watch the displaceImageData and update the displaceImageURL
store.watch((s) => s.displaceImageData, async (val) => {
  if (val === null) {
    store.state.displaceImageURL = "";
    return;
  }
  setWorkHorseSize(val.width, val.height);
  workHorseCtx.putImageData(val, 0, 0);
  const blob = await workHorseCanvas.convertToBlob();
  const url = URL.createObjectURL(blob);
  store.state.displaceImageURL = url;
});

// Watch both scale values and update the offsetData to accomodate the new potential restrictions
store.watch((s) => s.scaleX, (val) => {
  const maxOffset = val * store.state.mapWidth / 2;
  const minOffset = -maxOffset;
  // Loop throught the offsetData and clamp the values
  const newOffsets = Object.assign({}, store.state.offsetData);
  for (const key in newOffsets) {
    const offset = newOffsets[key];
    offset.x = Math.min(Math.max(offset.x, minOffset), maxOffset);
  }
  store.state.offsetData = newOffsets;
});
store.watch((s) => s.scaleY, (val) => {
  const maxOffset = val * store.state.mapHeight / 2;
  const minOffset = -maxOffset;
  // Loop throught the offsetData and clamp the values
  const newOffsets = Object.assign({}, store.state.offsetData);
  for (const key in newOffsets) {
    const offset = newOffsets[key];
    offset.y = Math.min(Math.max(offset.y, minOffset), maxOffset);
  }
  store.state.offsetData = newOffsets;
});

// Add an overflow hidden class to the body when a modal is open
store.watch((s) => s.modalData, (val) => {
  if (val === null) {
    document.body.classList.remove("overflow-hidden");
  } else {
    document.body.classList.add("overflow-hidden");
  }
});

export default store;
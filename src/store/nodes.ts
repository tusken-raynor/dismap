// Use this file to store callbacks for when the mesh nodes need a reset triggered

import store from ".";
import { NodeOffset } from "../types";

const CALLBACKS: Record<string, ((x: number, y: number) => void)> = {};

export default {
  subscribeToNodeRealignment(index: number, callback: (x: number, y: number) => void) {
    CALLBACKS[index] = callback;
  },
  unsubscribeFromNodeRealignment(index: number) {
    delete CALLBACKS[index];
  },
  triggerNodeRealignment(offsets: Record<string, NodeOffset> | 0, indices?: (number | string)[]) {
    if (indices === undefined) {
      if (offsets === 0) {
        // Reset all nodes
        Object.keys(CALLBACKS).forEach((index) => {
          CALLBACKS[index](0, 0);
        });
      } else {
        Object.entries(offsets).forEach(([index, { x, y }]) => {
          if (index in CALLBACKS) {
            CALLBACKS[index](x, y);
          }
        });
      }
    } else {
      indices.forEach((index) => {
        if (index in CALLBACKS && (offsets === 0 || index in offsets)) {
          const x = offsets === 0 ? 0 : offsets[index].x;
          const y = offsets === 0 ? 0 : offsets[index].y;
          CALLBACKS[index](x, y);
        }
      });
    }
  },
  compileNodeOffsets(offsetData: Record<string, NodeOffset>) {
    // Compile the offsets into a single array, and then join them
    // into a comma-separated string. This makes every 3 values in the
    // array correspond to a single node
    const offsets: number[] = [];
    Object.keys(offsetData).forEach((key) => {
      offsets.push(parseInt(key));
      offsets.push(offsetData[key].x);
      offsets.push(offsetData[key].y);
    });
    return offsets.join(",");
  },
  blankNodeOffsets() {
    const data: Record<string, NodeOffset> = {};
    const count = store.getters.meshCountX * store.getters.meshCountY;
    for (let i = 0; i < count; i++) {
      data[i] = { x: 0, y: 0 };
    } 
    return data;
  }
}
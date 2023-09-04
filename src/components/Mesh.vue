<script lang="ts">
import { defineComponent } from "vue";
import MeshNode from "./MeshNode.vue";
import { mapActions, mapGetters, mapMutations, mapState } from "vuex";
import { NodeOffset } from "../types";

export default defineComponent({
  name: "Mesh",
  components: {
    MeshNode,
  },
  computed: {
    ...mapState([
      "displayMesh",
      "mapWidth",
      "mapHeight",
      "reflectX",
      "reflectY",
      "offsetData",
    ]),
    ...mapGetters(["meshCountX", "meshCountY"]),
    meshCount() {
      return this.meshCountX * this.meshCountY;
    },
    highlightSelector() {
      if (this.manuallySelectedNodes.length) {
        return this.manuallySelectedNodes
          .map((index) => `.mesh-node[data-index="${index}"]`)
          .join(",");
      }
      const current = this.currentGrabbed || this.currentCoverage;
      if (current) {
        const { x, y } = current;
        if (!this.shiftKey && !this.metaKey) {
          // Return the default, single selector
          let selector = `.mesh-node[data-x="${x}"][data-y="${y}"]`;
          if (this.reflectY) {
            // Return the reflected selector
            selector += `, .mesh-node[data-x="${
              this.meshCountX - x - 1
            }"][data-y="${y}"]`;
          }
          if (this.reflectX) {
            // Return the reflected selector
            selector += `, .mesh-node[data-x="${x}"][data-y="${
              this.meshCountY - y - 1
            }"]`;
          }
          if (this.reflectX && this.reflectY) {
            // Return the reflected selector
            selector += `, .mesh-node[data-x="${
              this.meshCountX - x - 1
            }"][data-y="${this.meshCountY - y - 1}"]`;
          }
          return selector;
        }
        let selectors = [];
        if (this.shiftKey) {
          // Return all the nodes within the column
          selectors.push(`.mesh-node[data-x="${x}"]`);
          if (this.reflectY) {
            // Return all the nodes within the reflected column
            selectors.push(`.mesh-node[data-x="${this.meshCountX - x - 1}"]`);
          }
        }
        if (this.metaKey) {
          // Return all the nodes within the row
          selectors.push(`.mesh-node[data-y="${y}"]`);
          if (this.reflectX) {
            // Return all the nodes within the reflected row
            selectors.push(`.mesh-node[data-y="${this.meshCountY - y - 1}"]`);
          }
        }
        return selectors.join(",");
      }
      return "";
    },
    highlightCSS(): string {
      if (this.highlightSelector) {
        return `${this.highlightSelector}{border-color:#fff;cursor: grab;}`;
      }
      return "";
    },
    msb() {
      const left = Math.min(
        this.manualSelectionBounds.x1,
        this.manualSelectionBounds.x2
      );
      const top = Math.min(
        this.manualSelectionBounds.y1,
        this.manualSelectionBounds.y2
      );
      const right =
        innerWidth -
        Math.max(this.manualSelectionBounds.x1, this.manualSelectionBounds.x2);
      const bottom =
        innerHeight -
        Math.max(this.manualSelectionBounds.y1, this.manualSelectionBounds.y2);
      return {
        left,
        top,
        right,
        bottom,
      };
    },
  },
  data() {
    return {
      nodeGrabbed: false,
      shiftKey: false,
      metaKey: false,
      currentCoverage: null as { x: number; y: number; index: number } | null,
      currentGrabbed: null as { x: number; y: number; index: number } | null,
      manuallySelectedNodes: [] as number[],
      manualSelection: false,
      manualSelectionBounds: {
        x1: 0,
        y1: 0,
        x2: 0,
        y2: 0,
      },
      styleEl: null as null | HTMLStyleElement,
    };
  },
  methods: {
    ...mapMutations(["setTempOffsetsMesh3D"]),
    ...mapActions([
      "createDisplacementMap",
      "undoOffsetAction",
      "redoOffsetAction",
      "setOffsetData",
    ]),
    onReleased() {
      // Change the grabbed state
      this.nodeGrabbed = false;
      // Collect all the displaced node's offsets and send
      // them to the store to redraw the displacement map
      const offsetData = Array.from<HTMLElement>(
        this.$el.querySelectorAll(".mesh-node.displaced")
      ).reduce((record, node: HTMLElement) => {
        const index = parseInt(node.getAttribute("data-index")!);
        const x = parseInt(node.getAttribute("data-offset-x")!);
        const y = parseInt(node.getAttribute("data-offset-y")!);
        record[index] = { x, y };
        return record;
      }, {} as Record<string, NodeOffset>);
      this.setOffsetData(offsetData);
      // Reset the temp data
      this.setTempOffsetsMesh3D(null);

      // Create the displacement map
      this.createDisplacementMap();
    },
    onKeyDown(e: KeyboardEvent) {
      if (e.key === "Shift") this.shiftKey = true;
      if (e.key === "Meta" || e.key === "Control") this.metaKey = true;
    },
    onKeyUp(e: KeyboardEvent) {
      if (e.key === "Shift") this.shiftKey = false;
      if (e.key === "Meta" || e.key === "Control") this.metaKey = false;
    },
    onMouseDown(e: MouseEvent) {
      // First check if there is a node under coverage that is manually selected
      // If so, then don't start a manual selection, and unset any manual selection
      if (
        this.currentCoverage &&
        (!this.manuallySelectedNodes.length ||
          this.manuallySelectedNodes.includes(this.currentCoverage.index))
      ) {
        return;
      }
      this.manualSelection = true;
      // Add the event listener for mousemove and mouseup
      document.addEventListener("mousemove", this.onMouseMove);
      document.addEventListener("mouseup", this.onMouseUp);
      // Set the initial bounds of the selection
      this.manualSelectionBounds = {
        x1: e.clientX,
        y1: e.clientY,
        x2: e.clientX,
        y2: e.clientY,
      };
      document.body.classList.add("overflow-hidden");
    },
    onMouseUp(e: MouseEvent) {
      // Remove the event listener for mousemove and mouseup
      document.removeEventListener("mousemove", this.onMouseMove);
      document.removeEventListener("mouseup", this.onMouseUp);
      this.manualSelection = false;
      e;
      document.body.classList.remove("overflow-hidden");
      this.manuallySelectWithinBounds();
    },
    onMouseMove(e: MouseEvent) {
      // Update the bounds of the selection
      this.manualSelectionBounds = {
        x1: this.manualSelectionBounds.x1,
        y1: this.manualSelectionBounds.y1,
        x2: e.clientX,
        y2: e.clientY,
      };
    },
    manuallySelectWithinBounds() {
      // If add is false, use a new array
      const indices: number[] = [];
      // Use the bounds to find all the nodes that are within the bounds
      const left = Math.min(
        this.manualSelectionBounds.x1,
        this.manualSelectionBounds.x2
      );
      const right = Math.max(
        this.manualSelectionBounds.x1,
        this.manualSelectionBounds.x2
      );
      const top = Math.min(
        this.manualSelectionBounds.y1,
        this.manualSelectionBounds.y2
      );
      const bottom = Math.max(
        this.manualSelectionBounds.y1,
        this.manualSelectionBounds.y2
      );
      // Loop through the nodes and find the ones that are within the bounds
      Array.from(this.$refs.meshNodes).forEach((node: any) => {
        const rect = node.$el.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        if (
          centerX >= left &&
          centerX <= right &&
          centerY >= top &&
          centerY <= bottom
        ) {
          indices.push(node.index);
        }
      });
      // If the shift key is pressed and not the meta/ctrl key, then
      // add the indices to the existing array
      if (this.shiftKey && !this.metaKey) {
        this.manuallySelectedNodes = Array.from(
          new Set([...this.manuallySelectedNodes, ...indices])
        );
        return;
      }
      // If the meta/ctrl key is pressed and not the shift key, then
      // remove the indices from the existing array
      if (this.metaKey && !this.shiftKey) {
        this.manuallySelectedNodes = this.manuallySelectedNodes.filter(
          (index) => !indices.includes(index)
        );
        return;
      }
      // Assign the indices and make sure they are unique
      this.manuallySelectedNodes = Array.from(new Set(indices));
    },
    onNodeCovered(e: { x: number; y: number; index: number }) {
      this.currentCoverage = e;
    },
    onNodeUncovered() {
      this.currentCoverage = null;
    },
    onNodeGrabbed(e: {
      x: number;
      y: number;
      index: number;
      mouseEvent: MouseEvent;
    }) {
      // Get the node that was grabbed
      const focusNode = this.$refs.meshNodes[e.index] as any;
      if (!focusNode) return;
      // Make sure the node matches the curent highlight selector
      if (
        !this.highlightSelector ||
        !focusNode.$el.matches(this.highlightSelector)
      )
        return;
      // At this point we are allowed to grab the node(s) and drag them around
      this.nodeGrabbed = true;
      this.currentGrabbed = {
        x: e.x,
        y: e.y,
        index: e.index,
      };
      // Select all the nodes that match the selector
      const nodes = this.$refs.meshNodes.filter((node: any) =>
        node.$el.matches(this.highlightSelector)
      );
      // Call the grab method on all the nodes
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        // Pass in current grabbed this way so that it has the data it needs right away
        node.grabNode(e.mouseEvent, this.currentGrabbed);
      }
      const dragNode = (e: MouseEvent) => {
        // Collect the offset data from all the nodes
        const offset: Record<string, NodeOffset> = {};
        // Call the move method on all the nodes
        for (let i = 0; i < nodes.length; i++) {
          const node = nodes[i];
          node.moveNode(e);
          offset[node.index] = {
            x: node.offsetX,
            y: node.offsetY,
          };
        }
        // Send the offset data to the store
        this.setTempOffsetsMesh3D(Object.assign({}, this.offsetData, offset));
      };
      const onNodeReleased = () => {
        // Call the released method on the nodes
        for (let i = 0; i < nodes.length; i++) {
          const node = nodes[i];
          node.releaseNode();
        }
        // Remove the event listeners
        document.removeEventListener("mousemove", dragNode);
        document.removeEventListener("mouseup", onNodeReleased);
        this.currentGrabbed = null;
        this.onReleased();
      };
      // Add the event listeners
      document.addEventListener("mousemove", dragNode);
      document.addEventListener("mouseup", onNodeReleased);
    },
    undoMeshAction(e: KeyboardEvent) {
      e.preventDefault();
      // If the user pressed 'z' while holding the ctrl/meta key and not the shift key
      if (e.key === "z" && (e.metaKey || e.ctrlKey) && !e.shiftKey) {
        this.undoOffsetAction();
      }
    },
    redoMeshAction(e: KeyboardEvent) {
      e.preventDefault();
      // If the user pressed 'y' while holding the ctrl/meta key
      // Or if the user pressed 'z' while holding the ctrl/meta key and the shift key
      if (
        (e.key === "y" && (e.metaKey || e.ctrlKey)) ||
        (e.key === "z" && (e.metaKey || e.ctrlKey) && e.shiftKey)
      ) {
        this.redoOffsetAction();
      }
    },
  },
  watch: {
    highlightCSS(val) {
      if (this.styleEl) {
        this.styleEl.innerHTML = val;
      }
    },
  },
  mounted() {
    // Add event listeners for the shift and meta/ctrl keys
    document.addEventListener("keydown", this.onKeyDown);
    document.addEventListener("keyup", this.onKeyUp);
    // Add event listener for undo/redo
    document.addEventListener("keydown", this.undoMeshAction);
    document.addEventListener("keydown", this.redoMeshAction);
    // Create a style tag and inject it into the head
    this.styleEl = document.createElement("style");
    document.head.appendChild(this.styleEl);
  },
  beforeUnmount() {
    // Remove event listeners for the shift and meta/ctrl keys
    document.removeEventListener("keydown", this.onKeyDown);
    document.removeEventListener("keyup", this.onKeyUp);
    // Remove event listener for undo/redo
    document.removeEventListener("keydown", this.undoMeshAction);
    document.removeEventListener("keydown", this.redoMeshAction);
    // Remove the style tag from the head
    if (this.styleEl) {
      document.head.removeChild(this.styleEl);
    }
  },
});
</script>

<template>
  <div
    v-show="displayMesh"
    :class="[
      'mesh',
      { 'node-grabbed': nodeGrabbed, 'manual-selection': manualSelection },
    ]"
    :style="{
      '--mesh-x': `${meshCountX - 1}`,
      '--mesh-y': `${meshCountY - 1}`,
      '--msb-left': `${msb.left}px`,
      '--msb-top': `${msb.top}px`,
      '--msb-right': `${msb.right}px`,
      '--msb-bottom': `${msb.bottom}px`,
    }"
    @mousedown="onMouseDown"
  >
    <MeshNode
      v-for="i in meshCount"
      :key="i"
      :index="i - 1"
      ref="meshNodes"
      @cover="onNodeCovered"
      @uncover="onNodeUncovered"
      @grabbed="onNodeGrabbed"
    />
  </div>
</template>

<style scoped lang="scss">
.mesh {
  position: absolute;
  inset: 0;
  cursor: crosshair;
  z-index: 3;

  &.manual-selection {
    z-index: 100;
    &::after {
      content: "";
      position: fixed;
      inset: 0;
      z-index: 1;
    }
    &::before {
      content: "";
      position: fixed;
      inset: var(--msb-top) var(--msb-right) var(--msb-bottom) var(--msb-left);
      border: 1px solid #fff;
    }
  }

  &.node-grabbed {
    z-index: 100;
    &::before {
      content: "";
      position: fixed;
      inset: 0;
      z-index: 0;
    }
  }
}
</style>

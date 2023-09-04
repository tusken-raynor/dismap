<script lang="ts">
import { defineComponent } from "vue";
import { mapGetters, mapState } from "vuex";
import nodesManager from "../store/nodes";

export default defineComponent({
  name: "MeshNode",
  props: {
    index: Number,
  },
  computed: {
    ...mapState([
      "mapWidth",
      "mapHeight",
      "scaleX",
      "scaleY",
      "offsetData",
      "reflectX",
      "reflectY",
    ]),
    ...mapGetters(["meshCountX", "meshCountY"]),
    x(): number {
      return (this.index || 0) % this.meshCountX;
    },
    y(): number {
      return Math.floor((this.index || 0) / this.meshCountX);
    },
    maxX(): number {
      // The max offset number a node can travel along the x axis
      return (this.mapWidth * this.scaleX) / 2;
    },
    maxY(): number {
      // The max offset number a node can travel along the y axis
      return (this.mapHeight * this.scaleY) / 2;
    },
    meshEl(): HTMLElement | null {
      return this.$el.parentElement as HTMLElement;
    },
    displaced(): boolean {
      return this.offsetX !== 0 || this.offsetY !== 0;
    },
    xInv(): number {
      if (this.reflectY && this.currentGrabbed) {
        const half = Math.floor(this.meshCountX / 2);
        // If the current node is right in the middle, return zero
        if (this.currentGrabbed.x == half || this.x == half) return 0;
        // Determine if this node is on the same or opposite side of
        // the mesh from the current coverage node
        const sameSide =
          this.currentGrabbed.x < half ? this.x < half : this.x >= half;
        return sameSide ? 1 : -1;
      }
      return 1;
    },
    yInv(): number {
      if (this.reflectX && this.currentGrabbed) {
        const half = Math.floor(this.meshCountY / 2);
        // If the current node is right in the middle, return zero
        if (this.currentGrabbed.y == half || this.y == half) return 0;
        // Determine if this node is on the same or opposite side of
        // the mesh from the current coverage node
        const otherSide =
          this.currentGrabbed.y < half ? this.y < half : this.y >= half;
        return otherSide ? -1 : 1;
      }
      return 1;
    },
  },
  data() {
    return {
      grabbed: false,
      startOffsetX: null as null | number,
      startOffsetY: null as null | number,
      offsetX: 0,
      offsetY: 0,
      currentGrabbed: null as null | { x: number; y: number, index: number },
    };
  },
  methods: {
    onMouseDown(mouseEvent: MouseEvent) {
      this.$emit("grabbed", {
        index: this.index,
        x: this.x,
        y: this.y,
        mouseEvent,
      });
    },
    grabNode(e: MouseEvent, currentGrabbed: { x: number; y: number, index: number }) {
      this.currentGrabbed = currentGrabbed;
      this.grabbed = true;
      this.startOffsetX = e.clientX - this.offsetX * this.xInv;
      this.startOffsetY = e.clientY - this.offsetY * this.yInv;
    },
    moveNode(e: MouseEvent) {
      this.offsetX =
        Math.max(
          Math.min(e.clientX - this.startOffsetX!, this.maxX),
          -this.maxX
        ) * this.xInv;
      this.offsetY =
        Math.max(
          Math.min(e.clientY - this.startOffsetY!, this.maxY),
          -this.maxY
        ) * this.yInv;
    },
    releaseNode() {
      this.currentGrabbed = null;
      this.grabbed = false;
      this.startOffsetX = null;
      this.startOffsetY = null;
    },
    onMouseEnter() {
      this.$emit("cover", {
        index: this.index,
        x: this.x,
        y: this.y,
      });
    },
    onMouseLeave() {
      this.$emit("uncover", {
        index: this.index,
        x: this.x,
        y: this.y,
      });
    },
  },
  watch: {
    maxX() {
      // If the max offset is less than the current offset, cap the current offset
      if (Math.abs(this.offsetX) > this.maxX)
        this.offsetX = this.maxX * (this.offsetX < 0 ? -1 : 1);
    },
    maxY() {
      // If the max offset is less than the current offset, cap the current offset
      if (Math.abs(this.offsetY) > this.maxY)
        this.offsetY = this.maxY * (this.offsetY < 0 ? -1 : 1);
    },
  },
  mounted() {
    // Check the offset data in the store and see if this node has an offset
    if (this.index !== undefined && this.index in this.offsetData) {
      this.offsetX = this.offsetData[this.index].x;
      this.offsetY = this.offsetData[this.index].y;
    }
    if (this.index !== undefined) {
      nodesManager.subscribeToNodeRealignment(this.index, (x, y) => {
        this.offsetX = x;
        this.offsetY = y;
      });
    }
  },
  beforeUnmount() {
    if (this.index !== undefined) {
      nodesManager.unsubscribeFromNodeRealignment(this.index);
    }
  },
});
</script>

<template>
  <div
    :class="['mesh-node', { grabbed, displaced }]"
    :data-index="index"
    :data-x="x"
    :data-y="y"
    :data-offset-x="offsetX"
    :data-offset-y="offsetY"
    :style="`--x:${x};--y:${y};--offset-x:${offsetX};--offset-y:${offsetY};`"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
    @mousedown="onMouseDown"
  >
    Node
  </div>
</template>

<style scoped lang="scss">
.mesh-node {
  font-size: 0;
  width: 12px;
  height: 12px;
  border-radius: 100px;
  z-index: 1;
  position: absolute;
  top: calc(var(--y) / var(--mesh-y) * 100% - 6px);
  left: calc(var(--x) / var(--mesh-x) * 100% - 6px);
  border: 1px solid #646cff;
  box-sizing: border-box;
  transform: translate(
    calc(var(--offset-x, 0) * 1px),
    calc(var(--offset-y, 0) * 1px)
  );
  cursor: default;
  &:hover {
    z-index: 10;
  }
  &.grabbed.grabbed {
    cursor: grabbing;
  }

  &::before {
    content: "";
    position: absolute;
    inset: 3px;
    background-color: #000;
    border-radius: 100px;
  }
  &::after {
    content: "";
    position: absolute;
    inset: -7px;
    border-radius: 100px;
  }
}
</style>

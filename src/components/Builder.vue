<script lang="ts">
import { defineComponent } from "vue";
import { mapMutations, mapState } from "vuex";
import Mesh from "./Mesh.vue";
import DisplaceImage from "./DisplaceImage.vue";
import DisplaceMap from "./DisplaceMap.vue";

export default defineComponent({
  name: "Builder",
  components: { Mesh, DisplaceImage, DisplaceMap },
  computed: {
    ...mapState([
      "mapWidth",
      "mapHeight",
      "displayDisplacementMap",
      "displayMesh",
      "backdropImageURL",
    ]),
    showDisplacementMap: {
      get() {
        return this.displayDisplacementMap;
      },
      set(value: boolean) {
        this.setDisplayDisplacementMap(value);
      },
    },
    showMesh: {
      get() {
        return this.displayMesh;
      },
      set(value: boolean) {
        this.setDisplayMesh(value);
      },
    },
    reflectX: {
      get() {
        return this.$store.state.reflectX;
      },
      set(value: boolean) {
        this.$store.commit("setReflectX", value);
      },
    },
    reflectY: {
      get() {
        return this.$store.state.reflectY;
      },
      set(value: boolean) {
        this.$store.commit("setReflectY", value);
      },
    },
    renderMesh():boolean {
      return this.showMesh && !this.showDisplacementMap;
    }
  },
  methods: {
    ...mapMutations(["setDisplayDisplacementMap", "setDisplayMesh"]),
  }
});
</script>

<template>
  <div
    class="builder"
    :style="{ width: `${mapWidth}px`, height: `${mapHeight}px` }"
  >
    <DisplaceImage />
    <Mesh v-show="renderMesh" />
    <DisplaceMap v-show="showDisplacementMap" />
    <div class="controls">
      <div class="input-wrap">
        <input type="checkbox" name="symmetry-x" id="symmetry-x" v-model="reflectX" />
        <label for="symmetry-x">Reflect Across X-Axis</label>
      </div>
      <div class="input-wrap">
        <input type="checkbox" name="symmetry-y" id="symmetry-y" v-model="reflectY" />
        <label for="symmetry-y">Reflect Across Y-Axis</label>
      </div>
      <div class="input-wrap">
        <input type="checkbox" name="display-displace-map" id="display-displace-map" v-model="showDisplacementMap" />
        <label for="display-displace-map">Show Displacement Map</label>
      </div>
      <div class="input-wrap">
        <input type="checkbox" name="display-mesh" id="display-mesh" v-model="showMesh" />
        <label for="display-mesh">Show Mesh</label>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.builder {
  position: relative;
  margin-bottom: 120px;
}

.builder-backdrop {
  position: absolute;
  inset: 0;
  background-color: #2d2d2d;
  background-size: 100% 100%;
  background-repeat: no-repeat;
  background-position: center;
}

.controls {
  position: absolute;
  width: 100%;
  height: 80px;
  left: 0;
  top: calc(100% + 20px);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  flex-wrap: wrap;
  align-content: flex-start;
  column-gap: 20px;
}
</style>

<script lang="ts">
import { defineComponent } from "vue";
import { mapActions, mapMutations, mapState } from "vuex";
import UploadBackdrop from "./UploadBackdrop.vue";
import UploadDisplace from "./UploadDisplace.vue";

export default defineComponent({
  name: "Header",
  components: { UploadBackdrop, UploadDisplace },
  computed: {
    ...mapState(['mode'])
  },
  data() {
    return {
      menuOpen: false,
      width: "0",
      height: "0",
      scaleX: "1",
      scaleY: "1",
      scale: "0",
      meshDensity: "20",
      closeMouseOver: false,
    };
  },
  methods: {
    ...mapMutations(["setMapWidth", "setMapHeight", "setScaleX", "setScaleY", "setScale", "setMeshDensity", "setModalData"]),
    ...mapActions(["rememberMeshConfiguration", "resetMeshNodesOffsets"]),
    openMenu() {
      this.menuOpen = true;
      setTimeout(() => {
        document.body.addEventListener("click", this.bodyClickCloser);
        document.body.classList.add("overflow-hidden");
      }, 500);
    },
    closeMenu() {
      this.menuOpen = false;
      document.body.removeEventListener("click", this.bodyClickCloser);
      document.body.classList.remove("overflow-hidden");
    },
    saveSettings() {
      this.setMapWidth(parseInt(this.width));
      this.setMapHeight(parseInt(this.height));
      this.setScaleX(parseFloat(this.scaleX));
      this.setScaleY(parseFloat(this.scaleY));
      this.setScale(parseFloat(this.scale));
      this.setMeshDensity(parseInt(this.meshDensity));
      // Track the users mouse moved off the menu
      this.$refs.menuEl?.addEventListener("mouseleave", this.mouseOffMenu);
      this.postSaveCloser();
      this.closeMouseOver = true;
    },
    bodyClickCloser(e: MouseEvent) {
      if (!(e.target instanceof Element)) return;
      if (!this.$refs.menuEl?.contains(e.target)) {
        this.closeMenu();
      }
    },
    postSaveCloser() {
      // Right after the user hits the save button, wait a second and then close the menu
      // If the user still has their mouse over the menu, it will stay open
      setTimeout(() => {
        if (this.menuOpen && !this.closeMouseOver) {
          this.closeMenu();
        }
        // Remove the event listeners for the moving leaing/entering mouse
        this.$refs.menuEl?.removeEventListener("mouseleave", this.mouseOffMenu);
        this.$refs.menuEl?.removeEventListener("mouseenter", this.mouseOnMenu);
        this.closeMouseOver = false;
      }, 600);
    },
    mouseOffMenu() {
      // Remove the event listener of self
      this.$refs.menuEl?.removeEventListener("mouseleave", this.mouseOffMenu);
      // Watch if the user moves their mouse back onto the menu
      this.$refs.menuEl?.addEventListener("mouseenter", this.mouseOnMenu);
      this.closeMouseOver = false;
    },
    mouseOnMenu() {
      // Remove the event listener of self
      this.$refs.menuEl?.removeEventListener("mouseenter", this.mouseOnMenu);
      // They moved their mouse back onto the menu, so indicate that
      this.$refs.menuEl?.addEventListener("mouseenter", this.mouseOnMenu);
      this.closeMouseOver = true;
    },
    resetOffsetData() {
      if (confirm("Are you sure you want to reset the mesh?")) {
        this.resetMeshNodesOffsets();
      }
    },
    openLoadConfigMenu() {
      this.setModalData({
        component: "LoadMeshMenu",
      });
    },
  },
  mounted() {
    // Set the inital values of the inputs to the current map dimensions
    this.width = this.$store.state.mapWidth.toString();
    this.height = this.$store.state.mapHeight.toString();
    this.scaleX = this.$store.state.scaleX.toString();
    this.scaleY = this.$store.state.scaleY.toString();
    this.scale = this.$store.state.scale.toString();
    this.meshDensity = this.$store.state.meshDensity.toString();
  }
});
</script>

<template>
  <header>
    <h1><span class="p-1">Dis</span><span class="p-2">Map</span></h1>
    <div class="menu-btn" @click="openMenu"></div>
    <nav class="menu" :class="{ open: menuOpen }" ref="menuEl">
      <div class="menu-head">
        <div class="exit-btn" @click="closeMenu">exit</div>
      </div>
      <div class="settings">
        <div class="input-wrap">
          <label for="width">Width</label>
          <input
            type="number"
            id="width"
            name="width"
            step="1"
            v-model="width"
          />
        </div>
        <div class="input-wrap">
          <label for="height">Height</label>
          <input
            type="number"
            id="height"
            name="height"
            step="1"
            v-model="height"
          />
        </div>
        <div class="input-wrap">
          <label for="density">Mesh Density</label>
          <input
            type="number"
            id="density"
            name="density"
            step="1"
            v-model="meshDensity"
          />
        </div>
        <template v-if="mode == 'svg'">
          <div class="input-wrap">
            <label for="scale">Scale</label>
            <input
              type="number"
              name="scale"
              id="scale"
              min="0"
              step="1"
              v-model="scale"
            />
          </div>
        </template>
        <template v-else>
          <div class="input-wrap">
          <label for="scale-x">Scale X</label>
          <input
            type="range"
            name="scale-x"
            id="scale-x"
            min="0"
            max="1"
            step="0.01"
            v-model="scaleX"
          />
          <span>&nbsp;{{ scaleX }}</span>
        </div>
        <div class="input-wrap">
          <label for="scale-y">Scale Y</label>
          <input
            type="range"
            name="scale-y"
            id="scale-y"
            min="0"
            max="1"
            step="0.01"
            v-model="scaleY"
          />
          <span>&nbsp;{{ scaleY }}</span>
        </div>
        </template>
        <div class="update-size-btn std-btn" @click="saveSettings">
          Save Settings
        </div>
        <div class="button-wrap">
          <UploadDisplace />
          <UploadBackdrop />
        </div>
        <div class="button-wrap">
          <div class="reset-mesh-btn std-btn" @click="rememberMeshConfiguration">
            Save Mesh
          </div>
          <div class="reset-mesh-btn std-btn" @click="openLoadConfigMenu">
            Load Mesh
          </div>
          <div class="reset-mesh-btn std-btn" @click="resetOffsetData">
            Reset Mesh
          </div>
        </div>
      </div>
    </nav>
  </header>
</template>

<style scoped lang="scss">
header {
  padding: 24px;
  display: flex;
  gap: 24px;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
}
h1 {
  .p-1 {
    color: #646cff;
    text-decoration: underline #ffffffde;
  }
  .p-2 {
    color: #ffffffde;
    text-decoration: underline #646cff;
  }
}

.menu-btn {
  width: 36px;
  height: 28px;
  border: 4px solid #646cff;
  border-width: 4px 0 4px 0;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: center;
  cursor: pointer;

  &::before {
    content: "";
    width: 100%;
    height: 4px;
    background-color: #646cff;
    display: block;
  }
}

.menu {
  position: fixed;
  top: 0;
  bottom: 0;
  right: 0;
  width: 100vw;
  max-width: 650px;
  z-index: 20;
  background-color: #2d2d2d;
  transform: translateX(100%);
  opacity: 0.5;
  box-shadow: 0 0 12px rgba(0, 0, 0, 0);
  transition: transform 0.5s cubic-bezier(0.5, 0, 0.75, 0),
    opacity 0.3s linear 0.15s, box-shadow 0.3s linear;

  &.open {
    transform: translateX(0);
    opacity: 1;
    box-shadow: 0 0 12px rgba(0, 0, 0, 0.5);
    transition: transform 0.4s cubic-bezier(0.25, 1, 0.5, 1),
      opacity 0.3s linear, box-shadow 0.3s linear;
  }
}

.menu-head {
  padding: 24px;
  display: flex;
  justify-content: flex-end;
  .exit-btn {
    width: 36px;
    height: 28px;
    box-sizing: border-box;
    cursor: pointer;
    position: relative;
    font-size: 0;

    &::before,
    &::after {
      content: "";
      width: 100%;
      height: 4px;
      background-color: #646cff;
      display: block;
      position: absolute;
      top: 50%;
      left: 0;
    }

    &::before {
      transform: translateY(-50%) rotate(45deg);
    }

    &::after {
      transform: translateY(-50%) rotate(-45deg);
    }
  }
}

.settings {
  padding: 0 24px 48px;
  display: flex;
  flex-direction: column;
}
.update-size-btn {
  display: block;
  margin-bottom: 2em;
}
.std-btn {
  margin-bottom: 1em;
}
.update-size-btn {
  margin-bottom: 2em;
}
.button-wrap {
  display: flex;
  gap: 1em;
  flex-wrap: wrap;
}
</style>

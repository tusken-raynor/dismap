<script lang="ts">
import { defineComponent } from "vue";
import { mapMutations, mapState } from "vuex";
import LoadMeshMenu from "./LoadMeshMenu.vue";

export default defineComponent({
  name: "Modal",
  components: {
    LoadMeshMenu
  },
  computed: {
    ...mapState(["modalData"]),
    component(): string {
      if (!this.modalData) return "";
      return this.modalData.component;
    },
    props(): Record<string, unknown> {
      if (!this.modalData) return {};
      return this.modalData.props;
    },
  },
  methods: {
    ...mapMutations(["setModalData"]),
    closeModal() {
      this.setModalData(null);
    },
  },
});
</script>

<template>
  <div v-if="modalData && component" class="modal-wrapper" >
    <div class="modal-shadow" @click="closeModal"></div>
    <div class="modal" :style="modalData.style || undefined">
      <component :is="component" v-bind="props" />
      <div class="exit-btn" @click="closeModal">Exit</div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.modal-wrapper {
  position: fixed;
  inset: 0;
  z-index: 300;
  display: flex;
  justify-content: center;
  align-items: center;
  pointer-events: none;
}
.modal-shadow {
  position: absolute;
  inset: 0;
  background-color: #000000de;
  z-index: 1;
}
.modal {
  position: relative;
  z-index: 2;
  background-color: #242424;
  padding: 36px;
  border-radius: 8px;
  max-width: 650px;
  max-height: calc(100vh - 16px);
  box-sizing: border-box;
  overflow: auto;
  pointer-events: all;
}
.exit-btn {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 24px;
  height: 24px;
  cursor: pointer;
  font-size: 0;
  &::before, &::after {
    content: "";
    position: absolute;
    width: 100%;
    height: 2px;
    background-color: #646cff;
    top: 50%;
    left: 0;
    transform: translateY(-50%);
  }
  &::before {
    transform: translateY(-50%) rotate(45deg);
  }
  &::after {
    transform: translateY(-50%) rotate(-45deg);
  }
}
</style>
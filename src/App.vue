<script setup lang="ts">
import { onMounted } from "vue";
import Builder from "./components/Builder.vue";
import Header from "./components/Header.vue";
import store from "./store";
import Modal from "./components/Modal.vue";
import DisplacementTest from "./components/DisplacementTest.vue";

(window as any).logState = () => {
  console.log(store.state);
};
(window as any).logGetters = () => {
  console.log(Object.assign({}, store.getters));
};

onMounted(() => {
  // Initialize the renderer
  store.dispatch("initRenderer");
  // Set up the watcher for the renderer
});
</script>

<template>
  <Header />
  <main>
    <Builder />
    <DisplacementTest />
  </main>
  <Modal />
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import Builder from './components/Builder.vue';
import Header from './components/Header.vue';
import store from './store';
import Modal from './components/Modal.vue';

(window as any).logState = () => {
  console.log(store.state);
};
(window as any).logGetters = () => {
  console.log(Object.assign({}, store.getters));
};

onMounted(() => {
  // Initialize the renderer
  store.dispatch('initRenderer');
  // Set up the watcher for the renderer

});
</script>

<template>
  <Header />
  <main>
    <Builder />
  </main>
  <Modal />
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>

<script setup lang="ts">
import { useStore } from 'vuex';

const store = useStore();

function handleFileInput(event: Event) {
  if (event.target instanceof HTMLInputElement) {
    const fileValue = event.target.files?.[0];
    if (fileValue) {
      const url = URL.createObjectURL(fileValue);
      // Commit the image to the store
      store.commit("setBackdropImageURL", url);
    }
  }
}
</script>

<template>
  <div>
    <label class="std-btn" for="backdrop-image">Upload Backdrop Image</label>
    <input type="file" id="backdrop-image" accept="image/*" @change="handleFileInput" />
  </div>
</template>

<style scoped>
div {
  margin-bottom: 1em;
}
.std-btn {
  font-size: inherit;
}
input {
  display: none;
}
</style>
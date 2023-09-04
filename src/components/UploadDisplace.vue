<script setup lang="ts">
import { useStore } from 'vuex';

const store = useStore();

function handleFileInput(event: Event) {
  if (event.target instanceof HTMLInputElement) {
    const fileValue = event.target.files?.[0];
    if (fileValue) {
      // This is kinda quick and dirty right now creating a canvas on the fly
      // We should update this in the future to be more elegant
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const img = new Image();
      img.src = URL.createObjectURL(fileValue);
      img.onload = () => {
        const {width, height} = img;
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, width, height);
        const imageData = ctx.getImageData(0, 0, width, height);
        // Commit the image to the store
        store.commit("setDisplaceImageData", imageData);
      };
    }
  }
}
</script>

<template>
  <div>
    <label class="std-btn" for="displace-image">Upload Displace Image</label><br>
    <input type="file" id="displace-image" accept="image/*" @change="handleFileInput" />
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

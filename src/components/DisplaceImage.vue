<script lang="ts">
import { defineComponent } from 'vue';
import { mapState } from 'vuex';

export default defineComponent({
  name: 'DisplaceImage',
  computed: {
    ...mapState(['mapWidth', 'mapHeight', 'displaceImageData', 'displaceImageURL']),
  },
});
</script>

<template>
  <div class="displace-img">
    <img v-if="displaceImageURL" :src="displaceImageURL" alt="" aria-hidden="true">
  </div>
</template>

<style lang="scss" scoped>
.displace-img {
  position: relative;
  inset: 0;
  z-index: 2;
}
img {
  position: absolute;
  display: none;
}
canvas {
  width: 100%;
  height: 100%;
}
</style>
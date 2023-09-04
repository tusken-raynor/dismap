<script lang="ts">
import { defineComponent } from 'vue';
import { mapActions, mapState } from 'vuex';

  export default defineComponent({
    name: 'DisplaceMap',
    computed: {
      ...mapState(['mapWidth', 'mapHeight', 'displaceMapData']),
      canvas(): HTMLCanvasElement {
        return this.$refs.canvas as HTMLCanvasElement;
      },
      ctx(): CanvasRenderingContext2D {
        return this.canvas.getContext('2d') as CanvasRenderingContext2D;
      },
    },
    methods: {
      ...mapActions(['createDisplacementMap']),
      putDisplacementMapToCanvas() {
        if (!this.displaceMapData) {
          // Set the canvas to a neutral state
          this.ctx.fillStyle = 'rgb(127, 127, 0)';
          this.ctx.fillRect(0, 0, this.mapWidth, this.mapHeight);
          return;
        }
        // At this point the ImageData is guaranteed to exist
        this.ctx.putImageData(this.displaceMapData, 0, 0);
      }
    },
    watch: {
      displaceMapData() {
        this.putDisplacementMapToCanvas();
      }
    },
    mounted() {
      setTimeout(() => {
        this.createDisplacementMap();
        this.putDisplacementMapToCanvas();
      }, 500);
    }
  })
</script>

<template>
  <div class="displace-map">
    <canvas id="map-canvas" :width="mapWidth" :height="mapHeight" ref="canvas"></canvas>
  </div>
</template>

<style scoped lang="scss">
.displace-map {
  position: absolute;
  inset: 0;
  z-index: 4;
}
</style>
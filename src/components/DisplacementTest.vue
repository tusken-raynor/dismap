<script setup lang="ts">
import { ref } from "vue";
import params from "../params";

const render = params.has('displacement-test');

const width = 200;
const height = 200;
let scale = ref(200);

const red = ref(127);
const green = ref(127);
const blue = ref(0);

const onFrameUpdate = () => {
  scale.value = (scale.value + 2) % (height * 2 * 2);
  requestAnimationFrame(onFrameUpdate);
};
</script>

<template>
  <div v-if="render" class="displacement-test">
    <div
      class="test-displace-wrap"
      :style="{ width: `${width}px`, height: `${height}px`, backgroundColor: `rgb(${red}, ${green}, ${blue})` }"
    >
      <div class="test-displace filter"></div>
      <div
        class="test-displace"
        :style="{
          transform: `translate(${scale * -(red / 255 - 0.5)}px, ${
            scale * -(green / 255 - 0.5)
          }px)`,
        }"
      ></div>
    </div>
    <div class="input-wrap">
      <input type="range" min="0" max="1000" step="1" v-model="scale" />
      <span>&nbsp;{{ scale }}</span>
    </div>
    <div class="input-wrap">
      <input type="range" min="0" max="255" step="1" v-model="red" />
      <span>&nbsp;{{ red }}</span>
    </div>
    <div class="input-wrap">
      <input type="range" min="0" max="255" step="1" v-model="green" />
      <span>&nbsp;{{ green }}</span>
    </div>
    <svg>
      <defs>
        <filter
          id="test-displace"
          :width="width"
          :height="height"
          x="0"
          y="0"
          filterUnits="userSpaceOnUse"
          color-interpolation-filters="sRGB"
        >
          <feFlood
            result="DIMG"
            x="0"
            y="0"
            :width="width"
            :height="height"
            :flood-color="`rgb(${red}, ${green}, ${blue})`"
            flood-opacity="1"
          ></feFlood>
          <feDisplacementMap
            in="SourceGraphic"
            in2="DIMG"
            :scale="scale"
            xChannelSelector="R"
            yChannelSelector="G"
          ></feDisplacementMap>
        </filter>
      </defs>
    </svg>
  </div>
</template>

<style scoped>
.displacement-test {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.test-displace-wrap {
  background: url(../assets/img/texture7.png) no-repeat center/100% 100%;
  position: relative;
}
.test-displace {
  position: absolute;
  inset: 0;
  background: url(../assets/img/texture7.png) no-repeat center/100% 100%;
  width: 100%;
  height: 100%;
}
.test-displace.filter {
  filter: url(#test-displace);
}
.test-displace:not(.filter) {
  filter: grayscale(1) brightness(10000%);
}
.input-wrap {
  position: relative;
  z-index: 10;
  display: flex;
  align-items: center;
}
</style>

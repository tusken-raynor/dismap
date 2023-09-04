<script lang="ts">
import { defineComponent } from "vue";
import { mapActions, mapMutations } from "vuex";
import { NodeOffset, SavedOffsetStore } from "../types";
import nodesManager from "../store/nodes";

export default defineComponent({
  name: "Modal",
  computed: {
    namesAsDates(): Array<{key: string, date: string}> {
      return Object.entries(this.config).map(([key, value]) => {
        return {
          key,
          date: new Date(value.d).toLocaleString(),
        };
      });
    }
  },
  data() {
    return {
      config: {} as Record<string, SavedOffsetStore>,
    };
  },
  methods: {
    ...mapMutations(["setOffsetDataRedos", "setOffsetDataUndos", "setModalData"]),
    ...mapActions(["loadMeshConfigurations", "setOffsetData"]),
    clickItem(key: string) {
      // Confirm with the user that they want to load this configuration
      if (!confirm("Are you sure you want to load this mesh configuration? You will lose any unsaved data.")) return;
      // Grab the item from the config
      const item = this.config[key];
      // Parse the offset data
      const numbers = item.o.split(",").map(n => parseInt(n));
      const offsets: Record<string, NodeOffset> = {};
      for (let i = 0; i < numbers.length; i += 3) {
        const index = numbers[i];
        offsets[index] = {
          x: numbers[i + 1],
          y: numbers[i + 2],
        };
      }
      // Set the offset data
      this.setOffsetData(offsets);
      // Clear the offset data undos and redos
      this.setOffsetDataUndos([]);
      this.setOffsetDataRedos([]);
      // Sync the nodes with the offsetData in the store
      nodesManager.triggerNodeRealignment(Object.assign(nodesManager.blankNodeOffsets(), offsets));
      // Close the modal
      this.setModalData(null);
    },
  },
  mounted() {
    this.loadMeshConfigurations((config: Record<string, SavedOffsetStore>) => {
      this.config = config;
    });
  },
});
</script>

<template>
  <div class="saved-meshes">
    <div v-for="v in namesAsDates" :key="v.key" class="saved-mesh" @click="() => clickItem(v.key)">Saved on: {{ v.date }}</div>
  </div>
</template>

<style scoped lang="scss">
.saved-meshes {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.saved-mesh {
  padding: 10px;
  border: 1px solid #646cff;
  border-radius: 5px;
  cursor: pointer;
  margin-bottom: 2px;
}
</style>
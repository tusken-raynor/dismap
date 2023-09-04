import { ComponentCustomProperties } from "vue";

export default defineStorage({
  watch: {
    mapWidth: "default",
    mapHeight: "default",
    scaleX: "default",
    scaleY: "default",
    meshDensity: "default",
    backdropImageURL: "default",
    displaceImageURL: "default",
    offsetData: "default",
    offsetDataUndos: "default",
    reflectX: "default",
    reflectY: "default",
  },
  useStore(store) {
    const keys = Object.keys(this.watch) as Array<keyof typeof this.watch>;
    keys.forEach(key => {
      // Update the store with localStorage values on first load if the value exists
      const val = this.getValue(key);
      if (val !== undefined) {
        store.state[key] = val as never;
      }
      // Now add a watcher to the store to update localStorage when the value changes
      store.watch((s) => s[key], (val) => this.saveValue(key, val));

      // Manually store the value on first load if there is no value in localStorage
      if (localStorage.getItem(key) === null) {
        const val = store.state[key];
        if (val !== undefined) {
          this.saveValue(key, val);
        }
      }
    });
  },
  saveValue(key: StorageDefinitionWatchKey, value: any) {
    const handler = this.watch[key as keyof typeof this.watch] as StorageDefinitionWatchHandler;
    if (!(typeof handler === "string")) {
      value = handler.insert(value);
    }
    localStorage.setItem(key, JSON.stringify(value));
  },
  getValue(key: StorageDefinitionWatchKey) {
    const val = localStorage.getItem(key);
    if (val !== null) {
      let parsedVal = JSON.parse(val);
      const handler = this.watch[key as keyof typeof this.watch] as StorageDefinitionWatchHandler;
      if (!(typeof handler === "string")) {
        parsedVal = handler.extract(parsedVal);
      }
      return parsedVal;
    }
    return undefined;
  }
});

type StorageDefinitionWatchKey = keyof ComponentCustomProperties['$store']['state'];
type StorageDefinitionWatchHandler = "default" | {insert(value: any): any, extract(value: any): any};
type StorageDefinition = {
  watch: {[key in StorageDefinitionWatchKey]?: StorageDefinitionWatchHandler};
  useStore(store: ComponentCustomProperties['$store']): void;
}

function defineStorage<T extends StorageDefinition>(definiton: T) {
  return definiton;
}
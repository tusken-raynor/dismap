/// <reference types="vite/client" />
import store from "./store";


declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $store: typeof store;
    $refs: Record<string, HTMLElement | Element | Vue | Vue[] | NodeListOf<Element>>;
  }
}

declare global {
  interface Window {
    nugget: string;
  }
}
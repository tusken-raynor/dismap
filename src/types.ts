export interface NodeOffset {
  x: number;
  y: number;
}
export interface SavedOffsetStore {
  o: string;
  d: number;
}
export interface ModalData {
  component: string;
  props?: Record<string, any>;
  style?: Record<string, any>;
}
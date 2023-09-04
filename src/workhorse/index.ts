export const workHorseCanvas = new OffscreenCanvas(1, 1);
export const workHorseCtx = workHorseCanvas.getContext("2d")!;

export function setWorkHorseSize(width: number, height: number) {
  workHorseCanvas.width = width;
  workHorseCanvas.height = height;
}
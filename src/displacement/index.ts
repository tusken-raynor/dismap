import utils from "../utils";

type MapNode = {
  red: number;
  green: number;
  mapX: number;
  mapY: number;
}

const NODE_CACHE: Record<string, MapNode> = {};
const calcOffset = utils.channelValueToOffset;

export default {
  createMap(
    width: number,
    height: number,
    countX: number,
    countY: number,
    scaleX: number,
    scaleY: number,
    offsetData: Record<string, { x: number; y: number }>
  ) {
    const map = new Uint8ClampedArray(width * height * 4);
    // Calculate the number of pixels between the nodes both vertically and horizontally
    const pixelCountX = (width / (countX - 1));
    const pixelCountY = (height / (countY - 1));
    // Iterate through the counts, but each must be one less that the count because we are using the
    // current node and the next node to create the quad
    const itX = countX - 1;
    const itY = countY - 1;
    // Loop through each node in the mesh. For each node, grab the other three nodes that make up the quad.
    // interpolate the offset between the two vertical pairs, and then fill between them using a scanline
    // approach.
    for (let y = 0; y < itY; y++) {
      // Precompute the y indices for the row to avoid doing the multiplication in the inner loop
      const yIndex = y * countX;
      const yPlusOneIndex = (y + 1) * countX;
      const yPixelCount = y * pixelCountY;
      const yPlusOnePixelCount = (y + 1) * pixelCountY;
      for (let x = 0; x < itX; x++) {
        // if (Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2)) > 4) {
        //   continue;
        // }
        // The four indices for the nodes that make up the quad
        // Index: Top Left, IndexRight: Top Right, IndexBottom: Bottom Left, IndexDiag: Bottom Right
        const index = (yIndex + x);
        const indexRight = (yIndex + x + 1);
        const indexBottom = (yPlusOneIndex + x);
        const indexDiag = (yPlusOneIndex + x + 1);
        const xPixelCount = x * pixelCountX;
        const xPlusOnePixelCount = (x + 1) * pixelCountX;
        // Calculate the four map coordinates for the nodes that make up the quad
        const mapX = Math.floor(xPixelCount);
        const mapY = Math.floor(yPixelCount);
        const mapXPlusOne = Math.floor(xPlusOnePixelCount);
        const mapYPlusOne = Math.floor(yPlusOnePixelCount);
        // Construct the four nodes that make up the quad
        // If the node already exists in the cache, use it, otherwise create it and add it to the cache
        const node1 = getMapNode(index, width, height, mapX, mapY, scaleX, scaleY, offsetData);
        const node2 = getMapNode(indexRight, width, height, mapXPlusOne, mapY, scaleX, scaleY, offsetData);
        const node3 = getMapNode(indexBottom, width, height, mapX, mapYPlusOne, scaleX, scaleY, offsetData);
        const node4 = getMapNode(indexDiag, width, height, mapXPlusOne, mapYPlusOne, scaleX, scaleY, offsetData);
        
        // Create an array of intermediate nodes between the top left and bottom left nodes, and the top right and bottom right nodes
        const leftNodes: MapNode[] = [];
        const rightNodes: MapNode[] = [];
        let startRedLeft = node1.red;
        let stepRedLeft = (node3.red - node1.red) / pixelCountY;
        let startGreenLeft = node1.green;
        let stepGreenLeft = (node3.green - node1.green) / pixelCountY;
        let startRedRight = node2.red;
        let stepRedRight = (node4.red - node2.red) / pixelCountY;
        let startGreenRight = node2.green;
        let stepGreenRight = (node4.green - node2.green) / pixelCountY;
        for (let i = 0; i < pixelCountY; i++) {
          leftNodes.push({
            red: Math.round(startRedLeft),
            green: Math.round(startGreenLeft),
            mapX: node1.mapX,
            mapY: node1.mapY + i,
          });
          rightNodes.push({
            red: Math.round(startRedRight),
            green: Math.round(startGreenRight),
            mapX: node2.mapX,
            mapY: node2.mapY + i,
          });
          startRedLeft += stepRedLeft;
          startGreenLeft += stepGreenLeft;
          startRedRight += stepRedRight;
          startGreenRight += stepGreenRight;
        }

        // Now fill in the scanlines between the left and right nodes
        for (let i = 0; i < pixelCountY; i++) {
          const leftNode = leftNodes[i];
          const rightNode = rightNodes[i];
          let red = leftNode.red;
          const stepRed = (rightNode.red - leftNode.red) / pixelCountX;
          let green = leftNode.green;
          const stepGreen = (rightNode.green - leftNode.green) / pixelCountX;
          for (let j = 0; j < pixelCountX; j++) {
            const mapX = leftNode.mapX + j;
            const mapY = leftNode.mapY;
            const mapIndex = (mapY * width + mapX) * 4;
            map[mapIndex] = red;
            map[mapIndex + 1] = green;
            // Make sure the alpha channel is always 255
            map[mapIndex + 3] = 255;
            red += stepRed;
            green += stepGreen;
          }
        }
      }
    }
    // Clear the cache
    Object.keys(NODE_CACHE).forEach((key) => delete NODE_CACHE[key]);
    // Now that the map has been filled with scanlines, we actually need to invert the map
    // Return the map
    return map;
  },
};

function getMapNode(
  index: number,
  width: number,
  height: number,
  mapX: number,
  mapY: number,
  scaleX: number,
  scaleY: number,
  offsetData: Record<string, { x: number; y: number }>,
) {
  // Check the cache first
  if (index in NODE_CACHE) {
    // Return the cached node
    return NODE_CACHE[index];
  } else {
    // Create the node
    const x = index in offsetData ? offsetData[index].x : 0;
    const y = index in offsetData ? offsetData[index].y : 0;
    const node = {
      red: calcOffset(x, width, scaleX),
      green: calcOffset(y, height, scaleY),
      mapX,
      mapY,
    };
    // Cache the node
    if (!(index in NODE_CACHE)) {
      NODE_CACHE[index] = node;
    }
    return node;
  }
}
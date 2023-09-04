import { NodeOffset } from "../types";

export default {
  defineMesh(segsX: number, segsY: number, width: number, height: number, offsets: Record<string, NodeOffset>) {
    // Define the vertex and index bufferes for a rectangle mesh for three.js
    const halfX = width / 2;
    const halfY = height / 2;
    const vertexBuffer = new Float32Array(segsX * segsY * 3);
    const indexBuffer = new Uint16Array(segsX * segsY * 6);
    const uvBuffer = new Float32Array(segsX * segsY * 2);
    // This buffer is the same size as the vertex buffer, but any top or right vertices
    // are moved over one pixel so that they are not drawn on the map
    const wireframeVertexBuffer = new Float32Array(segsX * segsY * 3);

    let vertexIndex = 0;
    let uvIndex = 0;
    let wireframeIndex = 0;
    for (let y = 0; y < segsY; y++) {
      for (let x = 0; x < segsX; x++) {
        const index = (segsY - y - 1) * segsX + (segsX - 1 - x);
        // Fill the vertex buffer. Move the position by -half so that the mesh is centered
        vertexBuffer[vertexIndex] = x / (segsX - 1) * width - halfX;
        vertexBuffer[vertexIndex + 1] = y / (segsY - 1) * height - halfY;
        vertexBuffer[vertexIndex + 2] = 0;

        // Add the offset to the vertex position if it exists
        if (index in offsets) {
          vertexBuffer[vertexIndex] -= offsets[index].x;
          vertexBuffer[vertexIndex + 1] -= offsets[index].y;
        }

        vertexIndex += 3;


        // // Fill the UV buffer. Invert the u values so that the texture is not flipped
        uvBuffer[uvIndex] = 1.0 - x / (segsX - 1);
        uvBuffer[uvIndex + 1] = 1.0 - y / (segsY - 1);
        uvIndex += 2;

        // Fill the wireframe vertex buffer. If this is a top or right vertex, move it over one pixel
        // so that it is not drawn on the map
        wireframeVertexBuffer[wireframeIndex] = x / (segsX - 1) * width - halfX;
        wireframeVertexBuffer[wireframeIndex + 1] = y / (segsY - 1) * height - halfY;
        wireframeVertexBuffer[wireframeIndex + 2] = 0;

        if (x === segsX - 1) {
          wireframeVertexBuffer[wireframeIndex] -= 1;
        }
        if (y === 0) {
          wireframeVertexBuffer[wireframeIndex + 1] += 1;
        }

        // Add the offset to the vertex position if it exists
        if (index in offsets) {
          wireframeVertexBuffer[wireframeIndex] -= offsets[index].x;
          wireframeVertexBuffer[wireframeIndex + 1] -= offsets[index].y;
        }

        wireframeIndex += 3;
      }
    }

    // Fill the index buffer. Six for each quad, because we are using triangles
    let indexIndex = 0;
    for (let y = 0; y < segsY - 1; y++) {
      for (let x = 0; x < segsX - 1; x++) {
        const topLeft = y * segsX + x;
        const topRight = topLeft + 1;
        const bottomLeft = topLeft + segsX;
        const bottomRight = bottomLeft + 1;

        indexBuffer[indexIndex] = topLeft;
        indexBuffer[indexIndex + 1] = bottomLeft;
        indexBuffer[indexIndex + 2] = topRight;
        indexBuffer[indexIndex + 3] = topRight;
        indexBuffer[indexIndex + 4] = bottomLeft;
        indexBuffer[indexIndex + 5] = bottomRight;
        indexIndex += 6;
      }
    }

    return {
      vertexBuffer,
      wireframeVertexBuffer,
      indexBuffer,
      uvBuffer,
    };
  }
}
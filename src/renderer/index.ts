import {
  Mesh,
  MeshBasicMaterial,
  OrthographicCamera,
  Scene,
  TextureLoader,
  WebGLRenderer,
} from "three";
import geo from "../geometry";
import { NodeOffset } from "../types";
import uvVertShader from "../assets/shaders/uv.vert.glsl?raw";
import uvFragShader from "../assets/shaders/uv.frag.glsl?raw";

const TEXTURE_LOADER: TextureLoader = new THREE.TextureLoader();
const UV_MATERIAL = new THREE.ShaderMaterial({
  vertexShader: uvVertShader,
  fragmentShader: uvFragShader,
  side: THREE.DoubleSide,
  transparent: true,
});
const UV_RENDER_TARGET = new THREE.WebGLRenderTarget(1, 1, {
  minFilter: THREE.LinearFilter,
  magFilter: THREE.NearestFilter,
  format: THREE.RGBAFormat,
  type: THREE.UnsignedByteType,
  depthBuffer: false,
});

let RENDERER: WebGLRenderer | null = null;
let SCENE: Scene | null = null;
let CAMERA: OrthographicCamera | null = null;
let RECTANGLE_MESH: Mesh | null = null;
let WIREFRAME_MESH: Mesh | null = null;
let BACKDROP_MESH: Mesh | null = null;
let MATERIAL: MeshBasicMaterial | null = null;
let BACKDROP: MeshBasicMaterial | null = null;

const renderer = {
  initialze(mapWidth: number, mapHeight: number) {
    const halfMapWidth = mapWidth / 2;
    const halfMapHeight = mapHeight / 2;

    // Create the scene and camera
    SCENE = new THREE.Scene();
    CAMERA = new THREE.OrthographicCamera(
      -halfMapWidth,
      halfMapWidth,
      halfMapHeight,
      -halfMapHeight,
      0.1,
      100000
    );

    // Position the camera to look at where the mesh will be
    CAMERA.position.z = -1;
    CAMERA.lookAt(0, 0, 0);

    // Create the renderer
    RENDERER = new THREE.WebGLRenderer();
    RENDERER.setSize(mapWidth, mapHeight);
    RENDERER.setClearColor(0x2d2d2d);
    // Clear the default  frame
    RENDERER.clear();

    // Set the dimensions of the uv render target
    UV_RENDER_TARGET.setSize(mapWidth, mapHeight);

    // Create the backdrop mesh, which is just a simple rectangle
    const backdropGeometry = new THREE.PlaneGeometry(mapWidth, mapHeight);
    BACKDROP_MESH = new THREE.Mesh(backdropGeometry, BACKDROP || undefined);
    BACKDROP_MESH.name = "backdrop";
    BACKDROP_MESH.position.z = 1000;
    BACKDROP_MESH.lookAt(CAMERA.position);
    // Add the backdrop to the scene
    SCENE.add(BACKDROP_MESH);

    return this;
  },
  updateMesh(
    mapWidth: number,
    mapHeight: number,
    nodeCountX: number,
    nodeCountY: number,
    offsets: Record<string, NodeOffset>,
    showWireframe: boolean
  ) {
    // Remove the old mesh from the scene
    if (RECTANGLE_MESH && SCENE) {
      SCENE.remove(RECTANGLE_MESH);
    }
    if (WIREFRAME_MESH && SCENE) {
      SCENE.remove(WIREFRAME_MESH);
    }
    // Generate the new mesh
    const computedMesh = geo.defineMesh(
      nodeCountX,
      nodeCountY,
      mapWidth,
      mapHeight,
      offsets
    );

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(computedMesh.vertexBuffer, 3)
    );
    geometry.setAttribute(
      "uv",
      new THREE.BufferAttribute(computedMesh.uvBuffer, 2)
    );
    geometry.setIndex(new THREE.BufferAttribute(computedMesh.indexBuffer, 1));

    RECTANGLE_MESH = new THREE.Mesh(
      geometry,
      MATERIAL || undefined
    );
    RECTANGLE_MESH.name = "rectangle";

    if (showWireframe) {
      const wireframe = new THREE.BufferGeometry();
      wireframe.setAttribute(
        "position",
        new THREE.BufferAttribute(computedMesh.wireframeVertexBuffer, 3)
      );
      wireframe.setIndex(new THREE.BufferAttribute(computedMesh.indexBuffer, 1));

      // Create the color matieral for the wireframe
      const wireframeMat = new THREE.MeshBasicMaterial({
        wireframe: true,
        color: 0x888888,
      });

      WIREFRAME_MESH = new THREE.Mesh(wireframe, wireframeMat);
      WIREFRAME_MESH.name = "wireframe";
    } else {
      WIREFRAME_MESH = null;
    }

    // Add the new mesh to the scene
    if (SCENE) {
      SCENE.add(RECTANGLE_MESH);
      if (WIREFRAME_MESH) {
        SCENE.add(WIREFRAME_MESH);
      }
    }

    return this;
  },
  updateMaterial(imageData: ImageData | null) {
    // If the image data is null, create some blank data
    if (!imageData) {
      imageData = new ImageData(1, 1);
    }
    // Create a texture from the image data
    const texture = new THREE.DataTexture(
      imageData.data,
      imageData.width,
      imageData.height,
      THREE.RGBAFormat,
      THREE.UnsignedByteType
    );
    // const textureLoader = new THREE.TextureLoader();
    // const texture = textureLoader.load("/texture.png");
    MATERIAL = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
    });
    // Add the new material to the mesh
    if (RECTANGLE_MESH) {
      RECTANGLE_MESH.material = MATERIAL;
    }

    return this;
  },
  async updateBackdrop(backdropImageURL: string) {
    // Create a texture from the url
    const texture = await TEXTURE_LOADER.loadAsync(backdropImageURL);
    BACKDROP = new THREE.MeshBasicMaterial({
      map: texture,
      // wireframe: true,
      // color: 0x0000ff,
      side: THREE.DoubleSide,
      transparent: true
    });
    // Add the new material to the mesh
    if (BACKDROP_MESH) {
      BACKDROP_MESH.material = BACKDROP;
    }

    return this;
  },
  updateDimensions(mapWidth: number, mapHeight: number) {
    // Update the renderer size
    if (RENDERER) {
      RENDERER.setSize(mapWidth, mapHeight);
    }
    // Update the camera
    if (CAMERA) {
      const halfMapWidth = mapWidth / 2;
      const halfMapHeight = mapHeight / 2;
      CAMERA.left = -halfMapWidth;
      CAMERA.right = halfMapWidth;
      CAMERA.top = halfMapHeight;
      CAMERA.bottom = -halfMapHeight;
      CAMERA.updateProjectionMatrix();
    }
    // Update the dimensions of the uv render target
    UV_RENDER_TARGET.setSize(mapWidth, mapHeight);

    return this;
  },
  renderScene(parent?: Element) {
    if (!RENDERER || !SCENE || !CAMERA) {
      throw new Error("Renderer not initialized");
    }
    if (!parent && !RENDERER.domElement.parentElement) {
      throw new Error("Parent element not found");
    }

    // If the passed parent is different from the current parent, update the parent
    if (parent && parent !== RENDERER.domElement.parentElement) {
      parent.appendChild(RENDERER.domElement);
    }

    // Set the background color to #2d2d2d
    RENDERER.setClearColor(0x2d2d2d);
    // Clear the previous frame
    RENDERER.clear();

    // Render the scene
    RENDERER.render(SCENE, CAMERA);

    return this;
  },
  renderUV() {
    if (!RENDERER || !SCENE || !CAMERA) {
      throw new Error("Renderer not initialized");
    }
    if (!RECTANGLE_MESH) {
      throw new Error("Rectangle mesh not initialized");
    }

    // Remove the standard meshes from the scene
    if (BACKDROP_MESH) {
      SCENE.remove(BACKDROP_MESH);
    }
    SCENE.remove(RECTANGLE_MESH);
    if (WIREFRAME_MESH) {
      SCENE.remove(WIREFRAME_MESH);
    }
    // Create a new mesh with the uv material using the gemetry from the rectangle mesh
    const uvMesh = new THREE.Mesh(RECTANGLE_MESH.geometry, UV_MATERIAL);
    uvMesh.name = "uv";
    // Rotate the mesh to flip along x axis
    // We do this because the uv coordinates are flipped vertically
    uvMesh.rotation.x = Math.PI;
    // Add the new mesh to the scene
    SCENE.add(uvMesh);

    // Set the render target to the uv render target
    RENDERER.setRenderTarget(UV_RENDER_TARGET);
    // Render an all blue scene to the uv render target
    RENDERER.setClearColor(0x000000, 0);
    // Clear the previous frame
    RENDERER.clear();
    // Render the scene
    RENDERER.render(SCENE, CAMERA);
    // Reset the render target
    RENDERER.setRenderTarget(null);

    // Remove the uv mesh from the scene
    SCENE.remove(uvMesh);
    // Add the standard meshes back to the scene
    if (BACKDROP_MESH) {
      SCENE.add(BACKDROP_MESH);
    }
    SCENE.add(RECTANGLE_MESH);
    if (WIREFRAME_MESH) {
      SCENE.add(WIREFRAME_MESH);
    }

    // Store the render target to a buffer
    const buffer = new Uint8ClampedArray(UV_RENDER_TARGET.width * UV_RENDER_TARGET.height * 4);
    RENDERER.readRenderTargetPixels(UV_RENDER_TARGET, 0, 0, UV_RENDER_TARGET.width, UV_RENDER_TARGET.height, buffer);

    // Create an image data object from the buffer
    const imageData = new ImageData(buffer, UV_RENDER_TARGET.width, UV_RENDER_TARGET.height);
    // look for the canvas with id of 'uv-render-target' and render the uv render target to it
    const uvRenderTarget = document.querySelector<HTMLCanvasElement>("#uv-render-target");
    if (uvRenderTarget) {
      const context = uvRenderTarget.getContext("2d");
      if (context) {
        context.putImageData(imageData, 0, 0);
      }
    }

    return buffer;
  },
  setParent(parent: Element) {
    if (!RENDERER) {
      throw new Error("Renderer not initialized");
    }
    parent.appendChild(RENDERER.domElement);
    return this;
  },
  async testUVBuffer(width: number, height: number) {
    // Create a render target with the width and height of the map
    // const renderTarget = new THREE.WebGLRenderTarget(width, height);
    // Create a new renderer and scene to display a small 200 pixel square
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(width, height);
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(
      -width / 2,
      width / 2,
      height / 2,
      -height / 2,
      0.1,
      100000
    );
    camera.position.z = -1;
    camera.lookAt(0, 0, 0);

    // Create a square geometry
    const geometry = new THREE.PlaneGeometry(200, 200);
    // Create a material that will display a crate texture
    const textureLoader = new THREE.TextureLoader();
    const texture = await textureLoader.loadAsync("/wood_crate.jpg");

    const material = new THREE.MeshBasicMaterial({
      map: texture,
      // wireframe: true,
      // color: 0x0000ff,
    });
    // Create the mesh
    const mesh = new THREE.Mesh(geometry, material);
    mesh.lookAt(camera.position);
    mesh.position.x -= 100;
    mesh.position.z = 10000;
    // Add the mesh to the scene
    scene.add(mesh);

    // Create a custom material that will output the uv as the texture color instead of the texture
    const uvMaterial = new THREE.ShaderMaterial({
      vertexShader: uvVertShader,
      fragmentShader: uvFragShader,
    });
    // Now use the new custom material to create a new mesh
    const uvMesh = new THREE.Mesh(geometry, uvMaterial);
    uvMesh.lookAt(camera.position);
    uvMesh.position.x += 100;
    uvMesh.position.z = 10000;
    // Add the mesh to the scene
    scene.add(uvMesh);

    // Render the scene
    renderer.render(scene, camera);

    // Add the renderer to the DOM
    document.body.appendChild(renderer.domElement);
  }
};

export default renderer;
varying vec2 vUv;
void main() {
  // Store the uv values in a varying so that the fragment shader can access them
  // The vUv will be interpolated between the vertices
  vUv = uv; 
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
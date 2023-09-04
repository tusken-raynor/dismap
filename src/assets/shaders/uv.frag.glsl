varying vec2 vUv;
void main() {
  // We need to get more precision for the u and v values
  // To do this we are going to store extra data of u and v
  // in the blue channel of the texture, giving us 12 bits
  // of precision for each value.

  // Multiply the u/v values by 4095.0 and floor them 
  int x = int(floor(vUv.x * 4095.0));
  int y = int(floor(vUv.y * 4095.0));

  // Take the lowest 8 bits of x and store it in a variable called r
  int r = x & 255;
  // Take the lowest 8 bits of y and store it in a variable called g
  int g = y & 255;
  // Take the top 4 bits from both x and y and store them in a variable called b
  int b1 = (x >> 4) & 240;
  int b2 = y >> 8;
  int b = b1 | b2;

  // Divide the r, g, and b values by 255.0 to get the values between 0.0 and 1.0
  float red = float(r) / 255.0;
  float green = float(g) / 255.0;
  float blue = float(b) / 255.0;
  
  // Set the ouput colors. Make sure alpha is 1.0
  gl_FragColor = vec4(red, green, blue, 1.0);
}
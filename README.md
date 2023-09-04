# DisMap

**Project Author:** [Sam Powell](https://github.com/tusken-raynor)

DisMap is a web application that allows you to upload an image and distort it by manipulating points placed over the image as a grid. As you distort the image, it generates a displacement map that can be used in SVG filters for `feDisplacementMap`. This README provides instructions for setting up and using DisMap.

## Getting Started

Follow these steps to get the DisMap project up and running:

1. Clone the repository to your local machine:

   ```bash
   git clone https://github.com/tusken-raynor/dismap.git
   ```

2. Navigate to the project directory:

   ```bash
   cd dismap
   ```

3. Install the required dependencies:

   ```bash
   npm install
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

   This command will launch a local server, and you can access DisMap in your web browser at `http://localhost:5174` or whichever port Vite runs the server with.

5. To build the project for production, use the following command:

   ```bash
   npm run build
   ```

   This will create a production-ready build of DisMap.

## Usage

DisMap allows you to distort images and create displacement maps. Here's how to use it:

1. Open the menu from the header to access settings.
2. Set the canvas dimensions to your desired size.
3. Adjust the "Mesh Density" to control the number of distortion points. More points provide greater detail but may be harder to manipulate.
4. Set the scale for the X direction. Scale of X determines maximum displacement along the x-axis, and is a factor of the canvas's width. 
5. Set the scale for the Y direction. Scale of Y determines maximum displacement along the y-axis, and is a factor of the canvas's height.
6. Please note that you should only set the scale to allow the necessary displacement, as smaller scales generally result in better looking displacement results.
7. Upload an image for distortion by clicking "Upload Displace Image" and selecting an image from your file system.
8. Optionally, add a backdrop image by clicking "Upload Backdrop Image."

### Distorting Images

- Drag points to distort the image. You can:
  - Grab individual points with the mouse.
  - Hold Shift to select and move an entire column.
  - Hold Ctrl/Command to select and move an entire row.
  - Combine Shift and Ctrl/Command to grab both a row and a column.

- Create a selection rectangle by pressing down between points, then drag to select multiple points. Move the selected points by grabbing one of them.

- To add to selected points, hold Shift while creating a new selection rectangle.
- To subtract from selected points, hold Ctrl/Command while creating a selection rectangle.

### Reflection

- Check "Reflect Across X-Axis" to reflect transformations and selections from top to bottom.
- Check "Reflect Across Y-Axis" to reflect transformations and selections from left to right.

### Visualization

- Check "Show Displacement Map" to preview the displacement map image. Right-click to download it.
- Toggling "Show Mesh" hides the grid and points, allowing unobstructed view of the displaced image.

## License

This project is licensed under the [License Name](LICENSE.md) - see the [LICENSE.md](LICENSE.md) file for details.

## Acknowledgments

### Three.JS

This project relies on the [three.js](https://github.com/mrdoob/three.js/) library for 3D graphics rendering. We extend our gratitude to the three.js community for their amazing work.

The MIT License

Copyright © 2010-2023 three.js authors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
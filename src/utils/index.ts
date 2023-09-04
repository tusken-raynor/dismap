export default {
  dataUrlToBlobUrl(dataUrl: string) {
    // Convert Data URL to Blob
    const commaIndex = dataUrl.indexOf(',');
    const mimeType = dataUrl.substring(5, commaIndex);
    const base64Data = dataUrl.substring(commaIndex + 1);
    const byteCharacters = atob(base64Data);
    const byteArrays = [];
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteArrays.push(byteCharacters.charCodeAt(i));
    }
    
    const blob = new Blob([new Uint8Array(byteArrays)], { type: mimeType });
  
    // Create Blob URL from Blob
    const blobUrl = URL.createObjectURL(blob);
  
    return blobUrl;
  },
  /**
   * Pass a width and height and a maximum width and height and this function will return a new width and height that will fit within the maximum dimensions while  maintaining the aspect ratio of the original dimensions
   * @param width 
   * @param height 
   * @param maxWidth 
   * @param maxHeight 
   * @returns 
   */
  containDimensionsWithin(width: number, height: number, maxWidth: number, maxHeight: number) {
    // Pass a width and height and a maximum width and height
    // and this function will return a new width and height
    // that will fit within the maximum dimensions while
    // maintaining the aspect ratio of the original dimensions
    if (width <= maxWidth && height <= maxHeight) {
      // The image is already smaller than the maximum dimensions
      return { width, height };
    }
    const ratio = width / height;
    const maxRatio = maxWidth / maxHeight;
    if (ratio > maxRatio) {
      // Width is the limiting factor
      width = maxWidth;
      height = width / ratio;
    } else {
      // Height is the limiting factor
      height = maxHeight;
      width = height * ratio;
    }
    // Round the final values to integers
    width = Math.round(width);
    height = Math.round(height);
    return { width, height };
  },
  channelValueToOffset(channelValue: number, max: number, scale: number) {
    // This takes a color channel value between 0 and 255
    // and converts it to an offset between -1.0 and 1.0
    if (channelValue < 128) {
      return (channelValue - 128) * max * scale / 128;
    } else {
      return (channelValue - 128) * max * scale / 127;
    }
  },
  interpolateEaseCubic(t: number) {
    // This is an implementation of the cubic easing function
    // https://easings.net/#easeInOutCubic
    if ((t /= 0.5) < 1) return 0.5 * t * t * t;
    return 0.5 * ((t -= 2) * t * t + 2);
  },
  hashString(string: string, length = 6) {
    var charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var num = string.length % charset.length;
    for (var i = 0; i < string.length; i++) {
      num += string.charCodeAt(i);
    }
    num = num % charset.length;
    var hash = "";
    for (var i = 0; i < length; i++) {
      var charCode = string.charCodeAt(
        Math.min(Math.round((i * string.length) / length), string.length - 1)
      );
      var char = charset[(charCode + num) % charset.length];
      hash += char;
      num =
        (num + charCode + char.charCodeAt(0) + i + string.length) %
        charset.length;
    }
    return hash;
  }
}
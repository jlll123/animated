var pixelsTemp;

function chance(c) {
  return Math.random() < c;
}

function randomn(n) {
  return Math.floor(Math.random() * n);
}

function randomElem(arr) {
  return arr[ randomn(arr.length) ];
}

function findPowerOfTwo(n) {
  let res = 0;
  while (n >>= 1) res++;
  return res;
}

function bitRead(n, ind) {
  return (n >> ind) & 1;
}

function getBrightnessRGB(r, g, b) {
  if( r+g+b == 0 ) return 0;
  return Math.floor( Math.sqrt(0.299*r*r + 0.587*g*g + 0.114*b*b ) );
}

function greyScale(arr, min = 0, max = 255) {
  for(let i=0; i<arr.length/4; i++) {
    let b = Math.floor( map( getBrightnessRGB( arr[i*4], arr[i*4+1], arr[i*4+2] ), min, max, 0, 255, true) );
    arr[i*4] = b;
    arr[i*4+1] = b;
    arr[i*4+2] = b;
  }
}

function rgbToHsb(r, g, b) {
  var h, s, v;
  var min, max, delta;
  min = Math.min(r, g, b);
  max = Math.max(r, g, b);
  v = max;
  delta = max - min;
  if (max != 0) s = delta / max; // s
  else {
    s = 0;
    h = -1;
    return [h, s, v];
  }
  if (r == max) h = (g - b) / delta; // between yellow & magenta
  else if (g == max) h = 2 + (b - r) / delta; // between cyan & yellow
  else h = 4 + (r - g) / delta; // between magenta & cyan
  h *= 60; // degrees
  if (h < 0) h += 360;
  return [h, s * 100, v / 255 * 100 ];
}

function hsbToRgb(h, s, v) {
  var r, g, b;
  s = s / 100;
  v = v / 100;
  if (s == 0) {
    r = g = b = Math.floor(v * 255);
    return [ r, g, b ];
  }
  h /= 60; // sector 0 to 5
  var i = Math.floor(h);
  var f = h - i; // factorial part of h
  var p = v * (1 - s);
  var q = v * (1 - s * f);
  var t = v * (1 - s * (1 - f));
  switch (i) {
    case 0:
      r = v * 255;
      g = t * 255;
      b = p * 255;
      break;
    case 1:
      r = q * 255;
      g = v * 255;
      b = p * 255;
      break;
    case 2:
      r = p * 255;
      g = v * 255;
      b = t * 255;
      break;
    case 3:
      r = p * 255;
      g = q * 255;
      b = v * 255;
      break;
    case 4:
      r = t * 255;
      g = p * 255;
      b = v * 255;
      break;
    default: // case 5:
      r = v * 255;
      g = p * 255;
      b = q * 255;
  }
  return [ Math.floor(r), Math.floor(g), Math.floor(b) ];
}

function hsl(hue = 0, saturation = 1, brightness = 1) {
  for(let i=0; i<pixels.length/4; i++) {
    let hsb = rgbToHsb(pixels[i*4], pixels[i*4+1], pixels[i*4+2]);
    let nc = hsbToRgb( (hsb[0] + hue) % 360, hsb[1] * saturation, hsb[2] * brightness )
    pixels[i*4] = nc[0];
    pixels[i*4+1] = nc[1];
    pixels[i*4+2] = nc[2];
  }
}

function lighter(power = 0) {
  for(let i=0; i<pixels.length/4; i++) {
    pixels[i*4] += power;
    pixels[i*4+1] += power;
    pixels[i*4+2] += power;
  }
}

function contrast(power = 1) {
  for(let i=0; i<pixels.length/4; i++) {
    pixels[i*4] = 128 + (pixels[i*4]-128) * power;
    pixels[i*4+1] = 128 + (pixels[i*4+1]-128) * power;
    pixels[i*4+2] = 128 + (pixels[i*4+2]-128) * power;
  }
}



/* DITHERING */

function dithering() {

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {

      let ind = (y * W + x) * 4;

      let oldR = pixels[ind];
      let oldG = pixels[ind+1];
      let oldB = pixels[ind+2];

      let [newR, newG, newB] = findClosestPaletteColor(oldR, oldG, oldB);

      pixelsTemp[ind] = newR;
      pixelsTemp[ind+1] = newG;
      pixelsTemp[ind+2] = newB;
      pixelsTemp[ind+3] = 255;

      let errR = oldR - newR;
      let errG = oldG - newG;
      let errB = oldB - newB;

      if (x + 1 < W) diffuseError(x + 1, y, errR, errG, errB, 7.0 / 16);
      if (x - 1 >= 0 && y + 1 < H) diffuseError(x - 1, y + 1, errR, errG, errB, 3.0 / 16);
      if (y + 1 < H) diffuseError(x, y + 1, errR, errG, errB, 5.0 / 16);
      if (x + 1 < W && y + 1 < H) diffuseError(x + 1, y + 1, errR, errG, errB, 1.0 / 16);

    }
  }

  pixels.set(pixelsTemp);
}

function diffuseError(x, y, errR, errG, errB, factor) {
  let ind = (y * W + x) * 4;
  pixels[ind] += errR * factor;
  pixels[ind+1] += errG * factor;
  pixels[ind+2] += errB * factor;
}

function findClosestPaletteColor(oldR, oldG, oldB) {
  let closest = colors[0];
  let closestDistance = 999999;

  for (let i = 0; i < colors.length; i++) {

    // let b1 = Math.sqrt( 0.299 * (oldR) ** 2 + 0.587 * (oldG) ** 2 + 0.114 * (oldB) ** 2 );
    // let b2 = Math.sqrt( 0.299 * (colors[i][0]) ** 2 + 0.587 * (colors[i][1]) ** 2 + 0.114 * ( colors[i][2]) ** 2 );

    let distance = (oldR - colors[i][0]) ** 2 + (oldG - colors[i][1]) ** 2 + (oldB - colors[i][2]) ** 2;

    // let distance = Math.abs(b1 - b2) + Math.sqrt( (oldR - colors[i][0]) ** 2 + (oldG - colors[i][1]) ** 2 + (oldB - colors[i][2]) ** 2 );
    // let distance = Math.abs(b1 - b2) + Math.pow(oldR - colors[i][0], 2) + Math.pow(oldG - colors[i][1], 2) + Math.pow(oldB - colors[i][2], 2);

    // let distance = 0.299*Math.pow(oldR - colors[i][0], 2) + 0.587*Math.pow(oldG - colors[i][1], 2) + 0.114*Math.pow(oldB - colors[i][2], 2);
    // let distance = Math.sqrt( 0.299 * Math.pow(oldR - colors[i][0], 2) + 0.587 * Math.pow(oldG - colors[i][1], 2) + 0.114 * Math.pow(oldB - colors[i][2], 2) );

    if (distance < closestDistance) {
      closestDistance = distance;
      closest = colors[i];
    }

  }
  
  return closest;
}

function getDate() {
  var today = new Date();
  let y = today.getFullYear();
  let m = today.getMonth()+1;
  let d = today.getDate();
  if(m<=9) m = '0' + m;
  if(d<=9) d = '0' + d;
  return `${y}-${m}-${d}`;
}

function getTime() {
  var today = new Date();
  let h = today.getHours();
  let m = today.getMinutes();
  let s = today.getSeconds();
  if(h<=9) h = '0' + h;
  if(m<=9) m = '0' + m;
  if(s<=9) s = '0' + s;
  return `${h}-${m}-${s}`;
}

function dateTime() {
  return `${getDate()}-${getTime()}`;
}

function hexToRgb(hex) {
  // Remove the hash at the start if it's there
  hex = hex.replace(/^#/, '');
  
  // Parse the r, g, b values
  var bigint = parseInt(hex, 16);
  var r = (bigint >> 16) & 255;
  var g = (bigint >> 8) & 255;
  var b = bigint & 255;
  
  return [r,g,b];
}

function rgbToHex(r, g, b) {
  // Convert each component to a two-digit hex number
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
}
const VERSION = 6;
const SIZE = VERSION * 4 + 17;
const DATA_CODEWORDS = 136;
const EC_CODEWORDS = 18;
const BLOCKS = 2;
const BYTE_CAPACITY = 134;

const toUtf8Bytes = (text) => {
  const value = String(text || "");
  if (typeof TextEncoder !== "undefined") return Array.from(new TextEncoder().encode(value));
  const encoded = unescape(encodeURIComponent(value));
  return Array.from(encoded, (char) => char.charCodeAt(0));
};

const appendBits = (out, value, length) => {
  for (let i = length - 1; i >= 0; i -= 1) out.push((value >>> i) & 1);
};

const EXP = new Array(512);
const LOG = new Array(256);
(() => {
  let x = 1;
  for (let i = 0; i < 255; i += 1) {
    EXP[i] = x;
    LOG[x] = i;
    x <<= 1;
    if (x & 0x100) x ^= 0x11d;
  }
  for (let i = 255; i < 512; i += 1) EXP[i] = EXP[i - 255];
})();

const gfMul = (a, b) => (a === 0 || b === 0 ? 0 : EXP[LOG[a] + LOG[b]]);

const polyMul = (a, b) => {
  const out = new Array(a.length + b.length - 1).fill(0);
  for (let i = 0; i < a.length; i += 1) {
    for (let j = 0; j < b.length; j += 1) out[i + j] ^= gfMul(a[i], b[j]);
  }
  return out;
};

const rsGenerator = (degree) => {
  let gen = [1];
  for (let i = 0; i < degree; i += 1) gen = polyMul(gen, [1, EXP[i]]);
  return gen;
};

const rsEcc = (data, degree) => {
  const gen = rsGenerator(degree);
  const result = data.concat(new Array(degree).fill(0));
  for (let i = 0; i < data.length; i += 1) {
    const coef = result[i];
    if (!coef) continue;
    for (let j = 0; j < gen.length; j += 1) result[i + j] ^= gfMul(gen[j], coef);
  }
  return result.slice(data.length);
};

const degree = (value) => {
  let out = -1;
  let v = value;
  while (v) {
    v >>>= 1;
    out += 1;
  }
  return out;
};

const bchFormat = (formatData) => {
  let value = formatData << 10;
  const poly = 0x537;
  while (degree(value) - degree(poly) >= 0) value ^= poly << (degree(value) - degree(poly));
  return ((formatData << 10) | value) ^ 0x5412;
};

export const makeQrMatrix = (text) => {
  const bytes = toUtf8Bytes(text);
  if (bytes.length > BYTE_CAPACITY) {
    throw new Error("QR matni juda uzun: " + bytes.length + "/" + BYTE_CAPACITY + " bayt");
  }

  const bits = [];
  appendBits(bits, 0b0100, 4);
  appendBits(bits, bytes.length, 8);
  for (const byte of bytes) appendBits(bits, byte, 8);

  const capacityBits = DATA_CODEWORDS * 8;
  for (let i = 0; i < Math.min(4, capacityBits - bits.length); i += 1) bits.push(0);
  while (bits.length % 8) bits.push(0);

  const data = [];
  for (let i = 0; i < bits.length; i += 8) {
    let byte = 0;
    for (let j = 0; j < 8; j += 1) byte = (byte << 1) | bits[i + j];
    data.push(byte);
  }
  for (let i = 0; data.length < DATA_CODEWORDS; i += 1) data.push(i % 2 === 0 ? 0xec : 0x11);

  const blocks = [];
  const eccs = [];
  for (let i = 0; i < BLOCKS; i += 1) {
    const block = data.slice(i * 68, (i + 1) * 68);
    blocks.push(block);
    eccs.push(rsEcc(block, EC_CODEWORDS));
  }

  const codewords = [];
  for (let i = 0; i < 68; i += 1) for (let b = 0; b < BLOCKS; b += 1) codewords.push(blocks[b][i]);
  for (let i = 0; i < EC_CODEWORDS; i += 1) for (let b = 0; b < BLOCKS; b += 1) codewords.push(eccs[b][i]);

  const dataBits = [];
  for (const word of codewords) appendBits(dataBits, word, 8);

  const matrix = Array.from({ length: SIZE }, () => Array(SIZE).fill(false));
  const func = Array.from({ length: SIZE }, () => Array(SIZE).fill(false));
  const set = (x, y, dark, isFunction = true) => {
    if (x < 0 || y < 0 || x >= SIZE || y >= SIZE) return;
    matrix[y][x] = Boolean(dark);
    if (isFunction) func[y][x] = true;
  };

  const finder = (x, y) => {
    for (let dy = -1; dy <= 7; dy += 1) {
      for (let dx = -1; dx <= 7; dx += 1) {
        const xx = x + dx;
        const yy = y + dy;
        if (xx < 0 || yy < 0 || xx >= SIZE || yy >= SIZE) continue;
        const dark = dx >= 0 && dx <= 6 && dy >= 0 && dy <= 6 && (dx === 0 || dx === 6 || dy === 0 || dy === 6 || (dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4));
        set(xx, yy, dark, true);
      }
    }
  };

  finder(0, 0);
  finder(SIZE - 7, 0);
  finder(0, SIZE - 7);

  for (let i = 0; i < SIZE; i += 1) {
    if (!func[6][i]) set(i, 6, i % 2 === 0, true);
    if (!func[i][6]) set(6, i, i % 2 === 0, true);
  }

  const alignment = (cx, cy) => {
    for (let dy = -2; dy <= 2; dy += 1) {
      for (let dx = -2; dx <= 2; dx += 1) {
        const distance = Math.max(Math.abs(dx), Math.abs(dy));
        set(cx + dx, cy + dy, distance !== 1, true);
      }
    }
  };
  alignment(34, 34);

  set(8, 4 * VERSION + 9, true, true);
  for (let i = 0; i <= 8; i += 1) {
    if (i !== 6) {
      set(8, i, false, true);
      set(i, 8, false, true);
    }
  }
  for (let i = 0; i < 8; i += 1) {
    set(SIZE - 1 - i, 8, false, true);
    set(8, SIZE - 1 - i, false, true);
  }

  let bitIndex = 0;
  let upward = true;
  for (let right = SIZE - 1; right >= 1; right -= 2) {
    if (right === 6) right -= 1;
    for (let vert = 0; vert < SIZE; vert += 1) {
      const y = upward ? SIZE - 1 - vert : vert;
      for (let j = 0; j < 2; j += 1) {
        const x = right - j;
        if (func[y][x]) continue;
        matrix[y][x] = bitIndex < dataBits.length ? Boolean(dataBits[bitIndex]) : false;
        bitIndex += 1;
      }
    }
    upward = !upward;
  }

  for (let y = 0; y < SIZE; y += 1) {
    for (let x = 0; x < SIZE; x += 1) {
      if (!func[y][x] && (x + y) % 2 === 0) matrix[y][x] = !matrix[y][x];
    }
  }

  const format = bchFormat((1 << 3) | 0);
  const bit = (i) => ((format >>> i) & 1) !== 0;
  for (let i = 0; i <= 5; i += 1) set(8, i, bit(i), true);
  set(8, 7, bit(6), true);
  set(8, 8, bit(7), true);
  set(7, 8, bit(8), true);
  for (let i = 9; i < 15; i += 1) set(14 - i, 8, bit(i), true);
  for (let i = 0; i < 8; i += 1) set(SIZE - 1 - i, 8, bit(i), true);
  for (let i = 8; i < 15; i += 1) set(8, SIZE - 15 + i, bit(i), true);

  return matrix;
};

export const makeQrSvg = (text, { scale = 8, border = 4, foreground = "#001b3f" } = {}) => {
  const matrix = makeQrMatrix(text);
  const dimension = (SIZE + border * 2) * scale;
  const rects = [];
  for (let y = 0; y < SIZE; y += 1) {
    for (let x = 0; x < SIZE; x += 1) {
      if (!matrix[y][x]) continue;
      rects.push('<rect x="' + ((x + border) * scale) + '" y="' + ((y + border) * scale) + '" width="' + scale + '" height="' + scale + '"/>');
    }
  }
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + dimension + ' ' + dimension + '" width="' + dimension + '" height="' + dimension + '" role="img" aria-label="Telegram QR"><rect width="100%" height="100%" fill="#fff"/><g fill="' + foreground + '">' + rects.join("") + '</g></svg>';
};

export const makeQrSvgDataUrl = (text) => 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(makeQrSvg(text));

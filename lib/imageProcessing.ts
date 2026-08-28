/**
 * Image processing utilities — canvas-based manipulations for preprocessing
 * images before OCR. All functions return a new File object.
 */

/**
 * Loads an image File into an HTMLImageElement.
 */
function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Converts an HTMLImageElement to a File via canvas.
 */
function imageToFile(
  canvas: HTMLCanvasElement,
  originalName: string,
  type: string = 'image/png'
): Promise<File> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(new File([blob], originalName, { type }));
      }
    }, type);
  });
}

/**
 * Rotates an image by the specified degrees (90, 180, 270).
 */
export async function rotateImage(
  file: File,
  degrees: number
): Promise<File> {
  const img = await loadImage(file);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;

  const rad = (degrees * Math.PI) / 180;
  const sin = Math.abs(Math.sin(rad));
  const cos = Math.abs(Math.cos(rad));

  canvas.width = img.width * cos + img.height * sin;
  canvas.height = img.width * sin + img.height * cos;

  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(rad);
  ctx.drawImage(img, -img.width / 2, -img.height / 2);

  URL.revokeObjectURL(img.src);
  return imageToFile(canvas, file.name);
}

/**
 * Adjusts brightness of an image. Value range: -100 to +100.
 */
export async function adjustBrightness(
  file: File,
  value: number
): Promise<File> {
  const img = await loadImage(file);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;

  canvas.width = img.width;
  canvas.height = img.height;
  ctx.drawImage(img, 0, 0);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  const factor = (259 * (value + 255)) / (255 * (259 - value));

  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.min(255, Math.max(0, factor * (data[i] - 128) + 128));
    data[i + 1] = Math.min(255, Math.max(0, factor * (data[i + 1] - 128) + 128));
    data[i + 2] = Math.min(255, Math.max(0, factor * (data[i + 2] - 128) + 128));
  }

  ctx.putImageData(imageData, 0, 0);
  URL.revokeObjectURL(img.src);
  return imageToFile(canvas, file.name);
}

/**
 * Adjusts contrast of an image. Value range: -100 to +100.
 */
export async function adjustContrast(
  file: File,
  value: number
): Promise<File> {
  const img = await loadImage(file);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;

  canvas.width = img.width;
  canvas.height = img.height;
  ctx.drawImage(img, 0, 0);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  const factor = (259 * (value + 255)) / (255 * (259 - value));

  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.min(255, Math.max(0, factor * (data[i] - 128) + 128));
    data[i + 1] = Math.min(255, Math.max(0, factor * (data[i + 1] - 128) + 128));
    data[i + 2] = Math.min(255, Math.max(0, factor * (data[i + 2] - 128) + 128));
  }

  ctx.putImageData(imageData, 0, 0);
  URL.revokeObjectURL(img.src);
  return imageToFile(canvas, file.name);
}

/**
 * Crops an image to the specified region.
 */
export async function cropImage(
  file: File,
  region: { x: number; y: number; width: number; height: number }
): Promise<File> {
  const img = await loadImage(file);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;

  canvas.width = region.width;
  canvas.height = region.height;
  ctx.drawImage(
    img,
    region.x, region.y, region.width, region.height,
    0, 0, region.width, region.height
  );

  URL.revokeObjectURL(img.src);
  return imageToFile(canvas, file.name);
}

/**
 * Generates a thumbnail data URL from a File (max 200px).
 */
export async function generateThumbnail(file: File, maxSize: number = 200): Promise<string> {
  const img = await loadImage(file);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;

  const ratio = Math.min(maxSize / img.width, maxSize / img.height);
  canvas.width = img.width * ratio;
  canvas.height = img.height * ratio;
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  URL.revokeObjectURL(img.src);
  return canvas.toDataURL('image/jpeg', 0.7);
}

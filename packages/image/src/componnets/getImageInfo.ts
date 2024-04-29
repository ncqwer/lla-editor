import { ImageInfo, ImagePlaceholderInfo } from './types';

export const parseBufferToCss = (
  pixels: Uint8ClampedArray,
  width: number,
  height: number,
) => {
  const rows: string[] = [];
  for (let y = 0; y < height; ++y) {
    const colors = [];
    for (let x = 0; x < width; ++x) {
      const pos = (y * width + x) * 3;
      const start = x === 0 ? '' : ` ${(x / width) * 100}%`;
      const end = ` ${((x + 1) / width) * 100}%`;
      colors.push(
        `rgb(${pixels[pos + 0]},${pixels[pos + 1]},${
          pixels[pos + 2]
        })${start}${end}`,
      );
    }
    rows.push(`linear-gradient(90deg, ${colors.join(', ')})`);
  }
  const backgroundImage = rows.join(', ');
  const backgroundPosition = rows
    .map((_, i) => (i === 0 ? '0 0 ' : `0 ${(i / (rows.length - 1)) * 100}%`))
    .join(',');

  const backgroundSize = `100% ${100 / rows.length}%`;
  return {
    backgroundImage,
    backgroundPosition,
    backgroundSize,
  };
};

const gcd = (lhs: number, rhs: number) => {
  while (lhs !== rhs) {
    if (lhs < rhs) {
      rhs = rhs - lhs;
    } else {
      lhs = lhs - rhs;
    }
  }
  return lhs;
};

export const getImageInfo = async (
  sourceURI: string,
  {
    resizeHeight = 7,
    resizeWidth = 7,
    resizeQuality = 'high',
    placeholderZip = true,
    keepAspectRatio = true,
    breakpoints,
  }: {
    resizeHeight?: number;
    resizeWidth?: number;
    resizeQuality?: 'high' | 'medium' | 'low' | 'pixelated';
    preferStyle?: boolean;
    placeholderZip?: boolean;
    keepAspectRatio?: boolean;
    breakpoints?: number[];
  } = {},
): Promise<ImageInfo> => {
  const image = await new Promise<HTMLImageElement>((res, rej) => {
    const img = new Image();
    img.onload = () => {
      res(img);
    };
    img.onerror = rej;
    img.setAttribute('crossOrigin', ''); // try to fetch cross image
    img.src = sourceURI;
  });
  const { naturalWidth, naturalHeight } = image;
  const size = gcd(naturalWidth, naturalHeight);
  const aspectRatio: [number, number] = [
    Math.round(naturalWidth / size),
    Math.round(naturalHeight / size),
  ];
  if (keepAspectRatio) {
    resizeHeight = Math.round(
      (resizeWidth * aspectRatio[1]) / aspectRatio[0] + 0.5,
    );
  }
  const imageBitmap = await createImageBitmap(image, {
    resizeHeight,
    resizeWidth,
    resizeQuality,
    premultiplyAlpha: 'premultiply',
  });

  const canvas = new OffscreenCanvas(resizeWidth, resizeHeight);
  // const canvas = document.createElement('canvas');
  // canvas.width = resizeWidth;
  // canvas.height = resizeHeight;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(imageBitmap, 0, 0);
  const temp = ctx.getImageData(0, 0, resizeWidth, resizeHeight);
  // const base64 = await new Promise(async (res) => {
  //   const fileReader = new FileReader();
  //   fileReader.onload = () => {
  //     res(fileReader.result);
  //   };
  //   fileReader.readAsDataURL(await canvas.convertToBlob());
  // });
  // `data:image/${info.format};base64,${data.toString("base64")}`
  const typedArray = temp.data;

  const pixelsCount = resizeHeight * resizeWidth;
  const removedAlphaArray = new Uint8ClampedArray(pixelsCount * 3);
  for (let i = 0; i < pixelsCount; ++i) {
    removedAlphaArray[i * 3 + 0] = typedArray[i * 4 + 0]; // r
    removedAlphaArray[i * 3 + 1] = typedArray[i * 4 + 1]; // g
    removedAlphaArray[i * 3 + 2] = typedArray[i * 4 + 2]; // b
  }
  let placeholder: ImagePlaceholderInfo;
  if (!placeholderZip) {
    placeholder = {
      type: 'css',
      data: parseBufferToCss(removedAlphaArray, resizeWidth, resizeHeight),
      // data: {
      //   backgroundSize: 'cover',
      //   backgroundPosition: '50% 50%',
      //   backgroundRepeat: 'no-repeat',
      //   backgroundImage: `url(${h})`,
      // },
    };
  } else {
    placeholder = {
      type: 'raw',
      data: {
        width: resizeWidth,
        height: resizeHeight,
        pixels: window.btoa(
          String.fromCharCode.apply(null, removedAlphaArray as any),
        ),
      },
    };
  }
  let breakpointLevelObj = {};
  if (breakpoints) {
    const idx = breakpoints.findIndex((v) => v > naturalWidth);
    breakpointLevelObj = {
      breakpointLevel: !~idx ? breakpoints.length : idx,
    };
  }
  return {
    src: sourceURI,
    width: naturalWidth,
    height: naturalHeight,
    placeholder,
    aspectRatio,
    ...breakpointLevelObj,
  };
};

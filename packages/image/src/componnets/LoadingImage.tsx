import React from 'react';

type ImageInfo = {
  src: string;
  breakpointLevel?: number;
  width: number;
  height: number;
  placeholder: ImagePlaceholderInfo;
  aspectRatio: [number, number];
};

type ImagePlaceholderInfo =
  | {
      type: 'raw';
      data: {
        pixels: string; // base64 format, row first array, layout likes [r,g,b,...,r,g,b] no alpha channel
        width: number;
        height: number;
      };
    }
  | {
      type: 'css';
      data: Record<
        'backgroundImage' | 'backgroundPosition' | 'backgroundSize',
        string
      >;
    };

export const parseBase64ToBuffer = (base64String: string) => {
  const bstring = window.atob(base64String);
  const array = new Uint8ClampedArray(bstring.length);
  for (let i = 0; i < bstring.length; ++i) {
    array[i] = bstring.charCodeAt(i);
  }
  return array;
};

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
  }: {
    resizeHeight?: number;
    resizeWidth?: number;
    resizeQuality?: 'high' | 'medium' | 'low' | 'pixelated';
    preferStyle?: boolean;
    placeholderZip?: boolean;
    keepAspectRatio?: boolean;
  } = {},
): Promise<ImageInfo> => {
  const image = await new Promise<HTMLImageElement>((res, rej) => {
    const img = new Image();
    img.onload = () => {
      res(img);
    };
    img.onerror = rej;
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
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(imageBitmap, 0, 0);
  const temp = ctx.getImageData(0, 0, resizeWidth, resizeHeight);
  // const h = await new Promise(async (res) => {
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
  return {
    src: sourceURI,
    width: naturalWidth,
    height: naturalHeight,
    placeholder,
    aspectRatio,
  };
};

const ImageConfigContext = React.createContext<{
  loader: (src: string, width?: number, quality?: number) => string;
  breakpoints: number[];
  devicePixelRatio: 2;
}>({
  loader: (x: any, width: any) => {
    if (width < 768)
      return 'https://plus.unsplash.com/premium_photo-1713803863170-436be4feb510?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxlZGl0b3JpYWwtZmVlZHwxfHx8ZW58MHx8fHx8';
    return 'https://images.unsplash.com/photo-1713791924903-3b8f4c31dddb?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxlZGl0b3JpYWwtZmVlZHwzfHx8ZW58MHx8fHx8';
  },
  breakpoints: [640, 768, 1024, 1280, 1536],
  devicePixelRatio: 2,
} as any);

export const LoadingImage = ({
  src,
  placeholder,
  width,
  height,
  aspectRatio,
  className,
  breakpointLevel,
  containerClassName,
  style,
  fill,
  loading,
  lazy,
  imageStyle,
  ...others
}: React.PropsWithChildren<
  ImageInfo &
    Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'placeholder'> & {
      containerClassName?: string;
      fill?: 'fill' | 'aspect';
      imageStyle?: React.HtmlHTMLAttributes<HTMLImageElement>['style'];
      lazy?: boolean;
    }
>) => {
  const placeholderStyle = React.useMemo(() => {
    if (placeholder.type === 'css') return placeholder.data;
    const buffer = parseBase64ToBuffer(placeholder.data.pixels);
    return parseBufferToCss(
      buffer,
      placeholder.data.width,
      placeholder.data.height,
    );
  }, [placeholder]);
  const containerStyle = React.useMemo<any>(() => {
    let target: any = {};
    if (fill === 'fill') {
      target = {
        '--img-width': `100%`,
        '--img-height': `100%`,
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
      };
    } else if (aspectRatio && fill === 'aspect') {
      target = {
        '--img-width': `100%`,
        '--img-aspect-ratio': `${aspectRatio[0]}/${aspectRatio[1]}`,
      };
    } else if (aspectRatio && width) {
      target = {
        '--img-width': `${width}px`,
        '--img-height': `${(width! / aspectRatio[0]) * aspectRatio[1]}px`,
        '--img-aspect-ratio': `${aspectRatio[0]}/${aspectRatio[1]}`,
      };
    } else if (aspectRatio && height) {
      target = {
        '--img-height': `${height}px`,
        '--img-width': `${(height / aspectRatio[1]) * aspectRatio[0]}px`,
        '--img-aspect-ratio': `${aspectRatio[0]}/${aspectRatio[1]}`,
      };
    } else {
      target = {
        '--img-width': `${width}px`,
        '--img-height': `${height}px`,
      };
    }
    return Object.assign(target, style);
  }, [width, height, aspectRatio, style, fill]);

  const { loader, breakpoints, devicePixelRatio } =
    React.useContext(ImageConfigContext);
  const imageData = React.useMemo(() => {
    return {
      src: loader(src),
      srcSet: breakpoints
        .slice(0, breakpointLevel)
        .map((w) => `${loader(src, w)} ${w}w`)
        .join(', '),
      sizes: breakpoints
        .slice(0, breakpointLevel)
        .map((w, idx) =>
          idx === breakpoints.length - 1
            ? `${w}px`
            : `(max-width: ${w}px) ${w}px`,
        )
        .join(', '),
    };
  }, [src, loader, breakpointLevel, breakpoints, devicePixelRatio]);

  const [needShow, setNeedShow] = React.useState(!lazy);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (loading !== 'eager' && containerRef.current && lazy) {
      let observer: IntersectionObserver | null = new IntersectionObserver(
        (entries) => {
          const entity = entries[0];
          if (entity.isIntersecting) {
            setNeedShow(true);
            if (observer) {
              observer.disconnect();
              observer = null;
            }
          }
        },
        {
          rootMargin: '100px 100px 100px 100px',
        },
      );
      observer.observe(containerRef.current);
      return () => {
        if (observer) {
          observer.disconnect();
          observer = null;
        }
      };
    }
  }, [loading, lazy]);
  const [imageStatus, setImageStatus] = React.useState<
    'loading' | 'success' | 'error'
  >('loading');
  return (
    <div
      ref={containerRef}
      className={`w-[var(--img-width)] h-[var(--img-height)] aspect-[var(--img-aspect-ratio)] relative overflow-hidden ${
        containerClassName ? containerClassName : ''
      }`}
      style={containerStyle}
    >
      <div
        className="absolute inset-0 w-full h-full filter blur-2xl z-[-1] bg-no-repeat scale-150"
        style={placeholderStyle}
      ></div>
      {imageStatus === 'error' && (
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <span>
            <svg
              // style="width: 1em;height: 1em;vertical-align: middle;fill: currentColor;overflow: hidden;"
              className="inline-block w-[1em] h-[1em] mr-[0.5em]"
              viewBox="0 0 1024 1024"
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M494.933333 989.866667c-10.24 0-17.066667-6.826667-17.066666-17.066667V17.066667c0-10.24 6.826667-17.066667 17.066666-17.066667s17.066667 6.826667 17.066667 17.066667v955.733333c0 10.24-6.826667 17.066667-17.066667 17.066667z"
                fill=""
              ></path>
              <path
                d="M972.8 512H17.066667c-10.24 0-17.066667-6.826667-17.066667-17.066667s6.826667-17.066667 17.066667-17.066666h955.733333c10.24 0 17.066667 6.826667 17.066667 17.066666s-6.826667 17.066667-17.066667 17.066667zM870.4 238.933333h-750.933333c-10.24 0-17.066667-6.826667-17.066667-17.066666s6.826667-17.066667 17.066667-17.066667h750.933333c10.24 0 17.066667 6.826667 17.066667 17.066667s-6.826667 17.066667-17.066667 17.066666zM494.933333 750.933333h-409.6c-10.24 0-17.066667-6.826667-17.066666-17.066666s6.826667-17.066667 17.066666-17.066667h409.6c10.24 0 17.066667 6.826667 17.066667 17.066667s-6.826667 17.066667-17.066667 17.066666z"
                fill=""
              ></path>
              <path
                d="M494.933333 989.866667C334.506667 989.866667 204.8 768 204.8 494.933333S334.506667 0 494.933333 0 785.066667 221.866667 785.066667 494.933333c0 10.24-6.826667 17.066667-17.066667 17.066667s-17.066667-6.826667-17.066667-17.066667C750.933333 242.346667 634.88 34.133333 494.933333 34.133333S238.933333 242.346667 238.933333 494.933333 354.986667 955.733333 494.933333 955.733333c10.24 0 17.066667 6.826667 17.066667 17.066667s-6.826667 17.066667-17.066667 17.066667z"
                fill=""
              ></path>
              <path
                d="M494.933333 989.866667C221.866667 989.866667 0 768 0 494.933333S221.866667 0 494.933333 0 989.866667 221.866667 989.866667 494.933333c0 17.066667 0 34.133333-3.413334 54.613334 0 10.24-10.24 17.066667-20.48 13.653333-10.24 0-17.066667-10.24-13.653333-20.48 3.413333-17.066667 3.413333-34.133333 3.413333-47.786667C955.733333 242.346667 747.52 34.133333 494.933333 34.133333S34.133333 242.346667 34.133333 494.933333 242.346667 955.733333 494.933333 955.733333c20.48 0 40.96 0 64.853334-6.826666 10.24 0 17.066667 6.826667 20.48 13.653333 0 10.24-6.826667 17.066667-13.653334 20.48-27.306667 3.413333-51.2 6.826667-71.68 6.826667z"
                fill=""
              ></path>
              <path
                d="M802.133333 887.466667c-10.24 0-17.066667-6.826667-17.066666-17.066667v-170.666667c0-10.24 6.826667-17.066667 17.066666-17.066666s17.066667 6.826667 17.066667 17.066666v170.666667c0 10.24-6.826667 17.066667-17.066667 17.066667z"
                fill=""
              ></path>
              <path
                d="M802.133333 1024c-122.88 0-221.866667-98.986667-221.866666-221.866667s98.986667-221.866667 221.866666-221.866666 221.866667 98.986667 221.866667 221.866666-98.986667 221.866667-221.866667 221.866667z m0-409.6c-102.4 0-187.733333 85.333333-187.733333 187.733333s85.333333 187.733333 187.733333 187.733334 187.733333-85.333333 187.733334-187.733334-85.333333-187.733333-187.733334-187.733333z"
                fill=""
              ></path>
              <path
                d="M802.133333 955.733333c-10.24 0-17.066667-6.826667-17.066666-17.066666s6.826667-17.066667 17.066666-17.066667 17.066667 6.826667 17.066667 17.066667-6.826667 17.066667-17.066667 17.066666z"
                fill=""
              ></path>
            </svg>
            <span>Opps! there seems to be a network issue here!</span>
          </span>
        </div>
      )}
      {needShow && (
        <img
          {...others}
          className={`w-full h-full ${
            imageStatus !== 'success' ? 'hidden' : ''
          } ${className ? className : ''}`}
          style={imageStyle}
          onLoad={() => {
            setImageStatus('success');
          }}
          onError={() => {
            setImageStatus('error');
          }}
          {...imageData}
        />
      )}
    </div>
  );
};

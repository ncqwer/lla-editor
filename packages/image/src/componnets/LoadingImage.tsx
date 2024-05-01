import React from 'react';
import { ImageInfo, ImageLoadingConfig } from './types';
import { parseBase64ToBuffer } from './utils';
import { getImageInfo, parseBufferToCss } from './getImageInfo';

export const ImageConfigContext = React.createContext<ImageLoadingConfig>({
  loader: (x: string) => {
    return x;
  },
  breakpoints: [640, 768, 1024, 1280, 1536],
  devicePixelRatio: 2,
  allLazy: false,
} as any);

export const LoadingImage = React.forwardRef<
  {
    getImageInfo: (
      options?: Parameters<typeof getImageInfo>[1],
    ) => Promise<ImageInfo>;
    offsetHeight: number;
  },
  React.PropsWithChildren<
    ImageInfo &
      Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'placeholder'> & {
        containerClassName?: string;
        fill?: 'fill' | 'aspect';
        imageStyle?: React.HtmlHTMLAttributes<HTMLImageElement>['style'];
        lazy?: boolean;
        errorMessageUnwrap?: boolean;
      }
  >
>(
  (
    {
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
      lazy: _lazy,
      imageStyle,
      errorMessageUnwrap,
      ...others
    },
    ref,
  ) => {
    const placeholderStyle = React.useMemo(() => {
      if (!placeholder) return {};
      let temp;
      if (placeholder.type === 'css') {
        temp = placeholder.data;
      } else {
        const buffer = parseBase64ToBuffer(placeholder.data.pixels);
        temp = parseBufferToCss(
          buffer,
          placeholder.data.width,
          placeholder.data.height,
        );
      }
      return {
        ...temp,
        backgroundRepeat: 'no-repeat',
      };
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

    const { loader, breakpoints, devicePixelRatio, allLazy } =
      React.useContext(ImageConfigContext);
    const lazy = _lazy || allLazy;
    const imageData = React.useMemo(() => {
      return {
        src: loader(src),
        srcSet: breakpoints
          .slice(0, breakpointLevel || 0)
          .concat(width || 0) // raw width
          .filter(Boolean)
          .map(
            (w, idx, curr) =>
              `${loader(src, w, idx === curr.length - 1)} ${
                w * devicePixelRatio
              }w`,
          )
          .join(', '),
        // sizes: breakpoints
        //   .slice(0, breakpointLevel)
        //   .map((w, idx) =>
        //     idx === breakpoints.length - 1
        //       ? `${w}px`
        //       : `(max-width: ${w}px) ${w}px`,
        //   )
        //   .join(', '),
        sizes: '100vw',
      };
    }, [src, loader, breakpointLevel, breakpoints, devicePixelRatio]);

    const imageRef = React.useRef<HTMLImageElement>(null);
    React.useImperativeHandle(ref, () => {
      return {
        getImageInfo: (options) => getImageInfo(src, options),
        get offsetHeight() {
          return containerRef.current!.offsetHeight;
        },
      };
    });

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
    React.useEffect(() => {
      if (imageRef.current) {
        const id = setTimeout(() => {
          if (imageRef.current) {
            const img = imageRef.current;
            if (!img) return;
            if (img.naturalWidth > 0) {
              setImageStatus('success');
            }
          }
        }, 0);
        return () => clearTimeout(id);
      }
    }, []);
    return (
      <>
        <div
          ref={containerRef}
          className={`lla-image__resize-image ${
            containerClassName ? containerClassName : ''
          }`}
          style={containerStyle}
        >
          <div
            className="lla-image__resize-image__mask"
            style={placeholderStyle}
          ></div>
          {imageStatus === 'error' && !errorMessageUnwrap && (
            <div className="lla-image__resize-image__error-message">
              <span>
                <svg
                  viewBox="0 0 1024 1024"
                  version="1.1"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M494.933333 989.866667c-10.24 0-17.066667-6.826667-17.066666-17.066667V17.066667c0-10.24 6.826667-17.066667 17.066666-17.066667s17.066667 6.826667 17.066667 17.066667v955.733333c0 10.24-6.826667 17.066667-17.066667 17.066667z"></path>
                  <path d="M972.8 512H17.066667c-10.24 0-17.066667-6.826667-17.066667-17.066667s6.826667-17.066667 17.066667-17.066666h955.733333c10.24 0 17.066667 6.826667 17.066667 17.066666s-6.826667 17.066667-17.066667 17.066667zM870.4 238.933333h-750.933333c-10.24 0-17.066667-6.826667-17.066667-17.066666s6.826667-17.066667 17.066667-17.066667h750.933333c10.24 0 17.066667 6.826667 17.066667 17.066667s-6.826667 17.066667-17.066667 17.066666zM494.933333 750.933333h-409.6c-10.24 0-17.066667-6.826667-17.066666-17.066666s6.826667-17.066667 17.066666-17.066667h409.6c10.24 0 17.066667 6.826667 17.066667 17.066667s-6.826667 17.066667-17.066667 17.066666z"></path>
                  <path d="M494.933333 989.866667C334.506667 989.866667 204.8 768 204.8 494.933333S334.506667 0 494.933333 0 785.066667 221.866667 785.066667 494.933333c0 10.24-6.826667 17.066667-17.066667 17.066667s-17.066667-6.826667-17.066667-17.066667C750.933333 242.346667 634.88 34.133333 494.933333 34.133333S238.933333 242.346667 238.933333 494.933333 354.986667 955.733333 494.933333 955.733333c10.24 0 17.066667 6.826667 17.066667 17.066667s-6.826667 17.066667-17.066667 17.066667z"></path>
                  <path d="M494.933333 989.866667C221.866667 989.866667 0 768 0 494.933333S221.866667 0 494.933333 0 989.866667 221.866667 989.866667 494.933333c0 17.066667 0 34.133333-3.413334 54.613334 0 10.24-10.24 17.066667-20.48 13.653333-10.24 0-17.066667-10.24-13.653333-20.48 3.413333-17.066667 3.413333-34.133333 3.413333-47.786667C955.733333 242.346667 747.52 34.133333 494.933333 34.133333S34.133333 242.346667 34.133333 494.933333 242.346667 955.733333 494.933333 955.733333c20.48 0 40.96 0 64.853334-6.826666 10.24 0 17.066667 6.826667 20.48 13.653333 0 10.24-6.826667 17.066667-13.653334 20.48-27.306667 3.413333-51.2 6.826667-71.68 6.826667z"></path>
                  <path d="M802.133333 887.466667c-10.24 0-17.066667-6.826667-17.066666-17.066667v-170.666667c0-10.24 6.826667-17.066667 17.066666-17.066666s17.066667 6.826667 17.066667 17.066666v170.666667c0 10.24-6.826667 17.066667-17.066667 17.066667z"></path>
                  <path d="M802.133333 1024c-122.88 0-221.866667-98.986667-221.866666-221.866667s98.986667-221.866667 221.866666-221.866666 221.866667 98.986667 221.866667 221.866666-98.986667 221.866667-221.866667 221.866667z m0-409.6c-102.4 0-187.733333 85.333333-187.733333 187.733333s85.333333 187.733333 187.733333 187.733334 187.733333-85.333333 187.733334-187.733334-85.333333-187.733333-187.733334-187.733333z"></path>
                  <path d="M802.133333 955.733333c-10.24 0-17.066667-6.826667-17.066666-17.066666s6.826667-17.066667 17.066666-17.066667 17.066667 6.826667 17.066667 17.066667-6.826667 17.066667-17.066667 17.066666z"></path>
                </svg>
                <span>Opps! there seems to be a network issue here!</span>
              </span>
            </div>
          )}
          {needShow && (
            <img
              {...others}
              ref={imageRef}
              className={`w-full h-full ${
                imageStatus !== 'success' ? 'hidden' : ''
              } ${className ? className : ''}`}
              style={imageStyle}
              width={width}
              height={height}
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
        {imageStatus === 'error' && errorMessageUnwrap && (
          <div className="lla-image__resize-image__error-message">
            <span>
              <svg
                viewBox="0 0 1024 1024"
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M494.933333 989.866667c-10.24 0-17.066667-6.826667-17.066666-17.066667V17.066667c0-10.24 6.826667-17.066667 17.066666-17.066667s17.066667 6.826667 17.066667 17.066667v955.733333c0 10.24-6.826667 17.066667-17.066667 17.066667z"></path>
                <path d="M972.8 512H17.066667c-10.24 0-17.066667-6.826667-17.066667-17.066667s6.826667-17.066667 17.066667-17.066666h955.733333c10.24 0 17.066667 6.826667 17.066667 17.066666s-6.826667 17.066667-17.066667 17.066667zM870.4 238.933333h-750.933333c-10.24 0-17.066667-6.826667-17.066667-17.066666s6.826667-17.066667 17.066667-17.066667h750.933333c10.24 0 17.066667 6.826667 17.066667 17.066667s-6.826667 17.066667-17.066667 17.066666zM494.933333 750.933333h-409.6c-10.24 0-17.066667-6.826667-17.066666-17.066666s6.826667-17.066667 17.066666-17.066667h409.6c10.24 0 17.066667 6.826667 17.066667 17.066667s-6.826667 17.066667-17.066667 17.066666z"></path>
                <path d="M494.933333 989.866667C334.506667 989.866667 204.8 768 204.8 494.933333S334.506667 0 494.933333 0 785.066667 221.866667 785.066667 494.933333c0 10.24-6.826667 17.066667-17.066667 17.066667s-17.066667-6.826667-17.066667-17.066667C750.933333 242.346667 634.88 34.133333 494.933333 34.133333S238.933333 242.346667 238.933333 494.933333 354.986667 955.733333 494.933333 955.733333c10.24 0 17.066667 6.826667 17.066667 17.066667s-6.826667 17.066667-17.066667 17.066667z"></path>
                <path d="M494.933333 989.866667C221.866667 989.866667 0 768 0 494.933333S221.866667 0 494.933333 0 989.866667 221.866667 989.866667 494.933333c0 17.066667 0 34.133333-3.413334 54.613334 0 10.24-10.24 17.066667-20.48 13.653333-10.24 0-17.066667-10.24-13.653333-20.48 3.413333-17.066667 3.413333-34.133333 3.413333-47.786667C955.733333 242.346667 747.52 34.133333 494.933333 34.133333S34.133333 242.346667 34.133333 494.933333 242.346667 955.733333 494.933333 955.733333c20.48 0 40.96 0 64.853334-6.826666 10.24 0 17.066667 6.826667 20.48 13.653333 0 10.24-6.826667 17.066667-13.653334 20.48-27.306667 3.413333-51.2 6.826667-71.68 6.826667z"></path>
                <path d="M802.133333 887.466667c-10.24 0-17.066667-6.826667-17.066666-17.066667v-170.666667c0-10.24 6.826667-17.066667 17.066666-17.066666s17.066667 6.826667 17.066667 17.066666v170.666667c0 10.24-6.826667 17.066667-17.066667 17.066667z"></path>
                <path d="M802.133333 1024c-122.88 0-221.866667-98.986667-221.866666-221.866667s98.986667-221.866667 221.866666-221.866666 221.866667 98.986667 221.866667 221.866666-98.986667 221.866667-221.866667 221.866667z m0-409.6c-102.4 0-187.733333 85.333333-187.733333 187.733333s85.333333 187.733333 187.733333 187.733334 187.733333-85.333333 187.733334-187.733334-85.333333-187.733333-187.733334-187.733333z"></path>
                <path d="M802.133333 955.733333c-10.24 0-17.066667-6.826667-17.066666-17.066666s6.826667-17.066667 17.066666-17.066667 17.066667 6.826667 17.066667 17.066667-6.826667 17.066667-17.066667 17.066666z"></path>
              </svg>
              <span>Opps! there seems to be a network issue here!</span>
            </span>
          </div>
        )}
      </>
    );
  },
);

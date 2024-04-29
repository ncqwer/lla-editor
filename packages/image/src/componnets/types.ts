export type ImageInfo = {
  src: string;
  breakpointLevel?: number;
  width?: number;
  height?: number;
  placeholder?: ImagePlaceholderInfo;
  aspectRatio?: [number, number];
};

export type ImagePlaceholderInfo =
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

export type ImageLoadingConfig = {
  loader: (src: string, width?: number, quality?: number) => string;
  breakpoints: number[];
  devicePixelRatio: number;
  allLazy?: boolean;
};

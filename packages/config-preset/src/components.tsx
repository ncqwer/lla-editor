import React from 'react';
import { ConfigHelers } from '@lla-editor/core';
import unified from 'unified';
import parse from 'rehype-parse';
import rehype2remark from 'rehype-remark';
import remarkParse from 'remark-parse';
import stringify from 'remark-stringify';
import gfm from 'remark-gfm';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';

const { SharedProvider } = ConfigHelers;

const DefaultPickerComponent = ({ onSelect }: any) => (
  <Picker data={data} onEmojiSelect={onSelect} />
);

const processor = unified().use(parse).use(rehype2remark);
const txtprocessor = unified().use(gfm).use(remarkParse);
const mdprocessor = unified().use(gfm).use(stringify, {
  bullet: '*',
  fence: '`',
  fences: true,
  incrementListMarker: false,
});

export const SharedProviderPreset: React.FC<{
  overlayerId: string;
  HTableComponent: any;
  imageConfig: any;
  audioConfig: any;
  videoConfig: any;
  PickerComponent: any;
  children?: React.ReactNode;
}> = ({
  children,
  overlayerId,
  HTableComponent,
  imageConfig,
  audioConfig,
  videoConfig,
  PickerComponent,
}) => {
  const imageRef = React.useRef<HTMLInputElement>(null);
  const audioRef = React.useRef<HTMLInputElement>(null);
  const videoRef = React.useRef<HTMLInputElement>(null);
  const promiseRef = React.useRef<any>(null);

  return (
    <SharedProvider
      initialValue={React.useMemo<any>(
        () => ({
          core: {
            html2md: (v: string) => {
              const node = processor.parse(v);
              const ast = processor.runSync(node);
              return ast;
            },
            txt2md: (v: string) => {
              return txtprocessor.parse(v);
            },
            md2txt: (ast: any) => {
              return mdprocessor.stringify(ast);
            },
            overlayerId: overlayerId || 'root',
          },
          indentContainer: {
            indent: 24,
          },
          image: {
            loadingCover:
              'https://zhaji-public.oss-cn-shanghai.aliyuncs.com/mock/lla/loading.png',
            errorCover:
              'https://zhaji-public.oss-cn-shanghai.aliyuncs.com/mock/lla/NotFound.png',
            imgOpen: async () => {
              if (promiseRef.current) promiseRef.current[1]();
              imageRef.current?.click();
              return new Promise<string>((res, rej) => {
                promiseRef.current = [res, rej];
              });
            },
            imgSign: async (id: any) => id,
            imgRemove: async () => {},
            ...imageConfig,
          },
          audio: {
            loadingCover:
              'https://zhaji-public.oss-cn-shanghai.aliyuncs.com/mock/lla/loading.png',
            errorCover:
              'https://zhaji-public.oss-cn-shanghai.aliyuncs.com/mock/lla/NotFound.png',
            audioOpen: async () => {
              if (promiseRef.current) promiseRef.current[1]();
              audioRef.current?.click();
              return new Promise<string>((res, rej) => {
                promiseRef.current = [res, rej];
              });
            },
            audioSign: async (id: any) => id,
            audioRemove: async () => {},
            ...audioConfig,
          },
          video: {
            loadingCover:
              'https://zhaji-public.oss-cn-shanghai.aliyuncs.com/mock/lla/loading.png',
            errorCover:
              'https://zhaji-public.oss-cn-shanghai.aliyuncs.com/mock/lla/NotFound.png',
            videoOpen: async () => {
              if (promiseRef.current) promiseRef.current[1]();
              videoRef.current?.click();
              return new Promise<string>((res, rej) => {
                promiseRef.current = [res, rej];
              });
            },
            videoSign: async (id: any) => id,
            videoRemove: async () => {},
            ...videoConfig,
          },
          table: {
            HTableComponent,
          },
          callout: {
            PickerComponent: PickerComponent ?? DefaultPickerComponent,
          },
        }),
        [
          overlayerId,
          HTableComponent,
          imageConfig,
          audioConfig,
          videoConfig,
          PickerComponent,
        ],
      )}
    >
      {children}
      <input
        type="file"
        className="lla-image-input"
        ref={imageRef}
        value=""
        onChange={async (e) => {
          const file = e.target?.files?.[0];
          if (!file) return;
          promiseRef.current && promiseRef.current[0](file);
        }}
        accept=".jpeg,.jpg,.png"
      />
      <input
        type="file"
        className="lla-audio-input"
        value=""
        ref={audioRef}
        onChange={async (e) => {
          const file = e.target?.files?.[0];
          if (!file) return;
          promiseRef.current && promiseRef.current[0](file);
        }}
        accept=".mp3"
      />
      <input
        type="file"
        className="lla-video-input"
        value=""
        ref={videoRef}
        onChange={async (e) => {
          const file = e.target?.files?.[0];
          if (!file) return;
          promiseRef.current && promiseRef.current[0](file);
        }}
        accept=".mp4"
      />
    </SharedProvider>
  );
};

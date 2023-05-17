import React from 'react';
import { Transforms } from 'slate';
import {
  ElementJSX,
  elementPropsIs,
  ExtendRenderElementProps,
  useThrottle,
  LLAConfig,
  SharedApi,
  ConfigHelers,
  runWithCancel,
  elementRender,
  EmptyMedia,
} from '@lla-editor/core';
import { VideoElement } from './element';
import {
  ReactEditor,
  useReadOnly,
  useSelected,
  useSlateStatic,
} from 'slate-react';

const { useLens } = ConfigHelers as SharedApi<LLAConfig>;

const Resizedvideo: React.FC<
  React.HtmlHTMLAttributes<HTMLDivElement> & {
    src: string | File;
    alt?: string;
    selected?: boolean;
    width: number;
    openContextMenu: (f: () => HTMLElement | null) => void;
    onWidthChange: (v: number) => void;
    onSrcChange: (v: string) => void;
  }
> = ({
  src,
  selected = false,
  width,
  onWidthChange,
  onSrcChange,
  openContextMenu,
  ...others
}) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const [videoRemove] = useLens(['video', 'videoRemove']);
  const triggerRef = React.useRef<HTMLDivElement>(null);
  const [loadingCover] = useLens(['video', 'loadingCover']);
  const [errorCover] = useLens(['video', 'errorCover']);
  const [videoUpload] = useLens(['video', 'videoUpload']);
  const [videoSign] = useLens(['video', 'videoSign']);
  const [videoSrc, setVideoSrc] = React.useState<string | undefined>(
    loadingCover,
  );
  React.useEffect(() => {
    const task = runWithCancel(function* () {
      try {
        // setIsLoading(true);
        if (typeof src !== 'string') {
          const reader = new FileReader();
          new Promise((res) => {
            reader.onload = (event) => {
              if (event.target) return res(event.target.result);
              return res(null);
            };
          }).then((dataURL: any) => {
            dataURL && setVideoSrc(dataURL);
          });
          reader.readAsDataURL(src);
          if (videoUpload) {
            yield new Promise((res) => setTimeout(res, 1000));
            const uploadSrc = yield videoUpload(src);
            onSrcChange(uploadSrc);
          }
        } else {
          if (src === '') return setVideoSrc(errorCover);
          const tmp = yield videoSign(src, { width });
          setVideoSrc(tmp);
        }
      } catch (e) {
        setVideoSrc(errorCover);
      } finally {
        // setIsLoading(false);
      }
    });
    return task.cancel;
  }, [videoSign, videoUpload, src, errorCover, loadingCover]);
  const srcRef = React.useRef<string | File>(src);
  srcRef.current = src;
  React.useEffect((): any => {
    if (ref.current) {
      ref.current.style.cssText = `
      width: ${width}px;
      user-select:none;
    `;
    }
    return () =>
      typeof srcRef.current === 'string' &&
      srcRef.current !== errorCover &&
      srcRef.current !== loadingCover &&
      videoRemove(srcRef.current);
  }, []);
  const [handleWidthChangeDebounce] = useThrottle((v: number) => {
    onWidthChange(v);
  }, 1000 / 30);
  const readOnly = useReadOnly();
  return (
    <div
      className={`lla-context-menu-target lla-video relative ${
        selected ? 'lla-selected' : ''
      }`}
      ref={ref}
      contentEditable={false}
      {...others}
    >
      {videoSrc && renderVideo()}
      {!readOnly && (
        <>
          <div
            className="lla-video__resizer lla-video__resizer--left"
            onMouseDown={handleMouseDown(true)}
            onTouchStart={handleTouchStart(true)}
          >
            <div className="lla-video__resizer__handler"></div>
          </div>
          <div
            className="lla-video__resizer lla-video__resizer--right"
            onMouseDown={handleMouseDown(false)}
            onTouchStart={handleTouchStart(false)}
          >
            <div className="lla-video__resizer__handler"></div>
          </div>
          <div
            ref={triggerRef}
            className="lla-context-menu-trigger "
            onClick={(e) => {
              e.stopPropagation();
              openContextMenu(() => triggerRef.current);
            }}
            onTouchStart={(e) => {
              e.stopPropagation();
              openContextMenu(() => triggerRef.current);
            }}
          >
            ...
          </div>
        </>
      )}
    </div>
  );

  function renderVideo() {
    if (videoSrc === loadingCover)
      return (
        <img
          src={loadingCover}
          className="lla-video__content"
          alt="loading video..."
        />
      );
    if (videoSrc === errorCover)
      return (
        <img
          src={errorCover}
          className="lla-video__content"
          alt=" video loading error"
        />
      );
    return <video src={videoSrc} className="lla-video__content" controls />;
  }

  function handleMouseDown(isLeftHandler: boolean) {
    return (event: React.MouseEvent<HTMLDivElement>) => {
      const srcX = event.pageX;
      if (!ref.current) return;
      const offsetWidth = ref.current.offsetWidth;
      const offsetHeight = ref.current.offsetHeight;
      const changeWidthFunc = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!ref.current) return;
        // const offsetWidth = ref.current.offsetWidth;
        // const offsetWidth = ref.current.offsetWidth;
        // const offsetHeight = ref.current.offsetHeight;
        const k = 1;
        const diffX = isLeftHandler
          ? Math.round(e.pageX - srcX)
          : Math.round(srcX - e.pageX);
        // srcX = e.pageX;
        const width = getProperlyWidth(offsetWidth - diffX * k);
        ref.current.style.cssText = `
          width: ${width}px;
          height: ${offsetHeight}px;
          user-select:none;
        `;
        // api.start({ width });
        handleWidthChangeDebounce(width);
      };
      document.addEventListener('mousemove', changeWidthFunc as any);
      document.addEventListener('mouseup', () =>
        document.removeEventListener('mousemove', changeWidthFunc as any),
      );
    };
  }

  function handleTouchStart(isLeftHandler: boolean) {
    return (event: React.TouchEvent<HTMLDivElement>) => {
      const srcX = event.touches[0].pageX;
      if (!ref.current) return;
      const offsetWidth = ref.current.offsetWidth;
      const offsetHeight = ref.current.offsetHeight;
      const changeWidthFunc = (e: React.TouchEvent<HTMLDivElement>) => {
        if (!ref.current) return;
        const pageX = e.touches[0].pageX;
        // const offsetWidth = ref.current.offsetWidth;
        // const offsetHeight = ref.current.offsetHeight;
        const k = 1;
        const diffX = isLeftHandler
          ? Math.round(pageX - srcX)
          : Math.round(srcX - pageX);
        const width = getProperlyWidth(offsetWidth - diffX * k);
        ref.current.style.cssText = `
          width: ${width}px;
          height: ${offsetHeight}px;
          user-select:none;
        `;
        // console.log(width);
        // api.start({ width });
        handleWidthChangeDebounce(width);
      };
      document.addEventListener('touchmove', changeWidthFunc as any);
      document.addEventListener('touchend', () =>
        document.removeEventListener('touchmove', changeWidthFunc as any),
      );
    };
  }

  function getProperlyWidth(v: number) {
    if (v < 0) return 0;
    if (v > 1200) return 1200;
    return v;
  }
};

// const Loadingvideo: React.FC<{
//   src: string;
//   alt?: string;
//   className?: string;
// }> = ({ src, alt, className }) => {
//   const [loadingCover] = useLens(['video', 'loadingCover']);
//   const [errorCover] = useLens(['video', 'errorCover']);
//   const [videoSign] = useLens(['video', 'videoSign']);
//   const [videoSrc, setVideoSrc] = React.useState(loadingCover);
//   // const [loading, setIsLoading] = React.useState(false);

//   // React.useEffect(() => {
//   //   const task = runWithCancel(function* () {
//   //     try {
//   //       // setIsLoading(true);
//   //       const video = new video();
//   //       const tmp = yield imgSign(src);
//   //       video.src = tmp;
//   //       yield new Promise((res) => {
//   //         video.onload = res;
//   //       });
//   //       setImgSrc(tmp);
//   //     } catch (e) {
//   //       setImgSrc(errorCover);
//   //     } finally {
//   //       // setIsLoading(false);
//   //     }
//   //   });
//   //   return task.cancel;
//   // }, [imgSign, src, errorCover]);
//   return null;
//   // return <img src={imgSrc} alt={alt} className={className} />;
// };

const VideoComponent = ({
  attributes,
  children,
  element,
}: ExtendRenderElementProps<VideoElement>) => {
  const { src, width } = element;
  const selected = useSelected();
  const editor = useSlateStatic();
  const [videoOpen] = useLens(['video', 'videoOpen']);
  const readOnly = useReadOnly();
  return (
    <div className="lla-video-wrapper" {...attributes}>
      {(readOnly || src) && (
        <Resizedvideo
          src={src || ''}
          selected={selected}
          width={width}
          onSrcChange={handleMetaChange('src')}
          onWidthChange={handleMetaChange('width')}
          openContextMenu={openContenxtMenu}
          // onMouseOver={() =>
          //   console.log(ReactEditor.toDOMNode(editor, element))
          // }
        ></Resizedvideo>
      )}
      {!src && !readOnly && (
        <EmptyMedia
          onSrcChange={handleMetaChange('src')}
          selected={selected}
          openContextMenu={openContenxtMenu}
          resourceType={'video'}
          resourceIcon={
            <svg viewBox="0 0 30 30" className="lla-media__icon">
              <path d="M2,2v26h26V2H2z M26,6h-2V4h2V6z M22,14H8V4h14V14z M6,10H4V8h2V10z M6,12v2H4v-2H6z M6,16v2H4v-2H6z M6,20v2H4v-2H6z M8,16 h14v10H8V16z M24,20h2v2h-2V20z M24,18v-2h2v2H24z M24,14v-2h2v2H24z M24,10V8h2v2H24z M6,4v2H4V4H6z M4,24h2v2H4V24z M24,26v-2h2v2 H24z"></path>
            </svg>
          }
          localFileOpen={async () => {
            try {
              const src = await videoOpen();
              // console.log(src);
              handleMetaChange('src')(src);
            } catch (e) {
              console.error(e);
            }
          }}
          // onMouseOver={() =>
          //   console.log(ReactEditor.toDOMNode(editor, element))
          // }
        ></EmptyMedia>
      )}
      {children}
    </div>
  );

  function handleMetaChange<K extends keyof VideoElement>(meta: K) {
    return (v: VideoElement[K]) => {
      const path = ReactEditor.findPath(editor, element);
      return Transforms.setNodes(editor, { [meta]: v }, { at: path });
    };
  }

  function openContenxtMenu(targetGet: () => HTMLElement | null) {
    const contextMenu = editor.getOvlerLayer('contextMenu');
    if (contextMenu) {
      contextMenu.open({
        path: ReactEditor.findPath(editor, element),
        element,
        targetGet,
      });
    }
  }
};

export default [
  [elementPropsIs(VideoElement.is), elementRender(VideoComponent)],
] as ElementJSX<VideoElement>;

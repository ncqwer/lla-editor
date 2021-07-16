import React, { MouseEvent } from 'react';
import { createPortal } from 'react-dom';
import domAlign from 'dom-align';
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
  Func,
  elementRender,
  LLAOverLayer,
} from '@lla-editor/core';
import { useSpring, animated } from 'react-spring';
import { AudioElement } from './element';
import {
  ReactEditor,
  useReadOnly,
  useSelected,
  useSlateStatic,
} from 'slate-react';
import Slider from 'rc-slider';

const { useLens } = ConfigHelers as SharedApi<LLAConfig>;

const alignOpt = {
  points: ['bc', 'tc'],
};

const Audio: React.FC<{
  src: string | File;
  selected?: boolean;
  openContextMenu: (f: () => HTMLElement | null) => void;
}> = ({ src, selected = false, openContextMenu }) => {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const ref = React.useRef<HTMLAudioElement>(null);
  const [progress, setProgress] = React.useState(0);
  const [duration, setDuration] = React.useState(0);
  const [title, setTitle] = React.useState('');
  const [volumn, setVolumn] = React.useState(1);
  const [isOpen, setIsOpen] = React.useState(false);
  const volumnRef = React.useRef<HTMLDivElement>(null);
  const [audioRemove] = useLens(['audio', 'audioRemove']);
  const [loadingCover] = useLens(['audio', 'loadingCover']);
  const [errorCover] = useLens(['audio', 'errorCover']);
  const [audioUpload] = useLens(['audio', 'audioUpload']);
  const [audioSign] = useLens(['audio', 'audioSign']);
  const readOnly = useReadOnly();
  const [audioSrc, setAudioSrc] = React.useState<string | undefined>(
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
          }).then((dataURL: any) => dataURL && setAudioSrc(dataURL));
          reader.readAsDataURL(src);
          if (audioUpload) {
            yield new Promise((res) => setTimeout(res, 1000));
            const uploadSrc = yield audioUpload(src);
            setAudioSrc(uploadSrc);
          }
        } else {
          const tmp = yield audioSign(src);
          setAudioSrc(tmp);
        }
      } catch (e) {
        setAudioSrc(errorCover);
      } finally {
        // setIsLoading(false);
      }
    });
    return task.cancel;
  }, [audioSign, audioUpload, src, errorCover, loadingCover]);
  React.useEffect(() => {
    return () => {
      if (typeof src === 'string') audioRemove(src);
    };
  }, []);
  const triggerRef = React.useRef<HTMLDivElement>(null);
  return (
    <>
      <div
        className={`lla-context-menu-target lla-audio ${
          selected ? 'lla-selected' : ''
        }`}
        contentEditable={false}
      >
        {!readOnly && (
          <div
            ref={triggerRef}
            className="lla-context-menu-trigger "
            onClick={(e) => {
              e.stopPropagation();
              openContextMenu(() => triggerRef.current);
            }}
          >
            ...
          </div>
        )}
        {audioSrc && (
          <audio
            className="lla-audio__instance"
            src={audioSrc}
            ref={ref}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onVolumeChange={() => {
              setVolumn(
                Math.floor(parseFloat((ref.current?.volume as any) || 0) * 100),
              );
            }}
            onLoadedData={() => {
              setDuration(parseInt((ref.current?.duration as any) || 0, 10));
            }}
            onTimeUpdate={() =>
              setProgress(parseInt((ref.current?.currentTime as any) || 0, 10))
            }
          ></audio>
        )}
        <div
          className={`lla-audio__controller ${
            isPlaying
              ? 'lla-audio__controller--pause'
              : 'lla-audio__controller--play'
          }`}
          onClick={() => {
            if (ref.current) {
              if (isPlaying) {
                ref.current.pause();
              } else {
                ref.current.play();
              }
            }
          }}
        >
          {isPlaying ? (
            <svg viewBox="0 0 20 20">
              <path d="M5 4h3v12H5V4zm7 0h3v12h-3V4z"></path>
            </svg>
          ) : (
            <svg viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"></path>
              <path d="M0 0h24v24H0z" fill="none"></path>
            </svg>
          )}
        </div>
        <div className="flex-grow mr-6 ml-6">
          <div className="lla-audio__info flex justify-between">
            <input
              readOnly={readOnly}
              type="text"
              className={`lla-audio__title`}
              contentEditable={true}
              placeholder={readOnly ? '音乐载入出错' : '请输入音频名称'}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <div className="lla-audio__time">
              {getHumanReadableText(progress, true)} /
              {getHumanReadableText(duration, true)}
            </div>
          </div>
          <Slider
            min={0}
            max={duration}
            value={progress}
            className="lla-audio__progress-bar"
            onChange={(v) => {
              setProgress(v);
              if (ref.current) ref.current.currentTime = v;
            }}
          ></Slider>
        </div>
        <div
          ref={volumnRef}
          onMouseOver={() => setIsOpen(true)}
          className={`lla-audio__controller `}
        >
          <svg viewBox="0 0 24 24">
            <path d="M7 9v6h4l5 5V4l-5 5H7z"></path>
            <path d="M0 0h24v24H0z" fill="none"></path>
          </svg>
        </div>
      </div>
      {isOpen && !readOnly && (
        <LLAOverLayer
          onClose={() => setIsOpen(false)}
          targetGet={() => volumnRef.current}
          alignOpts={alignOpt}
        >
          <div className="lla-audio__volumn-bar-wrapper p-4 shadow-md">
            <Slider
              vertical
              min={0}
              max={100}
              value={volumn}
              className="lla-audio__volumn-bar"
              onChange={(v) => {
                setVolumn(v);
                if (ref.current) ref.current.volume = v / 100;
              }}
            ></Slider>
          </div>
        </LLAOverLayer>
      )}
    </>
  );
};

function getHumanReadableText(seconds: number, isShort = false): string {
  if (isShort) return new Date(seconds * 1000).toISOString().substr(14, 5);
  return new Date(seconds * 1000).toISOString().substr(11, 8);
}

// const ResizedImage: React.FC<
//   React.HtmlHTMLAttributes<HTMLDivElement> & {
//     src: string;
//     alt?: string;
//     selected?: boolean;
//     width: number;
//     openContextMenu: (f: () => HTMLElement | null) => void;
//     onWidthChange: (v: number) => void;
//   }
// > = ({
//   src,
//   alt,
//   selected = false,
//   width,
//   onWidthChange,
//   openContextMenu,
//   ...others
// }) => {
//   const ref = React.useRef<HTMLDivElement>(null);
//   const [imgRemove] = useLens(['auido', 'audioRemove']);
//   const [styles, api] = useSpring(() => ({ width }));
//   const triggerRef = React.useRef<HTMLDivElement>(null);
//   React.useEffect((): any => {
//     if (ref.current) {
//       ref.current.style.cssText = `
//       width: ${width}px;
//       user-select:none;
//     `;
//     }
//     return () => imgRemove(src);
//   }, []);
//   const [handleWidthChangeDebounce] = useThrottle((f: Func, v: number) => {
//     onWidthChange(v);
//     f();
//   }, 1000 / 30);
//   return (
//     <animated.div
//       style={styles}
//       className={`lla-context-menu-target lla-image relative ${
//         selected ? 'lla-selected' : ''
//       }`}
//       ref={ref}
//       contentEditable={false}
//       {...others}
//     >
//       <LoadingImage src={src} alt={alt} className="lla-image__content" />
//       <div
//         className="lla-image__resizer lla-image__resizer--left"
//         onMouseDown={handleMouseDown(true)}
//         onTouchStart={handleTouchStart(true)}
//       >
//         <div className="lla-image__resizer__handler"></div>
//       </div>
//       <div
//         className="lla-image__resizer lla-image__resizer--right"
//         onMouseDown={handleMouseDown(false)}
//         onTouchStart={handleTouchStart(false)}
//       >
//         <div className="lla-image__resizer__handler"></div>
//       </div>
//       <div
//         ref={triggerRef}
//         className="lla-context-menu-trigger "
//         onClick={(e) => {
//           e.stopPropagation();
//           openContextMenu(() => triggerRef.current);
//         }}
//       >
//         ...
//       </div>
//     </animated.div>
//   );

//   function handleMouseDown(isLeftHandler: boolean) {
//     return (event: React.MouseEvent<HTMLDivElement>) => {
//       let srcX = event.pageX;
//       const changeWidthFunc = (e: React.MouseEvent<HTMLDivElement>) => {
//         if (!ref.current) return;
//         const offsetWidth = ref.current.offsetWidth;
//         const k = 1;
//         const diffX = isLeftHandler ? e.pageX - srcX : srcX - e.pageX;
//         const width = getProperlyWidth(offsetWidth - diffX * k);
//         //   ref.current.style.cssText = `
//         //   width: ${width}px;
//         //   user-select:none;
//         // `;
//         // console.log(width);
//         api.start({ width });
//         handleWidthChangeDebounce(() => (srcX = e.pageX), width);
//       };
//       document.addEventListener('mousemove', changeWidthFunc as any);
//       document.addEventListener('mouseup', () =>
//         document.removeEventListener('mousemove', changeWidthFunc as any),
//       );
//     };
//   }

//   function handleTouchStart(isLeftHandler: boolean) {
//     return (event: React.TouchEvent<HTMLDivElement>) => {
//       let srcX = event.touches[0].pageX;
//       const changeWidthFunc = (e: React.TouchEvent<HTMLDivElement>) => {
//         if (!ref.current) return;
//         const pageX = e.touches[0].pageX;
//         const offsetWidth = ref.current.offsetWidth;
//         const k = 1;
//         const diffX = isLeftHandler ? pageX - srcX : srcX - pageX;
//         const width = getProperlyWidth(offsetWidth - diffX * k);
//         //   ref.current.style.cssText = `
//         //   width: ${width}px;
//         //   user-select:none;
//         // `;
//         // console.log(width);
//         api.start({ width });
//         handleWidthChangeDebounce(() => (srcX = pageX), width);
//       };
//       document.addEventListener('touchmove', changeWidthFunc as any);
//       document.addEventListener('touchend', () =>
//         document.removeEventListener('touchmove', changeWidthFunc as any),
//       );
//     };
//   }

//   function getProperlyWidth(v: number) {
//     if (v < 0) return 0;
//     if (v > 1200) return 1200;
//     return v;
//   }
// };

// const LoadingImage: React.FC<{
//   src: string;
//   alt?: string;
//   className?: string;
// }> = ({ src, alt, className }) => {
//   const [loadingCover] = useLens(['image', 'loadingCover']);
//   const [errorCover] = useLens(['image', 'errorCover']);
//   const [imgSign] = useLens(['image', 'imgSign']);
//   const [imgSrc, setImgSrc] = React.useState(loadingCover);
//   // const [loading, setIsLoading] = React.useState(false);

//   React.useEffect(() => {
//     const task = runWithCancel(function* () {
//       try {
//         // setIsLoading(true);
//         const image = new Image();
//         const tmp = yield imgSign(src);
//         image.src = tmp;
//         yield new Promise((res) => {
//           image.onload = res;
//         });
//         setImgSrc(tmp);
//       } catch (e) {
//         setImgSrc(errorCover);
//       } finally {
//         // setIsLoading(false);
//       }
//     });
//     return task.cancel;
//   }, [imgSign, src, errorCover]);

//   return <img src={imgSrc} alt={alt} className={className} />;
// };

const MenuItem: React.FC<{
  value: string;
  label: string;
  active: boolean;
  onAcitve: (v: string) => void;
}> = ({ value, label, active, onAcitve }) => {
  return (
    <div className="lla-media__popmenu__item" onClick={() => onAcitve(value)}>
      <div className="lla-media__popmenu__item__label">{label}</div>
      {active && (
        <div className="lla-media__popmenu__active-item-indicator "></div>
      )}
    </div>
  );
};

const alignOpts = { points: ['tc', 'bc'] };

const EmptyMediaMenu: React.FC<{
  onChange: (v: string) => void;
  onClose: () => void;
  targetGet: () => HTMLElement | null;
  localFileOpen: () => Promise<void>;
}> = ({ onClose, onChange, targetGet, localFileOpen }) => {
  const [embedSrc, setEmbedSrc] = React.useState<string>('');

  const [activeItem, setActiveItem] = React.useState('upload');
  return (
    <LLAOverLayer onClose={onClose} targetGet={targetGet} alignOpts={alignOpts}>
      <div
        className={`lla-media__popmenu`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="lla-media__popmenu__item-group ">
          <MenuItem
            value="upload"
            label="本地音频"
            onAcitve={setActiveItem}
            active={activeItem === 'upload'}
          ></MenuItem>
          <MenuItem
            value="embed"
            label="在线音频"
            onAcitve={setActiveItem}
            active={activeItem === 'embed'}
          ></MenuItem>
        </div>
        <div
          className={`lla-media__popmenu__content lla-media__popmenu__content--${activeItem}`}
        >
          {activeItem === 'upload' && renderUpload()}
          {activeItem === 'embed' && renderEmbed()}
        </div>
      </div>
    </LLAOverLayer>
  );

  function renderUpload() {
    return (
      <>
        <div className="lla-media__open" onClick={localFileOpen}>
          选择文件
        </div>
        <div className="lla-media__open-helper-message">{`音频不能超过5MB`}</div>
      </>
    );
  }

  function renderEmbed() {
    return (
      <>
        <div className="contents relative">
          <input
            autoFocus
            value={embedSrc}
            type="text"
            className="lla-media__embed-input"
            placeholder="添加音频链接"
            onChange={(e) => setEmbedSrc(e.target.value)}
          />
          {embedSrc && (
            <div
              className="lla-media__embed-input__clear"
              onClick={() => setEmbedSrc('')}
            >
              <svg viewBox="0 0 30 30">
                <path d="M15,0C6.716,0,0,6.716,0,15s6.716,15,15,15s15-6.716,15-15S23.284,0,15,0z M22,20.6L20.6,22L15,16.4L9.4,22L8,20.6l5.6-5.6 L8,9.4L9.4,8l5.6,5.6L20.6,8L22,9.4L16.4,15L22,20.6z"></path>
              </svg>
            </div>
          )}
        </div>
        <div
          className="lla-media__embed-submit"
          onClick={() => embedSrc && onChange(embedSrc)}
        >
          添加音频
        </div>
        <div className="lla-media__embed-helper-message">支持任意外链音频</div>
      </>
    );
  }
};

const EmptyAudio: React.FC<
  React.HtmlHTMLAttributes<HTMLDivElement> & {
    onSrcChange: (v: string) => void;
    localFileOpen: () => Promise<void>;
    selected?: boolean;
    openContextMenu: (f: () => HTMLElement | null) => void;
  }
> = ({
  onSrcChange,
  selected = false,
  openContextMenu,
  localFileOpen,
  ...others
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLDivElement>(null);
  return (
    <>
      <div
        className={`lla-context-menu-target lla-media lla-media--empty ${
          selected ? 'lla-selected' : ''
        }`}
        ref={ref}
        onClick={() => setIsOpen(true)}
        contentEditable={false}
        {...others}
      >
        <svg viewBox="0 0 26 23" className="lla-media__icon">
          <path d="M0 6.06667V16.4667H5.2L12.1333 22.5333V0L5.2 6.06667H0ZM4.33333 14.7333H1.73333V7.8H4.33333V14.7333ZM6.06667 7.61193L10.4 3.8194V18.7139L6.06667 14.9214V7.61193ZM19.0667 11.2667C19.0667 8.84433 17.6445 6.76087 15.5931 5.78847L14.586 7.24447C16.1928 7.87627 17.3333 9.43453 17.3333 11.2684C17.3333 13.1023 16.1928 14.6588 14.586 15.2923L15.5931 16.7483C17.6445 15.7725 19.0667 13.689 19.0667 11.2667ZM19.5607 0.0563333L18.5718 1.48287C21.9709 3.42247 24.2658 7.07373 24.2658 11.2667C24.2658 15.4596 21.9709 19.1109 18.5727 21.0505L19.5615 22.477C23.4087 20.2193 26 16.0507 26 11.2667C26 6.48267 23.4087 2.314 19.5607 0.0563333ZM22.5333 11.2667C22.5333 7.6648 20.5339 4.53093 17.5855 2.9094L16.5915 4.34547C19.0918 5.64547 20.8 8.25413 20.8 11.2649C20.8 14.2757 19.0901 16.8844 16.5915 18.1844L17.5855 19.6205C20.5339 18.0015 22.5333 14.8685 22.5333 11.2667Z"></path>
        </svg>

        <div className="lla-media__placeholder">添加音频</div>
        <div
          ref={triggerRef}
          className="lla-context-menu-trigger"
          onClick={(e) => {
            e.stopPropagation();
            openContextMenu(() => triggerRef.current);
          }}
        >
          ...
        </div>
      </div>
      {isOpen && (
        <EmptyMediaMenu
          onClose={() => setIsOpen(false)}
          onChange={onSrcChange}
          targetGet={() => ref.current}
          localFileOpen={localFileOpen}
        ></EmptyMediaMenu>
      )}
    </>
  );
};

const AudioComponent = ({
  attributes,
  children,
  element,
}: ExtendRenderElementProps<AudioElement>) => {
  const { src } = element;
  const selected = useSelected();
  const editor = useSlateStatic();
  const [audioOpen] = useLens(['audio', 'audioOpen']);
  const readOnly = useReadOnly();
  return (
    <div className="lla-audio-wrapper" {...attributes}>
      {(src || readOnly) && (
        <Audio
          src={src || ''}
          selected={selected}
          openContextMenu={openContenxtMenu}
          // onMouseOver={() =>
          //   console.log(ReactEditor.toDOMNode(editor, element))
          // }
        ></Audio>
      )}
      {!src && !readOnly && (
        <EmptyAudio
          onSrcChange={handleMetaChange('src')}
          selected={selected}
          openContextMenu={openContenxtMenu}
          localFileOpen={async () => {
            try {
              const src = await audioOpen();
              // console.log(src);
              handleMetaChange('src')(src);
            } catch (e) {}
          }}
          // onMouseOver={() =>
          //   console.log(ReactEditor.toDOMNode(editor, element))
          // }
        ></EmptyAudio>
      )}
      {children}
    </div>
  );

  function handleMetaChange<K extends keyof AudioElement>(meta: K) {
    return (v: AudioElement[K]) => {
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
  [elementPropsIs(AudioElement.is), elementRender(AudioComponent)],
] as ElementJSX<AudioElement>;

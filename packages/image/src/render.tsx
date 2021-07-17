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
} from '@lla-editor/core';
import { useSpring, animated } from 'react-spring';
import { ImageElement } from './element';
import {
  ReactEditor,
  useReadOnly,
  useSelected,
  useSlateStatic,
} from 'slate-react';

const { useLens } = ConfigHelers as SharedApi<LLAConfig>;

const ResizedImage: React.FC<
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
  alt,
  selected = false,
  width,
  onWidthChange,
  openContextMenu,
  onSrcChange,
  ...others
}) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const [imgRemove] = useLens(['image', 'imgRemove']);
  const [loadingCover] = useLens(['image', 'loadingCover']);
  const [errorCover] = useLens(['image', 'errorCover']);
  const [styles, api] = useSpring(() => ({ width }));
  const triggerRef = React.useRef<HTMLDivElement>(null);
  const readonly = useReadOnly();
  const srcRef = React.useRef<string | File>(src);
  srcRef.current = src;
  React.useEffect((): any => {
    if (ref.current) {
      ref.current.style.cssText = `
      width: ${width}px;
      user-select:none;
    `;
    }
    return () => {
      typeof srcRef.current === 'string' &&
        srcRef.current !== errorCover &&
        srcRef.current !== loadingCover &&
        imgRemove(srcRef.current);
    };
  }, []);
  const [handleWidthChangeDebounce] = useThrottle((f: Func, v: number) => {
    onWidthChange(v);
    f();
  }, 1000 / 30);
  return (
    <animated.div
      style={styles}
      className={`lla-context-menu-target lla-image relative ${
        selected ? 'lla-selected' : ''
      }`}
      ref={ref}
      contentEditable={false}
      {...others}
    >
      <LoadingImage
        src={src}
        alt={alt}
        className="lla-image__content"
        onSrcChange={onSrcChange}
      />
      {!readonly && (
        <>
          <div
            className="lla-image__resizer lla-image__resizer--left"
            onMouseDown={handleMouseDown(true)}
            onTouchStart={handleTouchStart(true)}
          >
            <div className="lla-image__resizer__handler"></div>
          </div>
          <div
            className="lla-image__resizer lla-image__resizer--right"
            onMouseDown={handleMouseDown(false)}
            onTouchStart={handleTouchStart(false)}
          >
            <div className="lla-image__resizer__handler"></div>
          </div>
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
        </>
      )}
    </animated.div>
  );

  function handleMouseDown(isLeftHandler: boolean) {
    return (event: React.MouseEvent<HTMLDivElement>) => {
      let srcX = event.pageX;
      const changeWidthFunc = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!ref.current) return;
        const offsetWidth = ref.current.offsetWidth;
        const k = 1;
        const diffX = isLeftHandler ? e.pageX - srcX : srcX - e.pageX;
        const width = getProperlyWidth(offsetWidth - diffX * k);
        //   ref.current.style.cssText = `
        //   width: ${width}px;
        //   user-select:none;
        // `;
        // console.log(width);
        api.start({ width });
        handleWidthChangeDebounce(() => (srcX = e.pageX), width);
      };
      document.addEventListener('mousemove', changeWidthFunc as any);
      document.addEventListener('mouseup', () =>
        document.removeEventListener('mousemove', changeWidthFunc as any),
      );
    };
  }

  function handleTouchStart(isLeftHandler: boolean) {
    return (event: React.TouchEvent<HTMLDivElement>) => {
      let srcX = event.touches[0].pageX;
      const changeWidthFunc = (e: React.TouchEvent<HTMLDivElement>) => {
        if (!ref.current) return;
        const pageX = e.touches[0].pageX;
        const offsetWidth = ref.current.offsetWidth;
        const k = 1;
        const diffX = isLeftHandler ? pageX - srcX : srcX - pageX;
        const width = getProperlyWidth(offsetWidth - diffX * k);
        //   ref.current.style.cssText = `
        //   width: ${width}px;
        //   user-select:none;
        // `;
        // console.log(width);
        api.start({ width });
        handleWidthChangeDebounce(() => (srcX = pageX), width);
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

const LoadingImage: React.FC<{
  src: string | File;
  alt?: string;
  className?: string;
  onSrcChange: (v: string) => void;
}> = ({ src, alt, className, onSrcChange }) => {
  const [loadingCover] = useLens(['image', 'loadingCover']);
  const [errorCover] = useLens(['image', 'errorCover']);
  const [imgSign] = useLens(['image', 'imgSign']);
  const [imgUpload] = useLens(['image', 'imgUpload']);
  const [imgSrc, setImgSrc] = React.useState(loadingCover);
  // const [loading, setIsLoading] = React.useState(false);
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
          }).then((dataURL: any) => dataURL && setImgSrc(dataURL));
          reader.readAsDataURL(src);
          if (imgUpload) {
            yield new Promise((res) => setTimeout(res, 1000));
            const uploadSrc = yield imgUpload(src);
            onSrcChange(uploadSrc);
          }
        } else {
          if (src === '') return setImgSrc(errorCover);
          const image = new Image();
          const tmp = yield imgSign(src);
          image.src = tmp;
          yield new Promise((res) => {
            image.onload = res;
          }).catch(() => setImgSrc(errorCover));
          setImgSrc(tmp);
        }
      } catch (e) {
        setImgSrc(errorCover);
      } finally {
        // setIsLoading(false);
      }
    });
    return task.cancel;
  }, [imgSign, imgUpload, src, errorCover, loadingCover]);

  return <img src={imgSrc} alt={alt} className={className} />;
};

const MenuItem: React.FC<{
  value: string;
  label: string;
  active: boolean;
  onAcitve: (v: string) => void;
}> = ({ value, label, active, onAcitve }) => {
  return (
    <div className="lla-image__popmenu__item" onClick={() => onAcitve(value)}>
      <div className="lla-image__popmenu__item__label">{label}</div>
      {active && (
        <div className="lla-image__popmenu__active-item-indicator "></div>
      )}
    </div>
  );
};

const EmptyImageMenu: React.FC<{
  onChange: (v: string | File) => void;
  onClose: () => void;
  alignMethod: (el: HTMLDivElement) => void;
}> = ({ alignMethod, onClose, onChange }) => {
  const ref = React.useRef<HTMLDivElement>(null);

  const [overLayerId] = useLens(['core', 'overlayerId']);
  const root = React.useMemo(() => document.getElementById(overLayerId), []);
  const [visible, setVisible] = React.useState(false);
  const [embedSrc, setEmbedSrc] = React.useState<string>('');
  const [imgOpen] = useLens(['image', 'imgOpen']);
  React.useEffect(() => {
    if (ref.current) alignMethod(ref.current);
    setVisible(true);
  }, []);
  const [activeItem, setActiveItem] = React.useState('upload');
  return createPortal(
    <div
      className="lla-overlay w-screen h-screen z-50 bg-transparent fixed top-0 left-0"
      onClick={() => onClose()}
    >
      <div
        ref={ref}
        className={`lla-image__popmenu ${visible ? 'visible' : 'invisible'}`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="lla-image__popmenu__item-group ">
          <MenuItem
            value="upload"
            label="本地图片"
            onAcitve={setActiveItem}
            active={activeItem === 'upload'}
          ></MenuItem>
          <MenuItem
            value="embed"
            label="在线图片"
            onAcitve={setActiveItem}
            active={activeItem === 'embed'}
          ></MenuItem>
        </div>
        <div
          className={`lla-image__popmenu__content lla-image__popmenu__content--${activeItem}`}
        >
          {activeItem === 'upload' && renderUpload()}
          {activeItem === 'embed' && renderEmbed()}
        </div>
      </div>
    </div>,
    root as any,
  );

  function renderUpload() {
    return (
      <>
        <div
          className="lla-image__open"
          onClick={async () => {
            try {
              const src = await imgOpen();
              onChange(src);
            } catch (e) {
              // do nothing
            }
          }}
        >
          选择文件
        </div>
        <div className="lla-image__open-helper-message">{`图片不能超过5MB`}</div>
        {/* <input
          type="file"
          className="hidden"
          ref={inputRef}
          onChange={async (e) => {
            const file = e.target?.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            const dataURL: string | null = await new Promise((res) => {
              reader.onload = (event) => {
                if (event.target) return res(event.target.result as string);
                return res(null);
              };
              reader.readAsDataURL(file);
            });
            dataURL && onChange(dataURL);
          }}
          accept=".jpeg,.jpg,.png"
        /> */}
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
            className="lla-image__embed-input"
            placeholder="添加图片链接"
            onChange={(e) => setEmbedSrc(e.target.value)}
          />
          {embedSrc && (
            <div
              className="lla-image__embed-input__clear"
              onClick={() => setEmbedSrc('')}
            >
              <svg viewBox="0 0 30 30">
                <path d="M15,0C6.716,0,0,6.716,0,15s6.716,15,15,15s15-6.716,15-15S23.284,0,15,0z M22,20.6L20.6,22L15,16.4L9.4,22L8,20.6l5.6-5.6 L8,9.4L9.4,8l5.6,5.6L20.6,8L22,9.4L16.4,15L22,20.6z"></path>
              </svg>
            </div>
          )}
        </div>
        <div
          className="lla-image__embed-submit"
          onClick={() => embedSrc && onChange(embedSrc)}
        >
          添加图片
        </div>
        <div className="lla-image__embed-helper-message">支持任意外链图片</div>
      </>
    );
  }
};

const EmptyImage: React.FC<
  React.HtmlHTMLAttributes<HTMLDivElement> & {
    onSrcChange: (v: string | File) => void;
    selected?: boolean;
    openContextMenu: (f: () => HTMLElement | null) => void;
  }
> = ({ onSrcChange, selected = false, openContextMenu, ...others }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  const triggerRef = React.useRef<HTMLDivElement>(null);
  return (
    <>
      <div
        className={`lla-context-menu-target lla-image lla-image--empty ${
          selected ? 'lla-selected' : ''
        }`}
        ref={ref}
        onClick={() => setIsOpen(true)}
        contentEditable={false}
        {...others}
      >
        <svg viewBox="0 0 30 30" className="lla-image__icon">
          <path d="M1,4v22h28V4H1z M27,24H3V6h24V24z M18,10l-5,6l-2-2l-6,8h20L18,10z M11.216,17.045l1.918,1.918l4.576-5.491L21.518,20H9 L11.216,17.045z M7,12c1.104,0,2-0.896,2-2S8.104,8,7,8s-2,0.896-2,2S5.896,12,7,12z"></path>
        </svg>

        <div className="lla-image__placeholder">添加图片</div>
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
        <EmptyImageMenu
          onClose={() => setIsOpen(false)}
          alignMethod={handleAlign}
          onChange={onSrcChange}
        ></EmptyImageMenu>
      )}
    </>
  );

  function handleAlign(source: HTMLDivElement) {
    if (ref.current) domAlign(source, ref.current, { points: ['tc', 'bc'] });
  }
};

const ImageComponent = ({
  attributes,
  children,
  element,
}: ExtendRenderElementProps<ImageElement>) => {
  const { src, alt, width } = element;
  const selected = useSelected();
  const editor = useSlateStatic();
  const readonly = useReadOnly();
  return (
    <div className="lla-image-wrapper" {...attributes}>
      {(src || readonly) && (
        <ResizedImage
          src={src || ''}
          alt={alt}
          selected={selected}
          onSrcChange={handleMetaChange('src')}
          width={width}
          onWidthChange={handleMetaChange('width')}
          openContextMenu={openContenxtMenu}
          // onMouseOver={() =>
          //   console.log(ReactEditor.toDOMNode(editor, element))
          // }
        ></ResizedImage>
      )}
      {!src && !readonly && (
        <EmptyImage
          onSrcChange={handleMetaChange('src')}
          selected={selected}
          openContextMenu={openContenxtMenu}
          // onMouseOver={() =>
          //   console.log(ReactEditor.toDOMNode(editor, element))
          // }
        ></EmptyImage>
      )}
      {children}
    </div>
  );

  function handleMetaChange<K extends keyof ImageElement>(meta: K) {
    return (v: ImageElement[K]) => {
      if (readonly) return;
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
  [elementPropsIs(ImageElement.is), elementRender(ImageComponent)],
] as ElementJSX<ImageElement>;

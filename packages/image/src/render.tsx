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
  LLAOverLayer,
} from '@lla-editor/core';

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
    height: number;
    openContextMenu: (f: () => HTMLElement | null) => void;
    onWidthChange: (v: number) => void;
    onHeightChange: (v: number) => void;
    onSrcChange: (v: string) => void;
  }
> = ({
  src,
  alt,
  selected = false,
  width,
  height = 300,
  onWidthChange,
  onHeightChange,
  openContextMenu,
  onSrcChange,
  ...others
}) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const [imgRemove] = useLens(['image', 'imgRemove']);
  const [loadingCover] = useLens(['image', 'loadingCover']);
  const [errorCover] = useLens(['image', 'errorCover']);
  // const [styles, api] = useSpring(() => ({ width, height }));
  const triggerRef = React.useRef<HTMLDivElement>(null);
  const readonly = useReadOnly();
  const imgRef = React.useRef<HTMLImageElement>(null);
  const srcRef = React.useRef<string | File>(src);
  srcRef.current = src;
  React.useEffect((): any => {
    if (ref.current) {
      ref.current.style.cssText = `
      width: ${width}px;
      height: ${height}px;
      user-select:none;
      max-height: fit-content;
    `;
    }
    return () => {
      typeof srcRef.current === 'string' &&
        srcRef.current !== errorCover &&
        srcRef.current !== loadingCover &&
        imgRemove(srcRef.current);
    };
  }, []);
  const [handleWidthChangeDebounce] = useThrottle((v: number) => {
    onWidthChange(v);
  }, 1000 / 60);
  const [handleHeightChangeDebounce] = useThrottle((v: number) => {
    onHeightChange(v);
  }, 1000 / 60);
  return (
    <div
      // style={styles}
      className={`lla-context-menu-target lla-image relative ${
        selected ? 'lla-selected' : ''
      }`}
      ref={ref}
      contentEditable={false}
      {...others}
    >
      <LoadingImage
        width={width}
        height={height}
        ref={imgRef}
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
            className="lla-image__resizer--bottom"
            onMouseDown={handleMouseDown__bottom(false)}
            onTouchStart={handleTouchStart__bottom(false)}
          >
            <div className="lla-image__resizer__handler--bottom"></div>
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
    </div>
  );

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
        const k = 2;
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
        const k = 2;
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

  function handleMouseDown__bottom(isLeftHandler: boolean) {
    return (event: React.MouseEvent<HTMLDivElement>) => {
      const srcY = event.pageY;
      if (!ref.current) return;
      const offsetWidth = ref.current.offsetWidth;
      const offsetHeight = ref.current.offsetHeight;
      const changeWidthFunc = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!ref.current) return;
        // const offsetHeight = ref.current.offsetHeight;
        const k = 1;
        const diffY = isLeftHandler ? e.pageY - srcY : srcY - e.pageY;
        const height = Math.min(
          Math.max(offsetHeight - diffY * k, 100),
          imgRef.current?.offsetHeight || 100,
        );
        ref.current.style.cssText = `
          width: ${offsetWidth}px;
          height: ${height}px;
          user-select:none;
        `;
        // api.start({ height });
        handleHeightChangeDebounce(height);
      };
      document.addEventListener('mousemove', changeWidthFunc as any);
      document.addEventListener('mouseup', () =>
        document.removeEventListener('mousemove', changeWidthFunc as any),
      );
    };
  }
  function handleTouchStart__bottom(isLeftHandler: boolean) {
    return (event: React.TouchEvent<HTMLDivElement>) => {
      const srcY = event.touches[0].pageY;
      if (!ref.current) return;
      const offsetWidth = ref.current.offsetWidth;
      const offsetHeight = ref.current.offsetHeight;
      const changeWidthFunc = (e: React.TouchEvent<HTMLDivElement>) => {
        if (!ref.current) return;
        const pageY = e.touches[0].pageY;
        // const offsetHeight = ref.current.offsetHeight;
        const k = 1;
        const diffY = isLeftHandler ? pageY - srcY : srcY - pageY;
        const height = Math.min(
          Math.max(offsetHeight - diffY * k, 100),
          imgRef.current?.offsetHeight || 100,
        );
        // console.log(pageY);
        // console.log(offsetHeight - diffY * k);
        // console.log(height);
        //   ref.current.style.cssText = `
        //   width: ${width}px;
        //   user-select:none;
        // `;
        ref.current.style.cssText = `
        width: ${offsetWidth}px;
        height: ${height}px;
        user-select:none;
      `;
        // api.start({ height });
        handleHeightChangeDebounce(height);
      };
      document.addEventListener('touchmove', changeWidthFunc as any);
      document.addEventListener('touchend', () =>
        document.removeEventListener('touchmove', changeWidthFunc as any),
      );
    };
  }
};

const LoadingImage = React.forwardRef(
  (
    {
      src,
      alt,
      className,
      width,
      height,
      onSrcChange,
    }: {
      src: string | File;
      alt?: string;
      width: number;
      height: number;
      className?: string;
      onSrcChange: (v: string) => void;
    },
    ref: any,
  ) => {
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
            const tmp = yield imgSign(src, { width, height });
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

    return <img src={imgSrc} alt={alt} className={className} ref={ref} />;
  },
);

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

const alignOpts = { points: ['tc', 'bc'] };
const EmptyImageMenu: React.FC<{
  onChange: (v: string | File) => void;
  // onClose: () => void;
  // alignMethod: (el: HTMLDivElement) => void;
}> = ({ onChange }) => {
  const [embedSrc, setEmbedSrc] = React.useState<string>('');
  const [imgOpen] = useLens(['image', 'imgOpen']);
  const [activeItem, setActiveItem] = React.useState('upload');
  return (
    <div
      className={`lla-media__popmenu`}
      onClick={(event) => event.stopPropagation()}
    >
      <div className="lla-media__popmenu__item-group ">
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
        className={`lla-media__popmenu__content lla-media__popmenu__content--${activeItem}`}
      >
        {activeItem === 'upload' && renderUpload()}
        {activeItem === 'embed' && renderEmbed()}
      </div>
    </div>
  );

  function renderUpload() {
    return (
      <>
        <div
          className="lla-media__open"
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
        <div className="lla-media__open-helper-message">{`图片不能超过5MB`}</div>
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
            placeholder="添加图片链接"
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
          添加图片
        </div>
        <div className="lla-media__embed-helper-message">支持任意外链图片</div>
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
        onTouchStart={() => setIsOpen(true)}
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
          onTouchStart={(e) => {
            e.stopPropagation();
            openContextMenu(() => triggerRef.current);
          }}
        >
          ...
        </div>
      </div>
      {isOpen && (
        <LLAOverLayer
          alignOpts={alignOpts}
          targetGet={() => ref.current}
          onClose={() => setIsOpen(false)}
        >
          <EmptyImageMenu onChange={onSrcChange}></EmptyImageMenu>
        </LLAOverLayer>
      )}
    </>
  );

  // function handleAlign(source: HTMLDivElement) {
  //   if (ref.current) domAlign(source, ref.current);
  // }
};

const ImageComponent = ({
  attributes,
  children,
  element,
}: ExtendRenderElementProps<ImageElement>) => {
  const { src, alt, width, height } = element;
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
          height={height}
          onWidthChange={handleMetaChange('width')}
          onHeightChange={handleMetaChange('height')}
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

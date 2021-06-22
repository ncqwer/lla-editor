import React, { useState, useMemo } from 'react';
import { Descendant } from 'slate';
import {
  PluginProvider,
  Environment,
  Editor,
  Editable,
  ConfigHelers,
  ParagraphImpl,
  useDebounce,
  useThrottle,
  Func,
  LLAConfig,
  LLAOverLayer,
} from '@lla-editor/core';
import { createPortal } from 'react-dom';
import IndentImpl from '@lla-editor/indent';
import TextBlockImpl from '@lla-editor/text-block';
import ListImpl from '@lla-editor/list';
import domAlign from 'dom-align';
import ImageImpl from '@lla-editor/image';
import HeadingImpl from '@lla-editor/heading';
import DividerImpl from '@lla-editor/divider';
import CalloutImpl from '@lla-editor/callout';

import 'emoji-mart/css/emoji-mart.css';
import { Picker } from 'emoji-mart';

import { animated, useSpring } from 'react-spring';
// import useThrottle from '@lla-editor/core/src/hooks/useThrottle';

const availablePlugins = [
  TextBlockImpl,
  IndentImpl,
  ListImpl,
  HeadingImpl,
  ImageImpl,
  DividerImpl,
  CalloutImpl,
  ParagraphImpl,
];
const activeNames = availablePlugins.map(({ pluginName }) => pluginName);

const { SharedProvider } = ConfigHelers;

const Paragraph = () => {
  return (
    <div className="lla-paragraph">
      <span>
        Lorem ipsum dolor sit, amet consectetur adipisicing elit. Doloribus,
        nostrum. Beatae reiciendis, laboriosam, alias quas esse itaque
        consectetur ad velit quisquam a non quidem rerum. Quam laboriosam iusto
        saepe repellat.
      </span>
    </div>
  );
};

const TextBlock = ({ complex = false }) => {
  return (
    <div className="lla-text-block">
      <Paragraph></Paragraph>
      {complex && (
        <div className="lla-text-block__container">
          <TextBlock></TextBlock>
        </div>
      )}
    </div>
  );
};

const Task = ({ type = 'task', complex = false }) => {
  return (
    <div className={`lla-list-item lla-list-item--${type}`}>
      <div className="lla-list-item__leading" contentEditable={false}>
        {renderLeading()}
      </div>
      <div className="lla-list-item__content">
        <Paragraph></Paragraph>
        {complex && (
          <div className="lla-list-item__container">
            <TextBlock></TextBlock>
          </div>
        )}
      </div>
    </div>
  );

  function renderLeading() {
    if (type === 'task')
      return (
        <input
          type="checkbox"
          className="lla-list-item__leading__content"
        ></input>
      );
    if (type === 'numbered') {
      return (
        <div className="lla-list-item__leading__content">
          <span>2.</span>
        </div>
      );
    }
    if (type === 'bulleted') {
      return (
        <div className="lla-list-item__leading__content">
          <span>•</span>
        </div>
      );
    }
  }
};

// const Image = ()=>{
//   return
// }

const PlainTextExample = () => {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const promiseRef = React.useRef<any>(null);
  return (
    <PluginProvider availablePlugins={availablePlugins}>
      <Environment activePluginNames={activeNames}>
        <SharedProvider
          initialValue={React.useMemo<Partial<LLAConfig>>(
            () => ({
              indentContainer: {
                indent: 24,
              },
              image: {
                loadingCover: 'loadingCover',
                errorCover: 'errorCover',
                imgOpen: async () => {
                  if (promiseRef.current) promiseRef.current[1]();
                  inputRef.current?.click();
                  return new Promise<string>((res, rej) => {
                    promiseRef.current = [res, rej];
                  });
                },
                imgSign: async (id: any) => id,
                imgRemove: async (id) => console.log(id),
              },
            }),
            [],
          )}
        >
          <AEditor></AEditor>
          <input
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
              dataURL && promiseRef.current && promiseRef.current[0](dataURL);
            }}
            accept=".jpeg,.jpg,.png"
          />
        </SharedProvider>
      </Environment>
    </PluginProvider>
  );
};

const ResizedImage: React.FC<{
  src: string;
  alt?: string;
  selected?: boolean;
  width: number;
  onWidthChange: (v: number) => void;
}> = ({ src, alt, selected = false, width, onWidthChange }) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const [styles, api] = useSpring(() => ({ width }));
  React.useEffect(() => {
    if (ref.current) {
      ref.current.style.cssText = `
      width: ${width}px;
      user-select:none;
    `;
    }
  }, []);
  const [handleWidthChangeDebounce] = useThrottle((f: Func, v: number) => {
    onWidthChange(v);
    f();
  }, 1000 / 30);
  return (
    <animated.div
      style={styles}
      className={`lla-image ${selected ? 'lla-selected' : ''}`}
      ref={ref}
    >
      <img src={src} alt={alt} className="lla-image__content" />
      <div
        className="lla-image__resizer lla-image__resizer--left"
        onMouseDown={handleMouseDown(true)}
      >
        <div className="lla-image__resizer__handler"></div>
      </div>
      <div
        className="lla-image__resizer lla-image__resizer--right"
        onMouseDown={handleMouseDown(false)}
      >
        <div className="lla-image__resizer__handler"></div>
      </div>
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

  function getProperlyWidth(v: number) {
    if (v < 0) return 0;
    if (v > 1200) return 1200;
    return v;
  }
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
  onChange: (v: string) => void;
  onClose: () => void;
  alignMethod: (el: HTMLDivElement) => void;
}> = ({ alignMethod, onClose, onChange }) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const root = React.useMemo(() => document.getElementById('root'), []);
  const [visible, setVisible] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [embedSrc, setEmbedSrc] = React.useState<string>('');
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
          onClick={() => inputRef.current?.click()}
        >
          选择文件
        </div>
        <div className="lla-image__open-helper-message">{`图片不能超过5MB`}</div>
        <input
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
        />
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

const EmptyImage: React.FC<{ onChange: (v: string) => void }> = ({
  onChange,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  return (
    <>
      <div
        className="lla-image lla-image--empty"
        ref={ref}
        onClick={() => setIsOpen(true)}
      >
        <svg viewBox="0 0 30 30" className="lla-image__icon">
          <path d="M1,4v22h28V4H1z M27,24H3V6h24V24z M18,10l-5,6l-2-2l-6,8h20L18,10z M11.216,17.045l1.918,1.918l4.576-5.491L21.518,20H9 L11.216,17.045z M7,12c1.104,0,2-0.896,2-2S8.104,8,7,8s-2,0.896-2,2S5.896,12,7,12z"></path>
        </svg>

        <div className="lla-image__placeholder">添加图片</div>
      </div>
      {isOpen && (
        <EmptyImageMenu
          onClose={() => setIsOpen(false)}
          alignMethod={handleAlign}
          onChange={onChange}
        ></EmptyImageMenu>
      )}
    </>
  );

  function handleAlign(source: HTMLDivElement) {
    if (ref.current) domAlign(source, ref.current, { points: ['tc', 'bc'] });
  }
};

const InsertPannelItem: React.FC<
  React.HtmlHTMLAttributes<HTMLDivElement> & {
    imgSrc: string;
    title: string;
    active?: boolean;
    description: string;
  }
> = ({ imgSrc, title, description, active = false, ...others }) => {
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (ref.current && active) {
      (ref.current as any).scrollIntoViewIfNeeded(false);
    }
  }, [active]);
  return (
    <div
      ref={ref}
      className={`lla-insert__item ${active ? 'lla-insert__item--active' : ''}`}
      {...others}
    >
      <img src={imgSrc} alt={title} className="lla-insert__item-cover" />
      <div className="lla-insert__item-content">
        <div className="lla-insert__item-title">{title}</div>
        <div className="lla-insert__item-descritption">{description}</div>
      </div>
    </div>
  );
};

const InsertPannel = () => {
  const [activeIdx, setActiveIdx] = React.useState(0);

  return (
    <>
      <div className="lla-insert">
        <div className="lla-insert__group">
          <div className="lla-insert__group-label">基础元素</div>
          {Array.from({ length: 13 }).map((_, i) => (
            <InsertPannelItem
              active={i === activeIdx}
              imgSrc="https://www.notion.so/images/blocks/text.9fdb530b.png"
              title={`Text-${i}`}
              description="Just start writing with plain text"
              key={i}
              onMouseOver={() => setActiveIdx(i)}
            ></InsertPannelItem>
          ))}
        </div>
      </div>
      <div className="m-7 flex ">
        <div
          className="mr-7 rounded shadow-xs border w-12 flex justify-center items-center cursor-pointer hover:bg-gray-100 active:bg-gray-200"
          onClick={handleUp}
        >
          Up
        </div>
        <div
          className="mr-7 rounded shadow-xs border w-12 flex justify-center items-center cursor-pointer hover:bg-gray-100 active:bg-gray-200"
          onClick={handleDown}
        >
          Down
        </div>
      </div>
    </>
  );

  function handleDown() {
    if (activeIdx >= 13) return;
    setActiveIdx(activeIdx + 1);
  }
  function handleUp() {
    if (activeIdx === 0) return;
    setActiveIdx(activeIdx - 1);
  }
};

const ContextMenu = () => {
  const [search, setSearch] = React.useState('');
  return (
    <div className="lla-context-menu">
      <div className="lla-context-menu__search">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="lla-context-menu__group">
        <div className="lla-context-menu__item">
          <div className="lla-context-menu__item__icon">
            <svg
              viewBox="0 0 30 30"
              // style="width: 17px; height: 17px; display: block; fill: inherit; flex-shrink: 0; backface-visibility: hidden;"
            >
              <path d="M21,5c0-2.2-1.8-4-4-4h-4c-2.2,0-4,1.8-4,4H2v2h2v22h22V7h2V5H21z M13,3h4c1.104,0,2,0.897,2,2h-8C11,3.897,11.897,3,13,3zM24,27H6V7h18V27z M16,11h-2v12h2V11z M20,11h-2v12h2V11z M12,11h-2v12h2V11z"></path>
            </svg>
          </div>
          <div className="lla-context-menu__item__title">Delete</div>
          <div className="lla-context-menu__item__shotkey">Del</div>
        </div>
        <div className="lla-context-menu__item">
          <div className="lla-context-menu__item__icon">
            <svg
              viewBox="0 0 30 30"
              // style="width: 17px; height: 17px; display: block; fill: inherit; flex-shrink: 0; backface-visibility: hidden;"
            >
              <path d="M21,5c0-2.2-1.8-4-4-4h-4c-2.2,0-4,1.8-4,4H2v2h2v22h22V7h2V5H21z M13,3h4c1.104,0,2,0.897,2,2h-8C11,3.897,11.897,3,13,3zM24,27H6V7h18V27z M16,11h-2v12h2V11z M20,11h-2v12h2V11z M12,11h-2v12h2V11z"></path>
            </svg>
          </div>
          <div className="lla-context-menu__item__title">Delete</div>
          <div className="lla-context-menu__item__shotkey">Del</div>
        </div>
      </div>
    </div>
  );
};

const Heading: React.FC<{
  level: number;
}> = ({ level }) => {
  return (
    <div className={`lla-heading-${level}`}>
      <Paragraph></Paragraph>
    </div>
  );
};

// const LLAOverLayer: React.FC<{
//   onClose: () => void;
//   alignMethod: (source: HTMLElement) => void;
// }> = ({ onClose, alignMethod, children }) => {
//   const root = React.useMemo(() => document.getElementById('root'), []);
//   const [visible, setVisible] = React.useState(false);
//   const ref = React.useRef<HTMLDivElement>(null);
//   React.useEffect(() => {
//     if (ref.current) alignMethod(ref.current);
//     setVisible(true);
//   }, []);
//   return createPortal(
//     <div className="lla-overlayer" onClick={onClose}>
//       <div
//         className={`lla-overlayer__content relative w-max ${
//           visible ? 'visible' : 'invisible'
//         }`}
//         ref={ref}
//         onClick={(e) => e.stopPropagation()}
//       >
//         {children}
//       </div>
//     </div>,
//     root as any,
//   );
// };

const emojiI18 = {
  search: '查询',
  clear: '清除',
  notfound: '暂无emoji',
  categories: {
    search: '查询结果',
    recent: '最近使用',
  },
};

const alignOpts = { points: ['tl', 'bl'] };

const Callout: React.FC = () => {
  const [emoji, setEmoji] = React.useState('🎇');
  const [isOpen, setIsOpen] = React.useState(false);
  const ref = React.useRef<HTMLSpanElement>(null);
  return (
    <>
      <div className="lla-callout">
        <div className="lla-callout__mark">
          <div className="lla-callout__emoji-wrapper">
            <span
              role="img"
              aria-label={emoji}
              ref={ref}
              onClick={() => setIsOpen(true)}
            >
              {emoji}
            </span>
          </div>
        </div>
        <Paragraph></Paragraph>
      </div>
      {isOpen && (
        <LLAOverLayer
          onClose={() => setIsOpen(false)}
          targetGet={() => ref.current}
          alignOpts={alignOpts}
        >
          <Picker
            onSelect={(v: any) => {
              setEmoji(v.native);
              setIsOpen(false);
            }}
            showSkinTones={false}
            showPreview={false}
            emojiTooltip={true}
            i18n={emojiI18}
          ></Picker>
        </LLAOverLayer>
      )}
    </>
  );
};

const AEditor = () => {
  const [value, setValue] = useState<Descendant[]>(initialValue());
  const [v, setV] = useState(1080);
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  return (
    <div className="m-4">
      {/* {imgSrc && (
        <ResizedImage
          src={imgSrc}
          width={v}
          onWidthChange={setV}
        ></ResizedImage>
      )}
      <EmptyImage onChange={setImgSrc}></EmptyImage> */}
      {/* <TextBlock></TextBlock>
      <TextBlock complex></TextBlock>
      <Task></Task>
      <Task type="numbered"></Task>
      <Task type="bulleted"></Task> */}
      {/* <InsertPannel></InsertPannel> */}
      {/* <ContextMenu></ContextMenu> */}
      {/* <Heading level={1}></Heading>
      <Heading level={2}></Heading>
      <Heading level={3}></Heading> */}
      {/* <div className="lla-divider"></div> */}

      {/* <Callout emoji="🎇"></Callout> */}
      <Editor value={value} onChange={setValue}>
        <Editable></Editable>
      </Editor>
    </div>
  );
};
const initialValue: () => Descendant[] = () => [
  {
    type: 'text-block',
    children: [{ type: 'paragraph', children: [{ text: '' }] }],
  },
];

export default PlainTextExample;

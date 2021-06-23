import React from 'react';
import { LLAOverLayer } from './LLAOverLayer';

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

const i18 = {
  video: {
    title: '视频',
    ext: '.mp4',
  },
};

const EmptyMediaMenu: React.FC<{
  onChange: (v: string) => void;
  onClose: () => void;
  targetGet: () => HTMLElement | null;
  localFileOpen: () => Promise<void>;
  resourceType: keyof typeof i18;
}> = ({ onClose, onChange, targetGet, localFileOpen, resourceType }) => {
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
            label={`本地${i18[resourceType].title}`}
            onAcitve={setActiveItem}
            active={activeItem === 'upload'}
          ></MenuItem>
          <MenuItem
            value="embed"
            label={`在线${i18[resourceType].title}`}
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
        <div className="lla-media__open-helper-message">{`${i18[resourceType].title}不能超过5MB`}</div>
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
            placeholder={`添加${i18[resourceType].title}链接`}
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
          {`添加${i18[resourceType].title}`}
        </div>
        <div className="lla-media__embed-helper-message">
          {`支持任意外链${i18[resourceType].title}`}
        </div>
      </>
    );
  }
};

export const EmptyMedia: React.FC<
  React.HtmlHTMLAttributes<HTMLDivElement> & {
    onSrcChange: (v: string) => void;
    localFileOpen: () => Promise<void>;
    selected?: boolean;
    openContextMenu: (f: () => HTMLElement | null) => void;
    resourceIcon: JSX.Element;
    resourceType: keyof typeof i18;
  }
> = ({
  onSrcChange,
  selected = false,
  openContextMenu,
  localFileOpen,
  resourceType,
  resourceIcon,
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
        {resourceIcon}
        <div className="lla-media__placeholder">
          {` 添加${i18[resourceType].title}`}
        </div>
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
          resourceType={resourceType}
          onClose={() => setIsOpen(false)}
          onChange={onSrcChange}
          targetGet={() => ref.current}
          localFileOpen={localFileOpen}
        ></EmptyMediaMenu>
      )}
    </>
  );
};

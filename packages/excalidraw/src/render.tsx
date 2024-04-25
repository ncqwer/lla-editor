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
import { createPortal } from 'react-dom';

import { ExcalidrawElement } from './element';
import {
  ReactEditor,
  useReadOnly,
  useSelected,
  useSlateStatic,
} from 'slate-react';

import { Excalidraw, exportToBlob } from '@excalidraw/excalidraw';
import { UseTransitionStageOptions, useTransitionStatus } from '@lla-ui/utils';
import { GetClipPath } from './modalClippath';
import { ExcalidrawImperativeAPI } from '@excalidraw/excalidraw/types/types';

const { useLens } = ConfigHelers as SharedApi<LLAConfig>;

const EmptyExcalidraw: React.FC<
  React.HtmlHTMLAttributes<HTMLDivElement> & {
    onSrcChange: (info: { src: string; excalidrawId: string }) => void;
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
        className={`lla-context-menu-target lla-excalidraw lla-excalidraw--empty ${
          selected ? 'lla-selected' : ''
        }`}
        ref={ref}
        onClick={() => setIsOpen((prev) => !prev)}
        onTouchStart={() => setIsOpen(true)}
        contentEditable={false}
        style={{
          zIndex: '999999999',
        }}
        {...others}
      >
        <svg viewBox="0 0 30 30" className="lla-excalidraw__icon">
          <path d="M1,4v22h28V4H1z M27,24H3V6h24V24z M18,10l-5,6l-2-2l-6,8h20L18,10z M11.216,17.045l1.918,1.918l4.576-5.491L21.518,20H9 L11.216,17.045z M7,12c1.104,0,2-0.896,2-2S8.104,8,7,8s-2,0.896-2,2S5.896,12,7,12z"></path>
        </svg>

        <div className="lla-excalidraw__placeholder">添加Excalidraw</div>
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
      <ExcalidrawModal
        show={isOpen}
        getInitialPosition={() => {
          // const;
          const el = ref.current!;
          const { top, right, bottom, left } = el.getBoundingClientRect();
          return [
            top,
            window.innerWidth - right,
            window.innerHeight - bottom,
            left,
          ];
        }}
      >
        <ExcalidrawImpl
          saveFile={async (data, blob) => {
            onSrcChange({ src: URL.createObjectURL(blob), excalidrawId: '1' });
          }}
        ></ExcalidrawImpl>
      </ExcalidrawModal>
    </>
  );
};

const ExcalidrawImpl = ({
  saveFile,
}: React.PropsWithChildren<{
  saveFile: (data: any, blob: Blob) => Promise<void>;
}>) => {
  const instaceRef = React.useRef<ExcalidrawImperativeAPI>(null);
  return (
    <Excalidraw
      excalidrawAPI={(v) => ((instaceRef.current as any) = v)}
      renderTopRightUI={() => {
        return (
          <button
            className="sidebar-trigger"
            onClick={async () => {
              const api = instaceRef.current!;
              const elements = api.getSceneElements();
              const files = api.getFiles();
              const appState = api.getAppState();
              const imageBlob = await exportToBlob({
                mimeType: 'image/png',
                elements,
                files,
              });

              await saveFile(
                {
                  type: 'excalidraw',
                  version: 2,
                  elements,
                  files,
                  appState: {
                    gridSize: appState.gridSize,
                    viewBackgroundColor: appState.viewBackgroundColor,
                  },
                },
                imageBlob,
              );
            }}
          >
            Save
          </button>
        );
      }}
    ></Excalidraw>
  );
};

const ExcalidrawComponent = ({
  attributes,
  children,
  element,
}: ExtendRenderElementProps<ExcalidrawElement>) => {
  const { info } = element;
  const selected = useSelected();
  const editor = useSlateStatic();
  const readonly = useReadOnly();
  return (
    <div className="lla-excalidraw-wrapper" {...attributes}>
      {info && <img src={info.src}></img>}
      {!info && (
        <EmptyExcalidraw
          onSrcChange={handleMetaChange('info')}
          selected={selected}
          openContextMenu={openContenxtMenu}
        ></EmptyExcalidraw>
      )}
      {children}
    </div>
  );

  function handleMetaChange<K extends keyof ExcalidrawElement>(meta: K) {
    return (v: ExcalidrawElement[K]) => {
      console.log(
        '%c [ v ]-174-「render」',
        'font-size:13px; background:pink; color:#bf2c9f;',
        v,
      );
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
  [elementPropsIs(ExcalidrawElement.is), elementRender(ExcalidrawComponent)],
] as ElementJSX<ExcalidrawElement>;

const ExcalidrawModal: React.FC<{
  children?: React.ReactNode;
  getInitialPosition?: () => [number, number, number, number];
  show: boolean;
}> = ({ children, show = false }) => {
  const [overlayterId] = useLens(['core', 'overlayerId']);
  const root = React.useMemo(
    () => document.getElementById(overlayterId),
    [overlayterId],
  );
  const ref = React.useRef<HTMLDivElement>(null);

  const status = useTransitionStatus(show, {
    timeout: 1000,
    onEnter: () => {
      if (ref.current) {
        ref.current.style.clipPath = '';
        ref.current.style.transition = ref.current.style.filter = '';
        ref.current.style.clipPath = GetClipPath.enter(
          window.innerWidth / 200,
          window.innerHeight / 200,
        );
      }
    },
    onEntering: () => {
      if (ref.current) {
        ref.current.style.clipPath = GetClipPath.entering(
          window.innerWidth / 200,
          window.innerHeight / 200,
        );
        ref.current.style.transition =
          'clip-path 1000ms cubic-bezier(0.4, 0, 0.2, 1)';
      }
    },
    onEntered: () => {
      if (ref.current) {
        ref.current.style.clipPath = '';
        ref.current.style.transition = ref.current.style.filter = '';
      }
    },
    onExit: () => {
      if (ref.current) {
        ref.current.style.clipPath = '';
        ref.current.style.transition = ref.current.style.filter = '';
        ref.current.style.clipPath = GetClipPath.exit(
          window.innerWidth / 200,
          window.innerHeight / 200,
        );
      }
    },
    onExiting: () => {
      if (ref.current) {
        ref.current.style.clipPath = GetClipPath.exiting(
          window.innerWidth / 200,
          window.innerHeight / 200,
        );
        ref.current.style.transition =
          'clip-path 1000ms cubic-bezier(0.4, 0, 0.2, 1)';
      }
    },
    onExited: () => {
      if (ref.current) {
        ref.current.style.clipPath =
          ref.current.style.transition =
          ref.current.style.filter =
            '';
      }
    },
  });

  if (status === 'unmount') return null;

  return createPortal(
    <div
      ref={ref}
      className={`w-screen h-screen z-50 bg-transparent fixed top-0 left-0`}
    >
      {children}
    </div>,
    root as any,
  );
};

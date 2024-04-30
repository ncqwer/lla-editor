import React from 'react';

import { Transforms } from 'slate';
import {
  ElementJSX,
  elementPropsIs,
  ExtendRenderElementProps,
  LLAConfig,
  SharedApi,
  ConfigHelers,
  elementRender,
} from '@lla-editor/core';
import { createPortal } from 'react-dom';

import { ExcalidrawElement } from './element';
import {
  ReactEditor,
  useReadOnly,
  useSelected,
  useSlateStatic,
} from 'slate-react';

// import type { Excalidraw, exportToBlob } from '@excalidraw/excalidraw';
import { useTransitionStatus } from '@lla-ui/utils';
import { GetClipPath } from './modalClippath';
import {
  type ImageInfo,
  LoadingImage,
  getImageInfo,
  ResizedImage,
} from '@lla-editor/image';

const { useLens } = ConfigHelers as SharedApi<LLAConfig>;

let ExcalidrawImport: any = null;

const EmptyExcalidraw: React.FC<
  React.HtmlHTMLAttributes<HTMLDivElement> & {
    selected?: boolean;
    openContextMenu: (f: () => HTMLElement | null) => void;
  }
> = ({
  selected = false,
  openContextMenu,
  onClick,
  onTouchStart,
  ...others
}) => {
  const triggerRef = React.useRef<HTMLDivElement>(null);

  const [isLoading, setIsLoading] = React.useState(false);
  return (
    <>
      <div
        className={`lla-context-menu-target lla-excalidraw lla-excalidraw--empty ${
          selected ? 'lla-selected' : ''
        }`}
        onClick={async (e) => {
          setIsLoading(true);
          if (onClick) {
            await onClick(e);
          }
          setIsLoading(false);
        }}
        onTouchStart={async (e) => {
          setIsLoading(true);
          if (onTouchStart) {
            await onTouchStart(e);
          }
          setIsLoading(false);
        }}
        contentEditable={false}
        {...others}
      >
        <svg
          className="lla-excalidraw__icon"
          viewBox="0 0 1024 1024"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M837.818182 136.192c46.545455 0 84.666182 35.886545 88.157091 81.501091l0.279272 6.935273v521.867636a88.436364 88.436364 0 0 1-81.547636 88.203636l-6.888727 0.232728h-7.307637V884.363636a79.127273 79.127273 0 0 1-79.127272 79.127273h-27.601455a79.127273 79.127273 0 0 1-79.127273-79.127273l-0.046545-26.205091H258.234182a23.272727 23.272727 0 0 1-23.272727-23.272727V779.170909a23.272727 23.272727 0 0 1 23.272727-23.272727h386.373818l0.046545-166.446546c0-8.238545 1.303273-16.430545 3.816728-24.203636l2.932363-7.726545 12.567273-27.601455 7.168-14.987636 6.330182-12.288c4.189091-7.726545 7.912727-13.963636 11.729454-19.176728 3.118545-4.282182 6.376727-8.098909 10.426182-11.776a55.389091 55.389091 0 0 1 39.424-15.499636c17.873455 0 30.068364 6.702545 40.215273 16.197818 4.142545 3.909818 7.354182 7.912727 10.426182 12.334546 3.723636 5.399273 7.261091 11.729455 11.170909 19.549091l9.076364 19.688727 7.028363 16.430545 7.912727 19.223273a79.127273 79.127273 0 0 1 5.678546 29.509818l-0.046546 189.998546H837.818182a32.581818 32.581818 0 0 0 32.302545-28.16l0.279273-4.421819V224.628364a32.581818 32.581818 0 0 0-28.16-32.302546L837.818182 192.046545H167.563636a32.581818 32.581818 0 0 0-32.302545 28.16l-0.279273 4.421819v521.867636a32.581818 32.581818 0 0 0 28.16 32.302545l4.421818 0.279273h36.770909v55.854546H167.563636a88.436364 88.436364 0 0 1-88.157091-81.501091l-0.279272-6.935273V224.628364a88.436364 88.436364 0 0 1 81.547636-88.157091l6.888727-0.279273H837.818182z m-63.162182 527.36H700.509091V884.363636a23.272727 23.272727 0 0 0 23.272727 23.272728h27.648a23.272727 23.272727 0 0 0 23.272727-23.272728l-0.046545-220.811636zM475.042909 362.589091c47.290182-46.173091 117.992727-49.664 208.058182-14.894546a27.927273 27.927273 0 0 1-20.107636 52.13091c-71.819636-27.741091-120.180364-25.367273-148.945455 2.746181-19.642182 19.130182-28.578909 43.101091-31.185455 77.963637l-1.210181 20.805818c-3.444364 43.473455-17.314909 78.429091-47.569455 107.985454-48.128 46.917818-116.596364 56.459636-201.588364 30.952728a27.927273 27.927273 0 0 1 16.058182-53.527273c67.165091 20.200727 114.734545 13.591273 146.525091-17.408 19.269818-18.850909 28.299636-41.192727 30.859637-71.819636l1.256727-21.504c3.584-47.197091 16.989091-83.316364 47.848727-113.431273zM739.048727 512c-3.444364 0-11.915636 14.522182-25.460363 43.566545l-11.077819 24.48291a23.365818 23.365818 0 0 0-2.001454 9.448727v18.199273h74.146909v-18.618182a23.272727 23.272727 0 0 0-1.629091-8.704l-6.981818-16.989091-6.190546-14.615273c-10.705455-24.529455-17.640727-36.770909-20.805818-36.770909zM315.392 245.341091a27.927273 27.927273 0 0 1 2.606545 35.700364l-3.304727 3.770181-89.367273 86.109091a27.927273 27.927273 0 0 1-42.030545-36.352l3.258182-3.816727 89.367273-86.109091a27.927273 27.927273 0 0 1 39.470545 0.698182z"
            fill="#7B88A0"
          ></path>
        </svg>
        {!isLoading && (
          <>
            <div className="lla-excalidraw__placeholder">添加Excalidraw</div>
          </>
        )}
        {isLoading && <div className="lla-excalidraw__loading"></div>}
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
    </>
  );
};

const ExcalidrawImpl = ({
  saveFile,
  id,
  onCancel,
  readonly,
}: React.PropsWithChildren<{
  saveFile: (data: any, blob: Blob) => Promise<void>;
  onCancel: () => void;
  id?: string;
  readonly?: boolean;
}>) => {
  const instaceRef = React.useRef<any>(null);
  const [getFile] = useLens(['excalidraw', 'getFile']);
  const data = id ? { initialData: getFile(id) } : {};
  if (!ExcalidrawImport) return null;
  const { Excalidraw, exportToBlob, WelcomeScreen } = ExcalidrawImport;
  return (
    <Excalidraw
      excalidrawAPI={(v: any) => ((instaceRef.current as any) = v)}
      {...data}
      renderTopRightUI={() => {
        return (
          <>
            <button className="sidebar-trigger" onClick={onCancel}>
              Cancel
            </button>
            {!readonly && (
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
                        scrollX: appState.scrollX,
                        scrollY: appState.scrollY,
                        zoom: appState.zoom,
                        offsetTop: appState.offsetTop,
                        offsetLeft: appState.offsetLeft,
                      },
                    },
                    imageBlob,
                  );
                }}
              >
                Save
              </button>
            )}
          </>
        );
      }}
    >
      <WelcomeScreen></WelcomeScreen>
    </Excalidraw>
  );
};

const ExcalidrawComponent = ({
  attributes,
  children,
  element,
}: ExtendRenderElementProps<ExcalidrawElement>) => {
  const { info, width, height } = element;
  const selected = useSelected();
  const editor = useSlateStatic();
  const readonly = useReadOnly();
  const [isOpen, setIsOpen] = React.useState(false);
  const [imgUpload] = useLens(['image', 'imgUpload']);
  const [breakpoints] = useLens(['image', 'breakpoints']);
  const [saveFile] = useLens(['excalidraw', 'saveFile']);
  const [preFetchFile] = useLens(['excalidraw', 'preFetchFile']);
  const [isLoading, setIsLoading] = React.useState(false);
  return (
    <div className="lla-excalidraw-wrapper" {...attributes}>
      {children}
      {info && (
        <ResizedImage
          src={info.src}
          selected={selected}
          width={width}
          height={height}
          onWidthChange={handleMetaChange('width')}
          onHeightChange={handleMetaChange('height')}
          openContextMenu={openContenxtMenu}
        >
          <div
            className="lla-excalidraw__edit-button"
            onClick={async () => {
              setIsLoading(true);
              await preFetchFile(info.excalidrawId);
              if (!ExcalidrawImport) {
                ExcalidrawImport = await import('@excalidraw/excalidraw');
              }
              setIsLoading(false);
              setIsOpen(true);
            }}
          >
            {!isLoading && readonly && 'Show'}
            {!isLoading && !readonly && 'Edit'}
            {isLoading && (
              <div className="lla-excalidraw__edit-button__loading-icon"></div>
            )}
          </div>
        </ResizedImage>
      )}
      {!info && (
        <EmptyExcalidraw
          selected={selected}
          openContextMenu={openContenxtMenu}
          onClick={async () => {
            if (!ExcalidrawImport) {
              ExcalidrawImport = await import('@excalidraw/excalidraw');
            }
            setIsOpen(true);
          }}
        ></EmptyExcalidraw>
      )}
      <ExcalidrawModal show={isOpen}>
        <ExcalidrawImpl
          readonly={readonly}
          id={info?.excalidrawId}
          onCancel={() => {
            setIsOpen(false);
          }}
          saveFile={async (data, blob) => {
            let src = URL.createObjectURL(blob);
            const uniqueId =
              info?.excalidrawId || `${crypto.randomUUID()}_${Date.now()}`;
            await saveFile(uniqueId, data);
            const imageInfo = await getImageInfo(src, {
              breakpoints,
            });
            if (imgUpload) {
              src = await imgUpload(
                blob,
                breakpoints
                  ? breakpoints.slice(0, imageInfo.breakpointLevel!)
                  : undefined,
              );
            }
            handleMetaChange('info')({
              excalidrawId: uniqueId,
              src: {
                ...imageInfo,
                src,
              },
            });
            setIsOpen(false);
          }}
        ></ExcalidrawImpl>
      </ExcalidrawModal>
    </div>
  );

  function handleMetaChange<K extends keyof ExcalidrawElement>(meta: K) {
    return (v: ExcalidrawElement[K]) => {
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

  if (status === 'unmount' || typeof document === 'undefined') return null;

  return createPortal(
    <div
      ref={ref}
      className={`w-screen h-screen z-50 bg-transparent fixed top-0 left-0`}
    >
      {children}
    </div>,
    document.getElementById(overlayterId)!,
  );
};

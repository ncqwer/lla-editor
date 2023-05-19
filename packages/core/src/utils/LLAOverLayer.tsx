import React from 'react';
import { createPortal } from 'react-dom';
import domAlign from 'dom-align';
import { ConfigHelers } from '../framework';

const { useLens } = ConfigHelers;

// eslint-disable-next-line valid-jsdoc
/**
 * @example
 *  const alignOpt = {points:['tc','bc']} //source's top center === target's bottom center
 *  //.....
 *  const [isOpen,setIsOpen] = React.useState(false);
 *  return {isOpen&&
 *            <LLAOverLayer>
 *                <YourComponent></YourComponent>
 *             </LLAOverLayer>
 *         }
 * @param props.onClose click on mask
 * @param props.targetGet get the target html element when overlayer mounted
 * @param props.alignOpts dom-align options see:https://www.npmjs.com/package/dom-align
 * @returns
 */
export const LLAOverLayer: React.FC<{
  onClose: () => void;
  targetGet: () => HTMLElement | null;
  children?: React.ReactNode;
  alignOpts: any;
}> = ({ onClose, targetGet, children, alignOpts }) => {
  const [overlayterId] = useLens(['core', 'overlayerId']);
  const root = React.useMemo(
    () => document.getElementById(overlayterId),
    [overlayterId],
  );
  const [visible, setVisible] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    const target = targetGet();
    if (!target) return;
    if (ref.current)
      domAlign(ref.current, target, {
        ...alignOpts,
        overflow: {
          alwaysByViewport: true,
          adjustX: true,
          adjustY: true,
        },
      });
    setVisible(true);
  }, []);
  return createPortal(
    <div className="lla-overlayer" onClick={onClose}>
      <div
        className={`lla-overlayer__content ${
          visible ? 'visible' : 'invisible'
        }`}
        ref={ref}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    root as any,
  );
};

export const LLAModal: React.FC<{
  onClose: () => void;
  hasMask?: boolean;
  noMaskClose?: boolean;
  children?: React.ReactNode;
}> = ({ onClose, children, hasMask = false, noMaskClose = false }) => {
  const [overlayterId] = useLens(['core', 'overlayerId']);
  const root = React.useMemo(
    () => document.getElementById(overlayterId),
    [overlayterId],
  );

  return createPortal(
    <div className={`w-screen h-screen z-50 bg-transparent fixed top-0 left-0`}>
      {hasMask && (
        <div
          className={`absolute inset-0 w-screen h-screen bg-gray-900 opacity-60`}
          onClick={(e) => {
            e.stopPropagation();
            if (noMaskClose) return;
            if (e.target === e.currentTarget) onClose();
          }}
          onContextMenu={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        ></div>
      )}
      {children}
    </div>,
    root as any,
  );
};

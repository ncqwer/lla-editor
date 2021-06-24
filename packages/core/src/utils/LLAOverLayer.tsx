import React from 'react';
import { createPortal } from 'react-dom';
import domAlign from 'dom-align';

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
  alignOpts: any;
}> = ({ onClose, targetGet, children, alignOpts }) => {
  const root = React.useMemo(() => document.getElementById('root'), []);
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

import React from 'react';
import { createPortal } from 'react-dom';
import domAlign from 'dom-align';

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
    if (ref.current) domAlign(ref.current, target, alignOpts);
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

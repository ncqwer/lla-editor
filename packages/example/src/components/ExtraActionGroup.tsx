import React from 'react';
import { LLAOverLayer } from '@lla-editor/core';

const alignOpts = { points: ['tr', 'br'] };

export const ExtraActionGroup = () => {
  const [isOpen, setIsOpen] = React.useState<boolean>(false);
  const ref = React.useRef<HTMLDivElement>(null);
  return (
    <>
      <div
        className={`lla-comment__extra-action-group__trigger${
          isOpen ? ' lla-comment__extra-action-group__trigger--active' : ''
        }`}
        ref={ref}
        onClick={() => setIsOpen(true)}
        onTouchStart={() => setIsOpen}
      >
        <span>...</span>
      </div>
      {isOpen && (
        <LLAOverLayer
          onClose={() => setIsOpen(false)}
          alignOpts={alignOpts}
          targetGet={() => ref.current}
        >
          <div className="lla-comment__extra-action-group">
            <div className="lla-comment__extra-action-group__report-action">
              举报
            </div>
          </div>
        </LLAOverLayer>
      )}
    </>
  );
};

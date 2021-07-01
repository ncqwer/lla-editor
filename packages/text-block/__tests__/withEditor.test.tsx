/** @jsx jsx */

import { jsx, runtime } from './index';

import { Editor } from 'slate';

declare namespace jsx.JSX {
  interface IntrinsicElements {
    [elemName: string]: any; // eslint-disable-line
  }
}

describe('withEditor', () => {
  test('should always wrap paragraph in text-block', () => {
    const input = runtime.withEditor(
      <editor>
        <paragraph>hh</paragraph>
      </editor>,
    );
    Editor.normalize(input, { force: true });
    const s = (
      <editor>
        <text-block>
          <paragraph>hh</paragraph>
        </text-block>
      </editor>
    );
    expect(input).editorEqual(s);
  });
});

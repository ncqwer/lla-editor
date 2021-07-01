/** @jsx jsx */

import { jsx, runtime } from './index';

import { Editor } from 'slate';

declare namespace jsx.JSX {
  interface IntrinsicElements {
    [elemName: string]: any; // eslint-disable-line
  }
}

describe('withEditor', () => {
  test('normalize should work fine', () => {
    const e = runtime.withEditor(
      <editor>
        <containable>
          <indent>
            <paragraph>123</paragraph>
          </indent>
        </containable>
      </editor>,
    );
    Editor.normalize(e, { force: true });
    expect(e).editorEqual(
      <editor>
        <paragraph>123</paragraph>
      </editor>,
    );
  });
});

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
        <number index={1}>
          <paragraph>first</paragraph>
        </number>
        <number index={1}>
          <paragraph>second</paragraph>
        </number>
        <number index={1}>
          <paragraph>thrid</paragraph>
        </number>
      </editor>,
    );
    Editor.normalize(e, { force: true });
    expect(e).editorEqual(
      <editor>
        <number index={1}>
          <paragraph>first</paragraph>
        </number>
        <number index={2}>
          <paragraph>second</paragraph>
        </number>
        <number index={3}>
          <paragraph>thrid</paragraph>
        </number>
      </editor>,
    );
  });
});

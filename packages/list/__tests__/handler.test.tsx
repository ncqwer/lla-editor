/**@jsx jsx */
import { mockKey, setShotKeyMock } from '@lla-editor/core';
import { runtime, jsx } from '.';

declare namespace jsx.JSX {
  interface IntrinsicElements {
    [elemName: string]: any; // eslint-disable-line
  }
}

describe('onKeyDown', () => {
  beforeAll(() => setShotKeyMock(true));
  afterAll(() => setShotKeyMock(false));

  test('[backspace] should work fine', () => {
    const e = runtime.withEditor(
      <editor>
        <task>
          <paragraph>
            <cursor></cursor>123
          </paragraph>
        </task>
      </editor>,
    );
    runtime.onKeyDown(() => {}, mockKey('backspace'), e, null as any);
    expect(e).editorEqual(
      <editor>
        <paragraph>
          <cursor></cursor>123
        </paragraph>
      </editor>,
    );
  });
});

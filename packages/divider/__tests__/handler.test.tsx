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

  test('[enter] should work fine', () => {
    const e = runtime.withEditor(
      <editor>
        <divider>
          <text>
            <cursor></cursor>
          </text>
        </divider>
      </editor>,
    );
    runtime.onKeyDown(() => {}, mockKey('enter'), e, null as any);
    expect(e).editorEqual(
      <editor>
        <divider>
          <text></text>
        </divider>
        <paragraph>
          <cursor></cursor>
        </paragraph>
      </editor>,
    );
  });
});

/** @jsx jsx */
import { mockKey, setShotKeyMock } from '@lla-editor/core';
import { runtime, jsx } from '.';

// eslint-disable-next-line @typescript-eslint/no-redeclare
declare namespace jsx.JSX {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
        <audio>
          <text>
            <cursor></cursor>
          </text>
        </audio>
      </editor>,
    );
    runtime.onKeyDown(() => {}, mockKey('enter'), e, null as any);
    expect(e).editorEqual(
      <editor>
        <audio>
          <text></text>
        </audio>
        <paragraph>
          <cursor></cursor>
        </paragraph>
      </editor>,
    );
  });
});

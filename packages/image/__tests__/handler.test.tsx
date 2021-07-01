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
        <image>
          <text>
            <cursor></cursor>
          </text>
        </image>
      </editor>,
    );
    runtime.onKeyDown(() => {}, mockKey('enter'), e, null as any);
    expect(e).editorEqual(
      <editor>
        <image>
          <text></text>
        </image>
        <paragraph>
          <cursor></cursor>
        </paragraph>
      </editor>,
    );
  });

  test('[backspace should avoid void]', () => {
    const e = runtime.withEditor(
      <editor>
        <paragraph>123</paragraph>
        <image>
          <text></text>
        </image>
        <image>
          <text></text>
        </image>
        <wrapper>
          <paragraph>
            <cursor />4
          </paragraph>
        </wrapper>
      </editor>,
    );
    runtime.onKeyDown(() => {}, mockKey('backspace'), e, null as any);
    expect(e).editorEqual(
      <editor>
        <paragraph>123</paragraph>
        <wrapper>
          <paragraph>
            <cursor />4
          </paragraph>
        </wrapper>
        <image>
          <text></text>
        </image>
        <image>
          <text></text>
        </image>
      </editor>,
    );
  });
});

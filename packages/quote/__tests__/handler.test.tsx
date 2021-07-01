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
        <quote>
          <paragraph>
            1<anchor />
            23
            <focus />4
          </paragraph>
        </quote>
      </editor>,
    );
    runtime.onKeyDown(() => {}, mockKey('enter'), e, null as any);
    expect(e).editorEqual(
      <editor>
        <quote>
          <paragraph>1</paragraph>
        </quote>
        <paragraph>
          <cursor />4
        </paragraph>
      </editor>,
    );
  });

  test('[backspace] should work fine', () => {
    const e = runtime.withEditor(
      <editor>
        <quote>
          <paragraph>
            <cursor />
            1234
          </paragraph>
        </quote>
      </editor>,
    );
    runtime.onKeyDown(() => {}, mockKey('backspace'), e, null as any);
    expect(e).editorEqual(
      <editor>
        <paragraph>
          <cursor />
          1234
        </paragraph>
      </editor>,
    );
  });
});

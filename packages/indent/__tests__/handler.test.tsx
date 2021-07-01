/** @jsx jsx */

import { jsx, runtime } from './index';
import { setShotKeyMock, mockKey } from '@lla-editor/core';

declare namespace jsx.JSX {
  interface IntrinsicElements {
    [elemName: string]: any; // eslint-disable-line
  }
}

describe('withEditor', () => {
  beforeAll(() => {
    setShotKeyMock(true);
  });
  afterAll(() => {
    setShotKeyMock(false);
  });
  test('[backsapce] should work fine in simple situation', () => {
    const e = runtime.withEditor(
      <editor>
        <containable>
          <paragraph>1</paragraph>
          <indent>
            <paragraph>2</paragraph>
            <paragraph>
              <cursor></cursor>3
            </paragraph>
          </indent>
        </containable>
      </editor>,
    );
    const mockFn = jest.fn(() => {});
    runtime.onKeyDown(mockFn, mockKey('backspace'), e, null as any);
    expect(e).editorEqual(
      <editor>
        <containable>
          <paragraph>1</paragraph>
          <indent>
            <paragraph>2</paragraph>
          </indent>
        </containable>
        <paragraph>
          <cursor></cursor>3
        </paragraph>
      </editor>,
    );
  });

  test('[backsapce] should work fine in nest situation', () => {
    const e = runtime.withEditor(
      <editor>
        <containable>
          <paragraph>1</paragraph>
          <indent>
            <containable>
              <paragraph>
                <cursor />2
              </paragraph>
              <indent>
                <paragraph>3</paragraph>
              </indent>
            </containable>
          </indent>
        </containable>
      </editor>,
    );
    const mockFn = jest.fn(() => {});
    runtime.onKeyDown(mockFn, mockKey('backspace'), e, null as any);
    expect(e).editorEqual(
      <editor>
        <containable>
          <paragraph>1</paragraph>
        </containable>
        <containable>
          <paragraph>
            <cursor />2
          </paragraph>
          <indent>
            <paragraph>3</paragraph>
          </indent>
        </containable>
      </editor>,
    );
  });

  test('[tab] should work fine', () => {
    const e = runtime.withEditor(
      <editor>
        <containable>
          <paragraph>1</paragraph>
        </containable>
        <indentable>
          <paragraph>
            <cursor></cursor>2
          </paragraph>
        </indentable>
      </editor>,
    );
    runtime.onKeyDown(() => {}, mockKey('tab'), e, null as any);
    expect(e).editorEqual(
      <editor>
        <containable>
          <paragraph>1</paragraph>
          <indent>
            <indentable>
              <paragraph>
                <cursor></cursor>2
              </paragraph>
            </indentable>
          </indent>
        </containable>
      </editor>,
    );
  });

  test('[tab] should work fine in complex situation', () => {
    const e = runtime.withEditor(
      <editor>
        <containable>
          <paragraph>1</paragraph>
          <indent>
            <paragraph>2</paragraph>
          </indent>
        </containable>
        <indentable>
          <paragraph>
            <cursor></cursor>3
          </paragraph>
        </indentable>
      </editor>,
    );
    runtime.onKeyDown(() => {}, mockKey('tab'), e, null as any);
    expect(e).editorEqual(
      <editor>
        <containable>
          <paragraph>1</paragraph>
          <indent>
            <paragraph>2</paragraph>
            <indentable>
              <paragraph>
                <cursor></cursor>3
              </paragraph>
            </indentable>
          </indent>
        </containable>
      </editor>,
    );
  });

  test('[enter] should work fine', () => {
    const e = runtime.withEditor(
      <editor>
        <containable>
          <paragraph>
            1<anchor />2<focus />3
          </paragraph>
        </containable>
      </editor>,
    );
    runtime.onKeyDown(() => {}, mockKey('enter'), e, null as any);
    expect(e).editorEqual(
      <editor>
        <containable>
          <paragraph>1</paragraph>
        </containable>
        <containable>
          <paragraph>
            <cursor></cursor>3
          </paragraph>
        </containable>
      </editor>,
    );
  });

  test('[enter] should work fine when has indent', () => {
    const e = runtime.withEditor(
      <editor>
        <containable>
          <paragraph>
            1<anchor />2<focus />3
          </paragraph>
          <indent>
            <indentable>
              <paragraph>4</paragraph>
            </indentable>
          </indent>
        </containable>
      </editor>,
    );
    runtime.onKeyDown(() => {}, mockKey('enter'), e, null as any);
    expect(e).editorEqual(
      <editor>
        <containable>
          <paragraph>1</paragraph>
          <indent>
            <indentable>
              <paragraph>
                <cursor></cursor>3
              </paragraph>
            </indentable>
            <indentable>
              <paragraph>4</paragraph>
            </indentable>
          </indent>
        </containable>
      </editor>,
    );
  });
});

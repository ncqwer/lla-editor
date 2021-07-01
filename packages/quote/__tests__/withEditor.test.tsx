/** @jsx jsx */

import { jsx, runtime } from './index';

import { Editor } from 'slate';

declare namespace jsx.JSX {
  interface IntrinsicElements {
    [elemName: string]: any; // eslint-disable-line
  }
}
const e = runtime.withEditor(
  <editor>
    <paragraph>1</paragraph>
  </editor>,
);
describe('withEditor', () => {
  test('can contain paragraph', () => {
    expect(
      e.isParagraphable(
        <quote>
          <paragraph>1</paragraph>
        </quote>,
      ),
    ).toBeTruthy();
  });
  test('can not contain indent', () => {
    expect(
      e.isContainable(
        <quote>
          <paragraph>1</paragraph>
        </quote>,
      ),
    ).not.toBeTruthy();
  });
  test('can be indentable', () => {
    expect(
      e.isParagraphable(
        <quote>
          <paragraph>1</paragraph>
        </quote>,
      ),
    ).toBeTruthy();
  });
});

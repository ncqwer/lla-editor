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
        <heading>
          <paragraph>1</paragraph>
        </heading>,
      ),
    ).toBeTruthy();
  });
  test('can not contain indent', () => {
    expect(
      e.isContainable(
        <heading>
          <paragraph>1</paragraph>
        </heading>,
      ),
    ).not.toBeTruthy();
  });
  test('can be indentable', () => {
    expect(
      e.isParagraphable(
        <heading>
          <paragraph>1</paragraph>
        </heading>,
      ),
    ).toBeTruthy();
  });
});

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
  test('is void', () => {
    expect(e.isVoid(<custom-void></custom-void>)).toBeTruthy();
  });
});

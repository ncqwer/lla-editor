import { ParagraphImpl, composePluginsForTest } from '@lla-editor/core';
import { Editor } from 'slate';
import QuoteImpl from '../src/index';

import { createHyperscript } from 'slate-hyperscript';
import { diff } from 'jest-diff';
import { QuoteElement } from '../src/element';

export const runtime = composePluginsForTest(
  QuoteImpl as any,
  ParagraphImpl as any,
);

expect.extend({
  editorEqual(lhs: Editor, rhs: Editor) {
    const options = {
      comment: 'deep equality',
      isNot: this.isNot,
      promise: this.promise,
    };
    const _lhs = { children: lhs.children, selection: lhs.selection };
    const _rhs = { children: rhs.children, selection: rhs.selection };

    const pass = this.equals(_lhs, _rhs);
    const message = pass
      ? () =>
          this.utils.matcherHint('editorEqual', undefined, undefined, options) +
          '\n\n' +
          `Expected: not ${this.utils.printExpected(_lhs)}\n` +
          `Received: ${this.utils.printReceived(_rhs)}`
      : () => {
          const diffString = diff(_lhs, _rhs, {
            expand: this.expand,
          });
          return (
            this.utils.matcherHint(
              'editorEqual',
              undefined,
              undefined,
              options,
            ) +
            '\n\n' +
            (diffString && diffString.includes('- Expect')
              ? `Difference:\n\n${diffString}`
              : `Expected: ${this.utils.printExpected(_lhs)}\n` +
                `Received: ${this.utils.printReceived(_rhs)}`)
          );
        };
    return {
      message,
      pass,
    };
  },
});

declare global {
  namespace jest {
    interface Matchers<R> {
      editorEqual(a: Editor): R;
    }
  }
}

export const jsx = createHyperscript({
  elements: {
    quote: QuoteElement.create(),
    paragraph: { type: 'paragraph' },
  },
});

import { setShotKeyMock } from '@lla-editor/core';

describe('onKeyDown', () => {
  beforeAll(() => setShotKeyMock(true));
  afterAll(() => setShotKeyMock(false));
  test('always true', () => {
    expect(true).toBeTruthy();
  });
});

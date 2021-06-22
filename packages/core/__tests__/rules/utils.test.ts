import {
  nextifyFlow,
  nextifParamsFlow,
  extractValueFromPlugin,
  defaultPropertyRule,
  caseMatch,
} from '../../src/rules/utils';

describe('nextifyFlow', () => {
  test('should work fine with empty', () => {
    const f = nextifyFlow();
    const mockF = jest.fn(() => 'hello world');
    const ans = f(mockF);
    expect(mockF).toBeCalledTimes(1);
    expect(mockF).toBeCalledWith();
    expect(ans).toBe('hello world');
  });

  test('should work fine with single', () => {
    const mockOut: string[] = [];
    const log = (c: string) => mockOut.push(c);
    const mockF = jest.fn((n: () => number, num: number) => {
      log('hello');
      let v = n();
      log('world');
      return v + num;
    });
    const last = () => {
      log('!');
      return 3;
    };
    const ans = nextifyFlow(mockF)(last, 4);
    expect(ans).toBe(7);
    expect(mockF).toBeCalledWith(last, 4);
    expect(mockOut.join('')).toBe('hello!world');
  });

  test('should work right', () => {
    const mockOut: string[] = [];
    const log = (c: string) => mockOut.push(c);
    const mockF = jest.fn((n: () => number, num: number) => {
      log('hello');
      let v = n();
      log('world');
      return v + num;
    });
    const last = () => {
      log('!');
      return 3;
    };
    const ans = nextifyFlow((n, num) => {
      log('wow');
      return n() + num;
    }, mockF)(last, 4);
    expect(ans).toBe(11);
    expect(mockF).toBeCalledWith(last, 4);
    expect(mockOut.join('')).toBe('wowhello!world');
  });
});

describe('nextifParamsFlow', () => {
  test('should work fine with empty', () => {
    const f = nextifParamsFlow();
    const mockF = jest.fn(() => 'hello world');
    const ans = f(mockF, 3);
    expect(mockF).toBeCalledTimes(1);
    expect(mockF).toBeCalledWith(3);
    expect(ans).toBe('hello world');
  });

  test('should work fine with single', () => {
    const mockOut: string[] = [];
    const log = (c: string) => mockOut.push(c);
    const mockF = jest.fn((n, num: number) => {
      log('hello');
      let v = n(num);
      log('world');
      return v + num;
    });
    const last = (v: number) => {
      log('!');
      return v;
    };
    const ans = nextifParamsFlow(mockF)(last, 4);
    expect(ans).toBe(8);
    expect(mockF).toBeCalledWith(last, 4);
    expect(mockOut.join('')).toBe('hello!world');
  });

  test('should work right', () => {
    const mockOut: string[] = [];
    const log = (c: string) => mockOut.push(c);
    const mockF = jest.fn((n, num: number) => {
      log('hello');
      let v = n(num);
      log('world');
      return v + num;
    });
    const last = () => {
      log('!');
      return 3;
    };
    const ans = nextifParamsFlow((n, num) => {
      log('wow');
      return n(2) + num;
    }, mockF)(last, 4);
    expect(ans).toBe(9);
    expect(mockF).toBeCalledWith(last, 2);
    expect(mockOut.join('')).toBe('wowhello!world');
  });
});

describe('extractValueFromPlugin', () => {
  test('should work right', () => {
    const f = () => {};
    const values = extractValueFromPlugin((...vs: any[]) => vs)(
      {
        pluginName: 'a',
        value: 1,
      },
      {
        pluginName: 'b',
        value: 'ssr',
      },
      {
        pluginName: 'c',
        value: f,
      },
    );
    expect(values).toStrictEqual([1, 'ssr', f]);
  });
});

describe('defaultPropertyRule', () => {
  const dashboard: string[] = [];
  const echoFactory = (i: number) => ({
    pluginName: i + '',
    value: (n: () => number, arg1: string, arg2: string) => {
      const v = n();
      dashboard.push(`${arg1}-${i}-${arg2}`);
      return v + i;
    },
  });
  const composedF = defaultPropertyRule(
    echoFactory(1),
    echoFactory(2),
    echoFactory(3),
  );
  const mockF = jest.fn(() => 0);
  const ans = composedF(mockF, '(', ')');
  expect(mockF).toBeCalledTimes(1);
  expect(mockF).toBeCalledWith();
  expect(ans).toBe(6);
  expect(dashboard.join('')).toBe('(-3-)(-2-)(-1-)');
});

describe('caseMatch', () => {
  test('should work right', () => {
    const is =
      (flag: string) =>
      <T extends { name: string }>(env: T): [T] | undefined =>
        env.name === flag ? [env] : undefined;
    const ans = caseMatch()(
      // add case
      [is('b'), (env) => `hello1:${env.value}`],
      [is('c'), (env) => `hello2:${env.value}`],
      [is('a'), (env) => `hello3:${env.value}`],
    )({
      name: 'a',
      value: "a's value",
    });
    expect(ans).toBe("hello3:a's value");
  });

  test('custom error handler', () => {
    const mockF = jest.fn((...str: string[]) => {
      throw new Error(`error occurred! arguments is ${str}`);
    });
    const f = () => caseMatch(mockF)()('a', 'b', 'c', 'd');
    expect(f).toThrowError(/a,b,c,d/);
  });
});

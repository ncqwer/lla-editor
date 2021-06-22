const isPromisify = (obj: any): obj is Promise<any> =>
  obj.then && typeof obj.then === 'function';

const CANCELED_ERROR = { error: 'manual canceled!!!' };

type GeneratorFn = (...args: any[]) => Generator<any, void, any>;

export const runWithCancel = (
  fn: GeneratorFn,
  ...args: Parameters<GeneratorFn>
) => {
  let canceled = false;
  const gen = fn(...args);

  const promise: Promise<void> & { cancel: () => void } = new Promise(
    (res, rej) => {
      onFulFilled();

      function onFulFilled(arg?: any): any {
        try {
          const { value, done } = canceled
            ? gen.throw(CANCELED_ERROR)
            : gen.next(arg);
          if (done) return Promise.resolve(value).then(res);
          if (isPromisify(value)) return value.then(onFulFilled, onRejected);
          if (typeof value === 'function')
            return value(onFulFilled, onRejected);
        } catch (e) {
          rej(e);
        }
      }

      function onRejected(arg?: any): any {
        try {
          const { value, done } = canceled
            ? gen.throw(CANCELED_ERROR)
            : gen.throw(arg);
          if (done) return Promise.resolve(value).then(res);
          if (isPromisify(value)) return value.then(onFulFilled, onRejected);
          if (typeof value === 'function')
            return value(onFulFilled, onRejected);
        } catch (e) {
          rej(e);
        }
      }
    },
  ) as any;

  promise.cancel = () => (canceled = true);
  return promise;
};

// Example
// const wait = (delay, flag) => new Promise((res) => setTimeout(() => res(flag), delay));
// const flow = function* () {
//   try {
//     const f = yield wait(1000, 'f').then(() => {
//       // eslint-disable-next-line no-throw-literal
//       throw { a: 'error' };
//     });
//     console.log(f);
//   } catch (e) {
//     if (e !== CANCELED_ERROR) throw e;
//   } finally {
//     console.log('hhh');
//     const b = yield wait(1000, 'b');
//     console.log(b);
//     const a = yield wait(1000, 'a');
//     console.log(a);
//   }
// };

// const p = runWithCancel(flow);
// wait(2500, 'out').then(() => p.cancel());

// 同构于一下代码
// const wait = (delay, flag) =>
//   new Promise((res) => setTimeout(() => res(flag), delay));
// const flow = async function () {
//   try {
//     const f = await wait(1000, "f").then(() => {
//       throw { a: "error" };
//     });
//     console.log(f);
//   } catch (e) {
//     throw e;
//   } finally {
//     console.log("hhh");
//     const b = await wait(1000, "b");
//     console.log(b);
//     const a = await wait(1000, "a");
//     console.log(a);
//   }
// };

// flow();

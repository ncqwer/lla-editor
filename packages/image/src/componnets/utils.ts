export const parseBase64ToBuffer = (base64String: string) => {
  const bstring = window.atob(base64String);
  const array = new Uint8ClampedArray(bstring.length);
  for (let i = 0; i < bstring.length; ++i) {
    array[i] = bstring.charCodeAt(i);
  }
  return array;
};

export const gcd = (lhs: number, rhs: number) => {
  while (lhs !== rhs) {
    if (lhs < rhs) {
      rhs = rhs - lhs;
    } else {
      lhs = lhs - rhs;
    }
  }
  return lhs;
};

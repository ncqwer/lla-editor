export const parseBase64ToBuffer = (base64String: string) => {
  if (typeof window !== 'undefined') {
    // web
    const bstring = window.atob(base64String);
    const array = new Uint8ClampedArray(bstring.length);
    for (let i = 0; i < bstring.length; ++i) {
      array[i] = bstring.charCodeAt(i);
    }
    return array;
  } else {
    // nodejs
    const buffer = Buffer.from(base64String, 'base64');
    return new Uint8ClampedArray(buffer);
  }
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

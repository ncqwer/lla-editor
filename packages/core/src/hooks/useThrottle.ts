import { createUseDebounce } from './useDebounce';

const defaultOption = {
  leading: true,
  trailing: false,
};
export function createUseThrottle(options?: Partial<typeof defaultOption>) {
  return createUseDebounce(
    Object.assign({}, defaultOption, options, { maxing: true }),
  );
}

export const useThrottle = createUseDebounce();
export default createUseThrottle();

import { WebpackBundleSizeLimitPluginOptions } from './types';
import { error } from './error';
import { Compilation } from './webpack-bundle-size-limit-plugin';

export const processOptions = (
  rawOptions: WebpackBundleSizeLimitPluginOptions | null,
  compilation: Compilation,
): WebpackBundleSizeLimitPluginOptions => {
  const options = Object.assign({}, rawOptions);
  options.extensions = options.extensions ?? ['js'];
  if (options.extensions) {
    if (!(options.extensions instanceof Array)) {
      compilation.errors.push(
        error(`Invalid type for options.extensions.
  Expected: Array
  Found:    ${typeof options.extensions}`),
      );
    }

    for (const option of options.extensions) {
      if (typeof option !== 'string') {
        compilation.errors.push(
          error(`Invalid type for options.extensions.${option}
  Expected: string
  Found:    ${typeof option}`),
        );
      }
    }
  }

  options.enforceForAllBundles = options.enforceForAllBundles ?? false;

  return options;
};

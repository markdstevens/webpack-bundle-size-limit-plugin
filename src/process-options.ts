import { error } from './error';
import { Compilation } from './webpack-bundle-size-limit-plugin';
import { WebpackBundleSizeLimitPluginOptions } from './types';

const processIncludeExclude = (
  options: WebpackBundleSizeLimitPluginOptions,
  compilation: Compilation,
  includeExclude: 'include' | 'exclude'
): void => {
  if (options[includeExclude]) {
    if (!(options[includeExclude] instanceof Array)) {
      compilation.errors.push(
        error([
          `Invalid type for options.${includeExclude}`,
          'Expected: Array',
          `Found:    ${typeof options[includeExclude]}`
        ])
      );
    } else {
      for (const option of options[includeExclude] as string[]) {
        if (typeof option !== 'string') {
          compilation.errors.push(
            error([
              `Invalid type for options.${includeExclude} for "${option}"`,
              'Expected: string',
              `Found:    ${typeof option}`
            ])
          );
        }
        if (!option.startsWith('.')) {
          compilation.warnings.push(
            error([
              '',
              `Each entry in options.${includeExclude} should start with "." to avoid common pitfalls (e.g. should be ".${option}" instead of "${option}")`
            ])
          );
        }
      }
    }
  }
};

export const processOptions = (
  rawOptions: WebpackBundleSizeLimitPluginOptions | null,
  compilation: Compilation
): WebpackBundleSizeLimitPluginOptions => {
  const options = Object.assign({}, rawOptions);

  if (options.include && options.exclude) {
    compilation.errors.push(
      error(
        'Only one of the following options can be specified: [include, exclude]'
      )
    );
  }

  processIncludeExclude(options, compilation, 'include');
  processIncludeExclude(options, compilation, 'exclude');

  options.enforceForAllBundles = options.enforceForAllBundles ?? false;

  return options;
};

import {BundleConstraintPluginOptions} from './types';
import {error} from './error';
import {Compilation} from './bundle-constraint-plugin';

export const processOptions = (rawOptions: BundleConstraintPluginOptions | null, compilation: Compilation) => {
  const options = Object.assign({}, rawOptions);
  options.extensions = options.extensions ?? ['js'];
  if (options.extensions) {
    if (!(options.extensions instanceof Array)) {
      compilation.errors.push(error(`Invalid type for options.extensions.
  Expected: Array
  Found:    ${typeof options.extensions}`));
    }

    for (const option of options.extensions) {
      if (typeof option !== 'string') {
        compilation.errors.push(error(`Invalid type for options.extensions.${option}
  Expected: string
  Found:    ${typeof option}`));
      }
    }
  }

  options.enforceForAllBundles = options.enforceForAllBundles ?? false;

  return options;
};

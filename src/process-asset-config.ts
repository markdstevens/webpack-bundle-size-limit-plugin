import {
  Config,
  BundleWithAdditions,
  WebpackBundleSizeLimitPluginOptions
} from './types';
import { Compilation } from './webpack-bundle-size-limit-plugin';
import { error } from './error';

export const processAssetConfig = (
  fileName: string,
  config: Config,
  compilation: Compilation,
  options: WebpackBundleSizeLimitPluginOptions
): BundleWithAdditions | null => {
  const key = options.key ?? 'bundles';
  const bundles = config[key].filter(bundle => bundle.name === fileName);
  if (bundles && bundles.length) {
    return bundles[0];
  }

  const match = config[key]
    .map(bundle => ({ regex: new RegExp(bundle.name), fileName }))
    .filter(fileRegexObj => fileRegexObj.regex.test(fileName));

  if (match && match.length) {
    if (match.length === 1) {
      return config[key].filter(
        bundle =>
          new RegExp(bundle.name).toString() === match[0].regex.toString()
      )[0];
    }
    compilation.errors.push(
      error(
        `File "${fileName}" matches multiple patterns: ${match
          .map(config => `"${config.fileName}"`)
          .join(', ')}`
      )
    );
    return null;
  }

  const err = error(`No config entry for ${fileName}`);
  if (options.enforceForAllBundles === true) {
    compilation.errors.push(err);
  } else {
    compilation.warnings.push(err);
  }
  return null;
};

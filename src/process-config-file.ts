import { existsSync } from 'fs';
import { error } from './error';
import { Config } from './types';
import { sizeUnits } from './size-units';
import { Compilation } from './webpack-bundle-size-limit-plugin';
import { parseMaxSize } from './max-size-regex';

export const getConfigFilePath = (
  options: WebpackBundleSizeLimitPluginOpts,
  compilation: Compilation
): string | null => {
  const packageJsonFile = `${process.cwd()}/package.json`;
  if (options.config) {
    if (!existsSync(options.config)) {
      compilation.errors.push(error(`File "${options.config}" does not exist`));
    } else {
      return options.config;
    }
  } else {
    if (!existsSync(packageJsonFile)) {
      compilation.errors.push(
        error(`No package.json exists at "${packageJsonFile}"`)
      );
    }
    return packageJsonFile;
  }
  return null;
};

const getConfig = (
  configPath: string,
  compilation: Compilation
): Config | null => {
  try {
    return require(configPath);
  } catch (e) {
    compilation.errors.push(
      error([`Failed to require config file at "${configPath}"`])
    );
    return null;
  }
};

export const processConfigFile = (
  configPath: string,
  compilation: Compilation
): Config | null => {
  const rawConfig = getConfig(configPath, compilation);

  if (rawConfig) {
    const clonedConfig = Object.assign({}, rawConfig);

    if (!clonedConfig.bundles) {
      compilation.errors.push(
        error('Config object must have a "bundles" field')
      );
      return null;
    }

    if (!(clonedConfig.bundles instanceof Array)) {
      compilation.errors.push(
        error([
          'Invalid type for config.bundles',
          'Expected: Array',
          `Found:    ${typeof clonedConfig.bundles}`
        ])
      );
      return null;
    }

    clonedConfig.bundles.forEach(bundle => {
      if (!bundle.name) {
        compilation.errors.push(
          error('Config entry is missing "name" property')
        );
        return;
      }

      if (typeof bundle.name !== 'string') {
        compilation.errors.push(
          error([
            `Invalid type for "name" field in config`,
            'Expected: string',
            `Found:    ${typeof bundle.name})`
          ])
        );
        return;
      }

      if (!bundle.maxSize) {
        compilation.errors.push(
          error(
            `Config entry with name "${bundle.name}" is missing "maxSize" property`
          )
        );
        return;
      }

      if (typeof bundle.maxSize !== 'string') {
        compilation.errors.push(
          error([
            `Invalid type for "maxSize" field in config entry with name "${bundle.name}".`,
            'Expected: string',
            `Found:    ${typeof bundle.maxSize})`
          ])
        );
        return;
      }

      const { unParsedSize, unitForIndex } = parseMaxSize(bundle.maxSize);

      const isValidUnit = Object.keys(sizeUnits).some(
        validUnit => validUnit === unitForIndex
      );

      if (!isValidUnit) {
        compilation.errors.push(
          error([
            `Invalid file size unit for "maxSize" field in config entry with name "${bundle.name}"`,
            'See the README for details on valid units.'
          ])
        );
        return;
      }

      try {
        const parsedSize = parseFloat(unParsedSize as any);
        if (isNaN(parsedSize)) throw new Error();

        if (unitForIndex) {
          bundle.unit = unitForIndex;
          bundle.maxSizeInBytes = parsedSize * sizeUnits[unitForIndex];
        }
      } catch (e) {
        compilation.errors.push(
          error([
            `Invalid number for "maxSize" field in config entry with name "${bundle.name}"`,
            'Expected: valid number',
            `Found:    ${unParsedSize}`
          ])
        );

        return;
      }
    });

    return clonedConfig;
  }

  return null;
};

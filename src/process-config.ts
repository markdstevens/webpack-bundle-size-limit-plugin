import { existsSync } from 'fs';
import { error } from './error';
import { BundleConstraintPluginOptions, Config } from './types';
import { fileSizeDenominations } from './file-size-denominations';
import { Compilation } from './bundle-constraint-plugin';

export const processConfig = (
  options: BundleConstraintPluginOptions,
  compilation: Compilation,
): string | null => {
  let configFile = null;
  if (options.config) {
    if (!existsSync(options.config)) {
      compilation.errors.push(error(`File "${options.config}" does not exist`));
    } else {
      configFile = options.config;
    }
  } else {
    const pkgFile = `${process.cwd()}/package.json`;
    if (!existsSync(pkgFile)) {
      compilation.errors.push(error(`No package.json exists at "${pkgFile}"`));
    } else {
      configFile = pkgFile;
    }
  }
  return configFile;
};

export const prepareConfig = (
  rawConfig: Config | null,
  compilation: Compilation,
): Config | null => {
  const config = Object.assign({}, rawConfig);
  if (!config.bundles) {
    compilation.errors.push(error('Config object must have a "bundles" field'));
    return null;
  }

  if (!(config.bundles instanceof Array)) {
    compilation.errors.push(
      error(`Invalid type for config.bundles.
  Expected: Array
  Found:    ${typeof config.bundles}`),
    );
    return null;
  }

  config.bundles.forEach(bundle => {
    if (!bundle.name) {
      compilation.errors.push(error('Config entry is missing "name" property'));
      return;
    }

    if (!bundle.maxSize) {
      compilation.errors.push(
        error(
          `Config entry with name "${bundle.name}" is missing "maxSize" property`,
        ),
      );
      return;
    }

    if (typeof bundle.maxSize !== 'string') {
      compilation.errors.push(
        error(`Invalid type for "maxSize" field in config entry with name "${
          bundle.name
        }".
  Expected: string
  Found:    ${typeof bundle.maxSize}`),
      );
      return;
    }

    const sizeDenomination = bundle.maxSize.substring(
      bundle.maxSize.length - 1,
    );
    const isSizeDenominationValid = Object.keys(fileSizeDenominations).some(
      validSizeDenomination => validSizeDenomination === sizeDenomination,
    );
    if (!isSizeDenominationValid) {
      compilation.errors.push(
        error(`Invalid file size denomination for "maxSize" field in config entry with name "${bundle.name}"
  Expected: one of ["B", "K", "M", "G"]
  Found:    ${sizeDenomination}`),
      );
      return;
    }

    const unitlessSize = bundle.maxSize.substring(0, bundle.maxSize.length - 1);
    let parsedUnitlessSize = 1;
    try {
      parsedUnitlessSize = parseFloat(unitlessSize);
      if (isNaN(parsedUnitlessSize)) {
        throw new Error();
      }
    } catch (e) {
      compilation.errors.push(
        error(`Invalid number for "maxSize" field in config entry with name "${bundle.name}" 
  Expected: valid number
  Found:    ${unitlessSize}`),
      );
      return;
    }

    bundle.maxSizeInBytes =
      parsedUnitlessSize * fileSizeDenominations[sizeDenomination];
    bundle.unit = sizeDenomination;
  });

  return config;
};

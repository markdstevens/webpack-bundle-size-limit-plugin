import { processConfig, prepareConfig } from './process-config';
import { fileSizeDenominations } from './file-size-denominations';
import { BundleConstraintPluginOptions, Config, Bundle } from './types';
import { Compiler, compilation as compilationType } from 'webpack';
import { processOptions } from './process-options';
import { execSync } from 'child_process';
import { error } from './error';

export type Compilation = compilationType.Compilation;

class BundleConstraintPlugin {
  private options: BundleConstraintPluginOptions | null = null;

  constructor(options: BundleConstraintPluginOptions = {}) {
    this.options = options;
  }

  private filterAssetByFileExtension(file: string): boolean {
    if (this.options?.extensions?.length) {
      return !this.options.extensions?.some(ext => file.endsWith(ext));
    }
    return false;
  }

  private getConfig(
    fileName: string,
    config: Config,
    compilation: Compilation,
    options: BundleConstraintPluginOptions,
  ): Bundle | null {
    const bundles = config?.bundles.filter(bundle => bundle.name === fileName);
    if (bundles && bundles.length) {
      return bundles[0];
    }

    const match = config?.bundles
      .map(bundle => ({ regex: new RegExp(bundle.name), fileName }))
      .filter(fileRegexObj => fileRegexObj.regex.test(fileName));

    if (match && match.length) {
      if (match.length === 1) {
        return config?.bundles.filter(
          bundle =>
            new RegExp(bundle.name).toString() === match[0].regex.toString(),
        )[0];
      }
      compilation.errors.push(
        error(
          `File "${fileName}" matches multiple patterns: ${match
            .map(config => `"${config.fileName}"`)
            .join(', ')}`,
        ),
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
  }

  private fromByteToX(numBytes: number, unit: string): string {
    return `${Math.round((numBytes / fileSizeDenominations[unit]) * 100) /
      100}${unit}`;
  }

  apply(compiler: Compiler): void {
    compiler.hooks.emit.tapAsync(
      'BundleConstraintPlugin',
      (compilation: Compilation, callback: any) => {
        const options = processOptions(this.options, compilation);
        const configFile = processConfig(options, compilation);

        if (configFile) {
          const config = prepareConfig(require(configFile), compilation);

          if (config) {
            for (const asset in compilation.assets) {
              if (!this.filterAssetByFileExtension(asset)) {
                const fileWithConfig = {
                  fileName: asset,
                  size: parseFloat(
                    execSync(
                      `wc -c dist/${asset} | awk '{$1=$1};1' | cut -d$' ' -f1`,
                    )
                      .toString()
                      .trim(),
                  ),
                  config: this.getConfig(asset, config, compilation, options),
                };

                if (
                  fileWithConfig.config &&
                  fileWithConfig.size > fileWithConfig.config.maxSizeInBytes
                ) {
                  compilation.errors.push(
                    error(`Bundle size exceeded.
  Bundle name:  ${fileWithConfig.fileName}
  Bundle size:  ${this.fromByteToX(
    fileWithConfig.size,
    fileWithConfig.config.unit,
  )}
  Bundle limit: ${fileWithConfig.config.maxSize}
    `),
                  );
                }
              }
            }
          }
        }

        callback();
      },
    );
  }
}

module.exports = BundleConstraintPlugin;

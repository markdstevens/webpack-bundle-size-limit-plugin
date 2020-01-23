import { getConfigFilePath, processConfigFile } from './process-config-file';
import { sizeUnits } from './size-units';
import { Bundle } from './types';
import { Compiler, compilation as compilationType } from 'webpack';
import { processOptions } from './process-options';
import { processAssetConfig } from './process-asset-config';
import { execSync } from 'child_process';
import { error } from './error';
import { parseMaxSize } from './parse-max-size';

export type Compilation = compilationType.Compilation;

class WebpackBundleSizeLimitPlugin {
  private options: WebpackBundleSizeLimitPluginOpts | null = null;

  constructor(options: WebpackBundleSizeLimitPluginOpts = {}) {
    this.options = options;
  }

  private filterAssetByFileExtension(file: string): boolean {
    let shouldFilter = false;

    if (this.options?.include?.length) {
      shouldFilter = !this.options.include.some(ext => file.endsWith(ext));
    }

    if (this.options?.exclude?.length) {
      shouldFilter = this.options.exclude.some(ext => file.endsWith(ext));
    }

    return shouldFilter;
  }

  private fromByteToX(numBytes: number, config: Bundle): string {
    const { unitForIndex, hasSpace, exactUnit } = parseMaxSize(config.maxSize);
    const unit = unitForIndex as string;
    const rawSize = Math.round((numBytes / sizeUnits[unit]) * 100) / 100;

    return `${rawSize}${hasSpace ? ' ' : ''}${exactUnit}`;
  }

  private getSizeInBytes(asset: string, { outputPath }: Compiler): number {
    return parseFloat(
      execSync(
        `wc -c ${outputPath}/${asset} | awk '{$1=$1};1' | cut -d$' ' -f1`
      )
        .toString()
        .trim()
    );
  }

  apply(compiler: Compiler): void {
    compiler.hooks.afterEmit.tapAsync(
      'WebpackBundleSizeLimitPlugin',
      (compilation: Compilation, callback: any) => {
        const options = processOptions(this.options, compilation);
        const configFilePath = getConfigFilePath(options, compilation);

        if (configFilePath) {
          const config = processConfigFile(configFilePath, compilation);

          if (config) {
            for (const asset in compilation.assets) {
              if (!this.filterAssetByFileExtension(asset)) {
                const fileWithAssetConfig = {
                  asset,
                  sizeInBytes: this.getSizeInBytes(asset, compiler),
                  config: processAssetConfig(
                    asset,
                    config,
                    compilation,
                    options
                  )
                };

                if (
                  fileWithAssetConfig.config &&
                  fileWithAssetConfig.sizeInBytes >
                    fileWithAssetConfig.config.maxSizeInBytes
                ) {
                  compilation.errors.push(
                    error([
                      'Bundle size exceeded.',
                      `Bundle name:  ${fileWithAssetConfig.asset}`,
                      `Bundle size:  ${this.fromByteToX(
                        fileWithAssetConfig.sizeInBytes,
                        fileWithAssetConfig.config
                      )}`,
                      `Bundle limit: ${fileWithAssetConfig.config.maxSize}`
                    ])
                  );
                }
              }
            }
          }
        }
        callback();
      }
    );
  }
}

module.exports = WebpackBundleSizeLimitPlugin;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ts_schema_utils_1 = __importDefault(require("ts-schema-utils"));
const process_config_1 = require("./process-config");
const file_size_denominations_1 = require("./file-size-denominations");
const options_schema_1 = require("./options-schema");
const process_options_1 = require("./process-options");
const child_process_1 = require("child_process");
const error_1 = require("./error");
class BundleConstraintPlugin {
    constructor(options = {}) {
        this.options = null;
        ts_schema_utils_1.default(options_schema_1.optionsSchema, options, 'BundleConstraintPlugin');
        this.options = options;
    }
    filterAssetByFileExtension(file) {
        var _a, _b, _c;
        if ((_b = (_a = this.options) === null || _a === void 0 ? void 0 : _a.extensions) === null || _b === void 0 ? void 0 : _b.length) {
            return !((_c = this.options.extensions) === null || _c === void 0 ? void 0 : _c.some(ext => file.endsWith(ext)));
        }
        return false;
    }
    getConfig(fileName, config, compilation, options) {
        var _a, _b, _c;
        const bundles = (_a = config) === null || _a === void 0 ? void 0 : _a.bundles.filter(bundle => bundle.name === fileName);
        if (bundles && bundles.length) {
            return bundles[0];
        }
        const match = (_b = config) === null || _b === void 0 ? void 0 : _b.bundles.map(bundle => ({ regex: new RegExp(bundle.name), fileName })).filter(fileRegexObj => fileRegexObj.regex.test(fileName));
        if (match && match.length) {
            if (match.length === 1) {
                return (_c = config) === null || _c === void 0 ? void 0 : _c.bundles.filter(bundle => new RegExp(bundle.name).toString() === match[0].regex.toString())[0];
            }
            compilation.errors.push(error_1.error(`File "${fileName}" matches multiple patterns: ${match.map(config => `"${config.fileName}"`).join(', ')}`));
            return null;
        }
        const err = error_1.error(`No config entry for ${fileName}`);
        if (options.enforceForAllBundles === true) {
            compilation.errors.push(err);
        }
        else {
            compilation.warnings.push(err);
        }
        return null;
    }
    ;
    fromByteToX(numBytes, unit) {
        return `${Math.round((numBytes / file_size_denominations_1.fileSizeDenominations[unit]) * 100) / 100}${unit}`;
    }
    apply(compiler) {
        compiler.hooks.emit.tapAsync('BundleConstraintPlugin', (compilation, callback) => {
            const options = process_options_1.processOptions(this.options, compilation);
            const configFile = process_config_1.processConfig(options, compilation);
            if (configFile) {
                const config = process_config_1.prepareConfig(require(configFile), compilation);
                if (config) {
                    for (const asset in compilation.assets) {
                        if (!this.filterAssetByFileExtension(asset)) {
                            const fileWithConfig = {
                                fileName: asset,
                                size: parseFloat(child_process_1.execSync(`wc -c dist/${asset} | awk '{$1=$1};1' | cut -d$' ' -f1`).toString().trim()),
                                config: this.getConfig(asset, config, compilation, options)
                            };
                            if (fileWithConfig.config && fileWithConfig.size > fileWithConfig.config.maxSizeInBytes) {
                                compilation.errors.push(error_1.error(`Bundle size exceeded.
  Bundle name:  ${fileWithConfig.fileName}
  Bundle size:  ${this.fromByteToX(fileWithConfig.size, fileWithConfig.config.unit)}
  Bundle limit: ${fileWithConfig.config.maxSize}
    `));
                            }
                        }
                    }
                }
            }
            callback();
        });
    }
}
module.exports = BundleConstraintPlugin;

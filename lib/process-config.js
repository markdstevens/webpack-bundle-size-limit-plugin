"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const error_1 = require("./error");
const file_size_denominations_1 = require("./file-size-denominations");
exports.processConfig = (options, compilation) => {
    let configFile = null;
    if (options.config) {
        if (!fs_1.existsSync(options.config)) {
            compilation.errors.push(error_1.error(`File "${options.config}" does not exist`));
        }
        else {
            configFile = options.config;
        }
    }
    else {
        const pkgFile = `${process.cwd()}/package.json`;
        if (!fs_1.existsSync(pkgFile)) {
            compilation.errors.push(error_1.error(`No package.json exists at "${pkgFile}"`));
        }
        else {
            configFile = pkgFile;
        }
    }
    return configFile;
};
exports.prepareConfig = (rawConfig, compilation) => {
    const config = Object.assign({}, rawConfig);
    if (!config.bundles) {
        compilation.errors.push(error_1.error('Config object must have a "bundles" field'));
        return null;
    }
    if (!(config.bundles instanceof Array)) {
        compilation.errors.push(error_1.error(`Invalid type for config.bundles.
  Expected: Array
  Found:    ${typeof config.bundles}`));
        return null;
    }
    config.bundles.forEach(bundle => {
        if (!bundle.name) {
            compilation.errors.push(error_1.error('Config entry is missing "name" property'));
            return;
        }
        if (!bundle.maxSize) {
            compilation.errors.push(error_1.error(`Config entry with name "${bundle.name}" is missing "maxSize" property`));
            return;
        }
        if (typeof bundle.maxSize !== 'string') {
            compilation.errors.push(error_1.error(`Invalid type for "maxSize" field in config entry with name "${bundle.name}".
  Expected: string
  Found:    ${typeof bundle.maxSize}`));
            return;
        }
        const sizeDenomination = bundle.maxSize.substring(bundle.maxSize.length - 1);
        const isSizeDenominationValid = Object.keys(file_size_denominations_1.fileSizeDenominations).some(validSizeDenomination => validSizeDenomination === sizeDenomination);
        if (!isSizeDenominationValid) {
            compilation.errors.push(error_1.error(`Invalid file size denomination for "maxSize" field in config entry with name "${bundle.name}"
  Expected: one of ["B", "K", "M", "G"]
  Found:    ${sizeDenomination}`));
            return;
        }
        let unitlessSize = bundle.maxSize.substring(0, bundle.maxSize.length - 1);
        let parsedUnitlessSize = 1;
        try {
            parsedUnitlessSize = parseFloat(unitlessSize);
            if (isNaN(parsedUnitlessSize)) {
                throw new Error();
            }
        }
        catch (e) {
            compilation.errors.push(error_1.error(`Invalid number for "maxSize" field in config entry with name "${bundle.name}" 
  Expected: valid number
  Found:    ${unitlessSize}`));
            return;
        }
        bundle.maxSizeInBytes = parsedUnitlessSize * (file_size_denominations_1.fileSizeDenominations[sizeDenomination]);
        bundle.unit = sizeDenomination;
    });
    return config;
};

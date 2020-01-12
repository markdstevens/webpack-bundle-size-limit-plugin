"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const error_1 = require("./error");
exports.processOptions = (rawOptions, compilation) => {
    var _a, _b;
    const options = Object.assign({}, rawOptions);
    options.extensions = (_a = options.extensions, (_a !== null && _a !== void 0 ? _a : ['js']));
    if (options.extensions) {
        if (!(options.extensions instanceof Array)) {
            compilation.errors.push(error_1.error(`Invalid type for options.extensions.
  Expected: Array
  Found:    ${typeof options.extensions}`));
        }
        for (const option of options.extensions) {
            if (typeof option !== 'string') {
                compilation.errors.push(error_1.error(`Invalid type for options.extensions.${option}
  Expected: string
  Found:    ${typeof option}`));
            }
        }
    }
    options.enforceForAllBundles = (_b = options.enforceForAllBundles, (_b !== null && _b !== void 0 ? _b : false));
    return options;
};

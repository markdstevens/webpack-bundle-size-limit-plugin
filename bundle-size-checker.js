const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const config = require('../bundle-size.conf.js');

const inputDir = path.join(__dirname, '../dist');

const exitWithError = (err) => {
  console.error(err);
  process.exit(1);
};

const validSizes = {
  B: Math.pow(2, 0),
  K: Math.pow(2, 10),
  M: Math.pow(2, 20),
  G: Math.pow(2, 30),
  T: Math.pow(2, 40)
};

// validate and modify config
Object.keys(config).forEach(configKey => {
  const configEntry = config[configKey];
  if (!configEntry.maxSize) {
    exitWithError(`bundle-size config entry "${configKey}" is missing "maxSize" property`);
  }

  if (typeof configEntry.maxSize !== 'string') {
    exitWithError(`bundle-size config entry "${configKey}.maxSize" must be of type "string", but found "${typeof configEntry.maxSize}"`);
  }

  const sizeDenomination = configEntry.maxSize.substring(configEntry.maxSize.length - 1);
  const isSizeDenominationValid = Object.keys(validSizes).some(validSizeDenomination => validSizeDenomination === sizeDenomination);
  if (!isSizeDenominationValid) {
    exitWithError(`bundle-size config entry "${configKey}.maxSize" must end with one of the following size denominations: ["B", "K", "M", "G"]`);
  }

  const maxSize = configEntry.maxSize;

  let unitlessSize = configEntry.maxSize.substring(0, configEntry.maxSize.length - 1);
  let parsedUnitlessSize;
  try {
    parsedUnitlessSize = parseFloat(unitlessSize);
    if (isNaN(parsedUnitlessSize)) {
      throw new Error();
    }
  } catch (e) {
    exitWithError(`bundle-size config entry "${configKey}.maxSize" must be a valid number. Found "${unitlessSize}"`);
  }

  config[configKey].maxSize = parsedUnitlessSize * (validSizes[sizeDenomination]);
  config[configKey].unit = sizeDenomination;
  config[configKey].rawValue = maxSize;
});

const fromByteToX = (numBytes, unit) => {
  return `${Math.round((numBytes / validSizes[unit]) * 100) / 100}${unit}`;
};

const getConfig = (fileName) => {
  if (config[fileName]) {
    return config[fileName];
  }

  const match = Object.keys(config)
    .map(fileName => ({regex: new RegExp(fileName), fileName }))
    .filter(fileRegexObj => fileRegexObj.regex.test(fileName));

  if (match && match.length) {
    if (match.length === 1) {
      return config[match[0].fileName];
    }
  }
  return (match && match.length) ? match : null;
};

fs.readdirSync(inputDir)
  .filter(file => file.endsWith('.js') || file.endsWith('.css') || file.endsWith('.json'))
  .map(fileName => ({
    fileName,
    size: parseInt(execSync(`wc -c dist/${fileName} | awk '{$1=$1};1' | cut -d$' ' -f1`).toString().trim()),
    config: getConfig(fileName)
  }))
  .filter(fileWithConfig => {
    if (!fileWithConfig.config) {
      console.warn(`no config entry for ${fileWithConfig.fileName}`);
    }
    if (fileWithConfig.config instanceof Array) {
      if (fileWithConfig.config.length === 1) {
        fileWithConfig.config = fileWithConfig.config[0].toString();
      } else {
        exitWithError(`file "${fileWithConfig.fileName}" matches multiple patterns: ${fileWithConfig.config.map(config => `"${config.fileName}"`).join(', ')}`);
      }
    }
    return !!fileWithConfig.config
  })
  .filter(fileWithConfig => fileWithConfig.size > fileWithConfig.config.maxSize)
  .map(invalidBundle => {
    return `bundle size exceeded for bundle "${invalidBundle.fileName}". 
  Bundle size:  ${fromByteToX(invalidBundle.size, invalidBundle.config.unit)}
  Bundle limit: ${invalidBundle.config.rawValue}
`;
  }).map(invalidBundle => {
    console.error(invalidBundle);
    return invalidBundle;
  }).forEach(invalidBundle => process.exit(1));

const basicError = (err: string): string =>
  `webpack-bundle-size-limit-plugin. ${err}`;

export const error = (errors: string[] | string): string => {
  if (!errors.length) {
    return '';
  }

  if (typeof errors === 'string') {
    return basicError(errors);
  }

  if (errors.length === 1) {
    return basicError(errors[0]);
  }

  let errorStr = `${basicError(errors[0])}`;
  for (let i = 1; i < errors.length; i++) {
    errorStr += `\n  ${errors[i]}`;
  }
  return errorStr;
};

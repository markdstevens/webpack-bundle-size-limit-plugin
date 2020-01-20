const basicError = (err: string | undefined): string =>
  `webpack-bundle-size-limit-plugin. ${err}`;

export const error = (errors: string[] | string): string => {
  if (!errors.length) return '';
  if (typeof errors === 'string') return basicError(errors);
  if (errors.length === 1) return basicError(errors[0]);

  const errorTitle = errors.shift();
  return errors.reduce(
    (str, nextLine) => (str += `\n  ${nextLine}`),
    `${basicError(errorTitle)}`
  );
};

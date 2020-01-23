import { error } from 'src/error';

describe('error', () => {
  it('returns empty string when input is empty', () => {
    const resultForEmptyString = error('');
    const resultForEmptyArray = error([]);

    expect(resultForEmptyString).toBe('');
    expect(resultForEmptyArray).toBe('');
  });

  it('returns something when a single string is passed', () => {
    const resultForSingleString = error('a string!');
    const resultForSingleStringInArray = error(['a string in an array!']);

    expect(resultForSingleString).toEqual(
      'webpack-bundle-size-limit-plugin. a string!'
    );
    expect(resultForSingleStringInArray).toEqual(
      'webpack-bundle-size-limit-plugin. a string in an array!'
    );
  });

  it('correctly format multiline errors', () => {
    const result = error(['Line 1', 'Line 2']);

    expect(result).toEqual(
      `webpack-bundle-size-limit-plugin. Line 1\n  Line 2`
    );
  });
});

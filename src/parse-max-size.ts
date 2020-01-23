const maxSizeRegex = /^(?<unParsedSize>(?:[0-9]+|[0-9]*\.[0-9]+))(?<space>\s)?(?<unit>[A-Za-z]+)$/;

interface MaxSize {
  exactUnit: string | null;
  unitForIndex: string | null;
  unParsedSize: string | null;
  hasSpace: boolean;
}

export const parseMaxSize = (maxSize: string): MaxSize => {
  const result = maxSize.match(maxSizeRegex);

  if (result && result.groups) {
    const { unit, unParsedSize, space } = result.groups;

    return {
      exactUnit: unit,
      unitForIndex: unit.toUpperCase(),
      unParsedSize: unParsedSize,
      hasSpace: Boolean(space)
    };
  }

  return {
    exactUnit: null,
    unitForIndex: null,
    unParsedSize: null,
    hasSpace: false
  };
};

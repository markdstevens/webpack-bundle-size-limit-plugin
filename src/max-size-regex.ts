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
    const { unit } = result.groups;

    return {
      exactUnit: unit ?? null,
      unitForIndex: unit?.toUpperCase() ?? null,
      unParsedSize: result.groups.unParsedSize ?? null,
      hasSpace: Boolean(result.groups.space)
    };
  }

  return {
    exactUnit: null,
    unitForIndex: null,
    unParsedSize: null,
    hasSpace: false
  };
};

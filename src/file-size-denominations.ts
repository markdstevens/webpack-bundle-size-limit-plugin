interface FileSizeDenomination {
  [key: string]: number;
}

export const fileSizeDenominations: FileSizeDenomination = {
  B: Math.pow(2, 0),
  K: Math.pow(2, 10),
  M: Math.pow(2, 20),
  G: Math.pow(2, 30),
  T: Math.pow(2, 40),
};

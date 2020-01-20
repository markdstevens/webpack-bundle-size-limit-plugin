export interface BundleAdditions {
  name: string;
  unit: string;
  maxSizeInBytes: number;
}

export interface Bundle {
  maxSize: string;
}

export type BundleWithAdditions = Bundle & BundleAdditions;

export interface Config {
  bundles: BundleWithAdditions[];
}

export interface BundleConstraintPluginOptions {
  /**
   * Absolute path to config file. If not specified, the "bundles" field in
   * package.json will be used. If that field does not exist, an error will
   * be thrown.
   */
  config?: string;
  /**
   * By default, all bundles will be analyzed. If specified, the extensions
   * field narrows down that list to only those bundles with an extension
   * specified in the list.
   */
  extensions?: string[];
  /**
   * By default, this is false. If a bundle is generated by webpack but is not
   * found in the config file, a warning will be logged. If the flag is set
   * to "true", an error will be logged and will fail the webpack build.
   */
  enforceForAllBundles?: boolean;
}

export interface Bundle {
  name: string;
  unit: string;
  maxSize: string;
  maxSizeInBytes: number;
}

export interface Config {
  bundles: Bundle[];
}

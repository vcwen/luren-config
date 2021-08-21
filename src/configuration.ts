import { CONFIG_METADATA_KEY } from './inject-env';

export interface ClassConstructor<T = any> {
  new (...args: unknown[]): T;
}
/**
 * Configuration decorator, decorate the class that will be an configuration
 */
export const Configuration =
  () =>
  (target: ClassConstructor): ClassConstructor => {
    return class ConfigClass extends target {
      constructor() {
        super();
        const props = Reflect.getMetadata(
          CONFIG_METADATA_KEY,
          target.prototype,
        );
        Object.assign(this, props);
      }
    };
  };

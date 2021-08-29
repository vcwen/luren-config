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
    const handler = {
      construct(target: ClassConstructor, args: any[]): any {
        const instance = new target(...args);
        const props = Reflect.getMetadata(
          CONFIG_METADATA_KEY,
          target.prototype,
        );
        Object.assign(instance, props);
        return instance;
      },
    };
    const ProxyClass = new Proxy(target, handler);
    return ProxyClass;
  };

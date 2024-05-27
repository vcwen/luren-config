import { InvalidEnvError, RequiredEnvError } from './errors';

export const CONFIG_METADATA_KEY = Symbol('config');
export const SKIP_UNSET_ENV = 'SKIP_UNSET_ENV';
const skipUnsetEnv = (): boolean => !!process.env[SKIP_UNSET_ENV];

const isNil = (val: unknown): boolean => val == null;

export interface InjectEnvOptions<T = unknown> {
  validate?: (val: string) => boolean;
  transform?: (val: string) => T;
  required?: boolean;
  default?: T;
  description?: string;
}
/**
 *
 * @param {string} name - name of the environment variable
 * @param {object} options - env options
 * @param {boolean} options.required - if the env is required, default is true, it will be false if options.default is set
 * @param {function} options.validate - validate the env string value
 * @param {function} options.transform - to transform string value to expected type
 * @param {any} options.default - default value
 * @param {string} options.description - environment variable description
 */
export const InjectEnv = <T>(
  name: string,
  options?: InjectEnvOptions<T>,
): PropertyDecorator => {
  const required =
    options?.required === false || !isNil(options?.default) ? false : true;
  return (target, prop): void => {
    const env = Reflect.get(process.env, name);
    let val: T | undefined;
    if (!env) {
      val = options?.default;
      if (isNil(val) && required && !skipUnsetEnv()) {
        throw new RequiredEnvError(name);
      }
    } else {
      if (options?.validate) {
        try {
          const valid = options.validate(env);
          if (!valid) {
            throw new InvalidEnvError(name, env);
          }
        } catch (err: any) {
          throw new InvalidEnvError(name, env, err?.message);
        }
      }
      if (options?.transform) {
        val = options.transform(env);
      } else {
        val = env as T;
      }
    }
    const props = Reflect.getMetadata(CONFIG_METADATA_KEY, target) ?? {};
    if (!isNil(val)) {
      Reflect.defineMetadata(
        CONFIG_METADATA_KEY,
        { ...props, [prop]: val },
        target,
      );
    }
  };
};

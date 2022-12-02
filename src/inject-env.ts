import {
  EnvException,
  InvalidPropValueException,
  RequiredPropValueException,
} from './errors';
import { getPropValue, GetPropValueOptions } from './get-prop-value';
import { ConfigurableProp } from './inject-prop';
import { METADATA_KEY_CONFIGURABLE_PROPS } from './metadata-key';
import 'reflect-metadata';

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
  options?: Exclude<GetPropValueOptions<T>, 'dataType'>,
): PropertyDecorator => {
  return (target, prop): void => {
    const dataType = Reflect.getOwnMetadata('design:type', target, prop);
    try {
      const val = getPropValue(process.env, name, { ...options, dataType });
      Object.defineProperty(target, prop, {
        value: val,
        writable: false,
        enumerable: true,
      });

      const processor = (): T | undefined =>
        getPropValue(process.env, name, { ...options, dataType });
      const configurableProp: ConfigurableProp = {
        dataType,
        processor,
      };
      const props: { [key: string]: ConfigurableProp } =
        Reflect.getMetadata(METADATA_KEY_CONFIGURABLE_PROPS, target) ?? {};
      Reflect.defineMetadata(
        METADATA_KEY_CONFIGURABLE_PROPS,
        { ...props, [prop]: configurableProp },
        target,
      );
    } catch (err) {
      if (err instanceof RequiredPropValueException) {
        throw new EnvException(`env ${err.valueName} is required`);
      } else if (err instanceof InvalidPropValueException) {
        throw new EnvException(
          `env ${err.valueName} has the invalid value:${err.value}${
            err.message ? `, reason:${err.message}` : ''
          }`,
        );
      } else {
        throw err;
      }
    }
  };
};

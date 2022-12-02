import { getPropValue, GetPropValueOptions } from './get-prop-value';
import { METADATA_KEY_CONFIGURABLE_PROPS } from './metadata-key';

export interface ConfigurableProp {
  // eslint-disable-next-line @typescript-eslint/ban-types
  dataType: string | Function;
  processor: (data?: any) => any;
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
export const InjectProp = <T>(
  options?: { name?: string } & Exclude<GetPropValueOptions<T>, 'dataType'>,
): PropertyDecorator => {
  return (target, prop): void => {
    const dataType = Reflect.getOwnMetadata('design:type', target, prop);
    const name = options?.name ?? (prop as string);
    const processor = (data: Record<string, any>): T | undefined =>
      getPropValue(data, name, { ...options, dataType });
    const configurableProp: ConfigurableProp = {
      dataType,
      processor,
    };
    const props =
      Reflect.getMetadata(METADATA_KEY_CONFIGURABLE_PROPS, target) ?? {};
    Reflect.defineMetadata(
      METADATA_KEY_CONFIGURABLE_PROPS,
      { ...props, [prop]: configurableProp },
      target,
    );
  };
};

import fs from 'fs';
import { parse as parseYaml } from 'yaml';
import { METADATA_KEY_CONFIGURABLE_PROPS } from './metadata-key';
import Path from 'path';
import { ConfigurableProp } from './inject-prop';

export interface ClassConstructor<T extends typeof Object = any> {
  new (...args: unknown[]): T;
}

export interface ConfigSource {
  filepath: string;
  format?: 'yaml' | 'json';
}

const getDataFromSource = (source: ConfigSource): any => {
  const filepath = source.filepath;
  const format = source.format ?? 'yaml';
  const content = fs.readFileSync(
    Path.resolve(process.cwd(), filepath),
    'utf-8',
  );
  switch (format) {
    case 'yaml': {
      return parseYaml(content);
    }
    case 'json': {
      return JSON.parse(content);
    }
    default: {
      throw new Error(`unsupported data format:${format}`);
    }
  }
};

const setValues = (data: any, target: any): void => {
  const props: { [key: string]: ConfigurableProp } = Reflect.getMetadata(
    METADATA_KEY_CONFIGURABLE_PROPS,
    target,
  );
  if (props) {
    for (const prop of Object.keys(props)) {
      const val = props[prop].processor(data);
      const dataType = props[prop].dataType;
      if (
        typeof dataType === 'function' &&
        Reflect.hasMetadata(METADATA_KEY_CONFIGURABLE_PROPS, dataType.prototype)
      ) {
        const instance = new (dataType as any)();
        setValues(val, instance);
        Object.defineProperty(target, prop, {
          value: instance,
          writable: false,
          enumerable: true,
        });
      } else {
        Object.defineProperty(target, prop, {
          value: val,
          writable: false,
          enumerable: true,
        });
      }
    }
  }
};

/**
 * Configuration decorator, decorate the class that will be used as an configuration
 */
export const Configuration =
  (source?: ConfigSource) =>
  // eslint-disable-next-line @typescript-eslint/ban-types
  (target: Function): any => {
    const data = source ? getDataFromSource(source) : process.env;
    setValues(data, target);
    const handler = {
      construct(TargetConstruct: ClassConstructor, args: any[]): any {
        const instance = new TargetConstruct(...args);
        setValues(data, instance);
        return instance;
      },
    };
    const ProxyClass = new Proxy(target, handler);
    return ProxyClass;
  };

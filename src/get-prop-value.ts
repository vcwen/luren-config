import {
  InvalidPropValueException,
  RequiredPropValueException,
} from './errors';
import { isNil } from './utils';

export interface GetPropValueOptions<T = unknown> {
  validate?: (val: T) => boolean;
  transform?: (val: any) => T;
  required?: boolean;
  dataType?: any;
  default?: T;
  description?: string;
}

export const getPropValue = <T>(
  dataSource: Record<string, any>,
  name: string,
  options?: GetPropValueOptions<T>,
): T | undefined => {
  const required = options?.required !== false;
  const originalVal = Reflect.get(dataSource, name);
  let val: T | undefined;
  if (isNil(originalVal)) {
    val = options?.default;
    if (isNil(val) && required) {
      throw new RequiredPropValueException(name, originalVal);
    }
  } else {
    if (options?.transform) {
      val = options.transform(originalVal);
    } else {
      const dataType = options?.dataType;
      switch (dataType) {
        case Number: {
          val = Number(originalVal) as any;
          if (Number.isNaN(val)) {
            throw new InvalidPropValueException(
              name,
              originalVal,
              'invalid number',
            );
          }
          break;
        }
        case Boolean: {
          if (!originalVal) {
            val = false as any;
          } else if (typeof originalVal === 'string') {
            if (
              originalVal.trim() === '' ||
              originalVal.trim() === '0' ||
              originalVal.trim() === 'false'
            ) {
              val = false as any;
            } else {
              val = true as any;
            }
          }
          break;
        }
        default:
          val = originalVal;
      }
    }
    if (!isNil(val) && options?.validate) {
      try {
        const valid = options.validate(val as T);
        if (!valid) {
          throw new InvalidPropValueException(name, originalVal);
        }
      } catch (err: any) {
        throw new InvalidPropValueException(name, originalVal, err?.message);
      }
    }
  }
  return val;
};

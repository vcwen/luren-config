import { Configuration, InjectProp } from '../src';
import { InjectEnv } from '../src';
import { EnvException } from '../src/errors';

const setEnv = (vals: Record<string, string>) => {
  const keys = Object.keys(vals);
  keys.forEach((key) => Reflect.set(process.env, key, vals[key]));
};

const unsetEnv = (vals: Record<string, string>) => {
  const keys = Object.keys(vals);
  keys.forEach((key) => Reflect.deleteProperty(process.env, key));
};

describe('InjectEnv', () => {
  it('should set the metadata', () => {
    const env = { NAME: 'vc' };
    setEnv(env);
    class Foo {
      @InjectEnv('NAME')
      public name!: string;
    }
    const foo = new Foo();
    unsetEnv(env);
    expect(foo.name).toBe('vc');
  });
  it('should throw error if env is required', () => {
    expect(() => {
      @Configuration()
      class Foo {
        @InjectEnv('NAME')
        public name: string;
      }
    }).toThrowError(EnvException);
  });
  it("should allow env not set if it' not required", () => {
    @Configuration()
    class Foo {
      @InjectEnv('NAME', { required: false })
      public name: string;
    }
    const foo = new Foo();
    expect(foo.name).toBeUndefined();
  });
  it('should use default value if env is not set ', () => {
    @Configuration()
    class Foo {
      @InjectEnv('NAME', { default: 'foo' })
      public name: string;
    }
    const foo = new Foo();
    expect(foo).toEqual({ name: 'foo' });
  });
  it('should validate the value', () => {
    const env = { PORT: '1234', BAR_PORT: 'bar' };
    setEnv(env);
    @Configuration()
    class Foo {
      @InjectEnv('PORT', { validate: (val: string) => /\d+/.test(val) })
      public port: string;
    }
    const foo = new Foo();
    expect(foo).toEqual({ port: '1234' });

    expect(() => {
      class Bar {
        @InjectEnv('BAR_PORT', { validate: (val: string) => /$\d+$/.test(val) })
        public port: number;
      }
    }).toThrowError(EnvException);
    expect(() => {
      class Bar {
        @InjectEnv('BAR_PORT', {
          validate: (val: number) => {
            if (Number.isInteger(val)) {
              return true;
            } else {
              throw new Error(`PORT must be an number`);
            }
          },
        })
        public port: number;
      }
    }).toThrowError();
    unsetEnv(env);
  });

  it('should transform the value', () => {
    const env = { NAME: 'foo', PORT: '1234' };
    setEnv(env);
    @Configuration()
    class Foo {
      @InjectEnv('PORT', {
        validate: (val) => Number.isInteger(val),
        transform: (val: string) => Number(val),
      })
      public port: number;
      @InjectEnv('NAME')
      public name: string;
    }

    const foo = new Foo();
    unsetEnv(env);
    expect(foo).toEqual({ port: 1234, name: 'foo' });
  });

  it('should set static value', () => {
    const env = { NAME: 'foo', PORT: '1234' };
    setEnv(env);
    @Configuration()
    class Foo {
      @InjectEnv('PORT', {
        validate: (val) => Number.isInteger(val),
        transform: (val: string) => Number(val),
      })
      public static port: number;
      @InjectEnv('NAME')
      public name: string;
    }

    unsetEnv(env);
    expect(Foo.port).toEqual(1234);
  });
});

describe('Configuration', () => {
  it('should get values from file', () => {
    @Configuration({ filepath: './test/config.json', format: 'json' })
    class Foo {
      @InjectProp()
      public foo: string;
      @InjectProp()
      public zee: number;
    }

    const foo = new Foo();
    expect(foo).toEqual({ foo: 'bar', zee: 1 });

    @Configuration({ filepath: './test/config.yml' })
    class Bar {
      @InjectProp()
      zee: number;

      @InjectProp()
      foo: string;

      @InjectProp({ transform: (val) => Number(val) })
      ordinal: number;
    }

    const bar = new Bar();

    expect(bar).toEqual({ foo: 'bar', ordinal: 1, zee: 1 });
  });
});

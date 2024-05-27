import { Configuration } from './';
import { InvalidEnvError, RequiredEnvError } from './';
import { InjectEnv } from './';
import { CONFIG_METADATA_KEY } from './inject-env';

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
    @Configuration()
    class Foo {
      @InjectEnv('NAME')
      @InjectEnv('NAME', { transform: (val) => Number.parseInt(val, 10) })
      public name!: string;
    }
    const metadata = Reflect.getMetadata(CONFIG_METADATA_KEY, Foo.prototype);
    unsetEnv(env);
    expect(metadata).toEqual({ name: 'vc' });
  });
  it('should throw error if env is required', () => {
    expect(() => {
      @Configuration()
      class Foo {
        @InjectEnv('NAME')
        public name: string;
      }
    }).toThrow(RequiredEnvError);
  });

  it('should skip unset envs if SKIP_UNSET_ENV is set', () => {
    expect(() => {
      setEnv({ SKIP_UNSET_ENV: '1' });
      @Configuration()
      class Foo {
        @InjectEnv('NAME')
        public name: string;
      }
      unsetEnv({ SKIP_UNSET_ENV: '1' });
    }).not.toThrow(RequiredEnvError);
  });
  it("should allow env not set if it's not required", () => {
    @Configuration()
    class Foo {
      @InjectEnv('NAME', { required: false })
      public name: string;
    }
    const metadata = Reflect.getMetadata(CONFIG_METADATA_KEY, Foo.prototype);
    expect(metadata).toBeUndefined();
  });
  it('should use default value if env is not set ', () => {
    @Configuration()
    class Foo {
      @InjectEnv('NAME', { default: 'foo' })
      public name: string;
    }
    const metadata = Reflect.getMetadata(CONFIG_METADATA_KEY, Foo.prototype);
    expect(metadata).toEqual({ name: 'foo' });
  });
  it('should validate the value', () => {
    const env = { PORT: '1234', BAR_PORT: 'bar' };
    setEnv(env);
    @Configuration()
    class Foo {
      @InjectEnv('PORT', { validate: (val) => /\d+/.test(val) })
      public port: string;
    }
    const metadata = Reflect.getMetadata(CONFIG_METADATA_KEY, Foo.prototype);
    expect(metadata).toEqual({ port: '1234' });

    expect(() => {
      class Bar {
        @InjectEnv('BAR_PORT', { validate: (val) => /$\d+$/.test(val) })
        public port: number;
      }
    }).toThrowError(InvalidEnvError);
    expect(() => {
      class Bar {
        @InjectEnv('BAR_PORT', {
          validate: (val) => {
            if (/\d+/.test(val)) {
              return true;
            } else {
              throw new Error(`PORT must be an number`);
            }
          },
        })
        public port: number;
      }
    }).toThrowError(/PORT must be an number/);
    unsetEnv(env);
  });

  it('should transform the value', () => {
    const env = { NAME: 'foo', PORT: '1234' };
    setEnv(env);
    @Configuration()
    class Foo {
      @InjectEnv('PORT', {
        validate: (val) => /\d+/.test(val),
        transform: (val) => Number.parseInt(val, 10),
      })
      public port: number;
      @InjectEnv('NAME')
      public name: string;
    }

    const foo = new Foo();
    unsetEnv(env);
    expect(foo).toEqual({ port: 1234, name: 'foo' });
  });
});

describe('Configuration', () => {
  it('should inherit values from parent', () => {
    const env = { NAME: 'foo', PORT: '1234' };
    setEnv(env);
    class Foo {
      @InjectEnv('NAME')
      public name: string;
    }

    @Configuration()
    class Bar extends Foo {
      @InjectEnv('PORT', {
        validate: (val) => /\d+/.test(val),
        transform: (val) => Number.parseInt(val, 10),
      })
      public port: number;
    }

    const bar = new Bar();
    unsetEnv(env);
    expect(bar).toEqual({ port: 1234, name: 'foo' });
  });
});

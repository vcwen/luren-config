> This a TypeScript library is to help you create a configuration class that values are injected from environment variables or files.

#### Prerequisites

---

`experimentalDecorators`, `emitDecoratorMetadata` compilation options should be enabled in your `tsconfig.json` file.

```json
{
  "compilerOptions": {
    //...
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
    //...
  }
}
```

#### Installation

---

##### yarn

`$ yarn add @lurenjs/config reflect-metadata`

##### npm

`$ npm i -S @lurenjs/config reflect-metadata`

#### Usage

---

##### Inject config from ENV

The configuration class should be decorator with `Configuration`, each property that you want to inject should be decorated with `InjectEnv`.
Values will be injected when instance is created.

```typescript
@Configuration()
class Foo {
  @InjectEnv('HOST', { default: 'localhost' })
  public host: string;
  @InjectEnv('PORT', {
    transform: (val) => Number.parseInt(val, 10),
  })
  public port: number;
  @InjectEnv('DATABASE', { description: 'database name' })
  public database: string;
}

/**
 * ENV
 *
 * PORT=1234
 * DATABASE=test
 *
 **/

const foo = new Foo()
console.log(foo)
/**
 *  Foo { host: 'localhost', port: 1234, database: 'test' }
 ** /
```

**Notice:For env variable injection, Configuration decorator is not required, but then value will be set on the prototype, that means fields won't be listed in Object.keys() or Object.getOwnProperites().**

```
import { InjectEnv } from './inject-env';

class Foo {
  @InjectEnv('HOST', { default: 'localhost' })
  host: string;
  @InjectEnv('PORT', {
    transform: (val) => Number(val),
  })
  port: number;
  @InjectEnv('DATABASE', { description: 'database name' })
  database: string;
}

const foo = new Foo();
console.log(foo);
/* Foo {} */

console.log(foo.host, foo.port, foo.database);
/* localhost 1234 db_name */
```

`static` fields can be injected too.

```typescript
import { InjectEnv } from './inject-env';

class Foo {
  @InjectEnv('HOST', { default: 'localhost' })
  static host: string;
  @InjectEnv('PORT', {
    transform: (val) => Number(val),
  })
  static port: number;
  @InjectEnv('DATABASE', { description: 'database name' })
  static database: string;
}

/**
 * ENV
 *
 * HOST=localhost
 * PORT=1234
 * DATABASE= db_name
 *
 **/

console.log(Foo)
/**
 * [class Foo] { host: 'localhost', port: 1234, database: 'db_name' }
 ** /
```

Config source can be an file, `json` and `yaml` format is supported, `yaml` is the default format. Then base filepath `cwd(current work directory)`.

```typescript

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

/**
 * ./test/config.yml
 *
 * foo: bar
 * ordinal: "1"
 * zee: 1
 *
 **/

const bar = new Bar()
/**
 * Bar { zee: 1, foo: 'bar', ordinal: 1 }
 ** /
```

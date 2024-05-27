> This a TypeScript library is to help you create a configuration class that values are injected from environment variables.

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

The configuration class should be decorator with `Configuration`, each property that you want to inject should be decorated with `InjectEnv`.
Values will be injected when instance is created.

Set env `SKIP_UNSET_ENV` if you want to skip some required environment variables.

```typescript
@Configuration()
class Foo {
  @InjectEnv('HOST', { default: 'localhost' })
  public host: number;
  @InjectEnv('PORT', {
    validate: (val) => /$\d+$/.test(val),
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
/**
 * foo: { host: 'localhost', port: 1234, database: 'test' }
 ** /
```

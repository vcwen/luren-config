> This a TypeScript library is to help you create a configuration class that values are injected from environment variables. [Dotenv](https://www.npmjs.com/package/dotenv) is enabled for convenience, so `.env` will be loaded automatically if it's present the project.

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

`$ yarn add @luren/config reflect-metadata`

##### npm

`$ npm i -S @luren/config reflect-metadata`

#### Usage

---

The configuration class should be decorator with `Configuration`, each property that you want to inject should be decorated with `InjectEnv`.
Values will be injected when instance is created.

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

// foo is actually an ConfigClass that extends from Foo
const foo = new Foo()
/**
 * foo: ConfigClass { host: 'localhost', port: 1234, database: 'test' }
 ** /
```

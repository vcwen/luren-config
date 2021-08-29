# @lurenjs/config

> @lurenjs/config 是 TypeScript 的库，主要是用来创建用于配置参数的类，参数的值可以从环境变量中读入。

#### 配置要求

---

ts 的配置文件`tsconfig.json`中的`experimentalDecorators`, `emitDecoratorMetadata`选项需要被启用。`reflect-metadata`是依赖库（peerDependency），如果未安装的话，也需要同时安装。

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

#### 安装

---

##### yarn

`$ yarn add @lurenjs/config reflect-metadata`

##### npm

`$ npm i -S @lurenjs/config reflect-metadata`

#### 使用

---

配置类上需要添加`Configuration`的注解，需要读入环境变量的参数需要添加`InjectEnv`的注解。当该配置类被实例化时，相应的参数会被注入配置环境变量的值。`validate`和`transform`可以对环境变量的值进行验证和转换。

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

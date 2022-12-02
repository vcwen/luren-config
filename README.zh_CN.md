# @lurenjs/config

> @lurenjs/config 是 TypeScript 的库，主要是用来创建用于配置参数的类，参数的值可以从环境变量或者文件中读入。

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

**注意:对于环境变量的注入，Configuaration 的注解并不是必须的，省略的结果是注入的值会定义在 prototype 上，这样会导致 Object.keys()或 Object.getOwnProperites()方法无法遍历对象中的值，如下**

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

静态属性页可以被注入。

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

注入的数据来源也可以是文件, 目前支持`json` 和 `yaml` , 默认是`yaml`.

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

# Zod

可以把 Zod 理解成：用一份 schema，同时完成运行时数据校验和 TypeScript 类型推导。

TypeScript 只能检查编译期类型，后端 API、WebSocket、`localStorage` 和 URL 参数等运行时数据并不因此可信。Zod 负责在这些系统边界验证数据，再把验证后的结果交给业务逻辑。

## Schema 与类型推导

### Schema 与类型

`schema` 是运行时的验证器，可以用 `z.infer` 从 schema 推导 TypeScript 类型：

```ts
import * as z from 'zod';

const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  age: z.number(),
});

type User = z.infer<typeof UserSchema>;
```

这里同时得到运行时验证器 `UserSchema` 和 TypeScript 类型 `User`。`User` 等价于：

```ts
type User = {
  id: string;
  name: string;
  age: number;
};
```

通常不需要再重复声明一个 `interface User`，而是让 schema 成为数据结构的唯一来源：

```ts
const UserSchema = z.object(/* ... */);
type User = z.infer<typeof UserSchema>;
```

## 基础 Schema

### 基础类型

Zod 的基础类型基本可以和 TypeScript 对应：

```ts
z.string();
z.number();
z.boolean();
z.bigint();
z.null();
z.undefined();
```

### 字符串约束

字符串约束在表单和 API 校验中很常见：

```ts
const UsernameSchema = z.string().min(3).max(20);

UsernameSchema.parse('Alice'); // OK
UsernameSchema.parse('A'); // 抛出 ZodError

z.string().min(1);
z.string().max(100);
z.string().length(10);
z.string().regex(/^[a-zA-Z0-9]+$/);
```

Zod 4 推荐使用顶层格式 API：

```ts
const UserSchema = z.object({
  email: z.email(),
  homepage: z.url(),
  id: z.uuid(),
});
```

### 数字约束

数字可以限制范围、正负性和整数性：

```ts
const CoordinateSchema = z.object({
  longitude: z.number().min(-180).max(180),
  latitude: z.number().min(-90).max(90),
});

z.number().positive();
z.number().negative();
z.number().nonnegative();
z.number().nonpositive();
z.number().int();
```

### 对象、数组和嵌套对象

对象、数组和嵌套对象可以直接组合：

```ts
const DroneSchema = z.object({
  id: z.string(),
  roles: z.array(z.string()),
  position: z.object({
    longitude: z.number(),
    latitude: z.number(),
  }),
});

z.array(z.string());
z.string().array();
```

### `literal`、`enum` 和 `union`

`literal` 用来限制固定值，`enum` 用来表示固定字符串联合类型，`union` 用来表示多个 schema 的联合：

```ts
const DroneTypeSchema = z.literal('drone');

const StatusSchema = z.enum(['idle', 'running', 'error']);
type Status = z.infer<typeof StatusSchema>;
// 'idle' | 'running' | 'error'

const IdSchema = z.union([z.string(), z.number()]);
// 也可以写成：z.string().or(z.number())
```

### `discriminatedUnion`

如果联合的分支可以通过某个固定字段区分，可以使用 `discriminatedUnion`：

```ts
const PositionMessageSchema = z.object({
  type: z.literal('position'),
  longitude: z.number(),
  latitude: z.number(),
});

const AlarmMessageSchema = z.object({
  type: z.literal('alarm'),
  level: z.number(),
  message: z.string(),
});

const MessageSchema = z.discriminatedUnion('type', [
  PositionMessageSchema,
  AlarmMessageSchema,
]);

type Message = z.infer<typeof MessageSchema>;

function handleMessage(message: Message) {
  if (message.type === 'position') {
    message.longitude;
  }

  if (message.type === 'alarm') {
    message.level;
  }
}
```

### `record`

`z.record` 对应 `Record<string, number>`。Zod 4 应显式写出 key 和 value schema：

```ts
const ScoresSchema = z.record(z.string(), z.number());
// Record<string, number>
```

不要沿用 Zod 3 时代的单参数写法 `z.record(z.string())`。

## 可选字段与对象 Schema 派生

### `optional`、`nullable` 和 `nullish`

`optional`、`nullable` 和 `nullish` 的区别如下：

| Zod | TypeScript | 字段是否必须存在 |
| --- | --- | --- |
| `z.string()` | `string` | 是 |
| `z.string().optional()` | `string \| undefined` | 否 |
| `z.string().nullable()` | `string \| null` | 是 |
| `z.string().nullish()` | `string \| null \| undefined` | 否 |

例如：

```ts
const ProfileSchema = z.object({
  nickname: z.string().optional(),
  avatar: z.string().nullable(),
  bio: z.string().nullish(),
});

ProfileSchema.parse({ avatar: null });
// nickname 和 bio 可以缺省，但 avatar 仍然必须存在
```

### `default`

`default` 不只是类型声明，它会在 `parse` 时补充实际数据：

```ts
const PaginationSchema = z.object({
  page: z.number().default(1),
});

PaginationSchema.parse({});
// { page: 1 }
```

### `pick`、`omit`、`partial` 和 `extend`

对象 schema 可以像 TypeScript 工具类型一样派生：

```ts
const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  age: z.number(),
  password: z.string(),
});

const PublicUserSchema = UserSchema.pick({
  id: true,
  name: true,
});

const SafeUserSchema = UserSchema.omit({
  password: true,
});

const UpdateUserSchema = UserSchema.partial();

const BaseSchema = z.object({
  id: z.string(),
});

const ExtendedUserSchema = BaseSchema.extend({
  name: z.string(),
  age: z.number(),
});
```

上面的 API 分别对应 TypeScript 的 `Pick`、`Omit`、`Partial` 和基于已有对象的扩展。

在 PATCH 请求中，常见做法是从创建 schema 派生更新 schema：

```ts
const CreateUserSchema = z.object({
  name: z.string(),
  age: z.number(),
});

const UpdateUserSchema = CreateUserSchema.partial();
```

## 数据验证和错误处理

### `parse`

API 返回值不应该直接通过类型断言“相信”：

```ts
const data: unknown = await response.json();
const user = data as User; // 没有运行时验证
```

使用 `parse` 才会真正验证数据。成功时返回验证后的数据，失败时抛出 `ZodError`：

```ts
const user = UserSchema.parse(data);
```

适合在初始化配置或开发期断言等“验证失败就应该中断”的场景使用。

### `safeParse`

如果不希望验证失败直接抛异常，则使用 `safeParse`。它返回一个可以通过 `success` 区分的联合结果：

```ts
const result = UserSchema.safeParse(data);

if (!result.success) {
  console.error(result.error);
  return;
}

const user = result.data;
```

API、WebSocket 和用户输入等不可信数据通常适合使用 `safeParse`。

### 查看错误信息

验证失败时可以读取 `result.error.issues`：

```ts
const Schema = z.object({
  name: z.string(),
  age: z.number(),
});

const result = Schema.safeParse({
  name: 123,
  age: '20',
});

if (!result.success) {
  result.error.issues;
}
```

每条 issue 都会带有错误路径。例如嵌套数据 `{ user: { address: { city: 123 } } }` 的路径可能是 `['user', 'address', 'city']`，适合定位表单或 API 字段错误。

### `refine`

当内置约束无法表达规则时再使用 `refine`：

```ts
const PasswordSchema = z.string().min(8).refine(
  value => /\d/.test(value),
  { message: 'Password must contain a number' },
);
```

如果 Zod 已经提供了对应 API，就优先使用原生约束。例如使用 `z.number().min(0).max(360)`，不要用 `refine` 重写同一条规则。

## 验证后的数据转换

### `transform`

`transform` 可以在验证通过后转换结果，因此输入类型和输出类型可能不同：

```ts
const LengthSchema = z.string().transform(value => value.length);

LengthSchema.parse('hello'); // 5

type Input = z.input<typeof LengthSchema>; // string
type Output = z.output<typeof LengthSchema>; // number
type Inferred = z.infer<typeof LengthSchema>; // number，等价于输出类型
```

### `coerce`

`coerce` 适合 URL 参数和 `FormData` 等本来就是字符串的输入。它会先尝试执行对应的 JavaScript 转换，例如 `z.coerce.number()` 使用 `Number(input)`：

```ts
const PageSchema = z.coerce.number().int().positive();

const page = PageSchema.parse(searchParams.get('page'));
```

因为 `URLSearchParams.get` 的返回值是 `string | null`，上述 schema 会负责把可转换的字符串变成 number，并继续检查整数和正数约束。

## 系统边界验证

### API 响应

完整的 API 响应示例：

```ts
import * as z from 'zod';

const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  roles: z.array(z.string()),
});

const UserResponseSchema = z.object({
  code: z.number(),
  data: UserSchema,
});

type UserResponse = z.infer<typeof UserResponseSchema>;

const response = await fetch('/api/user');
const raw: unknown = await response.json();
const result = UserResponseSchema.safeParse(raw);

if (!result.success) {
  console.error('Invalid API response', result.error);
  return;
}

const data: UserResponse = result.data;
```

从 `result.success` 判断成功之后，`data` 已经从不可信的运行时数据变成符合 `UserResponse` 的对象。

### WebSocket 消息

实时消息也应在进入业务逻辑前验证：

```ts
const DroneUpdateSchema = z.object({
  type: z.literal('drone-update'),
  droneId: z.string(),
  longitude: z.number().min(-180).max(180),
  latitude: z.number().min(-90).max(90),
  altitude: z.number(),
  heading: z.number().min(0).max(360),
  pitch: z.number(),
});

type DroneUpdate = z.infer<typeof DroneUpdateSchema>;

socket.onmessage = event => {
  const raw: unknown = JSON.parse(event.data);
  const result = DroneUpdateSchema.safeParse(raw);

  if (!result.success) {
    console.error('Invalid drone message', result.error);
    return;
  }

  const message: DroneUpdate = result.data;
  handleDroneUpdate(message);
};
```

`JSON.parse` 的结果来自系统边界，应该按 `unknown` 对待，而不是直接当成 `any`：

```text
HTTP response / WebSocket / localStorage
                    ↓
                 unknown
                    ↓
               Zod schema
                    ↓
          validated typed data
                    ↓
        React / Zustand / 业务逻辑
```

Zod 应集中放在数据进入前端系统的边界层，而不是在每个组件内部重复验证。这样组件拿到的数据默认就是可信的，验证逻辑也更容易维护。

## 常用 API

| 方法 | 用途 |
| --- | --- |
| `z.object()` | 对象 |
| `z.string()` | 字符串 |
| `z.number()` | 数字 |
| `z.boolean()` | 布尔值 |
| `z.array()` | 数组 |
| `z.enum()` | 字符串联合类型 |
| `z.literal()` | 固定值 |
| `z.union()` | 联合类型 |
| `.optional()` | 可选字段 |
| `.nullable()` | 允许 `null` |
| `.min() / .max()` | 长度或数字范围 |
| `.default()` | 默认值 |
| `.refine()` | 自定义验证 |
| `.parse()` | 验证，失败时抛异常 |
| `.safeParse()` | 验证，不直接抛异常 |
| `z.infer<>` | 从 schema 推导 TypeScript 类型 |

# 数据表设计

数据表（Table）是存储一类数据的结构，每张表有多个字段（Column），多条记录（Row），以及一个表示唯一记录的主键（Primary Key）。

以用户数据为例，假设有这么一张 `user` 表

| id  | username | email               | created_at |
| --- | -------- | ------------------- | ---------- |
| 1   | alice    | alice@example.com   | 2026-11-01 |
| 2   | bob      | bob@example.com     | 2026-11-02 |
| 3   | charlie  | charlie@example.com | 2026-11-03 |

表的 schema 类似 TS 中的接口定义

```ts
interface User {
  id: number;
  username: string;
  email: string;
  createdAt: string;
}

const users: User[] = [];
```

数据表需要额外考虑字段的是否可空，是否可重复，如何关联多张表

## 设计思路

### 1. 分析业务需求，识别实体

### 2. 理解表之间的对应关系

### 3. 设计字段类型和字段约束

### 4. 数据库规范化（Normalization）

规范化（Normalization）的核心目的，是**减少重复数据，避免修改一处数据时其他地方不一致**。

### 5. 根据查询需求设计索引

TODO：待续

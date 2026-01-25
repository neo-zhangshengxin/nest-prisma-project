### 新项目的执行命令和作用

#### 执行顺序
1. **`pnpm prisma init`**
2. **`pnpm prisma db pull`**
3. **`pnpm prisma generate`**

#### 各命令作用

**1. `pnpm prisma init`**
- 初始化 Prisma 项目，在项目根目录创建 `prisma/` 文件夹
- 生成默认的 `prisma/schema.prisma` 文件（包含基础配置结构）
- 生成 `.env` 文件（用于配置数据库连接字符串 `DATABASE_URL`）

**2. `pnpm prisma db pull`**
- 连接到 `.env` 文件中指定的数据库
- 分析数据库中的表结构
- 更新 `prisma/schema.prisma` 文件，添加或修改对应的数据模型
- 确保 `schema.prisma` 文件与实际数据库结构保持同步

**3. `pnpm prisma generate`**
- 根据更新后的 `prisma/schema.prisma` 文件生成 Prisma Client
- 将生成的 Prisma Client 输出到指定目录（如 `prisma/generated`）
- 确保代码中使用的 `this.prisma` 对象包含最新的模型定义和方法


### pnpm prisma db pull 作用

#### `pnpm prisma db pull` 命令通过以下文件来确定要拉取的数据库：

1. **`.env` 文件**：定义了 `DATABASE_URL` 环境变量，包含了数据库连接信息：
   ```
   DATABASE_URL="mysql://root:123456Abc@localhost:3306/world"
   ```

2. **`prisma.config.ts` 文件**：
   - 首先通过 `import "dotenv/config";` 加载 `.env` 文件中的环境变量
   - 然后在配置中使用 `process.env["DATABASE_URL"]` 作为数据源的 URL：
     ```typescript
     datasource: {
       url: process.env["DATABASE_URL"],
     },
     ```

当执行 `npx prisma db pull` 命令时，Prisma 会读取 `prisma.config.ts` 文件中的配置，从而知道要连接到哪个数据库并拉取其结构。


### Prisma @map 注解的使用

#### 什么是 @map 注解？
- `@map` 是 Prisma 提供的一个注解，用于**自定义字段映射**
- 允许在代码中使用一种命名风格（如驼峰命名），而在数据库中使用另一种命名风格（如蛇形命名）

#### 为什么需要使用 @map 注解？
- **前端习惯**：前端代码通常使用驼峰命名（如 `isDiscount`）
- **数据库规范**：数据库字段通常使用蛇形命名（如 `is_discount`）
- **代码一致性**：后端代码也应该使用驼峰命名，符合 TypeScript 习惯
- **类型安全**：Prisma Client 会自动处理类型映射，确保类型安全

#### 如何使用 @map 注解？

**示例（schema.prisma）**：
```prisma
model phone {
  id          BigInt   @id @default(autoincrement()) @db.UnsignedBigInt
  name        String   @db.VarChar(100)
  price       Decimal  @db.Decimal(10, 2)
  stock       Int      @default(0) @db.UnsignedInt
  isDiscount  Boolean  @default(false) @map("is_discount") // 代码中使用 isDiscount
  updateTime  DateTime @default(now()) @db.Timestamp(0) @map("update_time") // 代码中使用 updateTime
  isDeleted   Boolean  @default(false) @map("is_deleted") // 代码中使用 isDeleted
}
```

**在代码中使用**：
```typescript
// src/phone/phone.service.ts
async findAll() {
  return this.prisma.phone.findMany({
    where: {
      isDeleted: false, // 代码中使用 isDeleted
    },
    orderBy: {
      id: 'asc', // 代码中使用 id
    }
  });
}

async add(phone: { name: string; price: number; isDiscount?: boolean }) {
  return this.prisma.phone.create({
    data: {
      ...phone,
      isDeleted: false, // 代码中使用 isDeleted
    }
  });
}
```

#### 重要特性
- **`npx prisma db pull` 不会移除 @map 注解**：确保配置持久化
- **类型安全**：Prisma Client 会根据 @map 注解生成正确的类型定义
- **运行时正确**：Prisma 会根据 @map 注解正确映射到数据库字段

#### 总结
使用 `@map` 注解可以：
1. **保持前端代码风格**：使用驼峰命名
2. **保持数据库命名规范**：使用蛇形命名
3. **保持后端代码一致性**：使用驼峰命名
4. **确保类型安全**：Prisma 自动处理类型映射
5. **确保配置持久化**：`db pull` 不会移除注解


### 将 where 条件独立成变量的最佳实践

#### 为什么要将 where 条件独立成变量？
1. **代码复用**：
   - 在 `findMany` 和 `count` 等多个方法中复用相同的查询条件
   - 修改查询条件时只需改一处，避免重复代码和潜在的不一致

2. **类型安全**：
   - 使用 Prisma 生成的类型注解，享受完整的 TypeScript 类型提示和校验
   - 避免手动编写查询条件时的类型错误

3. **可读性**：
   - 独立的变量使查询条件更清晰，易于理解和维护
   - 将复杂的查询逻辑与执行代码分离，提高代码可读性

4. **可维护性**：
   - 便于后续扩展和修改查询条件
   - 支持动态构建查询条件（如根据不同参数调整过滤条件）

#### 如何获取和使用类型标注？
1. **导入 Prisma 类型**：
   - 从生成的 Prisma Client 中导入 `Prisma` 命名空间
   - 确保导入路径正确指向生成的文件

2. **使用类型注解**：
   - 使用 `Prisma.{ModelName}WhereInput` 类型标注 where 变量
   - 根据生成的类型名称格式使用正确的大小写（如 `phoneWhereInput` 或 `PhoneWhereInput`）

3. **享受类型提示**：
   - 输入 `where.` 时，IDE 会自动提示模型的所有字段
   - 输入 `where.field.` 时，会提示对应字段支持的操作符（如字符串的 `startsWith`、`contains` 等）
   - TypeScript 会校验字段名、操作符和值类型的正确性

#### 示例实现：
```typescript
// src/phone/phone.service.ts
import { Injectable } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client'; // 导入 Prisma 类型
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PhoneService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(pagination: { page?: number; pageSize?: number }) {
    const { page = 1, pageSize = 10 } = pagination;
    const skip = (page - 1) * pageSize;

    // 定义独立的 where 变量（带类型注解）
    const where: Prisma.phoneWhereInput = {
      isDeleted: false,
      name: {
        startsWith: '三星',
      },
      price: {
        gt: 8000,
      },
    };

    const [phones, total] = await Promise.all([
      this.prisma.phone.findMany({
        where, // 复用 where 变量
        skip,
        take: pageSize,
        orderBy: {
          id: 'asc',
        },
      }),
      this.prisma.phone.count({
        where, // 复用 where 变量
      }),
    ]);

    // 后续代码...
  }
}
```

#### 优势总结
- **减少代码重复**：避免在多个方法中复制相同的查询条件
- **提高类型安全性**：利用 TypeScript 的类型系统确保查询条件的正确性
- **改善代码可读性**：将查询逻辑与执行代码分离，使代码更易于理解
- **增强可维护性**：便于后续扩展和修改查询条件
- **提升开发效率**：通过 IDE 的智能提示快速编写正确的查询条件

这种将 where 条件独立成变量并使用类型标注的做法，是 Prisma + TypeScript 项目中的最佳实践，能够显著提高代码质量和开发效率。
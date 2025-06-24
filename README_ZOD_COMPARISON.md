# Zod vs StructuredOutputParser 对比

本项目展示了 TypeScript 中 LangChain 使用类似 Python Pydantic 功能的两种方式：

## 方法对比

### 1. StructuredOutputParser（传统方式）

**文件**: `newNameJSON.ts`

```typescript
import { StructuredOutputParser } from "@langchain/core/output_parsers";

// 定义结构化输出解析器
const parser = StructuredOutputParser.fromNamesAndDescriptions({
    names: "生成的3个名字,中间以英文逗号分隔",
    county: "地区特色",
    boyInspiration: "男孩名字的灵感来源",
    girlInspiration: "女孩名字的灵感来源",
});

// 需要在提示词中包含格式指令
const template = `你是一个起名大师...

{format_instructions}`;

// 创建链
const chain = prompt.pipe(llm).pipe(parser);
```

### 2. Zod（现代方式）

**文件**: `newNameZod.ts`

```typescript
import { z } from "zod";

// 使用 Zod 定义数据架构，类似 Python 的 Pydantic BaseModel
const NameGenerationSchema = z.object({
    names: z.string().describe("生成的3个名字,中间以英文逗号分隔"),
    county: z.string().describe("地区特色"),
    boyInspiration: z.string().describe("男孩名字的灵感来源"),
    girlInspiration: z.string().describe("女孩名字的灵感来源"),
});

// 自动推断类型
type NameGenerationResult = z.infer<typeof NameGenerationSchema>;

// 使用 withStructuredOutput 方法
const structuredLlm = llm.withStructuredOutput(NameGenerationSchema);
```

## 主要区别

| 特性 | StructuredOutputParser | Zod + withStructuredOutput |
|------|----------------------|----------------------------|
| **类型安全** | 运行时验证 | 编译时 + 运行时验证 |
| **自动补全** | 无 | 完整的 TypeScript 支持 |
| **架构定义** | 简单的键值对 | 强大的 Zod 架构 |
| **嵌套对象** | 支持有限 | 完全支持 |
| **数组和复杂类型** | 有限支持 | 完全支持 |
| **验证规则** | 基础验证 | 丰富的验证规则 |
| **错误处理** | 基础错误信息 | 详细的验证错误 |
| **性能** | 较快 | 稍慢（更多验证） |
| **现代化程度** | 传统 | 现代 TypeScript 标准 |

## 复杂架构示例

### Zod 支持更复杂的数据结构

```typescript
const ComplexSchema = z.object({
    // 基础类型
    name: z.string().min(1).max(50),
    age: z.number().int().positive(),
    
    // 可选字段
    email: z.string().email().optional(),
    
    // 数组
    hobbies: z.array(z.string()),
    
    // 嵌套对象
    address: z.object({
        street: z.string(),
        city: z.string(),
        zipCode: z.string().regex(/^\d{5}$/)
    }),
    
    // 联合类型
    status: z.enum(["active", "inactive", "pending"]),
    
    // 条件验证
    metadata: z.record(z.string(), z.any())
});
```

## 运行示例

```bash
# 传统方式
npm run newnamejson

# Zod 方式
npm run newnamezod
```

## 推荐使用

对于新项目，建议使用 **Zod + withStructuredOutput** 方式，因为它提供：

1. ✅ 更好的类型安全
2. ✅ 完整的 IDE 支持
3. ✅ 更强大的验证功能
4. ✅ 更现代的开发体验
5. ✅ 与 TypeScript 生态更好的集成

对于简单的用例，`StructuredOutputParser` 仍然是一个有效的选择。 
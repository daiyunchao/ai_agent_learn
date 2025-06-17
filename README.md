# AI Agent 学习项目

这是一个基于 Node.js 和 TypeScript 的 AI Agent 学习项目，使用 LangChain 作为核心框架。

## 项目结构

```
ai_agent_learn/
├── src/
│   ├── index.ts                     # 主入口文件
│   ├── config.ts                    # 配置文件
│   ├── deepseek-example.ts          # 基础HTTP调用示例
│   ├── langchain-deepseek.ts        # 传统LangChain集成示例
│   └── modern-langchain-example.ts  # 现代LCEL LangChain示例
├── dist/                            # 编译输出目录
├── config.example.ts                # 配置示例文件
├── package.json                     # 项目配置
├── tsconfig.json                    # TypeScript 配置
├── .gitignore                      # Git 忽略文件
├── README.md                       # 项目说明
└── 使用指南.md                      # 详细使用指南
```

## 安装依赖

```bash
npm install
```

## 运行项目

### 开发模式（推荐）
```bash
npm run dev
```

### 构建并运行
```bash
npm run build
npm start
```

### 其他命令
```bash
npm run build    # 编译 TypeScript
npm run clean    # 清理构建目录
npm run watch    # 监视文件变化并自动编译
```

## 已安装的依赖

### 核心依赖
- **langchain**: AI 应用开发框架
- **@langchain/openai**: OpenAI集成模块
- **dotenv**: 环境变量管理

### 开发依赖
- **typescript**: TypeScript 编译器
- **ts-node**: 直接运行 TypeScript 文件
- **@types/node**: Node.js 类型定义

## 本地DeepSeek模型配置

在使用前，请确保：

1. **本地DeepSeek模型服务正在运行**
   - 默认地址：`http://localhost:8000/v1`
   - 确保支持OpenAI兼容的API格式

2. **配置模型参数**
   - 编辑 `src/config.ts` 文件
   - 或设置环境变量：
     ```bash
     export DEEPSEEK_BASE_URL="http://localhost:8000/v1"
     export DEEPSEEK_API_KEY="your-api-key-here"
     export DEEPSEEK_MODEL="deepseek-chat"
     ```

## 功能特性

### ✅ 基础HTTP调用
- 直接通过HTTP API调用本地DeepSeek模型
- 支持多种问答场景
- 错误处理和重试机制

### ✅ LangChain集成
- **正确使用LangChain的ChatOpenAI**：通过配置baseURL调用本地模型
- **传统LLMChain方式**：支持问答链、代码解释链、翻译链
- **现代LCEL语法**：使用pipe操作符的链式处理
- **多步骤处理**：复杂的链式工作流
- **对话记忆**：保持上下文的对话系统

## 开始开发

1. 编辑 `src/index.ts` 文件
2. 运行 `npm run dev` 查看结果
3. 开始构建您的 AI Agent！

## 系统要求

- Node.js >= 18.0.0
- npm 或 yarn

## 下一步

您可以开始：
- 集成不同的 LLM 模型
- 创建自定义的 Chains
- 实现 Agents 和 Tools
- 添加向量数据库集成
- 构建对话系统

祝您学习愉快！🚀 
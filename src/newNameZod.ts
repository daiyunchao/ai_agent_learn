import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { z } from "zod";
import { config } from "./config";

// 创建配置了本地DeepSeek服务的ChatOpenAI实例
function createDeepSeekLLM() {
    return new ChatOpenAI({
        openAIApiKey: config.DEEPSEEK_API_KEY, // 本地服务可能不需要真实key
        modelName: config.DEEPSEEK_MODEL,
        temperature: 0,
        maxTokens: 100000,
        timeout: 60000,
        maxRetries: 2,
        configuration: {
            baseURL: config.DEEPSEEK_BASE_URL,
        }
    });
}

// 使用 Zod 定义数据架构，类似 Python 的 Pydantic BaseModel
const NameGenerationSchema = z.object({
    names: z.string().describe("生成的3个名字,中间以英文逗号分隔"),
    county: z.string().describe("地区特色"),
    boyInspiration: z.string().describe("男孩名字的灵感来源"),
    girlInspiration: z.string().describe("女孩名字的灵感来源"),
});

// 定义类型，从 Zod 架构中自动推断
type NameGenerationResult = z.infer<typeof NameGenerationSchema>;

class NewNameZod {
    private llm: ChatOpenAI;
    private structuredLlm: any; // 使用 withStructuredOutput

    constructor() {
        this.llm = createDeepSeekLLM();
        
        // 使用 withStructuredOutput 方法绑定 Zod 架构
        this.structuredLlm = this.llm.withStructuredOutput(NameGenerationSchema);
    }

    async run(county: string, gender: string, boyName: string, girlName: string): Promise<NameGenerationResult> {
        // 使用 ChatPromptTemplate 而不是 PromptTemplate，更现代的方式
        const prompt = ChatPromptTemplate.fromTemplate(`
你是一个起名大师，请模仿示例起3个具有{county}特色的{gender}名字。

示例: 男孩常用名字{boyName}，女孩常用名字{girlName}

请按照以下要求生成结果：
1. names: 生成的3个名字，用英文逗号分隔
2. county: 说明地区特色
3. boyInspiration: 如果是男孩名字，说明灵感来源
4. girlInspiration: 如果是女孩名字，说明灵感来源

请严格按照JSON格式返回，不要包含任何其他文字、标签或思考过程。
        `.trim());

        // 直接使用 structuredLlm 而不是创建链
        const result = await this.structuredLlm.invoke(
            await prompt.format({ 
                county, 
                gender, 
                boyName, 
                girlName
            })
        );
        
        return result as NameGenerationResult;
    }
}

async function main() {
    try {
        console.log("🚀 开始使用 Zod 架构生成起名结果...");
        console.log("📝 输入参数: 中国, 男孩, 龙儿, 凤儿\n");
        
        const newNameZod = new NewNameZod();
        const result = await newNameZod.run("中国", "男孩", "龙儿", "凤儿");
        
        console.log("✅ 成功生成结果:");
        console.log(JSON.stringify(result, null, 2));
        
        // 验证结果类型安全
        console.log("\n🔍 类型安全验证:");
        console.log(`生成的名字: ${result.names}`);
        console.log(`地区特色: ${result.county}`);
        console.log(`男孩灵感: ${result.boyInspiration}`);
        console.log(`女孩灵感: ${result.girlInspiration}`);
        
    } catch (error: any) {
        console.error("❌ 执行出错:", error);
        if (error.message) {
            console.log("错误信息:", error.message);
        }
    }
}

// 如果直接运行此文件，则执行 main 函数
if (require.main === module) {
    main();
}

export { NewNameZod, NameGenerationSchema, type NameGenerationResult }; 
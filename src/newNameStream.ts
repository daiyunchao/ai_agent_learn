import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { StructuredOutputParser } from "@langchain/core/output_parsers";

// 移除废弃的LLMChain导入
// import { LLMChain } from "langchain/chains";

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

class NewName {
    private llm: ChatOpenAI;
    private chain: any; // 使用LCEL链
    private parser: any;
    constructor() {
        this.llm = createDeepSeekLLM();
        
        // 定义结构化输出解析器
        this.parser = StructuredOutputParser.fromNamesAndDescriptions({
            names: "生成的3个名字,中间以英文逗号分隔",
            county: "地区特色",
            boyInspiration: "男孩名字的灵感来源",
            girlInspiration: "女孩名字的灵感来源",
        });
        
        // 修改模板，包含格式指令
        const template = `你是一个起名大师,请模仿示例起3个具有{county}特色的{gender}名字,示例: 男孩常用名字{boyName},女孩常用名字{girlName}.

请严格按照以下格式输出，不要包含任何其他文字、标签或思考过程:

{format_instructions}`;
        
        const prompt = PromptTemplate.fromTemplate(template);
        
        // 创建不包含解析器的链用于流式输出
        this.chain = prompt.pipe(this.llm);
    }

    // 流式调用方法
    async runStream(county: string, gender: string, boyName: string, girlName: string) {
        const formatInstructions = this.parser.getFormatInstructions();
        console.log("开始流式生成内容...\n");
        
        let fullContent = "";
        
        // 使用stream方法进行流式调用
        const stream = await this.chain.stream({ 
            county, 
            gender, 
            boyName, 
            girlName,
            format_instructions: formatInstructions 
        });
        
        // 处理流式数据
        for await (const chunk of stream) {
            const content = chunk.content;
            if (content) {
                process.stdout.write(content); // 实时输出内容
                fullContent += content;
            }
        }
        
        console.log("\n\n流式输出完成！");
        console.log("尝试解析完整结果...\n");
        
        // 流式输出完成后，尝试解析完整内容
        try {
            const parsedResult = await this.parser.parse(fullContent);
            return parsedResult;
        } catch (parseError) {
            console.log("解析结构化输出失败，返回原始文本:", parseError);
            return { raw_content: fullContent };
        }
    }
}

async function main() {
    try {
        const newNameInstance = new NewName();
        
        console.log("=== 使用流式调用方式 ===");
        let streamResult = await newNameInstance.runStream("中国", "男孩", "龙儿", "凤儿");
        console.log("流式调用解析结果:");
        console.log(JSON.stringify(streamResult, null, 2));
        console.log("\n" + "=".repeat(50) + "\n");
        
    } catch (error: any) {
        console.error("执行出错:", error)
        if (error.llmOutput) {
            console.log("AI模型的原始输出:")
            console.log(error.llmOutput)
        }
    }
}

main()

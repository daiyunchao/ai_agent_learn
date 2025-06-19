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
        
        // 创建包含清理函数的链
        this.chain = prompt
            .pipe(this.llm)
            .pipe(this.parser)
    }

    async run(county: string, gender: string, boyName: string, girlName: string) {
        const formatInstructions = this.parser.getFormatInstructions();
        const result = await this.chain.invoke({ 
            county, 
            gender, 
            boyName, 
            girlName,
            format_instructions: formatInstructions 
        });
        return result; 
    }

    
}

async function main() {
    try {
        let newName = await new NewName().run("中国", "男孩", "龙儿", "凤儿")
        console.log("成功生成结果:")
        console.log(JSON.stringify(newName, null, 2))
    } catch (error: any) {
        console.error("执行出错:", error)
        if (error.llmOutput) {
            console.log("AI模型的原始输出:")
            console.log(error.llmOutput)
        }
    }
}

main()

import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";

// 移除废弃的LLMChain导入
// import { LLMChain } from "langchain/chains";

import { config } from "./config";

// 自定义输出处理函数
function cleanOutput(text: string): string {
    // 移除<think>标签及其内容
    const cleanedText = text.replace(/<think>[\s\S]*?<\/think>/gi, '');
    
    // 移除多余的空白字符和换行
    return cleanedText.trim();
}

// 自定义将结果变成数组
function resultToArray(text: string): string[] {
    return text.split(',');
}

// 创建配置了本地DeepSeek服务的ChatOpenAI实例
function createDeepSeekLLM() {
    return new ChatOpenAI({
        openAIApiKey: config.DEEPSEEK_API_KEY, // 本地服务可能不需要真实key
        modelName: config.DEEPSEEK_MODEL,
        temperature: 0.7,
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

    constructor() {
        const template = `你是一个起名大师,请模仿示例起3个具有{county}特色的{gender}名字,示例: 男孩常用名字{boyName},女孩常用名字{girlName}.请返回以","分隔的列表形式. 不要返回额外内容`;
        this.llm = createDeepSeekLLM();
        
        // 使用新的LCEL格式构建链
        const prompt = PromptTemplate.fromTemplate(template);
        const outputParser = new StringOutputParser();
        
        // 创建包含清理函数的链
        this.chain = prompt
            .pipe(this.llm)
            .pipe(outputParser)
            .pipe(cleanOutput)
            .pipe(resultToArray); // 添加清理函数
    }

    async run(county: string, gender: string, boyName: string, girlName: string) {
        const result = await this.chain.invoke({ county, gender, boyName, girlName });
        return result; 
    }

    
}

async function main() {
    let newName = await new NewName().run("中国", "男孩", "龙儿", "凤儿")
    console.log(newName)resultToArray
}

main()

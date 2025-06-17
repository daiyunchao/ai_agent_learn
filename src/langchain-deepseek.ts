import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { LLMChain } from "langchain/chains";
import { config } from "./config";

// 创建配置了本地DeepSeek服务的ChatOpenAI实例
function createDeepSeekLLM() {
    return new ChatOpenAI({
        openAIApiKey: config.DEEPSEEK_API_KEY, // 本地服务可能不需要真实key
        modelName: config.DEEPSEEK_MODEL,
        temperature: 0.7,
        maxTokens: 1000,
        timeout: 60000,
        maxRetries: 2,
        configuration: {
            baseURL: config.DEEPSEEK_BASE_URL,
        }
    });
}

// 示例：问答链
export async function createQAChain() {
    const llm = createDeepSeekLLM();
    
    const template = `你是一个智能助手，请根据以下上下文回答用户的问题：

上下文: {context}

问题: {question}

请提供准确、有帮助的回答：`;

    const prompt = PromptTemplate.fromTemplate(template);
    const chain = new LLMChain({ llm, prompt });
    
    return chain;
}

// 示例：代码解释链
export async function createCodeExplainChain() {
    const llm = createDeepSeekLLM();
    
    const template = `你是一个编程专家，请解释以下代码的功能：

编程语言: {language}
代码:
{code}

请详细解释这段代码的作用、逻辑和关键概念：`;

    const prompt = PromptTemplate.fromTemplate(template);
    const chain = new LLMChain({ llm, prompt });
    
    return chain;
}

// 示例：翻译链
export async function createTranslationChain() {
    const llm = createDeepSeekLLM();
    
    const template = `请将以下文本从{sourceLanguage}翻译成{targetLanguage}：

原文: {text}

译文:`;

    const prompt = PromptTemplate.fromTemplate(template);
    const chain = new LLMChain({ llm, prompt });
    
    return chain;
}

// 测试所有链的功能
export async function testLangChainIntegration() {
    console.log("🔗 开始测试LangChain与本地DeepSeek模型集成...\n");
    
    try {
        // 测试问答链
        console.log("📚 测试问答链:");
        const qaChain = await createQAChain();
        const qaResult = await qaChain.call({
            context: "人工智能(AI)是计算机科学的一个分支，致力于创造能够模拟人类智能的机器。",
            question: "什么是人工智能？"
        });
        console.log("💡 问答结果:", qaResult.text);
        console.log();
        
        // 测试代码解释链
        console.log("💻 测试代码解释链:");
        const codeChain = await createCodeExplainChain();
        const codeResult = await codeChain.call({
            language: "JavaScript",
            code: `function fibonacci(n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}`
        });
        console.log("💡 代码解释:", codeResult.text);
        console.log();
        
        // 测试翻译链
        console.log("🌐 测试翻译链:");
        const translationChain = await createTranslationChain();
        const translationResult = await translationChain.call({
            sourceLanguage: "中文",
            targetLanguage: "英文",
            text: "今天天气很好，我们去公园散步吧。"
        });
        console.log("💡 翻译结果:", translationResult.text);
        console.log();
        
        console.log("✅ LangChain集成测试完成！");
        
    } catch (error) {
        console.error("❌ LangChain集成测试失败:", error);
    }
} 
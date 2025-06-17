import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";
import { config } from "./config";

// 创建配置了本地DeepSeek服务的ChatOpenAI实例
function createDeepSeekModel() {
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

// 使用LCEL创建问答链
export async function createModernQAChain() {
    const model = createDeepSeekModel();
    
    const prompt = ChatPromptTemplate.fromTemplate(`
        你是一个智能助手，请根据以下上下文回答用户的问题：

        上下文: {context}
        问题: {question}

        请提供准确、有帮助的回答：
    `);
    
    const outputParser = new StringOutputParser();
    
    // 使用LCEL链式语法
    const chain = prompt.pipe(model).pipe(outputParser);
    
    return chain;
}

// 使用LCEL创建代码解释链
export async function createModernCodeExplainChain() {
    const model = createDeepSeekModel();
    
    const prompt = ChatPromptTemplate.fromTemplate(`
        你是一个编程专家，请解释以下代码的功能：

        编程语言: {language}
        代码:
        {code}

        请详细解释这段代码的作用、逻辑和关键概念：
    `);
    
    const outputParser = new StringOutputParser();
    
    const chain = prompt.pipe(model).pipe(outputParser);
    
    return chain;
}

// 使用LCEL创建多步骤处理链
export async function createMultiStepChain() {
    const model = createDeepSeekModel();
    
    // 第一步：分析问题
    const analyzePrompt = ChatPromptTemplate.fromTemplate(`
        请分析以下用户问题，提取关键信息：
        问题: {question}
        
        请简要分析问题的要点：
    `);
    
    // 第二步：提供详细回答
    const answerPrompt = ChatPromptTemplate.fromTemplate(`
        基于问题分析，请提供详细回答：
        
        问题分析: {analysis}
        原问题: {question}
        
        详细回答：
    `);
    
    const outputParser = new StringOutputParser();
    
    // 创建多步骤链
    const analyzeChain = analyzePrompt.pipe(model).pipe(outputParser);
    
    const fullChain = RunnableSequence.from([
        {
            analysis: analyzeChain,
            question: (input: any) => input.question,
        },
        answerPrompt,
        model,
        outputParser,
    ]);
    
    return fullChain;
}

// 使用LCEL创建对话记忆链
export async function createConversationChain() {
    const model = createDeepSeekModel();
    
    const prompt = ChatPromptTemplate.fromTemplate(`
        你是一个友好的AI助手。以下是我们的对话历史：

        {chat_history}

        用户: {input}
        助手: 
    `);
    
    const outputParser = new StringOutputParser();
    
    const chain = prompt.pipe(model).pipe(outputParser);
    
    return chain;
}

// 测试现代LangChain功能
export async function testModernLangChainIntegration() {
    console.log("🔗 开始测试现代LangChain与本地DeepSeek模型集成...\n");
    
    try {
        // 测试LCEL问答链
        console.log("📚 测试LCEL问答链:");
        const qaChain = await createModernQAChain();
        const qaResult = await qaChain.invoke({
            context: "人工智能(AI)是计算机科学的一个分支，致力于创造能够模拟人类智能的机器。它包括机器学习、深度学习、自然语言处理等多个子领域。",
            question: "什么是人工智能？它包括哪些主要技术？"
        });
        console.log("💡 LCEL问答结果:", qaResult);
        console.log();
        
        // 测试代码解释链
        console.log("💻 测试LCEL代码解释链:");
        const codeChain = await createModernCodeExplainChain();
        const codeResult = await codeChain.invoke({
            language: "TypeScript",
            code: `
async function fetchUserData(userId: string): Promise<User> {
    const response = await fetch(\`/api/users/\${userId}\`);
    if (!response.ok) {
        throw new Error('Failed to fetch user data');
    }
    return response.json();
}`
        });
        console.log("💡 LCEL代码解释:", codeResult);
        console.log();
        
        // 测试多步骤链
        console.log("🔄 测试多步骤处理链:");
        const multiStepChain = await createMultiStepChain();
        const multiStepResult = await multiStepChain.invoke({
            question: "如何学习TypeScript？"
        });
        console.log("💡 多步骤处理结果:", multiStepResult);
        console.log();
        
        // 测试对话链
        console.log("💬 测试对话记忆链:");
        const conversationChain = await createConversationChain();
        
        // 模拟对话
        let chatHistory = "";
        
        const firstResponse = await conversationChain.invoke({
            chat_history: chatHistory,
            input: "你好，我是一名开发者"
        });
        console.log("💡 第一轮对话:", firstResponse);
        
        chatHistory = `用户: 你好，我是一名开发者\n助手: ${firstResponse}\n`;
        
        const secondResponse = await conversationChain.invoke({
            chat_history: chatHistory,
            input: "我想学习AI相关的技术，有什么建议吗？"
        });
        console.log("💡 第二轮对话:", secondResponse);
        console.log();
        
        console.log("✅ 现代LangChain集成测试完成！");
        
    } catch (error) {
        console.error("❌ 现代LangChain集成测试失败:", error);
        if (error instanceof Error) {
            console.error("错误详情:", error.message);
        }
    }
} 
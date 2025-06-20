import { ChatOpenAI } from "@langchain/openai";
import { AgentExecutor, createToolCallingAgent } from "langchain/agents";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { DynamicTool } from "@langchain/core/tools";
import { config } from "./config";

// 创建配置了本地DeepSeek服务的ChatOpenAI实例
function createDeepSeekModel() {
    return new ChatOpenAI({
        openAIApiKey: config.DEEPSEEK_API_KEY,
        modelName: config.DEEPSEEK_MODEL,
        temperature: 0.1, // 数学计算需要更精确
        maxTokens: 1000,
        timeout: 60000,
        maxRetries: 2,
        configuration: {
            baseURL: config.DEEPSEEK_BASE_URL,
        }
    });
}

// 创建加法器工具
function createAdditionTool() {
    return new DynamicTool({
        name: "calculator_add",
        description: "用于计算两个数字的加法。输入参数格式：'数字1,数字2'，例如：'5,3'",
        func: async (input: string) => {
            try {
                const [a, b] = input.split(',').map(s => parseFloat(s.trim()));
                
                if (isNaN(a) || isNaN(b)) {
                    return `错误：无效的输入格式。请使用格式：'数字1,数字2'，例如：'5,3'`;
                }
                
                const result = a + b;
                console.log(`🧮 计算: ${a} + ${b} = ${result}`);
                return `计算结果：${a} + ${b} = ${result}`;
            } catch (error) {
                return `计算错误：${error}`;
            }
        }
    });
}

// 创建Agent和工具执行器
async function createMathAgent() {
    const model = createDeepSeekModel();
    
    // 创建工具集合
    const tools = [
        createAdditionTool()
    ];
    
    // 创建提示模板
    const prompt = ChatPromptTemplate.fromMessages([
        [
            "system",
            `你是一个数学计算助手。你有以下工具可以使用：

1. calculator_add: 专门用于加法计算

当用户需要进行数学计算时，请使用合适的工具来完成计算。
当没有合适的工具时,不使用工具来完成计算,正常回答问题即可
请用中文回答用户的问题，并在使用工具后提供友好的解释。`
        ],
        [
            "human",
            "{input}"
        ],
        [
            "placeholder",
            "{agent_scratchpad}"
        ]
    ]);
    
    // 创建工具调用agent
    const agent = await createToolCallingAgent({
        llm: model,
        tools,
        prompt
    });
    
    // 创建agent执行器
    const agentExecutor = new AgentExecutor({
        agent,
        tools,
        verbose: false, // 显示详细执行过程
        maxIterations: 5,
        returnIntermediateSteps: false
    });
    
    return agentExecutor;
}

// 测试加法器工具
async function testAdditionTool() {
    console.log("🧮 开始测试LangChain加法器工具...\n");
    
    try {
        const mathAgent = await createMathAgent();
        
        // 测试用例
        const testCases = [
            "请帮我计算 15 + 27",
            "请用高级计算器计算 45 * 8"
        ];
        
        for (let i = 0; i < testCases.length; i++) {
            const testCase = testCases[i];
            console.log(`\n--- 测试用例 ${i + 1} ---`);
            console.log(`用户问题: ${testCase}`);
            console.log("处理中...\n");
            
            const result = await mathAgent.invoke({
                input: testCase
            });
            
            console.log("🤖 Agent回答:", result.output);
            console.log("---");
        }
        
        console.log("\n✅ 加法器工具测试完成！");
        
    } catch (error) {
        console.error("❌ 加法器工具测试失败:", error);
        if (error instanceof Error) {
            console.error("错误详情:", error.message);
        }
    }
}

// 主函数
async function main() {
    console.log("🔧 LangChain 加法器工具示例\n");
    
    // 运行基础测试
    await testAdditionTool();
    
    console.log("\n" + "=".repeat(60) + "\n");

}

// 导出主要函数
export {
    createAdditionTool,
    createMathAgent,
    testAdditionTool
};

// 如果直接运行此文件，则执行主函数
if (require.main === module) {
    main().catch(console.error);
}

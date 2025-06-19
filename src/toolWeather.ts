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
        temperature: 0.1,
        maxTokens: 1000,
        timeout: 60000,
        maxRetries: 2,
        configuration: {
            baseURL: config.DEEPSEEK_BASE_URL,
        }
    });
}

// 创建天气查询工具
function createWeatherTool() {
    return new DynamicTool({
        name: "weather_query",
        description: "用于查询指定城市的当前天气情况。输入参数格式：'城市名称'，例如：'北京' 或 'Beijing'",
        func: async (input: string) => {
            try {
                const city = input.trim();
                
                if (!city) {
                    return `错误：请提供城市名称，例如：'北京' 或 'Beijing'`;
                }
                
                // 使用OpenWeatherMap API（免费版本）
                const API_KEY = config.OPENWEATHER_API_KEY;
                
                if (!API_KEY) {
                    return `错误：未配置OpenWeatherMap API密钥。请设置环境变量 OPENWEATHER_API_KEY 或在config.ts中配置。`;
                }
                
                const API_URL = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric&lang=zh_cn`;
                
                console.log(`🌤️  正在查询 ${city} 的天气...`);
                
                const response = await fetch(API_URL);
                
                if (!response.ok) {
                    if (response.status === 404) {
                        return `抱歉，找不到城市"${city}"的天气信息。请检查城市名称是否正确。`;
                    } else if (response.status === 401) {
                        return `天气API认证失败，请检查API密钥配置。`;
                    } else {
                        return `获取天气信息失败，HTTP状态码：${response.status}`;
                    }
                }
                
                const weatherData = await response.json();
                
                // 格式化天气信息
                const result = {
                    城市: weatherData.name,
                    国家: weatherData.sys.country,
                    天气: weatherData.weather[0].description,
                    温度: `${weatherData.main.temp}°C`,
                    体感温度: `${weatherData.main.feels_like}°C`,
                    湿度: `${weatherData.main.humidity}%`,
                    风速: `${weatherData.wind.speed} m/s`,
                    能见度: `${weatherData.visibility / 1000} km`
                };
                
                const formattedResult = `
📍 ${result.城市}, ${result.国家}
🌤️  天气：${result.天气}
🌡️  温度：${result.温度}（体感：${result.体感温度}）
💧 湿度：${result.湿度}
💨 风速：${result.风速}
👁️  能见度：${result.能见度}
                `.trim();
                
                console.log(`✅ 成功获取 ${city} 的天气信息`);
                return formattedResult;
                
            } catch (error) {
                console.error('天气查询错误:', error);
                return `获取天气信息时发生错误：${error instanceof Error ? error.message : '未知错误'}`;
            }
        }
    });
}

// 创建简单的天气工具（用于演示，不需要真实API）
function createMockWeatherTool() {
    return new DynamicTool({
        name: "weather_mock",
        description: "模拟天气查询工具，用于演示。输入参数格式：'城市名称'，例如：'北京' 或 'Beijing'",
        func: async (input: string) => {
            try {
                const city = input.trim();
                
                if (!city) {
                    return `错误：请提供城市名称，例如：'北京' 或 'Beijing'`;
                }
                
                console.log(`🌤️  正在模拟查询 ${city} 的天气...`);
                
                // 模拟API延迟
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                // 模拟天气数据
                const mockWeatherData = {
                    '北京': { temp: 15, weather: '晴朗', humidity: 45, wind: 3.2 },
                    '上海': { temp: 20, weather: '多云', humidity: 60, wind: 2.8 },
                    '广州': { temp: 25, weather: '小雨', humidity: 75, wind: 1.5 },
                    'Beijing': { temp: 15, weather: '晴朗', humidity: 45, wind: 3.2 },
                    'Shanghai': { temp: 20, weather: '多云', humidity: 60, wind: 2.8 },
                    'Guangzhou': { temp: 25, weather: '小雨', humidity: 75, wind: 1.5 }
                };
                
                const weatherInfo = mockWeatherData[city as keyof typeof mockWeatherData] || 
                    { temp: 18, weather: '晴朗', humidity: 50, wind: 2.5 };
                
                const result = `
📍 ${city}
🌤️  天气：${weatherInfo.weather}
🌡️  温度：${weatherInfo.temp}°C
💧 湿度：${weatherInfo.humidity}%
💨 风速：${weatherInfo.wind} m/s
                `.trim();
                
                console.log(`✅ 成功获取 ${city} 的模拟天气信息`);
                return result;
                
            } catch (error) {
                console.error('天气查询错误:', error);
                return `获取天气信息时发生错误：${error instanceof Error ? error.message : '未知错误'}`;
            }
        }
    });
}

// 创建Agent和工具执行器
async function createWeatherAgent(useMock: boolean = true) {
    const model = createDeepSeekModel();
    
    // 创建工具集合
    const tools = [
        useMock ? createMockWeatherTool() : createWeatherTool()
    ];
    
    // 创建提示模板
    const prompt = ChatPromptTemplate.fromMessages([
        [
            "system",
            `你是一个天气查询助手。你有以下工具可以使用：

1. ${useMock ? 'weather_mock' : 'weather_query'}: 专门用于查询城市天气信息
如果玩家输入的是城市名是中文的,可以转换成英文来查询,比如北京转换成Beijing,上海转换成Shanghai,广州转换成Guangzhou
当用户询问天气情况时，请使用天气查询工具获取准确的天气信息。
当没有涉及天气查询时，请正常回答用户的问题。
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
        verbose: true, // 显示详细执行过程
        maxIterations: 5,
        returnIntermediateSteps: true
    });
    
    return agentExecutor;
}

// 测试天气查询工具
async function testWeatherTool() {
    console.log("🌤️  开始测试LangChain天气查询工具...\n");
    
    try {
        const weatherAgent = await createWeatherAgent(false); 
        
        // 测试用例
        const testCases = [
            "请帮我查询Beijing的天气情况",
            "Shanghai今天天气怎么样？",
        ];
        
        for (let i = 0; i < testCases.length; i++) {
            const testCase = testCases[i];
            console.log(`\n--- 测试用例 ${i + 1} ---`);
            console.log(`用户问题: ${testCase}`);
            console.log("处理中...\n");
            
            const result = await weatherAgent.invoke({
                input: testCase
            });
            
            console.log("🤖 Agent回答:", result.output);
            console.log("---");
        }
        
        console.log("\n✅ 天气查询工具测试完成！");
        
    } catch (error) {
        console.error("❌ 天气查询工具测试失败:", error);
        if (error instanceof Error) {
            console.error("错误详情:", error.message);
        }
    }
}

// 主函数
async function main() {
    console.log("🌤️  LangChain 天气查询工具示例\n");
    
    console.log("📝 说明：");
    console.log("- 当前使用模拟天气数据进行演示");
    console.log("- 要使用真实天气数据，请：");
    console.log("  1. 注册 OpenWeatherMap 账号：https://openweathermap.org/api");
    console.log("  2. 获取免费的API密钥");
    console.log("  3. 设置环境变量：");
    console.log("     - 复制 .env.example 为 .env");
    console.log("     - 在 .env 文件中设置 OPENWEATHER_API_KEY=你的API密钥");
    console.log("     - 或者在终端中运行：export OPENWEATHER_API_KEY=你的API密钥");
    console.log("  4. 调用 createWeatherAgent(false) 使用真实API");
    console.log("");
    
    // 运行基础测试
    await testWeatherTool();
    
    console.log("\n" + "=".repeat(60) + "\n");
}

// 导出主要函数
export {
    createWeatherTool,
    createMockWeatherTool,
    createWeatherAgent,
    testWeatherTool
};

// 如果直接运行此文件，则执行主函数
if (require.main === module) {
    main().catch(console.error);
}

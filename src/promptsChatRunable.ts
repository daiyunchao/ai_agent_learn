//字符串提示词
import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { RunnableParallel } from "@langchain/core/runnables";

import { config } from "./config";

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

async function start(){
    console.log("start");
    const prompt = ChatPromptTemplate.fromMessages([
        [
            "system",
            "你是一个取名大师,帮我按照用户的要求取名,要求需要名字比较文雅"
        ],
        [
            "human",
            "{input}"
        ]
    ]);
    const prompt2 = ChatPromptTemplate.fromMessages([
        [
            "system",
            "你是一个诗人,帮我写一首诗句"
        ],
        [
            "human",
            "{input}"
        ]
    ]);
const llm = createDeepSeekLLM();
const chain1 = prompt.pipe(llm);
const chain2 = prompt2.pipe(llm);
const chain = RunnableParallel.from([chain1, chain2]);
const result = await chain.invoke({
    input: "蘅芷"
})
//查看graph
console.log(chain.getGraph().drawMermaid());

console.log(result)
}

start().then(() => {
    console.log("done")
});


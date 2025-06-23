import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate, FewShotChatMessagePromptTemplate } from "@langchain/core/prompts";
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

class MagicMatch {
    private llm: ChatOpenAI;
    private chain: any; // 使用LCEL链
    constructor() {
        this.llm = createDeepSeekLLM();
        
    }
    async run(){
        //chat提示词
        const chatPrompt = ChatPromptTemplate.fromMessages(
            [
                [
                    "human",
                    "{input}"
                ],
                [
                    "assistant",
                    "{output}"
                ]
            ]
        )

        //few shot提示词
        const fewShotPrompt = new FewShotChatMessagePromptTemplate({
            examplePrompt: chatPrompt,
            inputVariables: ["input"],
            examples:[
                {"input":"2 🐦 2","output":"4"},
                {"input":"2 🐦 3","output":"5"},
            ]
        });

        const exampleMessages = await fewShotPrompt.formatMessages({});

        //组合提示词
        const finalPrompt = ChatPromptTemplate.fromMessages([
            [
                "system",
                "你是一个数学大师,可以通过规律帮我生成答案"
            ],
            ...exampleMessages,
            [
                "human",
                "{input}"
            ]
        ])

        //调用大模型
        this.chain = finalPrompt.pipe(this.llm)
        const result = await this.chain.invoke({
            input: "3 🐦 4"
        });
        console.log(result.content);
    }
}

new MagicMatch().run().then(() => {
    console.log("done")
});
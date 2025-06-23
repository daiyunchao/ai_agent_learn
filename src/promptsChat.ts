//字符串提示词
import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";

async function start(){
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
const result = await prompt.formatMessages({
    input: "请帮我取一个名字"
})
console.log(result)
}

start().then(() => {
    console.log("done")
});


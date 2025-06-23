import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { HumanMessage } from "@langchain/core/messages";

async function start(){
    const prompt = ChatPromptTemplate.fromMessages([
        [
            "system",
            "你是一个取名大师,帮我按照用户的要求取名,要求需要名字比较文雅"
        ],
       new MessagesPlaceholder("input"),
    ]);
    const result = await prompt.invoke({
        "input":[
            new HumanMessage("请帮我取一个名字")
        ]
    })
    console.log(result)
}
start().then(() => {
    console.log("done")
});

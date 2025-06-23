//字符串提示词
import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";

async function start(){
    const template = `你是一个起名大师,请模仿示例起3个具有{county}特色的{gender}名字,示例: 男孩常用名字{boyName},女孩常用名字{girlName}.请返回以","分隔的列表形式. 不要返回额外内容`;
    const prompt = PromptTemplate.fromTemplate(template);
    const result = await prompt.format({
        county: "中国",
        gender: "男孩",
        boyName: "龙儿",
        girlName: "凤儿"
    })
    console.log(result)
}

start().then(() => {
    console.log("done")
});


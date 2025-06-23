import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate, FewShotPromptTemplate,PromptTemplate,Example } from "@langchain/core/prompts";
import { LengthBasedExampleSelector } from "@langchain/core/example_selectors";


async function run(){
    //例子
    const examples: Example[] = [
        {
            input: "happy",
            output: "sad"
        },
      
        {
            input: "angry",
            output: "calm"
        },
        
        {
            input: "excited",
            output: "calm"
        },
       
        {
            input: "excited",
            output: "calm"
        },
        {
            input: "tall",
            output: "short"
        },
        {
            input: "高兴",
            output: "悲伤"
        }
    ]
    //提示词
    const prompt = new PromptTemplate({
        template: "原词：{input}，反义词：{output}",
        inputVariables: ["input","output"]
    })
    //长度选择器
    const selector = new LengthBasedExampleSelector({
        examplePrompt: prompt,
        maxLength: 100,
        getTextLength: (text: string) => text.length
    })

    // 添加例子
    for (const example of examples) {
        await selector.addExample(example);
    }

    //few shot提示词
    const fewShotPrompt = new FewShotPromptTemplate({
        exampleSelector: selector,
        examplePrompt: prompt,
        prefix: "以下是一些形容词和它们的反义词",
        suffix: "原词:{adjective}，反义词:",
        inputVariables: ["adjective"]
    })

        //打印提示词
    console.log(await fewShotPrompt.invoke({
        adjective: "happy"
    }));
}

run().then(() => {
    console.log("done")
});
import { config } from "./config";

// 简单的HTTP请求函数来调用本地DeepSeek模型
async function callDeepSeekModel(prompt: string): Promise<string> {
    try {
        const response = await fetch(`${config.DEEPSEEK_BASE_URL}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.DEEPSEEK_API_KEY}`,
            },
            body: JSON.stringify({
                model: config.DEEPSEEK_MODEL,
                messages: [
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                temperature: 0.7,
                max_tokens: 1000,
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        throw new Error(`调用DeepSeek模型失败: ${error}`);
    }
}

export async function testDeepSeekModel() {
    console.log("🚀 开始测试本地DeepSeek模型调用...");
    console.log(`🔗 模型地址: ${config.DEEPSEEK_BASE_URL}`);
    console.log(`🤖 模型名称: ${config.DEEPSEEK_MODEL}\n`);

    const questions = [
        "什么是人工智能？请用简短的话回答。",
        "请解释一下机器学习的基本概念。",
        "你好，请介绍一下你自己。"
    ];

    for (let i = 0; i < questions.length; i++) {
        const question = questions[i];
        console.log(`📝 问题 ${i + 1}: ${question}`);
        console.log("🤔 正在思考...");

        try {
            const response = await callDeepSeekModel(question);
            console.log(`💡 回答: ${response}\n`);
        } catch (error) {
            console.error(`❌ 调用模型时发生错误: ${error}\n`);
        }

        // 添加延迟避免请求过快
        if (i < questions.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }

    console.log("✅ 测试完成！");
} 
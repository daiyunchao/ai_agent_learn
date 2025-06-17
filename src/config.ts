// 本地DeepSeek模型配置
export const config = {
    DEEPSEEK_BASE_URL: process.env.DEEPSEEK_BASE_URL || "http://10.60.11.59:1234/v1",
    DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY || "sk-dummy-key", // 本地模型可能不需要真实key
    DEEPSEEK_MODEL: process.env.DEEPSEEK_MODEL || "deepseek-chat",
}; 
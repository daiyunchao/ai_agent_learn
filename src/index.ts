import * as dotenv from "dotenv";
import { testDeepSeekModel } from "./deepseek-example";
import { testLangChainIntegration } from "./langchain-deepseek";
import { testModernLangChainIntegration } from "./modern-langchain-example";

// 加载环境变量
dotenv.config();

async function main() {
    console.log("🚀 欢迎使用 AI Agent 学习项目!");
    console.log("📚 本地DeepSeek模型与LangChain集成示例\n");
    
    try {
        // 基础HTTP调用测试
        console.log("=== 第一部分：基础HTTP调用测试 ===");
        await testDeepSeekModel();
        
        console.log("\n" + "=".repeat(50) + "\n");
        
        // 传统LangChain集成测试
        console.log("=== 第二部分：传统LangChain集成测试 ===");
        await testLangChainIntegration();
        
        console.log("\n" + "=".repeat(50) + "\n");
        
        // 现代LangChain LCEL测试
        console.log("=== 第三部分：现代LangChain LCEL测试 ===");
        await testModernLangChainIntegration();
        
        console.log("\n" + "=".repeat(50) + "\n");
        console.log("🎉 恭喜！所有测试都通过了！");
        console.log("💡 您的本地DeepSeek模型已经可以正常使用了！");
        console.log("📖 现在您可以开始构建更复杂的AI Agent应用：");
        console.log("   - 使用现代LCEL语法构建复杂链");
        console.log("   - 集成LangChain的各种工具和代理");
        console.log("   - 创建多步骤处理和工作流");
        console.log("   - 添加向量数据库和RAG功能");
        console.log("   - 构建多轮对话和记忆系统");
        console.log("   - 开发自定义工具和插件");
        
    } catch (error) {
        console.error("❌ 程序执行失败:", error);
        console.log("\n💡 故障排除建议：");
        console.log("   1. 确保本地DeepSeek模型服务正在运行");
        console.log("   2. 检查模型地址和端口配置是否正确");
        console.log("   3. 验证API密钥配置（如果需要的话）");
        console.log("   4. 查看src/config.ts文件确认配置参数");
        console.log("   5. 确保模型支持OpenAI兼容的API格式");
    }
}

// 运行主函数
main().catch((error) => {
    console.error("❌ 发生错误：", error);
    process.exit(1);
}); 
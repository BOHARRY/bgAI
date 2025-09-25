// 配置文件
const CONFIG = {
    // 本地 API 配置
    API_URL: '/api/chat',
    
    // AI 模型配置
    MODEL: 'gpt-4o-mini',
    MAX_TOKENS: 1000,
    TEMPERATURE: 0.4,
    
    // 系統提示詞 (注意：實際的系統提示詞在服務器端動態生成，包含完整的 Similo 規則)
    SYSTEM_PROMPT: `你是 Similo AI 陪玩員，專門協助玩家進行 Similo 桌遊。`,

    // UI 配置
    TYPING_DELAY: 50,
    MAX_CHAT_HISTORY: 20
};

// 導出配置
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
} else {
    window.CONFIG = CONFIG;
}

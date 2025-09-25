// 測試 prompt 內容是否包含規則文件
const ResponseGenerator = require('./response-generator.js');

async function testPromptContent() {
    console.log('🧪 測試 Prompt 內容\n');
    
    const generator = new ResponseGenerator();
    
    // 模擬意圖結果
    const mockIntentResult = {
        intent: {
            primary_intent: 'start_game',
            confidence: 0.95
        },
        response_strategy: {
            approach: 'environment_sensing',
            tone: 'friendly'
        }
    };
    
    // 模擬上下文分析
    const mockContextAnalysis = {
        continuity_analysis: {
            is_continuous: false
        }
    };
    
    // 生成 prompt
    const prompt = generator.buildGenerationPrompt(
        '可以教我玩遊戲嗎?',
        mockContextAnalysis,
        mockIntentResult
    );
    
    console.log('📝 生成的 Prompt 長度:', prompt.length, '字符');
    console.log('\n🔍 檢查 Prompt 內容:');
    
    // 檢查是否包含規則文件內容
    const containsGameRules = prompt.includes('遊戲區域與佈局詳解');
    const containsRoleRules = prompt.includes('出題者 (Clue Giver)');
    const containsFullRules = prompt.includes('=== 遊戲狀態與操作手冊 ===');
    
    console.log(`  - 包含遊戲規則: ${containsGameRules}`);
    console.log(`  - 包含角色規則: ${containsRoleRules}`);
    console.log(`  - 包含完整規則標記: ${containsFullRules}`);
    
    if (containsGameRules && containsRoleRules) {
        console.log('✅ Prompt 包含完整的 Similo 規則文件');
    } else {
        console.log('❌ Prompt 沒有包含完整的規則文件');
    }
    
    // 顯示 prompt 的前 500 字符
    console.log('\n📖 Prompt 預覽 (前 500 字符):');
    console.log(prompt.substring(0, 500) + '...');
    
    // 檢查 buildSimiloKnowledge 的輸出
    console.log('\n🎮 buildSimiloKnowledge 輸出:');
    const knowledge = generator.buildSimiloKnowledge(mockIntentResult);
    console.log('長度:', knowledge.length, '字符');
    console.log('預覽:', knowledge.substring(0, 200) + '...');
}

testPromptContent().catch(console.error);

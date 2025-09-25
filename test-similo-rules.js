// 測試 Similo 規則載入功能
const fs = require('fs');
const path = require('path');

// 載入 Similo 規則文件
function loadSimiloRules() {
    try {
        const similoGameRules = fs.readFileSync(path.join(__dirname, 'book', 'Similo.md'), 'utf8');
        const similoRoleRules = fs.readFileSync(path.join(__dirname, 'book', 'SimiloRole.md'), 'utf8');
        
        return {
            gameRules: similoGameRules,
            roleRules: similoRoleRules
        };
    } catch (error) {
        console.error('無法載入 Similo 規則文件:', error);
        return {
            gameRules: '',
            roleRules: ''
        };
    }
}

// 測試規則載入
console.log('🧪 測試 Similo 規則載入...\n');

const rules = loadSimiloRules();

console.log('📋 遊戲狀態與操作手冊長度:', rules.gameRules.length, '字符');
console.log('📋 角色規則長度:', rules.roleRules.length, '字符');

if (rules.gameRules.length > 0 && rules.roleRules.length > 0) {
    console.log('\n✅ Similo 規則文件載入成功！');
    
    // 顯示規則文件的前 200 個字符作為預覽
    console.log('\n📖 遊戲狀態手冊預覽:');
    console.log(rules.gameRules.substring(0, 200) + '...');
    
    console.log('\n📖 角色規則預覽:');
    console.log(rules.roleRules.substring(0, 200) + '...');
    
    // 構建完整的系統提示詞
    const systemPrompt = `你是 Similo AI 陪玩員，專門協助玩家進行 Similo 桌遊。你擁有完整的 Similo 遊戲規則知識，可以擔任出題者或協助猜題者。

=== SIMILO 遊戲狀態與操作手冊 ===
${rules.gameRules}

=== SIMILO 角色規則 ===
${rules.roleRules}

你的主要任務：
1. 🎯 **遊戲主持** - 協助建立和管理 Similo 遊戲狀態
2. 🤖 **AI 出題者** - 當玩家需要時，擔任出題者角色，選擇秘密人物並給予線索
3. 🧠 **策略顧問** - 協助猜題者分析線索和制定淘汰策略
4. 📋 **規則裁判** - 解釋規則細節，確保遊戲正確進行
5. 🎮 **遊戲狀態追蹤** - 維護遊戲桌面狀態（謎底區、線索區、淘汰區等）

重要指導原則：
- 嚴格遵循上述 Similo 規則文件
- 當擔任出題者時，要保守秘密人物資訊
- 提供清晰的遊戲狀態描述
- 用座標系統 (1,1) 到 (4,3) 來標識卡牌位置
- 記錄線索卡的擺放方向（垂直=相似，橫置=不相似）

請用友善、專業且有趣的語調與玩家互動，讓 Similo 遊戲體驗更加精彩！`;

    console.log('\n📏 完整系統提示詞長度:', systemPrompt.length, '字符');
    console.log('\n✅ 系統提示詞構建成功！');
    
} else {
    console.log('\n❌ 規則文件載入失敗！');
}

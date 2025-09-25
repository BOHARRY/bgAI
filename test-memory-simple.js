const ResponseGenerator = require('./response-generator');

function testMemoryExtraction() {
    console.log('🧪 測試記憶提取功能...\n');
    
    const responseGenerator = new ResponseGenerator();
    
    // 測試案例 1：完整對話歷史
    console.log('=== 測試案例 1：完整對話歷史 ===');
    const fullHistory = [
        { role: 'user', content: '你可以教我怎麼玩嗎？' },
        { role: 'assistant', content: '當然可以！請告訴我你們有幾個人？' },
        { role: 'user', content: '我們有三個人，都是新手' },
        { role: 'assistant', content: '太好了！請選擇卡牌主題。' },
        { role: 'user', content: '神話!' },
        { role: 'assistant', content: '很好！現在請洗牌後排成4×3方陣。' },
        { role: 'user', content: '排好了' },
        { role: 'assistant', content: '太好了！現在請出題者選擇秘密人物。' },
        { role: 'user', content: '選好了' }
    ];
    
    const contextAnalysis1 = { chatHistory: fullHistory };
    const memory1 = responseGenerator.buildMemoryContext(contextAnalysis1);
    
    console.log('🧠 提取的記憶：');
    console.log(memory1);
    console.log('');
    
    // 驗證關鍵信息
    const expectedInfo1 = ['3人', '新手', '神話', '卡牌佈局', '秘密人物選擇'];
    let found1 = 0;
    expectedInfo1.forEach(info => {
        if (memory1.includes(info)) {
            console.log(`✅ 找到: ${info}`);
            found1++;
        } else {
            console.log(`❌ 缺少: ${info}`);
        }
    });
    console.log(`準確率: ${found1}/${expectedInfo1.length} (${Math.round(found1/expectedInfo1.length*100)}%)\n`);
    
    // 測試案例 2：部分對話歷史
    console.log('=== 測試案例 2：部分對話歷史 ===');
    const partialHistory = [
        { role: 'user', content: '你可以教我怎麼玩嗎？' },
        { role: 'assistant', content: '當然可以！請告訴我你們有幾個人？' },
        { role: 'user', content: '我們有五個人' }
    ];
    
    const contextAnalysis2 = { chatHistory: partialHistory };
    const memory2 = responseGenerator.buildMemoryContext(contextAnalysis2);
    
    console.log('🧠 提取的記憶：');
    console.log(memory2);
    console.log('');
    
    // 驗證關鍵信息
    const expectedInfo2 = ['5人'];
    let found2 = 0;
    expectedInfo2.forEach(info => {
        if (memory2.includes(info)) {
            console.log(`✅ 找到: ${info}`);
            found2++;
        } else {
            console.log(`❌ 缺少: ${info}`);
        }
    });
    console.log(`準確率: ${found2}/${expectedInfo2.length} (${Math.round(found2/expectedInfo2.length*100)}%)\n`);
    
    // 測試案例 3：空歷史
    console.log('=== 測試案例 3：空歷史 ===');
    const emptyHistory = [];
    const contextAnalysis3 = { chatHistory: emptyHistory };
    const memory3 = responseGenerator.buildMemoryContext(contextAnalysis3);
    
    console.log('🧠 提取的記憶：');
    console.log(memory3);
    console.log('');
    
    if (memory3.includes('尚無已知信息')) {
        console.log('✅ 正確處理空歷史');
    } else {
        console.log('❌ 空歷史處理錯誤');
    }
    
    // 測試案例 4：數字變體
    console.log('\n=== 測試案例 4：數字變體 ===');
    const numberVariants = [
        { role: 'user', content: '我們有4個人' },
        { role: 'user', content: '我們四個人' },
        { role: 'user', content: '我們六人' },
        { role: 'user', content: '我們有八位玩家' }
    ];
    
    numberVariants.forEach((msg, index) => {
        const testHistory = [msg];
        const contextAnalysis = { chatHistory: testHistory };
        const memory = responseGenerator.buildMemoryContext(contextAnalysis);
        
        console.log(`測試 ${index + 1}: "${msg.content}"`);
        console.log(`結果: ${memory}`);
        
        // 檢查是否正確提取人數
        const hasPlayerCount = memory.includes('玩家人數：');
        console.log(`${hasPlayerCount ? '✅' : '❌'} 人數提取: ${hasPlayerCount ? '成功' : '失敗'}`);
        console.log('');
    });
    
    console.log('🎉 記憶提取功能測試完成！');
}

// 測試記憶在提示詞中的應用
function testMemoryInPrompt() {
    console.log('\n🧪 測試記憶在提示詞中的應用...\n');
    
    const responseGenerator = new ResponseGenerator();
    
    // 模擬有記憶的上下文
    const contextWithMemory = {
        chatHistory: [
            { role: 'user', content: '你可以教我怎麼玩嗎？' },
            { role: 'assistant', content: '當然可以！請告訴我你們有幾個人？' },
            { role: 'user', content: '我們有三個人，都是新手' },
            { role: 'assistant', content: '太好了！請選擇卡牌主題。' },
            { role: 'user', content: '神話!' }
        ]
    };
    
    // 模擬遊戲狀態
    const gamePhaseInfo = {
        phaseName: '卡牌佈局設置',
        instruction: '請洗牌後排成4×3方陣',
        currentRole: '所有玩家',
        completionCheck: '用戶說"排好了"'
    };
    
    // 構建完整的提示詞
    const prompt = responseGenerator.buildGenerationPrompt(
        '現在該做什麼？',
        contextWithMemory,
        { intent: { primary_intent: 'game_state_query' } },
        gamePhaseInfo
    );
    
    console.log('📝 生成的提示詞片段（記憶部分）：');
    
    // 提取記憶部分
    const memoryMatch = prompt.match(/🧠 \*\*已知信息記憶\*\*：\n(.*?)\n\n/s);
    if (memoryMatch) {
        console.log(memoryMatch[1]);
        
        // 檢查是否包含關鍵信息
        const memoryContent = memoryMatch[1];
        const keyInfo = ['3人', '新手', '神話'];
        
        console.log('\n✅ 記憶內容驗證：');
        keyInfo.forEach(info => {
            const found = memoryContent.includes(info);
            console.log(`${found ? '✅' : '❌'} ${info}: ${found ? '已記住' : '遺失'}`);
        });
        
        // 檢查是否有"不要再問"的提醒
        const hasReminder = memoryContent.includes('不要再問');
        console.log(`${hasReminder ? '✅' : '❌'} 防重複提醒: ${hasReminder ? '已包含' : '缺少'}`);
        
    } else {
        console.log('❌ 未找到記憶部分');
    }
}

testMemoryExtraction();
testMemoryInPrompt();

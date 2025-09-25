const GameStateManager = require('./game-state-manager');

function testPhaseProgression() {
    console.log('🧪 測試遊戲階段推進...\n');
    
    const gameStateManager = new GameStateManager();
    
    // 測試完整的階段推進流程
    const testFlow = [
        {
            step: 1,
            message: "你可以教我怎麼玩嗎？",
            expectedPhase: "player_count_setup",
            description: "觸發遊戲開始"
        },
        {
            step: 2,
            message: "我們有三個人",
            expectedPhase: "card_layout_setup", 
            description: "人數確認完成"
        },
        {
            step: 3,
            message: "排好了",
            expectedPhase: "secret_selection",
            description: "卡牌佈局完成"
        },
        {
            step: 4,
            message: "選好了",
            expectedPhase: "hand_cards_setup",
            description: "秘密人物選擇完成"
        },
        {
            step: 5,
            message: "準備好了",
            expectedPhase: "round_1_clue",
            description: "手牌設置完成"
        }
    ];
    
    console.log(`初始狀態: ${gameStateManager.currentState.phase}\n`);
    
    for (let i = 0; i < testFlow.length; i++) {
        const test = testFlow[i];
        console.log(`=== 步驟 ${test.step}: ${test.description} ===`);
        console.log(`用戶消息: "${test.message}"`);
        console.log(`當前階段: ${gameStateManager.currentState.phase}`);
        
        // 檢查是否可以推進
        const canAdvance = gameStateManager.canAdvancePhase(test.message, null);
        console.log(`可以推進: ${canAdvance ? '✅' : '❌'}`);
        
        if (canAdvance) {
            // 提取完成數據
            let completionData = {};
            if (test.message.includes('三個人')) {
                completionData.playerCount = 3;
            }
            
            // 推進階段
            const newPhaseInfo = gameStateManager.advanceToNextPhase(completionData);
            console.log(`新階段: ${newPhaseInfo.phase}`);
            console.log(`階段名稱: ${newPhaseInfo.phaseName}`);
            console.log(`當前指令: ${newPhaseInfo.instruction}`);
            
            // 驗證是否符合預期
            if (newPhaseInfo.phase === test.expectedPhase) {
                console.log(`✅ 階段推進正確`);
            } else {
                console.log(`❌ 階段推進錯誤，期望: ${test.expectedPhase}，實際: ${newPhaseInfo.phase}`);
            }
        } else {
            console.log(`❌ 無法推進階段`);
        }
        
        console.log('\n' + '='.repeat(60) + '\n');
    }
    
    // 測試邊緣情況
    console.log('=== 邊緣情況測試 ===');
    
    // 重置狀態
    const gameStateManager2 = new GameStateManager();
    
    const edgeCases = [
        {
            message: "準備好了",
            phase: "not_started",
            shouldAdvance: false,
            description: "在未開始狀態說準備好了"
        },
        {
            message: "我們有十個人",
            phase: "player_count_setup", 
            shouldAdvance: true,
            description: "數字變體測試"
        },
        {
            message: "好了好了",
            phase: "card_layout_setup",
            shouldAdvance: true,
            description: "重複詞語測試"
        }
    ];
    
    edgeCases.forEach((testCase, index) => {
        console.log(`\n邊緣測試 ${index + 1}: ${testCase.description}`);
        
        // 設置特定階段
        gameStateManager2.currentState.phase = testCase.phase;
        console.log(`設置階段: ${testCase.phase}`);
        console.log(`測試消息: "${testCase.message}"`);
        
        const canAdvance = gameStateManager2.canAdvancePhase(testCase.message, null);
        console.log(`可以推進: ${canAdvance ? '✅' : '❌'}`);
        console.log(`預期結果: ${testCase.shouldAdvance ? '✅' : '❌'}`);
        
        if (canAdvance === testCase.shouldAdvance) {
            console.log(`✅ 測試通過`);
        } else {
            console.log(`❌ 測試失敗`);
        }
    });
    
    console.log('\n🎉 階段推進測試完成！');
}

// 測試階段信息獲取
function testPhaseInfo() {
    console.log('\n🧪 測試階段信息獲取...\n');
    
    const gameStateManager = new GameStateManager();
    
    // 測試每個階段的信息
    const phases = [
        'not_started',
        'player_count_setup', 
        'card_layout_setup',
        'secret_selection',
        'hand_cards_setup',
        'round_1_clue'
    ];
    
    phases.forEach(phase => {
        gameStateManager.currentState.phase = phase;
        const phaseInfo = gameStateManager.getCurrentPhaseInfo();
        
        console.log(`階段: ${phase}`);
        console.log(`  名稱: ${phaseInfo.phaseName}`);
        console.log(`  指令: ${phaseInfo.instruction}`);
        console.log(`  完成標準: ${phaseInfo.completionCheck}`);
        console.log(`  當前角色: ${phaseInfo.currentRole || '無'}`);
        console.log('');
    });
}

testPhaseProgression();
testPhaseInfo();

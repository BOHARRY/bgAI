const ResponseGenerator = require('./response-generator');

function testRuleValidation() {
    console.log('🧪 測試規則驗證功能...\n');
    
    const responseGenerator = new ResponseGenerator();
    
    // 測試案例：包含錯誤規則的回應
    const testCases = [
        {
            name: '錯誤規則：三次猜測',
            response: '在 Similo 中，猜題者有三次猜測的機會，出題者可以提供最多三個線索。',
            expectedErrors: ['包含錯誤規則：三次猜測']
        },
        {
            name: '錯誤術語：隱藏者',
            response: '隱藏者需要選擇一個秘密角色，然後給出線索。',
            expectedErrors: ['使用錯誤術語：隱藏者']
        },
        {
            name: '說明書語氣',
            response: '通常情況下，這意味著玩家需要根據線索進行判斷。',
            expectedErrors: ['使用說明書語氣']
        },
        {
            name: '正確規則',
            response: '第1回合淘汰1張卡，第2回合淘汰2張卡，線索卡直放表示相似。',
            expectedErrors: []
        },
        {
            name: '混合錯誤',
            response: '隱藏者有三次猜測機會，通常這意味著遊戲很簡單。',
            expectedErrors: ['包含錯誤規則：三次猜測', '使用錯誤術語：隱藏者', '使用說明書語氣']
        }
    ];
    
    console.log('=== 規則驗證測試 ===');
    testCases.forEach((testCase, index) => {
        console.log(`\n測試 ${index + 1}: ${testCase.name}`);
        console.log(`原始回應: "${testCase.response}"`);
        
        const validation = responseGenerator.validateRules(testCase.response);
        
        console.log(`驗證結果: ${validation.isValid ? '✅ 通過' : '❌ 失敗'}`);
        if (!validation.isValid) {
            console.log(`發現錯誤: ${validation.errors.join(', ')}`);
        }
        
        // 檢查是否找到了預期的錯誤
        const foundExpectedErrors = testCase.expectedErrors.every(expectedError => 
            validation.errors.some(actualError => actualError.includes(expectedError.split('：')[1]))
        );
        
        if (testCase.expectedErrors.length === 0) {
            // 預期沒有錯誤
            if (validation.isValid) {
                console.log('✅ 測試通過：正確識別為有效規則');
            } else {
                console.log('❌ 測試失敗：錯誤標記為無效');
            }
        } else {
            // 預期有錯誤
            if (foundExpectedErrors) {
                console.log('✅ 測試通過：正確識別預期錯誤');
            } else {
                console.log('❌ 測試失敗：未能識別預期錯誤');
                console.log(`預期錯誤: ${testCase.expectedErrors.join(', ')}`);
                console.log(`實際錯誤: ${validation.errors.join(', ')}`);
            }
        }
    });
    
    console.log('\n=== 規則修正測試 ===');
    const correctionCases = [
        {
            name: '修正三次猜測',
            original: '猜題者有三次猜測的機會來找到正確答案。',
            expected: '5回合淘汰'
        },
        {
            name: '修正隱藏者術語',
            original: '隱藏者需要給出線索幫助其他玩家。',
            expected: '出題者'
        },
        {
            name: '修正說明書語氣',
            original: '通常情況下，這意味著玩家需要仔細思考。',
            expected: ''  // 應該被移除
        }
    ];
    
    correctionCases.forEach((testCase, index) => {
        console.log(`\n修正測試 ${index + 1}: ${testCase.name}`);
        console.log(`原始: "${testCase.original}"`);
        
        const corrected = responseGenerator.correctRuleErrors(testCase.original);
        console.log(`修正後: "${corrected}"`);
        
        if (corrected.includes(testCase.expected) || (testCase.expected === '' && corrected.length < testCase.original.length)) {
            console.log('✅ 修正成功');
        } else {
            console.log('❌ 修正失敗');
        }
    });
    
    console.log('\n=== 完整流程測試 ===');
    const fullTestResponse = '在 Similo 中，隱藏者有三次猜測的機會。通常這意味著遊戲很容易。';
    console.log(`原始回應: "${fullTestResponse}"`);
    
    const processedResponse = responseGenerator.postProcessResponse(fullTestResponse);
    console.log(`處理後回應: "${processedResponse}"`);
    
    // 檢查是否修正了主要錯誤
    const hasCorrections = !processedResponse.includes('三次猜測') && 
                          !processedResponse.includes('隱藏者') && 
                          !processedResponse.includes('通常這意味著');
    
    if (hasCorrections) {
        console.log('✅ 完整流程測試通過：成功修正所有錯誤');
    } else {
        console.log('❌ 完整流程測試失敗：仍包含錯誤規則');
    }
    
    console.log('\n🎉 規則驗證功能測試完成！');
}

testRuleValidation();

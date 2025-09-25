# 🚀 Phase 2: 多 AI 模組架構 - 詳細開發計劃

## 📋 **項目概述**

### **目標**
將現有的單一 AI 架構升級為多個專門化 AI 模組，實現質的體驗飛躍。

### **核心改進**
- **專業化分工** - 每個 AI 專注特定任務
- **智能上下文理解** - 深度分析對話歷史和意圖
- **流暢對話體驗** - 處理複雜的非線性對話
- **成本效益優化** - 利用 gpt-4o-mini 的低成本優勢

---

## 🏗️ **架構設計**

### **Phase 2A: 基礎多 AI 架構**
```
用戶輸入
    ↓
Context Analyzer AI (新增) → 上下文分析
    ↓
現有 Intent + Response AI → 意圖檢測 + 回應生成
    ↓
返回結果
```

### **Phase 2B: 完整多 AI 架構**
```
用戶輸入
    ↓
Context Analyzer AI → 上下文分析
    ↓
Intent Detector AI → 意圖檢測
    ↓
Response Generator AI → 回應生成
    ↓
返回結果
```

---

## 🧠 **AI 模組詳細設計**

### **1. Context Analyzer AI (上下文分析師)**

#### **職責範圍**
- 分析對話歷史的語義連貫性
- 檢測對話中斷和回歸模式
- 識別未完成的對話線程
- 評估上下文相關度和重要性

#### **輸入格式**
```json
{
  "currentMessage": "我們有4個人",
  "chatHistory": [
    {"role": "user", "content": "你可以教我怎麼玩嗎？"},
    {"role": "assistant", "content": "先跟我說說：現在桌上有幾位玩家呢？"},
    {"role": "user", "content": "線索卡要怎麼放？"},
    {"role": "assistant", "content": "線索卡的擺放很重要..."}
  ],
  "timestamp": 1758797936693
}
```

#### **輸出格式**
```json
{
  "continuity_analysis": {
    "is_continuous": true,
    "continuity_type": "delayed_response",
    "confidence": 0.9,
    "reasoning": "用戶回答了第2輪對話中關於玩家人數的問題"
  },
  "topic_analysis": {
    "current_topic": "player_count_response",
    "previous_topic": "clue_card_rules",
    "topic_switch_detected": true,
    "return_to_topic": "player_count_question"
  },
  "context_relevance": {
    "relevant_history": [0, 1],
    "irrelevant_history": [2, 3],
    "key_information": {
      "pending_question": "現在桌上有幾位玩家呢？",
      "question_asker": "assistant",
      "question_timestamp": 1758797936690
    }
  },
  "conversation_state": {
    "incomplete_threads": ["player_count_setup"],
    "completed_threads": ["clue_card_explanation"],
    "current_phase": "game_setup"
  }
}
```

#### **Prompt 設計**
```javascript
const contextAnalyzerPrompt = `你是專業的對話上下文分析師。分析用戶對話的連續性、話題切換和上下文相關性。

當前用戶消息：「${currentMessage}」

對話歷史：
${chatHistoryFormatted}

請分析：
1. **連續性分析** - 這是否是對之前問題的回應？
2. **話題分析** - 是否發生了話題切換？
3. **上下文相關性** - 哪些歷史對話與當前消息相關？
4. **對話狀態** - 有哪些未完成的對話線程？

返回 JSON 格式的分析結果。`;
```

### **2. Intent Detector AI (意圖檢測師)**

#### **職責範圍**
- 精準分類用戶意圖
- 評估回應緊急程度
- 建議最佳回應策略
- 判斷環境感知需求

#### **輸入格式**
```json
{
  "currentMessage": "我們有4個人",
  "contextAnalysis": {
    "continuity_analysis": {...},
    "topic_analysis": {...},
    "context_relevance": {...}
  }
}
```

#### **輸出格式**
```json
{
  "intent": {
    "primary_intent": "player_count_response",
    "secondary_intent": "game_setup_continuation",
    "confidence": 0.95,
    "intent_category": "setup_information"
  },
  "urgency": {
    "level": "normal",
    "should_interrupt": false,
    "priority_score": 0.7
  },
  "response_strategy": {
    "approach": "acknowledge_and_continue",
    "tone": "encouraging",
    "should_reference_context": true,
    "next_action": "proceed_with_setup"
  },
  "environment_sensing": {
    "needs_sensing": false,
    "already_collected": ["player_count"],
    "still_needed": ["experience_level", "materials"]
  }
}
```

### **3. Response Generator AI (回應生成師)**

#### **職責範圍**
- 生成自然友善的回應
- 保持 Similo 陪玩員人格
- 處理複雜對話流程
- 整合上下文和意圖信息

#### **輸入格式**
```json
{
  "currentMessage": "我們有4個人",
  "contextAnalysis": {...},
  "intentResult": {...},
  "gameRules": "Similo 完整規則文件"
}
```

#### **輸出格式**
```json
{
  "response": "太好了！4個人玩 Similo 很棒 😊 我注意到剛才你問了線索卡的問題，現在我們先完成設置，然後我會詳細解釋線索卡的使用方法。你們四個人中誰想當出題者呢？",
  "response_metadata": {
    "referenced_context": true,
    "acknowledged_topic_switch": true,
    "maintained_flow": true,
    "next_expected_input": "role_selection"
  }
}
```

---

## 🔧 **技術實現方案**

### **Phase 2A 實現步驟**

#### **Step 1: 創建 Context Analyzer 模組**
```javascript
// 文件：context-analyzer.js
class ContextAnalyzer {
    async analyze(currentMessage, chatHistory, openaiApiCall) {
        const prompt = this.buildAnalysisPrompt(currentMessage, chatHistory);
        const result = await openaiApiCall([{role: 'user', content: prompt}]);
        return JSON.parse(result);
    }
    
    buildAnalysisPrompt(message, history) {
        // 構建專門的上下文分析 prompt
    }
}
```

#### **Step 2: 修改 API 處理流程**
```javascript
// 文件：api/chat.js
class MultiAIProcessor {
    constructor() {
        this.contextAnalyzer = new ContextAnalyzer();
        this.legacyProcessor = new SimpleAIHandler(); // 保留現有邏輯
    }
    
    async processMessage(userMessage, context, openaiApiCall) {
        // 1. 上下文分析
        const contextAnalysis = await this.contextAnalyzer.analyze(
            userMessage, 
            context.chatHistory, 
            openaiApiCall
        );
        
        // 2. 使用現有的意圖檢測和回應生成（增強版）
        const result = await this.legacyProcessor.processMessageWithContext(
            userMessage, 
            context, 
            contextAnalysis, 
            openaiApiCall
        );
        
        return {
            ...result,
            contextAnalysis: contextAnalysis
        };
    }
}
```

#### **Step 3: 增強現有 AI 處理器**
```javascript
// 修改現有的 SimpleAIHandler
class SimpleAIHandler {
    async processMessageWithContext(userMessage, context, contextAnalysis, openaiApiCall) {
        // 使用 contextAnalysis 增強意圖檢測
        const intentAnalysis = await this.analyzeIntentWithContext(
            userMessage, 
            context, 
            contextAnalysis, 
            openaiApiCall
        );
        
        // 使用 contextAnalysis 增強回應生成
        const response = await this.generateResponseWithContext(
            userMessage, 
            intentAnalysis, 
            context, 
            contextAnalysis, 
            openaiApiCall
        );
        
        return { intentAnalysis, response, contextAnalysis };
    }
}
```

### **Phase 2B 實現步驟**

#### **Step 1: 拆分 Intent Detector**
```javascript
// 文件：intent-detector.js
class IntentDetector {
    async detect(currentMessage, contextAnalysis, openaiApiCall) {
        const prompt = this.buildIntentPrompt(currentMessage, contextAnalysis);
        const result = await openaiApiCall([{role: 'user', content: prompt}]);
        return JSON.parse(result);
    }
}
```

#### **Step 2: 拆分 Response Generator**
```javascript
// 文件：response-generator.js
class ResponseGenerator {
    async generate(currentMessage, contextAnalysis, intentResult, openaiApiCall) {
        const prompt = this.buildResponsePrompt(currentMessage, contextAnalysis, intentResult);
        const result = await openaiApiCall([{role: 'user', content: prompt}]);
        return result;
    }
}
```

#### **Step 3: 整合完整流程**
```javascript
class MultiAIProcessor {
    constructor() {
        this.contextAnalyzer = new ContextAnalyzer();
        this.intentDetector = new IntentDetector();
        this.responseGenerator = new ResponseGenerator();
    }
    
    async processMessage(userMessage, context, openaiApiCall) {
        // 三階段處理
        const contextAnalysis = await this.contextAnalyzer.analyze(...);
        const intentResult = await this.intentDetector.detect(...);
        const response = await this.responseGenerator.generate(...);
        
        return { response, contextAnalysis, intentResult };
    }
}
```

---

## 📊 **成本效益分析**

### **Token 使用估算**
```javascript
// Phase 2A (Context Analyzer + 現有邏輯)
Context Analyzer: 300-400 tokens
Enhanced Legacy: 600-800 tokens
總計: 900-1200 tokens (vs 現在 800-1200)
成本增加: 0-20%

// Phase 2B (完整三模組)
Context Analyzer: 300-400 tokens
Intent Detector: 200-300 tokens
Response Generator: 400-600 tokens
總計: 900-1300 tokens
成本增加: 10-30%
```

### **預期效果提升**
```javascript
// 量化指標
意圖檢測準確度: 85% → 95% (+10%)
回應相關性: 75% → 90% (+15%)
對話連續性: 60% → 85% (+25%)
用戶滿意度: 70% → 90% (+20%)

// ROI 計算
成本增加: 20%
效果提升: 平均 17.5%
淨收益: 正向，值得投資
```

---

## 🧪 **測試策略**

### **Phase 2A 測試**
1. **上下文分析準確性測試**
2. **增強版意圖檢測測試**
3. **回應質量對比測試**
4. **成本效益驗證**

### **Phase 2B 測試**
1. **三模組協作測試**
2. **複雜對話場景測試**
3. **性能和成本測試**
4. **用戶體驗測試**

### **測試用例設計**
```javascript
// 複雜對話測試
const testCases = [
    {
        scenario: "延遲回應",
        conversation: [
            "你可以教我怎麼玩嗎？",
            "先跟我說說：現在桌上有幾位玩家呢？",
            "線索卡要怎麼放？",
            "線索卡的擺放...",
            "我們有4個人"  // 延遲回應測試
        ]
    },
    {
        scenario: "話題跳躍",
        conversation: [
            "你可以教我怎麼玩嗎？",
            "先跟我說說：現在桌上有幾位玩家呢？",
            "這遊戲適合小朋友嗎？",  // 跳躍問題測試
            "4個人，其中有2個小朋友"  // 複合回應測試
        ]
    }
];
```

---

## 🚀 **部署計劃**

### **Phase 2A 部署**
1. **開發環境測試** - 本地驗證功能
2. **Staging 部署** - Vercel 預覽環境
3. **A/B 測試** - 對比現有版本
4. **生產部署** - 正式上線

### **Phase 2B 部署**
1. **漸進式升級** - 逐步替換模組
2. **降級機制** - 確保穩定性
3. **監控告警** - 實時性能監控
4. **用戶反饋** - 收集使用體驗

---

## ⏱️ **開發時程**

### **Phase 2A (預計 4-6 小時)**
- Context Analyzer 開發: 2 小時
- 現有邏輯增強: 2 小時
- 測試和調試: 1-2 小時

### **Phase 2B (預計 3-4 小時)**
- Intent Detector 拆分: 1.5 小時
- Response Generator 拆分: 1.5 小時
- 整合和優化: 1-2 小時

### **總計: 7-10 小時**

---

## 🎯 **成功指標**

### **技術指標**
- API 響應時間 < 3秒
- 意圖檢測準確率 > 95%
- 上下文理解準確率 > 90%
- 系統穩定性 > 99%

### **用戶體驗指標**
- 對話連續性滿意度 > 85%
- 回應相關性滿意度 > 90%
- 整體使用體驗滿意度 > 85%

### **商業指標**
- Token 成本控制在預算內
- 用戶留存率提升
- 用戶推薦意願提升

---

## 🔄 **風險評估與應對策略**

### **技術風險**
1. **多 AI 調用延遲** - 可能增加響應時間
   - **應對**: 並行調用優化、超時機制
2. **JSON 解析失敗** - AI 返回格式不正確
   - **應對**: 嚴格的 prompt 設計、錯誤處理機制
3. **成本超預算** - Token 使用量超出預期
   - **應對**: 實時監控、自動降級機制

### **用戶體驗風險**
1. **回應質量下降** - 多模組可能導致不一致
   - **應對**: 充分測試、A/B 對比
2. **對話中斷** - 某個模組失敗影響整體
   - **應對**: 降級到單一 AI 模式

### **降級策略**
```javascript
// 自動降級機制
class FallbackHandler {
    async processWithFallback(userMessage, context, openaiApiCall) {
        try {
            // 嘗試多 AI 模組處理
            return await this.multiAIProcessor.process(...);
        } catch (error) {
            console.warn('多 AI 模組失敗，降級到單一 AI');
            // 降級到現有的單一 AI 處理
            return await this.legacyProcessor.process(...);
        }
    }
}
```

## 📈 **後續擴展計劃**

### **Phase 3: 高級功能**
1. **Memory AI** - 長期記憶管理
2. **Emotion AI** - 情感狀態檢測
3. **Strategy AI** - 遊戲策略建議

### **Phase 4: 多遊戲支援**
1. **Game Detector AI** - 自動識別遊戲類型
2. **Rule Adapter AI** - 動態載入遊戲規則
3. **Universal Companion AI** - 通用陪玩員

---

**這份詳細的開發計劃涵蓋了技術實現、成本分析、風險評估和擴展規劃。準備好開始 Phase 2A 的實現了嗎？** 🎭

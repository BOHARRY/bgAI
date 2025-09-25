# Similo AI 陪玩員 🎭

專業的 Similo 桌遊 AI 陪玩引導員，具備環境感知和雙階段處理能力！

## ✨ 核心特色

### 🧠 **智能環境感知**
- **現場感知** - 自動識別玩家人數、經驗程度、遊戲材料狀況
- **建立連結** - 像真人陪玩員一樣先了解桌上狀況再引導
- **動態調整** - 根據環境狀態調整教學深度和引導方式

### 🎯 **雙階段處理架構**
- **第一階段：意圖分析 + 環境感知** - 精準理解用戶需求和現場狀況
- **第二階段：針對性回應生成** - 根據分析結果生成最適合的回應
- **分步引導** - 避免資訊轟炸，一步步帶領玩家進入遊戲

### 🎮 **專業陪玩引導**
- **Similo 專精** - 完整掌握 Similo 遊戲規則和流程
- **流程引導** - 協助玩家設置遊戲、分配角色、理解規則
- **規則解釋** - 即時回答遊戲過程中的各種疑問
- **不參與遊戲** - 純粹的引導員角色，避免 token 消耗爆炸

### 🎨 **現代化界面**
- **iOS 風格** - 毛玻璃質感界面，視覺體驗優雅
- **即時互動** - 基於 OpenAI gpt-4o-mini的智能對話
- **狀態追蹤** - 完整的環境狀態和遊戲進度管理

## 🚀 快速開始

### 前置需求
- Node.js 14.0.0 或更高版本
- 有效的 OpenAI API Key
- Similo 卡牌（或其他卡片代替）

### 安裝與運行

1. **克隆項目**
   ```bash
   git clone https://github.com/BOHARRY/bgAI.git
   cd boardgame
   ```

2. **配置 API Key**
   - 創建 `.env` 文件
   - 填入您的 OpenAI API Key：
     ```
     OPENAI_API_KEY=your-actual-api-key-here
     ```

3. **啟動服務器**
   ```bash
   node server.js
   ```

4. **打開瀏覽器**
   - 訪問 `http://localhost:8888`
   - 開始與 AI 陪玩員互動！

### 💡 使用流程

1. **環境感知階段**
   - 說：「你可以教我怎麼玩嗎？」
   - AI 會詢問玩家人數
   - 回答：「3個人」或「兩個人」

2. **遊戲設置階段**
   - AI 引導抽取 12 張卡片排成 4×3 方陣
   - 協助分配出題者和猜題者角色
   - 解釋基本規則

3. **遊戲進行階段**
   - 隨時詢問規則細節
   - 獲得流程指導
   - AI 不參與實際遊戲，只提供引導

## 📁 項目結構

```
boardgame/
├── 🎨 前端界面
│   ├── index.html              # 主頁面
│   ├── styles.css              # iOS 風格樣式
│   ├── config.js               # 前端配置
│   └── app.js                  # 前端應用邏輯
│
├── 🧠 AI 處理核心
│   ├── layered-ai-handler.js   # 主要 AI 處理器
│   ├── dual-stage-processor.js # 雙階段處理器
│   ├── intent-detector.js      # 意圖檢測
│   ├── environment-sensor.js   # 環境感知
│   ├── environment-state.js    # 環境狀態管理
│   └── response-strategy.js    # 回應策略選擇
│
├── 🎮 遊戲邏輯
│   ├── game-state.js           # 遊戲狀態管理
│   └── interaction-flow.js     # 互動流程管理
│
├── 📚 知識庫
│   ├── book/Similo.md          # Similo 遊戲規則
│   └── book/SimiloRole.md      # Similo 角色說明
│
├── 🔧 服務器與配置
│   ├── server.js               # Node.js 服務器
│   ├── package.json            # 項目配置
│   └── .env                    # 環境變數
│
└── 🧪 測試文件
    ├── test-dual-stage.js      # 雙階段處理測試
    └── test-layered-system.js  # 分層系統測試
```

## 🎮 使用方法

### 🌟 智能對話流程

#### 第一步：建立連結
```
用戶：「你可以教我怎麼玩嗎？」
AI：「太棒了 🎉 我來當你們的陪玩員！在開始之前，先跟我說說：現在桌上有幾位玩家呢？」
```

#### 第二步：環境感知
```
用戶：「3個人」
AI：「很好！3個人玩 Similo 很棒 😊 現在我們來快速設置：請從牌堆中抽出 12 張卡片，排成 4×3 的方陣。你們三個人中誰想當出題者呢？」
```

#### 第三步：遊戲引導
- AI 協助角色分配（出題者/猜題者）
- 解釋遊戲規則和流程
- 引導遊戲設置和進行

### 🎯 AI 陪玩員特色

#### ✅ AI 會做的事：
- **環境感知** - 了解玩家人數、經驗程度
- **流程引導** - 協助遊戲設置和角色分配
- **規則解釋** - 回答各種遊戲規則問題
- **狀態追蹤** - 記住對話歷史和遊戲進度

#### ❌ AI 不會做的事：
- **參與遊戲** - 不會說「我當出題者」
- **做出決策** - 不會替玩家選擇或猜測
- **進入遊戲** - 避免 token 消耗爆炸
- **破壞體驗** - 保持陪玩引導員身份

### 📋 常用對話範例

```
「你可以教我怎麼玩嗎？」          # 開始學習
「我們有4個人」                   # 提供玩家人數
「第一次玩」                      # 說明經驗程度
「什麼是線索卡？」                # 詢問規則細節
「怎麼淘汰卡片？」                # 了解遊戲機制
「遊戲怎麼結束？」                # 詢問勝負條件
```

## 🛠️ 技術架構

### 核心技術棧
- **前端**: HTML5, CSS3, Vanilla JavaScript
- **後端**: Node.js (原生 HTTP 模組)
- **AI 引擎**: OpenAI model: 'gpt-4o-mini',
- **設計風格**: iOS 風格毛玻璃效果

### 🧠 AI 處理架構

#### 雙階段處理流程
```
用戶輸入 → 第一階段：意圖分析 + 環境感知 → 第二階段：針對性回應生成 → 輸出回應
```

#### 核心組件
1. **DualStageProcessor** - 雙階段處理協調器
2. **EnvironmentSensor** - 環境感知引擎
3. **EnvironmentState** - 環境狀態管理
4. **IntentDetector** - 意圖檢測器
5. **ResponseStrategy** - 回應策略選擇器

#### 處理模式
- **環境感知模式** - 收集桌遊現場資訊
- **行動引導模式** - 引導遊戲設置和進行
- **規則解釋模式** - 回答規則相關問題

### 🎮 遊戲狀態管理

#### 環境狀態追蹤
- **玩家人數** - 自動識別並記住
- **經驗程度** - beginner/experienced/expert
- **遊戲材料** - available/missing/substitute
- **遊戲階段** - not_started/setup/playing/ended

#### 智能感知能力
- **自動提取** - 從用戶回應中提取環境資訊
- **狀態同步** - 跨對話保持環境記憶
- **動態調整** - 根據環境調整回應策略

## 🔒 安全與效能

### Token 管理
- **AI 不參與遊戲** - 避免 token 消耗爆炸
- **分階段處理** - 精確控制 AI 調用
- **環境變數** - 安全管理 API Key

### 效能優化
- **意圖快取** - 避免重複分析
- **狀態持久化** - 減少重複感知
- **模組化設計** - 便於維護和擴展

## 🚀 Vercel 部署指南

### 📋 部署步驟

#### 1. **在 Vercel 界面中的設置**

**Framework Preset**: 選擇 **"Other"** ✅

**Root Directory**: 保持 **"./"** (根目錄) ✅

**Build and Output Settings**: Vercel 會自動檢測並處理

#### 2. **Environment Variables (環境變數)**

在 Vercel 控制台中設置以下環境變數：

```
OPENAI_API_KEY=your-actual-openai-api-key-here
```

#### 3. **部署後測試**

部署完成後，訪問你的 Vercel 域名：
- 測試閒聊：「你好嗎？」
- 測試規則問題：「請問一開始上面要放幾張牌？」
- 測試開始遊戲：「你可以教我怎麼玩嗎？」

#### 4. **常見問題**

**Q: API 調用失敗**
A: 檢查 Environment Variables 中的 OPENAI_API_KEY 是否正確設置

**Q: 頁面無法載入**
A: 確認 public 目錄中包含所有必要的靜態文件

**Q: 功能異常**
A: 查看 Vercel 控制台的 Functions 日誌

#### 5. **本地開發**

如果需要本地測試：
```bash
# 安裝 Vercel CLI
npm i -g vercel

# 本地開發
vercel dev
```

### ✅ 部署檢查清單

- [ ] Framework Preset 選擇 "Other"
- [ ] Root Directory 設為 "./"
- [ ] Environment Variables 設置 OPENAI_API_KEY
- [ ] 確認 public 目錄包含所有靜態文件
- [ ] 確認 api 目錄包含 chat.js
- [ ] 測試所有核心功能

## 🔧 常見部署問題與解決方案

### 🚨 **404 錯誤修正**

如果遇到以下錯誤：
```
GET https://your-domain.vercel.app/openai-client.js net::ERR_ABORTED 404 (Not Found)
app.js:4  Uncaught ReferenceError: OpenAIClient is not defined
```

**解決方案**：
- ✅ 前端已重構為直接調用 Vercel API
- ✅ 移除對 `openai-client.js` 的依賴
- ✅ 使用 `fetch()` 調用 `/api/chat`

### 🔍 **調試信息**

前端會在控制台顯示：
```javascript
🎯 AI 處理結果: {
  "intent": "chitchat",
  "strategy": "direct_answer",
  "processingMode": "dual_stage"
}
📋 意圖: chitchat | 策略: direct_answer | 模式: dual_stage
```

這表示 AI 處理流程正常運行！

## 🧪 測試與開發

### 運行測試
```bash
# 測試雙階段處理系統
node test-dual-stage.js

# 測試改進後的系統
node test-improved-system.js

# 語法檢查
node -c api/chat.js
```

### 開發模式
- **雙階段模式** - 預設使用，具備環境感知
- **傳統模式** - 備用模式，原有分層架構
- **Vercel 模式** - 生產環境部署模式

### 調試功能
- **詳細日誌** - 完整的處理流程記錄
- **狀態追蹤** - 環境狀態變化監控
- **意圖分析** - 意圖檢測結果顯示

## 🚀 未來規劃

### 短期目標
- [ ] 完善遊戲進行階段的 AI 引導
- [ ] 增加更多桌遊支援
- [ ] 優化環境感知準確度
- [ ] 添加語音互動功能

### 長期願景
- [ ] 多語言支援
- [ ] 移動端 App
- [ ] 線上多人遊戲
- [ ] AI 策略分析工具

## 🤝 貢獻

歡迎提交 Issue 和 Pull Request！

### 貢獻指南
1. Fork 本項目
2. 創建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 開啟 Pull Request

## 📄 授權

MIT License

---

**🎭 讓 AI 成為你最好的桌遊夥伴！**
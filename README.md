# RuleBuddy.ai 🎲

您的專屬 AI 桌遊陪玩員，讓每場遊戲都更精彩！

## ✨ 功能特色

- 🎯 **規則解釋** - 清楚解釋複雜的桌遊規則，讓新手也能快速上手
- 🤔 **策略建議** - 提供專業的遊戲策略和技巧分享
- ⚡ **即時解答** - 遊戲過程中的任何疑問都能立即獲得解答
- 🎨 **現代 UI** - iOS 風格毛玻璃質感界面
- 🤖 **AI 驅動** - 基於 OpenAI GPT-3.5 的智能對話

## 🚀 快速開始

### 前置需求
- Node.js 14.0.0 或更高版本
- 有效的 OpenAI API Key

### 安裝與運行

1. **克隆項目**
   ```bash
   git clone https://github.com/BOHARRY/bgAI.git
   cd bgAI
   ```

2. **配置 API Key**
   - 複製 `.env.example` 為 `.env`
   - 在 `.env` 文件中填入您的 OpenAI API Key：
     ```
     OPENAI_API_KEY=your-actual-api-key-here
     ```

3. **啟動服務器**
   ```bash
   npm start
   ```

4. **打開瀏覽器**
   - 訪問 `http://localhost:3000`
   - 開始與 AI 桌遊助手對話！

## 📁 項目結構

```
rulebuddy-ai/
├── index.html          # 主頁面
├── styles.css          # 樣式文件
├── config.js           # 配置文件
├── openai-client.js    # OpenAI API 客戶端
├── app.js              # 主應用邏輯
├── server.js           # 本地服務器
├── package.json        # 項目配置
└── README.md           # 說明文件
```

## 🎮 使用方法

1. 在輸入框中輸入您的桌遊問題
2. 點擊「開始探索」或按 Enter 鍵
3. AI 助手會為您提供詳細的回答
4. 支持連續對話，AI 會記住上下文

## 🛠️ 技術棧

- **前端**: HTML5, CSS3, Vanilla JavaScript
- **後端**: Node.js (原生 HTTP 模組)
- **AI**: OpenAI GPT-3.5 Turbo
- **設計**: iOS 風格毛玻璃效果

## 📝 開發說明

### 模組化架構
- `config.js` - 集中管理配置
- `openai-client.js` - 封裝 API 調用邏輯
- `app.js` - 主應用程式邏輯
- `styles.css` - 獨立的樣式文件

### 本地 API 服務器
為了解決瀏覽器 CORS 限制，項目包含一個簡單的 Node.js 服務器來代理 OpenAI API 請求。

## 🔒 安全注意事項

- API Key 目前存儲在服務器端代碼中
- 生產環境建議使用環境變數管理敏感信息
- 考慮添加請求限制和用戶認證

## 🤝 貢獻

歡迎提交 Issue 和 Pull Request！

## 📄 授權

MIT License
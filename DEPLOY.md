# 🚀 Vercel 部署指南

## 📋 部署步驟

### 1. **在 Vercel 界面中的設置**

#### Framework Preset
- 選擇：**"Other"** ✅

#### Root Directory
- 保持：**"./"** (根目錄) ✅

#### Build and Output Settings (可選，通常不需要設置)
- Vercel 會自動檢測並處理

### ⚠️ **常見錯誤已修正**
- ✅ 修正了 `vercel.json` 中 `functions` 和 `builds` 衝突問題
- ✅ 使用 CommonJS 格式避免模組導入問題
- ✅ 簡化配置文件

### 2. **Environment Variables (環境變數)**

在 Vercel 控制台中設置以下環境變數：

```
OPENAI_API_KEY=your-actual-openai-api-key-here
```

### 3. **項目結構**

```
📁 項目根目錄
├── 📁 api/
│   └── chat.js          # Vercel API 路由
├── 📁 public/
│   ├── index.html       # 主頁面
│   ├── styles.css       # 樣式文件
│   ├── app.js          # 前端邏輯
│   └── config.js       # 前端配置
├── vercel.json         # Vercel 配置
├── package.json        # 項目配置
└── README.md          # 項目說明
```

### 4. **部署後測試**

部署完成後，訪問你的 Vercel 域名：
- 測試閒聊：「你好嗎？」
- 測試規則問題：「請問一開始上面要放幾張牌？」
- 測試開始遊戲：「你可以教我怎麼玩嗎？」

### 5. **常見問題**

#### Q: API 調用失敗
A: 檢查 Environment Variables 中的 OPENAI_API_KEY 是否正確設置

#### Q: 頁面無法載入
A: 確認 public 目錄中包含所有必要的靜態文件

#### Q: 功能異常
A: 查看 Vercel 控制台的 Functions 日誌

### 6. **本地開發**

如果需要本地測試：
```bash
# 安裝 Vercel CLI
npm i -g vercel

# 本地開發
vercel dev
```

## ✅ 部署檢查清單

- [ ] Framework Preset 選擇 "Other"
- [ ] Root Directory 設為 "./"
- [ ] Environment Variables 設置 OPENAI_API_KEY
- [ ] 確認 public 目錄包含所有靜態文件
- [ ] 確認 api 目錄包含 chat.js
- [ ] 測試所有核心功能

## 🎯 預期結果

部署成功後，你將獲得：
- ✅ 智能意圖識別
- ✅ 環境感知能力
- ✅ 雙階段處理架構
- ✅ 自然的對話體驗
- ✅ 專業的 Similo 規則解釋

🎭 **讓 AI 成為你最好的桌遊夥伴！**

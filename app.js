// 主應用程式
class RuleBuddyApp {
    constructor() {
        this.openaiClient = new OpenAIClient(CONFIG.API_URL);
        this.isLoading = false;
        this.init();
    }

    // 初始化應用
    init() {
        this.bindEvents();
        this.setupUI();
    }

    // 綁定事件
    bindEvents() {
        // 提交按鈕點擊事件
        const submitBtn = document.querySelector('.submit-btn');
        submitBtn.addEventListener('click', () => this.handleSubmit());

        // 輸入框 Enter 鍵事件
        const gameInput = document.getElementById('gameInput');
        gameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !this.isLoading) {
                this.handleSubmit();
            }
        });

        // 可愛臉臉點擊事件
        const cuteFace = document.querySelector('.cute-face');
        cuteFace.addEventListener('click', () => this.playFaceAnimation());
    }

    // 設置 UI
    setupUI() {
        // 創建聊天容器
        const chatContainer = document.createElement('div');
        chatContainer.className = 'chat-container';
        chatContainer.id = 'chatContainer';

        // 插入到輸入區域之前
        const inputSection = document.querySelector('.input-section');
        inputSection.parentNode.insertBefore(chatContainer, inputSection);
    }

    // 處理提交
    async handleSubmit() {
        const input = document.getElementById('gameInput');
        const query = input.value.trim();
        
        if (!query) {
            this.showInputError();
            return;
        }

        if (this.isLoading) {
            return;
        }

        try {
            this.setLoading(true);
            
            // 顯示聊天容器
            this.showChatContainer();
            
            // 添加用戶消息
            this.addMessage('user', query);
            
            // 清空輸入框
            input.value = '';
            
            // 顯示載入中
            const loadingMessageId = this.addMessage('assistant', '<div class="loading"></div>');
            
            // 模擬 AI 回應（測試用）
            await new Promise(resolve => setTimeout(resolve, 1000)); // 模擬延遲
            const response = `您好！我是 RuleBuddy.ai 🎲\n\n關於「${query}」，這是一個很棒的桌遊問題！\n\n雖然我目前還在連接 OpenAI API，但我已經準備好為您提供最佳的桌遊體驗了！\n\n請稍後再試，或者您可以繼續問我其他桌遊問題。`;
            
            // 移除載入中消息
            this.removeMessage(loadingMessageId);
            
            // 添加 AI 回應
            this.addMessage('assistant', response);
            
        } catch (error) {
            console.error('Error:', error);
            
            // 移除載入中消息
            const loadingMsg = document.querySelector('.message .loading');
            if (loadingMsg) {
                loadingMsg.closest('.message').remove();
            }
            
            // 顯示錯誤消息
            this.addMessage('assistant', `抱歉，發生了錯誤：${error.message}`);
            
        } finally {
            this.setLoading(false);
        }
    }

    // 添加消息到聊天區域
    addMessage(role, content) {
        const chatContainer = document.getElementById('chatContainer');
        const messageDiv = document.createElement('div');
        const messageId = 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        
        messageDiv.className = `message ${role}`;
        messageDiv.id = messageId;
        messageDiv.innerHTML = content;
        
        chatContainer.appendChild(messageDiv);
        
        // 滾動到底部
        chatContainer.scrollTop = chatContainer.scrollHeight;
        
        return messageId;
    }

    // 移除消息
    removeMessage(messageId) {
        const message = document.getElementById(messageId);
        if (message) {
            message.remove();
        }
    }

    // 顯示聊天容器
    showChatContainer() {
        const chatContainer = document.getElementById('chatContainer');
        chatContainer.classList.add('active');
    }

    // 設置載入狀態
    setLoading(loading) {
        this.isLoading = loading;
        const submitBtn = document.querySelector('.submit-btn');
        
        if (loading) {
            submitBtn.textContent = '思考中...';
            submitBtn.disabled = true;
        } else {
            submitBtn.textContent = '開始探索';
            submitBtn.disabled = false;
        }
    }

    // 顯示輸入錯誤
    showInputError() {
        const container = document.querySelector('.input-container');
        container.style.animation = 'shake 0.5s';
        setTimeout(() => {
            container.style.animation = '';
        }, 500);
    }

    // 臉臉動畫
    playFaceAnimation() {
        const face = document.querySelector('.cute-face');
        const faces = ['🎲', '🎯', '🃏', '🎪', '🎨', '⭐', '🤖', '💭'];
        const randomFace = faces[Math.floor(Math.random() * faces.length)];
        
        face.style.transform = 'scale(0.9)';
        face.innerHTML = randomFace;
        
        setTimeout(() => {
            face.style.transform = 'scale(1)';
            setTimeout(() => {
                face.innerHTML = '🎲';
            }, 1000);
        }, 150);
    }

    // 清除聊天記錄
    clearChat() {
        const chatContainer = document.getElementById('chatContainer');
        chatContainer.innerHTML = '';
        chatContainer.classList.remove('active');
        this.openaiClient.clearHistory();
    }
}

// 當 DOM 載入完成後初始化應用
document.addEventListener('DOMContentLoaded', () => {
    window.ruleBuddyApp = new RuleBuddyApp();
});

// 導出類（如果需要）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RuleBuddyApp;
} else {
    window.RuleBuddyApp = RuleBuddyApp;
}

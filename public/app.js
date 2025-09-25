// 主應用程式
class RuleBuddyApp {
    constructor() {
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
            
            // 發送到 Vercel API
            const response = await this.sendToAPI(query);
            
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

    // 提取聊天歷史
    extractChatHistory() {
        const messages = [];
        const chatContainer = document.getElementById('chatContainer');
        const messageElements = chatContainer.querySelectorAll('.message');

        messageElements.forEach(element => {
            const role = element.classList.contains('user') ? 'user' : 'assistant';
            const content = element.textContent.trim();

            // 過濾掉載入中的消息和空消息
            if (content && !content.includes('loading') && content !== '') {
                messages.push({ role, content });
            }
        });

        // 返回最近的對話記錄（限制數量避免 token 過多）
        return messages.slice(-8); // 最近8條對話
    }

    // 生成會話 ID（簡單實現）
    getSessionId() {
        if (!this.sessionId) {
            this.sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        }
        return this.sessionId;
    }

    // 發送消息到 Vercel API
    async sendToAPI(message) {
        try {
            // 提取當前聊天歷史
            const chatHistory = this.extractChatHistory();

            console.log('📚 發送上下文:', {
                currentMessage: message,
                historyLength: chatHistory.length,
                sessionId: this.getSessionId()
            });

            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: message,
                    context: {
                        chatHistory: chatHistory,
                        timestamp: Date.now(),
                        sessionId: this.getSessionId()
                    }
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || 'API 調用失敗');
            }

            console.log('🎯 AI 處理結果:', JSON.stringify(data.debug, null, 2));
            console.log(`📋 意圖: ${data.debug.intent} | 策略: ${data.debug.strategy} | 模式: ${data.debug.processingMode}`);

            // 顯示上下文使用情況
            if (data.debug.contextUsed) {
                console.log(`🔗 上下文: 已使用 ${data.debug.historyLength} 條歷史記錄`);
            } else {
                console.log(`🔗 上下文: 無歷史記錄（首次對話）`);
            }

            return data.message;

        } catch (error) {
            console.error('API 調用錯誤:', error);
            throw new Error(`無法連接到 AI 服務: ${error.message}`);
        }
    }

    // 清除聊天記錄
    clearChat() {
        const chatContainer = document.getElementById('chatContainer');
        chatContainer.innerHTML = '';
        chatContainer.classList.remove('active');
        // 清除聊天歷史（前端狀態重置）
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

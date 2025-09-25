// 意圖檢測層 (Intent Detection Layer)
class IntentDetector {
    constructor() {
        // 定義意圖類別和關鍵詞
        this.intentPatterns = {
            start_game: {
                keywords: ['開始', '怎麼玩', '新遊戲', '開局', '設置', 'setup', 'start', '玩法', '教我', '學習', '可以教'],
                phrases: ['我想開始', '怎麼開始', '如何設置', '開始新遊戲', '教我玩', '可以教我', '怎麼玩', '學習怎麼玩']
            },
            rule_question: {
                keywords: ['規則', '怎麼', '為什麼', '可以', '應該', '淘汰', '線索', '直放', '橫放', '回合'],
                phrases: ['淘汰幾張', '什麼意思', '怎麼淘汰', '線索怎麼', '規則是']
            },
            progress_control: {
                keywords: ['等等', '暫停', '回顧', '重複', '上一步', '下一步', '繼續', '狀態', '現在'],
                phrases: ['等一下', '再說一次', '回到上一步', '現在到哪', '目前狀況']
            },
            game_action: {
                keywords: ['出牌', '選擇', '淘汰', '決定', '我選', '打出', '放置'],
                phrases: ['我要淘汰', '我選擇', '出這張', '放這個位置', '決定是']
            },
            chitchat: {
                keywords: ['好難', '有趣', '喜歡', '討厭', '無聊', '換遊戲', '其他'],
                phrases: ['這遊戲', '太難了', '很有趣', '不喜歡', '可以換']
            }
        };
    }

    // 檢測用戶意圖
    detectIntent(userMessage) {
        const message = userMessage.toLowerCase();
        const scores = {};

        // 計算每個意圖的匹配分數
        for (const [intent, patterns] of Object.entries(this.intentPatterns)) {
            scores[intent] = this.calculateScore(message, patterns);
        }

        // 找出最高分的意圖
        const bestIntent = Object.keys(scores).reduce((a, b) => 
            scores[a] > scores[b] ? a : b
        );

        // 如果最高分太低，歸類為 chitchat
        const confidence = scores[bestIntent];
        if (confidence < 0.3) {
            return { intent: 'chitchat', confidence: confidence };
        }

        return { intent: bestIntent, confidence: confidence };
    }

    // 計算匹配分數
    calculateScore(message, patterns) {
        let score = 0;
        let totalChecks = 0;

        // 檢查關鍵詞
        for (const keyword of patterns.keywords) {
            totalChecks++;
            if (message.includes(keyword)) {
                score += 1;
            }
        }

        // 檢查短語（權重更高）
        for (const phrase of patterns.phrases) {
            totalChecks++;
            if (message.includes(phrase)) {
                score += 2; // 短語匹配權重更高
            }
        }

        // 返回標準化分數
        return totalChecks > 0 ? score / totalChecks : 0;
    }

    // 獲取意圖的詳細信息
    getIntentInfo(intent) {
        const intentDescriptions = {
            start_game: {
                description: '用戶想要開始新遊戲或學習遊戲玩法',
                expectedActions: ['提供遊戲設置指導', '解釋基本規則', '引導角色選擇']
            },
            rule_question: {
                description: '用戶對遊戲規則有疑問',
                expectedActions: ['查找相關規則', '提供清楚解釋', '舉例說明']
            },
            progress_control: {
                description: '用戶想要控制遊戲進度',
                expectedActions: ['暫停/繼續遊戲', '回顧狀態', '提供當前進度']
            },
            game_action: {
                description: '用戶正在進行遊戲動作',
                expectedActions: ['處理遊戲動作', '更新遊戲狀態', '提供下一步指導']
            },
            chitchat: {
                description: '用戶進行閒聊或其他對話',
                expectedActions: ['友善回應', '引導回到遊戲', '提供鼓勵']
            }
        };

        return intentDescriptions[intent] || { description: '未知意圖', expectedActions: [] };
    }
}

// 導出類
if (typeof module !== 'undefined' && module.exports) {
    module.exports = IntentDetector;
} else {
    window.IntentDetector = IntentDetector;
}

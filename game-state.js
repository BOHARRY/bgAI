// 遊戲狀態記憶層 (State Tracking Layer)
class GameState {
    constructor() {
        this.reset();
    }

    // 重置遊戲狀態
    reset() {
        this.gamePhase = 'not_started'; // not_started, setup, playing, ended
        this.currentRound = 0;
        this.maxRounds = 5;
        
        // 遊戲區域
        this.gridArea = Array(4).fill(null).map(() => Array(3).fill(null)); // 4x3 謎底區
        this.clueArea = []; // 線索區
        this.eliminationArea = []; // 淘汰區
        
        // 遊戲角色
        this.roles = {
            clueGiver: null, // 'ai' 或 'human'
            guesser: null    // 'ai' 或 'human'
        };
        
        // 秘密資訊（只有出題者知道）
        this.secretCharacter = null;
        this.secretPosition = null; // {row, col}
        
        // AI 出題者的手牌（如果 AI 是出題者）
        this.aiHand = [];
        
        // 遊戲歷史
        this.actionHistory = [];
        
        // 當前狀態描述
        this.lastStateDescription = '';
    }

    // 設置遊戲
    setupGame(characters, secretCharacter, roles) {
        this.gamePhase = 'setup';
        this.roles = roles;
        this.secretCharacter = secretCharacter;
        
        // 隨機排列角色到 4x3 網格
        const shuffled = [...characters];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        
        // 填入網格並記錄秘密角色位置
        let index = 0;
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 3; col++) {
                this.gridArea[row][col] = shuffled[index];
                if (shuffled[index] === secretCharacter) {
                    this.secretPosition = { row, col };
                }
                index++;
            }
        }
        
        this.addAction('setup', `遊戲設置完成，秘密角色：${secretCharacter}`);
        this.gamePhase = 'playing';
        this.currentRound = 1;
    }

    // 添加線索
    addClue(clueCard, isSimilar) {
        const clue = {
            card: clueCard,
            isSimilar: isSimilar,
            round: this.currentRound,
            orientation: isSimilar ? 'vertical' : 'horizontal'
        };
        
        this.clueArea.push(clue);
        this.addAction('clue', `第${this.currentRound}回合線索：${clueCard} (${isSimilar ? '相似' : '不相似'})`);
    }

    // 淘汰角色
    eliminateCharacters(positions) {
        const eliminated = [];
        
        for (const pos of positions) {
            const character = this.gridArea[pos.row][pos.col];
            if (character) {
                eliminated.push(character);
                this.eliminationArea.push({
                    character: character,
                    position: pos,
                    round: this.currentRound
                });
                this.gridArea[pos.row][pos.col] = null;
                
                // 檢查是否淘汰了秘密角色
                if (character === this.secretCharacter) {
                    this.gamePhase = 'ended';
                    this.addAction('eliminate', `淘汰：${eliminated.join(', ')} - 遊戲失敗！淘汰了秘密角色`);
                    return { success: false, eliminated, gameEnded: true };
                }
            }
        }
        
        this.addAction('eliminate', `第${this.currentRound}回合淘汰：${eliminated.join(', ')}`);
        
        // 檢查是否遊戲結束（只剩一張卡）
        const remainingCount = this.getRemainingCharacters().length;
        if (remainingCount === 1) {
            this.gamePhase = 'ended';
            this.addAction('victory', '遊戲勝利！找到了秘密角色');
            return { success: true, eliminated, gameEnded: true };
        }
        
        return { success: true, eliminated, gameEnded: false };
    }

    // 進入下一回合
    nextRound() {
        if (this.currentRound < this.maxRounds) {
            this.currentRound++;
            this.addAction('round', `進入第${this.currentRound}回合`);
            return true;
        }
        return false;
    }

    // 獲取剩餘角色
    getRemainingCharacters() {
        const remaining = [];
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 3; col++) {
                if (this.gridArea[row][col]) {
                    remaining.push({
                        character: this.gridArea[row][col],
                        position: { row, col }
                    });
                }
            }
        }
        return remaining;
    }

    // 獲取當前應該淘汰的數量
    getEliminationCount() {
        return this.currentRound;
    }

    // 添加動作記錄
    addAction(type, description) {
        this.actionHistory.push({
            type: type,
            description: description,
            timestamp: new Date(),
            round: this.currentRound
        });
    }

    // 獲取遊戲狀態摘要
    getStateSummary() {
        const remaining = this.getRemainingCharacters();
        const summary = {
            phase: this.gamePhase,
            round: this.currentRound,
            remainingCount: remaining.length,
            eliminatedCount: this.eliminationArea.length,
            cluesGiven: this.clueArea.length,
            nextEliminationCount: this.getEliminationCount(),
            isGameEnded: this.gamePhase === 'ended'
        };
        
        return summary;
    }

    // 獲取詳細狀態描述
    getDetailedState() {
        const remaining = this.getRemainingCharacters();
        const state = {
            summary: this.getStateSummary(),
            gridArea: this.gridArea,
            remainingCharacters: remaining,
            clueHistory: this.clueArea,
            eliminatedCharacters: this.eliminationArea,
            actionHistory: this.actionHistory.slice(-20), // 最近20個動作
            roles: this.roles
        };
        
        // 如果 AI 是出題者，包含秘密資訊
        if (this.roles.clueGiver === 'ai') {
            state.secretInfo = {
                character: this.secretCharacter,
                position: this.secretPosition
            };
        }
        
        return state;
    }

    // 檢查遊戲是否可以繼續
    canContinue() {
        return this.gamePhase === 'playing' && this.currentRound <= this.maxRounds;
    }
}

// 導出類
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameState;
} else {
    window.GameState = GameState;
}

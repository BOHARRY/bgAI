// 環境狀態管理器 - 追蹤桌遊現場環境
class EnvironmentState {
    constructor() {
        this.reset();
    }

    // 重置環境狀態
    reset() {
        // 基本環境資訊
        this.playerCount = null;
        this.experienceLevel = null; // 'beginner', 'experienced', 'expert'
        this.availableMaterials = null; // 'available', 'missing', 'substitute'
        
        // 遊戲狀態
        this.gamePhase = 'unknown'; // 'not_started', 'setup', 'playing', 'ended'
        this.currentSituation = null;
        this.playerRole = null; // 'clue_giver', 'guesser', 'undecided'
        this.aiRole = null;
        
        // 進度追蹤
        this.gameProgress = null;
        this.confusionPoint = null;
        this.lastAction = null;
        
        // 感知歷史
        this.sensingHistory = [];
        this.environmentComplete = false;
        
        // 時間戳
        this.lastUpdated = new Date();
    }

    // 更新環境資訊
    updateEnvironment(newInfo) {
        let updated = false;
        
        for (const [key, value] of Object.entries(newInfo)) {
            if (value !== null && this[key] !== value) {
                this[key] = value;
                updated = true;
                
                // 記錄更新歷史
                this.sensingHistory.push({
                    timestamp: new Date(),
                    field: key,
                    oldValue: this[key],
                    newValue: value
                });
            }
        }
        
        if (updated) {
            this.lastUpdated = new Date();
            this.checkEnvironmentCompleteness();
        }
        
        return updated;
    }

    // 檢查環境資訊完整性
    checkEnvironmentCompleteness() {
        const requiredFields = ['playerCount', 'experienceLevel', 'availableMaterials'];
        this.environmentComplete = requiredFields.every(field => this[field] !== null);
        
        if (this.environmentComplete) {
            console.log('🌟 環境感知完成！');
        }
        
        return this.environmentComplete;
    }

    // 獲取缺失的環境資訊
    getMissingInfo() {
        const missing = [];
        
        if (this.playerCount === null) missing.push('player_count');
        if (this.experienceLevel === null) missing.push('experience_level');
        if (this.availableMaterials === null) missing.push('materials_check');
        if (this.gamePhase === 'unknown') missing.push('game_phase');
        
        return missing;
    }

    // 獲取環境摘要
    getEnvironmentSummary() {
        return {
            playerCount: this.playerCount,
            experienceLevel: this.experienceLevel,
            availableMaterials: this.availableMaterials,
            gamePhase: this.gamePhase,
            playerRole: this.playerRole,
            aiRole: this.aiRole,
            isComplete: this.environmentComplete,
            missingInfo: this.getMissingInfo(),
            lastUpdated: this.lastUpdated
        };
    }

    // 獲取詳細環境狀態
    getDetailedState() {
        return {
            basic: {
                playerCount: this.playerCount,
                experienceLevel: this.experienceLevel,
                availableMaterials: this.availableMaterials
            },
            game: {
                gamePhase: this.gamePhase,
                currentSituation: this.currentSituation,
                playerRole: this.playerRole,
                aiRole: this.aiRole
            },
            progress: {
                gameProgress: this.gameProgress,
                confusionPoint: this.confusionPoint,
                lastAction: this.lastAction
            },
            meta: {
                environmentComplete: this.environmentComplete,
                missingInfo: this.getMissingInfo(),
                sensingHistory: this.sensingHistory.slice(-5), // 最近5次更新
                lastUpdated: this.lastUpdated
            }
        };
    }

    // 根據環境狀態生成上下文描述
    generateContextDescription() {
        const parts = [];
        
        if (this.playerCount) {
            parts.push(`${this.playerCount}位玩家`);
        }
        
        if (this.experienceLevel) {
            const expMap = {
                'beginner': '新手',
                'experienced': '有經驗',
                'expert': '專家級'
            };
            parts.push(`${expMap[this.experienceLevel]}玩家`);
        }
        
        if (this.availableMaterials) {
            const matMap = {
                'available': '有完整卡牌',
                'missing': '缺少卡牌',
                'substitute': '使用替代卡牌'
            };
            parts.push(matMap[this.availableMaterials]);
        }
        
        if (this.gamePhase && this.gamePhase !== 'unknown') {
            const phaseMap = {
                'not_started': '尚未開始',
                'setup': '設置中',
                'playing': '遊戲進行中',
                'ended': '遊戲結束'
            };
            parts.push(phaseMap[this.gamePhase]);
        }
        
        return parts.length > 0 ? parts.join('，') : '環境資訊收集中';
    }

    // 判斷是否需要更多環境資訊
    needsMoreInfo(intent) {
        const criticalInfo = {
            'start_game': ['playerCount', 'availableMaterials'],
            'rule_question': ['gamePhase'],
            'game_action': ['playerRole', 'gamePhase'],
            'progress_control': ['gameProgress']
        };
        
        const required = criticalInfo[intent] || [];
        return required.some(field => this[field] === null);
    }

    // 獲取下一個需要收集的資訊
    getNextInfoNeeded(intent) {
        const priorities = {
            'start_game': ['playerCount', 'experienceLevel', 'availableMaterials'],
            'rule_question': ['gamePhase', 'currentSituation'],
            'game_action': ['playerRole', 'gamePhase', 'currentSituation'],
            'progress_control': ['gameProgress', 'confusionPoint']
        };
        
        const priorityList = priorities[intent] || ['playerCount'];
        
        for (const field of priorityList) {
            if (this[field] === null) {
                return field;
            }
        }
        
        return null;
    }

    // 驗證環境資訊的一致性
    validateConsistency() {
        const issues = [];
        
        // 檢查玩家人數合理性
        if (this.playerCount && (this.playerCount < 1 || this.playerCount > 10)) {
            issues.push('玩家人數不合理');
        }
        
        // 檢查角色分配一致性
        if (this.playerRole && this.aiRole && this.playerRole === this.aiRole) {
            issues.push('角色分配衝突');
        }
        
        // 檢查遊戲階段邏輯
        if (this.gamePhase === 'playing' && !this.playerRole) {
            issues.push('遊戲進行中但角色未定');
        }
        
        return {
            isValid: issues.length === 0,
            issues: issues
        };
    }

    // 從用戶回應中自動更新環境
    autoUpdateFromResponse(userMessage) {
        const EnvironmentSensor = require('./environment-sensor');
        const sensor = new EnvironmentSensor();
        
        const extracted = sensor.extractEnvironmentInfo(userMessage);
        
        if (Object.keys(extracted).length > 0) {
            console.log(`🔍 從用戶回應中提取到環境資訊:`, extracted);
            return this.updateEnvironment(extracted);
        }
        
        return false;
    }

    // 生成環境狀態報告
    generateStatusReport() {
        const summary = this.getEnvironmentSummary();
        const validation = this.validateConsistency();
        
        return {
            summary: summary,
            description: this.generateContextDescription(),
            validation: validation,
            completeness: this.environmentComplete ? '完整' : '不完整',
            nextSteps: this.environmentComplete ? [] : this.getMissingInfo()
        };
    }
}

module.exports = EnvironmentState;

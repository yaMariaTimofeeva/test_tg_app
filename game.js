class ChemicalGame {
    constructor() {
        this.availableElements = ['H₂', 'O₂', 'C', 'Fe', 'Na', 'Cl']; // Стартовый набор
        this.selectedElements = [];
        this.steps = 0;
        this.discovered = new Set(this.availableElements);
        this.score = 0;
        this.currentTarget = 'H₂O';
        this.reactionLog = [];
        
        this.init();
    }
    
    init() {
        this.updateTarget();
        this.renderElements();
        this.setupEventListeners();
        this.updateStats();
        this.addLog('Игра началась! Получите вещество: ' + this.currentTarget);
    }
    
    // Выбор случайной цели
    updateTarget() {
        this.currentTarget = TARGETS[Math.floor(Math.random() * TARGETS.length)];
        document.getElementById('target').textContent = this.currentTarget;
    }
    
    // Отрисовка доступных элементов
    renderElements() {
        const grid = document.getElementById('elementsGrid');
        grid.innerHTML = '';
        
        this.availableElements.forEach(element => {
            const btn = document.createElement('button');
            btn.className = 'element-btn';
            if (!this.discovered.has(element)) {
                btn.classList.add('new');
            }
            btn.textContent = element;
            btn.dataset.element = element;
            
            btn.addEventListener('click', () => this.toggleSelect(element, btn));
            
            if (this.selectedElements.includes(element)) {
                btn.classList.add('selected');
            }
            
            grid.appendChild(btn);
        });
        
        document.getElementById('discoveredCount').textContent = this.discovered.size;
    }
    
    // Выбор/снятие выбора элемента
    toggleSelect(element, button) {
        const index = this.selectedElements.indexOf(element);
        
        if (index === -1) {
            if (this.selectedElements.length < 2) {
                this.selectedElements.push(element);
                button.classList.add('selected');
            }
        } else {
            this.selectedElements.splice(index, 1);
            button.classList.remove('selected');
        }
        
        // Активируем кнопку "Соединить" только если выбрано 2 элемента
        const combineBtn = document.getElementById('combineBtn');
        combineBtn.disabled = this.selectedElements.length !== 2;
        combineBtn.textContent = `Соединить выбранное (${this.selectedElements.length})`;
    }
    
    // Попытка соединения двух веществ
    combineElements() {
        if (this.selectedElements.length !== 2) return;
        
        this.steps++;
        const [elem1, elem2] = this.selectedElements;
        const reactionKey1 = `${elem1}+${elem2}`;
        const reactionKey2 = `${elem2}+${elem1}`;
        
        let product = null;
        
        // Ищем реакцию в базе
        for (const reaction of REACTIONS) {
            if (reaction[0] === reactionKey1 || reaction[0] === reactionKey2) {
                product = reaction[1];
                break;
            }
        }
        
        if (product) {
            // Проверяем, не получили ли мы новое вещество
            const isNew = !this.availableElements.includes(product);
            
            // Добавляем продукт в доступные (если ещё нет)
            if (isNew) {
                this.availableElements.push(product);
                this.discovered.add(product);
                this.score += 50; // Бонус за открытие
            } else {
                this.score += 10; // Небольшой бонус за повторную реакцию
            }
            
            // Проверяем победу
            let win = false;
            if (product === this.currentTarget) {
                this.score += 500;
                this.addLog(`🎉 Победа! Вы получили ${product}!`, 'success');
                win = true;
            } else if (product.includes(this.currentTarget) && product !== this.currentTarget) {
                this.addLog(`🎯 Близко! Вы получили вещество, содержащее цель: ${product}`, 'success');
                this.score += 100;
            }
            
            // Логируем успешную реакцию
            this.addLog(`✅ ${elem1} + ${elem2} → ${product} ${isNew ? '(НОВОЕ!)' : ''}`);
            
            // Сбрасываем выбор
            this.selectedElements = [];
            this.renderElements();
            
            if (win) {
                setTimeout(() => {
                    if (confirm(`Поздравляем! Вы получили ${this.currentTarget} за ${this.steps} шагов! Хотите новую цель?`)) {
                        this.resetGame();
                    }
                }, 300);
            }
        } else {
            // Неудачная попытка
            this.addLog(`❌ ${elem1} + ${elem2} → Нет реакции`, 'error');
            this.score = Math.max(0, this.score - 5); // Штраф за неудачу
            this.selectedElements = [];
            this.renderElements();
        }
        
        this.updateStats();
    }
    
    // Сброс игры
    resetGame() {
        this.availableElements = ['H₂', 'O₂', 'C', 'Fe', 'Na', 'Cl'];
        this.selectedElements = [];
        this.steps = 0;
        this.discovered = new Set(this.availableElements);
        this.score = 0;
        this.updateTarget();
        this.renderElements();
        this.updateStats();
        this.reactionLog = [];
        document.getElementById('reactionLog').innerHTML = 
            '<div class="log-entry">Игра сброшена. Новая цель: ' + this.currentTarget + '</div>';
        this.addLog('Новая игра началась!');
    }
    
    // Обновление статистики
    updateStats() {
        document.getElementById('stepsCount').textContent = this.steps;
        document.getElementById('discoveredCount').textContent = this.discovered.size;
        document.getElementById('score').textContent = this.score;
        
        const combineBtn = document.getElementById('combineBtn');
        combineBtn.disabled = this.selectedElements.length !== 2;
        combineBtn.textContent = `Соединить выбранное (${this.selectedElements.length})`;
    }
    
    // Добавление записи в журнал
    addLog(message, type = '') {
        const entry = document.createElement('div');
        entry.className = `log-entry ${type}`;
        entry.textContent = `Шаг ${this.steps + 1}: ${message}`;
        
        const logContainer = document.getElementById('reactionLog');
        logContainer.prepend(entry); // Новые записи сверху
        
        // Ограничиваем журнал 10 последними записями
        if (logContainer.children.length > 10) {
            logContainer.removeChild(logContainer.lastChild);
        }
        
        this.reactionLog.push(message);
    }
    
    // Настройка обработчиков событий
    setupEventListeners() {
        document.getElementById('combineBtn').addEventListener('click', () => this.combineElements());
        document.getElementById('resetBtn').addEventListener('click', () => this.resetGame());
        
        // Горячие клавиши
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && !document.getElementById('combineBtn').disabled) {
                this.combineElements();
            }
            if (e.code === 'Escape') {
                this.selectedElements = [];
                this.renderElements();
            }
            if (e.code === 'KeyN' && e.ctrlKey) {
                this.resetGame();
            }
        });
    }
}

// Запуск игры при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    window.game = new ChemicalGame();
});

/**
 * StateCraft Core Game Engine
 */
class GameState {
  constructor() {
    this.year = 2026;
    this.seasonIndex = 0;
    this.seasons = ["Весна", "Лето", "Осень", "Зима"];
    this.selectedCountryId = null;
    this.player = null;
    this.otherCountries = {};
    this.activeDiploPartner = null;
    this.logs = [];
    this.regimeTypes = [
      { id: "liberal", name: "Либеральная демократия", desc: "+15% к иностранным инвестициям, -5% к скорости военных решений" },
      { id: "social_state", name: "Социальное правовое государство", desc: "+20% к счастью граждан, повышенные расходы на пособия" },
      { id: "technocracy", name: "Технократическая элита", desc: "+25% к эффекту от науки и ИИ, умеренное одобрение народа" },
      { id: "sovereign_statism", name: "Суверенный авторитаризм", desc: "+20% к контролю безопасности и стабильности, санкционные риски" }
    ];
    this.decrees = [
      { id: "free_economic_zones", name: "Создание безналоговых технопарков и ОЭЗ", cost: 12, passed: false, desc: "Привлекает глобальный капитал, ускоряет рост ВВП" },
      { id: "media_sovereignty", name: "Закон о защите национального инфопространства", cost: 6, passed: false, desc: "Снижает влияние иностранной пропаганды, Стабильность +10%" },
      { id: "defense_priority_order", name: "Гособоронзаказ в круглосуточном режиме", cost: 18, passed: false, desc: "Военная мощь +15, Казна -$5B ежеквартально" },
      { id: "anti_corruption_audit", name: "Глубокий независимый аудит госзакупок", cost: 8, passed: false, desc: "Снижает коррупцию на 10%, предотвращает утечку казны" }
    ];
  }

  init() {
    this.renderCountrySelection();
    this.bindGlobalEvents();
  }

  bindGlobalEvents() {
    // Navigation Tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        const target = btn.getAttribute('data-tab');
        document.getElementById(target).classList.add('active');
      });
    });

    // Next Turn Button
    document.getElementById('btnNextTurn').addEventListener('click', () => {
      this.advanceTurn();
    });

    // Sound toggle dummy
    document.getElementById('btnSoundToggle').addEventListener('click', () => {
      this.toast("Звуковые эффекты переключены");
    });

    // Save Game
    document.getElementById('btnSaveGame').addEventListener('click', () => {
      this.saveGame();
    });

    // Restart
    document.getElementById('btnRestart').addEventListener('click', () => {
      if (confirm("Вы уверены, что хотите начать новую игру? Текущий прогресс будет сброшен.")) {
        localStorage.removeItem('statecraft_save');
        location.reload();
      }
    });

    // Economic sliders
    const taxSlider = document.getElementById('taxSlider');
    taxSlider.addEventListener('input', (e) => {
      const val = e.target.value;
      document.getElementById('taxRateVal').innerText = `${val}%`;
      if (this.player) {
        this.player.stats.taxRate = parseInt(val);
      }
    });

    // Military buttons
    document.getElementById('btnMobilize').addEventListener('click', () => {
      if (this.player.stats.treasury >= 5) {
        this.player.stats.treasury -= 5;
        this.player.stats.military = Math.min(100, this.player.stats.military + 6);
        this.player.stats.stability = Math.max(0, this.player.stats.stability - 3);
        this.toast("Объявлена частичная мобилизация резервов. Армия усилена.");
        this.updateHeaderAndResources();
        this.renderMilitaryTab();
      } else {
        this.toast("Недостаточно средств в казне!");
      }
    });

    document.getElementById('btnDrills').addEventListener('click', () => {
      if (this.player.stats.treasury >= 3) {
        this.player.stats.treasury -= 3;
        this.player.stats.military = Math.min(100, this.player.stats.military + 3);
        this.player.stats.influence = Math.min(100, this.player.stats.influence + 4);
        this.toast("Крупные войсковые маневры проведены успешно. Боеготовность выросла.");
        this.updateHeaderAndResources();
        this.renderMilitaryTab();
      } else {
        this.toast("Недостаточно средств в казне!");
      }
    });

    document.getElementById('btnModernize').addEventListener('click', () => {
      if (this.player.stats.treasury >= 8) {
        this.player.stats.treasury -= 8;
        this.player.stats.military = Math.min(100, this.player.stats.military + 9);
        this.toast("Контракты на поставку высокоточного оружия заключены.");
        this.updateHeaderAndResources();
        this.renderMilitaryTab();
      } else {
        this.toast("Недостаточно средств в казне!");
      }
    });
  }

  renderCountrySelection() {
    const grid = document.getElementById('countriesGrid');
    grid.innerHTML = '';

    for (let key in COUNTRIES_DATA) {
      const c = COUNTRIES_DATA[key];
      const card = document.createElement('div');
      card.className = `country-card ${this.selectedCountryId === key ? 'selected' : ''}`;
      card.innerHTML = `
        <div class="card-top">
          <span class="card-flag">${c.flag}</span>
          <div>
            <div class="card-country-title">${c.name}</div>
            <div class="card-ideology">${c.regime}</div>
          </div>
        </div>
        <p class="card-summary">${c.summary.substring(0, 115)}...</p>
        <div class="card-metrics">
          <div>💰 Казна: $${c.stats.treasury}B</div>
          <div>⚔️ Армия: ${c.stats.military}/100</div>
          <div>👥 Стабильность: ${c.stats.stability}%</div>
          <div>🕊️ Влияние: ${c.stats.influence}/100</div>
        </div>
      `;

      card.addEventListener('click', () => {
        this.selectedCountryId = key;
        document.querySelectorAll('.country-card').forEach(el => el.classList.remove('selected'));
        card.classList.add('selected');
        this.renderCountryPreview(c);
      });

      grid.appendChild(card);
    }
  }

  renderCountryPreview(country) {
    const preview = document.getElementById('countryPreview');
    preview.innerHTML = `
      <div class="preview-content">
        <div class="preview-header">
          <div class="preview-title-box">
            <h2>${country.flag} ${country.fullName}</h2>
            <div style="font-style: italic; color: #8b9bb4; margin-top:2px;">«${country.motto}»</div>
            <div class="preview-traits">
              ${country.traits.map(t => `<span class="trait-tag">${t}</span>`).join('')}
            </div>
          </div>
          <div style="text-align: right;">
            <div style="font-size:0.85rem; color: #8b9bb4;">Столица: <strong style="color:#fff;">${country.capital}</strong></div>
            <div style="font-size:0.85rem; color: #8b9bb4;">Правление: <strong style="color:var(--text-gold);">${country.leader}</strong></div>
          </div>
        </div>

        <div class="preview-body">
          <div class="preview-history">
            <h4 style="color:var(--text-gold); margin-bottom:8px; font-family:var(--font-heading);">Геополитический обзор</h4>
            <p>${country.history}</p>
            <p style="font-size:0.92rem; color:#8b9bb4;">${country.summary}</p>
          </div>

          <div class="preview-stats-box">
            <h4 style="color:var(--text-gold); margin-bottom:10px; font-family:var(--font-heading);">Ключевые показатели</h4>
            <div class="stat-row"><span>Госрезервы и казна:</span> <strong>$${country.stats.treasury} млрд</strong></div>
            <div class="stat-row"><span>Индекс обороноспособности:</span> <strong>${country.stats.military} / 100</strong></div>
            <div class="stat-row"><span>Внутренняя стабильность:</span> <strong>${country.stats.stability}%</strong></div>
            <div class="stat-row"><span>Геополитический вес:</span> <strong>${country.stats.influence} / 100</strong></div>
            <div class="stat-row"><span>Энергонезависимость:</span> <strong>${country.stats.energy}%</strong></div>
            
            <button class="btn-start-game" id="btnConfirmCountry">Вступить в должность главы государства ➔</button>
          </div>
        </div>
      </div>
    `;

    document.getElementById('btnConfirmCountry').addEventListener('click', () => {
      this.startGame(country.id);
    });
  }

  startGame(countryId) {
    // Deep clone data
    this.player = JSON.parse(JSON.stringify(COUNTRIES_DATA[countryId]));
    this.otherCountries = {};
    for (let k in COUNTRIES_DATA) {
      if (k !== countryId) {
        this.otherCountries[k] = JSON.parse(JSON.stringify(COUNTRIES_DATA[k]));
      }
    }

    // Switch screen
    document.getElementById('screenSelection').classList.remove('active');
    document.getElementById('screenGame').classList.add('active');
    document.getElementById('gameHeader').style.display = 'flex';
    document.getElementById('resourceBar').style.display = 'flex';

    this.log(`Вы вступили в управление государством ${this.player.name}. Впереди эпоха великих вызовов.`);
    this.toast(`Добро пожаловать, глава государства ${this.player.name}!`);

    this.updateHeaderAndResources();
    this.renderOverviewTab();
    this.renderDiplomacyTab();
    this.renderEconomyTab();
    this.renderMilitaryTab();
    this.renderPoliciesTab();
  }

  updateHeaderAndResources() {
    document.getElementById('playerFlag').innerText = this.player.flag;
    document.getElementById('playerCountryName').innerText = this.player.name;
    document.getElementById('playerRegime').innerText = this.player.regime;
    document.getElementById('currentTurnDisplay').innerText = `${this.seasons[this.seasonIndex]}, ${this.year}`;

    // Stats
    document.getElementById('resTreasury').innerText = `$${Math.round(this.player.stats.treasury)}B`;
    document.getElementById('resMilitary').innerText = `${Math.min(100, Math.round(this.player.stats.military))}`;
    document.getElementById('resStability').innerText = `${Math.min(100, Math.round(this.player.stats.stability))}%`;
    document.getElementById('resInfluence').innerText = `${Math.min(100, Math.round(this.player.stats.influence))}`;
    document.getElementById('resEnergy').innerText = `${Math.min(100, Math.round(this.player.stats.energy))}%`;
  }

  advanceTurn() {
    // 1. Advance Season & Year
    this.seasonIndex++;
    if (this.seasonIndex >= 4) {
      this.seasonIndex = 0;
      this.year++;
    }

    // 2. Economic Calculation
    const taxIncome = Math.round((this.player.stats.taxRate * 0.45) + (this.player.stats.incomeBonus || 0));
    const milExpenses = Math.round(this.player.stats.military * 0.15);
    const netIncome = taxIncome - milExpenses;
    this.player.stats.treasury += netIncome;

    // Stability drift
    if (this.player.stats.taxRate > 35) {
      this.player.stats.stability = Math.max(0, this.player.stats.stability - 2);
    }

    this.log(`Наступил квартал: ${this.seasons[this.seasonIndex]} ${this.year}. Доходы бюджета: +$${taxIncome}B, военные расходы: -$${milExpenses}B (Сальдо: ${netIncome >= 0 ? '+' : ''}$${netIncome}B).`);
    this.updateHeaderAndResources();

    // 3. Trigger Random Dilemma Event
    const event = HISTORICAL_EVENTS[Math.floor(Math.random() * HISTORICAL_EVENTS.length)];
    this.showEventModal(event);

    // AI reactions
    for (let c in this.player.relations) {
      // Natural slight drift
      const change = (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 3);
      this.player.relations[c] = Math.max(0, Math.min(100, this.player.relations[c] + change));
    }

    this.renderOverviewTab();
    this.renderDiplomacyTab();
    this.renderEconomyTab();
  }

  showEventModal(evt) {
    const modal = document.getElementById('eventModal');
    document.getElementById('modalCategoryIcon').innerText = evt.icon;
    document.getElementById('modalTitle').innerText = evt.title;
    document.getElementById('modalDate').innerText = `${evt.category} • ${this.seasons[this.seasonIndex]} ${this.year}`;
    document.getElementById('modalText').innerText = evt.text;

    const optContainer = document.getElementById('modalOptions');
    optContainer.innerHTML = '';

    evt.options.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'option-btn';
      btn.innerHTML = `
        <strong>${opt.text}</strong>
        <span class="option-impact">Последствия: ${opt.impact}</span>
      `;
      btn.addEventListener('click', () => {
        opt.action(this);
        modal.style.display = 'none';
        this.log(`Решение по событию «${evt.title}»: ${opt.text}`);
        this.toast("Государственное решение приведено в исполнение.");
        this.updateHeaderAndResources();
        this.renderOverviewTab();
      });
      optContainer.appendChild(btn);
    });

    modal.style.display = 'flex';
  }

  renderOverviewTab() {
    // Leader briefing
    const briefing = document.getElementById('leaderBriefing');
    briefing.innerHTML = `
      <p style="margin-bottom:6px;"><strong>Ваше Превосходительство,</strong> геополитический кабинет находится в вашем распоряжении.</p>
      <p style="color:#8b9bb4; font-size:0.86rem;">Статус суверенитета: устойчивый. Доверие народа: ${this.player.stats.stability}%. Коррупционный фон: ${this.player.stats.corruption || 12}%. Налоговая ставка: ${this.player.stats.taxRate}%.</p>
    `;

    // Focuses
    const focuses = document.getElementById('focusList');
    focuses.innerHTML = `
      <div class="focus-item">
        <div class="focus-info">
          <h5>Укрепление энергетической автономии</h5>
          <p>Инвестиции в производство и долгосрочные контракты поставок</p>
        </div>
        <span class="regime-badge">${this.player.stats.energy}% готовности</span>
      </div>
      <div class="focus-item">
        <div class="focus-info">
          <h5>Модернизация оборонного контура</h5>
          <p>Развертывание высокоточных комплексов и интеграция ПВО</p>
        </div>
        <span class="regime-badge">${this.player.stats.military}/100 мощи</span>
      </div>
    `;

    // Advisors
    const advList = document.getElementById('advisorsList');
    advList.innerHTML = '';
    this.player.advisors.forEach(a => {
      const card = document.createElement('div');
      card.className = 'advisor-card';
      card.innerHTML = `
        <div class="advisor-avatar">🎖️</div>
        <div class="advisor-content">
          <h5>${a.role} (${a.name})</h5>
          <p>«${a.advice}»</p>
        </div>
      `;
      advList.appendChild(card);
    });
  }

  renderDiplomacyTab() {
    const list = document.getElementById('diploCards');
    list.innerHTML = '';

    for (let key in this.otherCountries) {
      const c = this.otherCountries[key];
      const rel = this.player.relations[key] !== undefined ? this.player.relations[key] : 50;
      
      let relStatus = "Нейтралитет";
      let relColor = "var(--text-gold)";
      if (rel >= 75) { relStatus = "Союзнические узы"; relColor = "#3ea068"; }
      else if (rel >= 55) { relStatus = "Партнерство"; relColor = "#55c888"; }
      else if (rel <= 25) { relStatus = "Враждебность / Конфронтация"; relColor = "#ff6b6b"; }
      else if (rel <= 40) { relStatus = "Холодные отношения"; relColor = "#fca311"; }

      const card = document.createElement('div');
      card.className = `diplo-card ${this.activeDiploPartner === key ? 'active' : ''}`;
      card.innerHTML = `
        <div class="diplo-card-top">
          <strong style="color:#fff;">${c.flag} ${c.name}</strong>
          <span style="font-size:0.75rem; color:${relColor}; font-weight:600;">${relStatus}</span>
        </div>
        <div style="font-size:0.8rem; color:#8b9bb4;">Отношения: ${rel}/100</div>
        <div class="diplo-relation-bar">
          <div class="diplo-relation-fill" style="width: ${rel}%; background: ${relColor};"></div>
        </div>
      `;

      card.addEventListener('click', () => {
        this.activeDiploPartner = key;
        this.renderDiplomacyTab();
        this.renderDiploDialogue(key);
      });

      list.appendChild(card);
    }
  }

  renderDiploDialogue(targetId) {
    const pane = document.getElementById('diploDialoguePane');
    const target = this.otherCountries[targetId];
    const rel = this.player.relations[targetId];
    const preset = this.player.dialoguePresets[targetId] || {
      greeting: "Мы готовы выслушать ваши предложения в духе взаимоуважения.",
      proposals: ["Предложить договор о ненападении", "Торговый меморандум", "Культурное сотрудничество"]
    };

    pane.innerHTML = `
      <div class="dialogue-header">
        <div>
          <h3 style="font-family:var(--font-heading); color:var(--text-gold); font-size:1.3rem;">${target.flag} Посольство державы: ${target.name}</h3>
          <p style="font-size:0.85rem; color:#8b9bb4;">Лидер: ${target.leader} • Форма правления: ${target.regime}</p>
        </div>
        <span class="regime-badge">Индекс дружбы: ${rel}/100</span>
      </div>

      <div class="dialogue-messages" id="dialogueChat">
        <div class="chat-bubble them">
          <strong>Полномочный посол ${target.name}:</strong><br>
          «${preset.greeting}»
        </div>
      </div>

      <h4 class="subhead">Дипломатические инициативы и действия</h4>
      <div class="dialogue-actions-grid">
        <button class="btn btn-action" id="btnDiploTrade">📜 Заключить торговый пакт ($5B)</button>
        <button class="btn btn-action" id="btnDiploAlliance">🤝 Предложить оборонительный союз</button>
        <button class="btn btn-action" id="btnDiploGift">🎁 Направить финансовый грант ($10B)</button>
        <button class="btn btn-action btn-danger" id="btnDiploUltimatum">⚠️ Выдвинуть дипломатический ультиматум</button>
      </div>
    `;

    const chat = document.getElementById('dialogueChat');

    document.getElementById('btnDiploTrade').addEventListener('click', () => {
      if (this.player.stats.treasury >= 5) {
        this.player.stats.treasury -= 5;
        this.player.stats.incomeBonus = (this.player.stats.incomeBonus || 0) + 4;
        this.player.relations[targetId] = Math.min(100, this.player.relations[targetId] + 10);
        chat.innerHTML += `
          <div class="chat-bubble you">Мы предлагаем взаимное снижение пошлин и открытие логистических коридоров.</div>
          <div class="chat-bubble them">Соглашение ратифицировано! Торговый оборот между нашими странами начнет приносить взаимную прибыль.</div>
        `;
        this.toast(`Торговый пакт с ${target.name} заключен!`);
        this.updateHeaderAndResources();
        this.renderDiplomacyTab();
      } else {
        this.toast("В казне недостаточно средств для подписания торгового пакта!");
      }
    });

    document.getElementById('btnDiploAlliance').addEventListener('click', () => {
      if (rel >= 65) {
        this.player.relations[targetId] = Math.min(100, this.player.relations[targetId] + 15);
        this.player.stats.influence = Math.min(100, this.player.stats.influence + 8);
        chat.innerHTML += `
          <div class="chat-bubble you">Предлагаем скрепить наши братские отношения договором о коллективной безопасности.</div>
          <div class="chat-bubble them">Мы с гордостью принимаем предложение! Наше военное братство непоколебимо.</div>
        `;
        this.toast(`Оборонительный союз с ${target.name} заключен!`);
      } else {
        chat.innerHTML += `
          <div class="chat-bubble you">Предлагаем военный союз.</div>
          <div class="chat-bubble them">Уровень доверия между нашими столицами пока недостаточен для столь серьезных обязательств. (Требуется отношение 65+)</div>
        `;
        this.toast(`Отказ: уровень доверия ниже 65`);
      }
      this.updateHeaderAndResources();
    });

    document.getElementById('btnDiploGift').addEventListener('click', () => {
      if (this.player.stats.treasury >= 10) {
        this.player.stats.treasury -= 10;
        this.player.relations[targetId] = Math.min(100, this.player.relations[targetId] + 20);
        chat.innerHTML += `
          <div class="chat-bubble you">Мы направляем транш гуманитарной и инвестиционной помощи вашей экономике.</div>
          <div class="chat-bubble them">Выражаем глубочайшую признательность за щедрость. Общественное мнение о вашей державе резко возросло.</div>
        `;
        this.toast(`Отношения с ${target.name} выросли на +20!`);
        this.updateHeaderAndResources();
        this.renderDiplomacyTab();
      } else {
        this.toast("Недостаточно средств в казне!");
      }
    });

    document.getElementById('btnDiploUltimatum').addEventListener('click', () => {
      this.player.relations[targetId] = Math.max(0, this.player.relations[targetId] - 35);
      this.player.stats.stability = Math.max(0, this.player.stats.stability - 5);
      chat.innerHTML += `
        <div class="chat-bubble you">Мы требуем прекратить любые враждебные маневры и безоговорочно признать наши национальные интересы!</div>
        <div class="chat-bubble them" style="border-color:var(--accent-red); color:#ff9494;">Это неслыханная дерзость! Наш посол отзывается для консультаций. Армия приведена в боевую готовность!</div>
      `;
      this.toast(`Отношения с ${target.name} разорваны до критических!`);
      this.updateHeaderAndResources();
      this.renderDiplomacyTab();
    });
  }

  renderEconomyTab() {
    // Projects
    const pList = document.getElementById('ecoProjectsList');
    pList.innerHTML = '';
    this.player.projects.forEach(p => {
      const item = document.createElement('div');
      item.className = 'project-item';
      item.innerHTML = `
        <div>
          <strong style="color:#fff;">${p.name}</strong>
          <div style="font-size:0.8rem; color:var(--text-gold);">${p.effect}</div>
          <div style="font-size:0.75rem; color:#8b9bb4;">Стоимость: $${p.cost}B</div>
        </div>
        <button class="btn btn-sm ${p.active ? 'btn-active' : ''}" id="proj_${p.id}">
          ${p.active ? '✓ Реализовано' : 'Финансировать'}
        </button>
      `;

      pList.appendChild(item);

      document.getElementById(`proj_${p.id}`).addEventListener('click', () => {
        if (p.active) return;
        if (this.player.stats.treasury >= p.cost) {
          this.player.stats.treasury -= p.cost;
          p.active = true;
          this.player.stats.incomeBonus = (this.player.stats.incomeBonus || 0) + 10;
          this.toast(`Мегапроект «${p.name}» запущен!`);
          this.log(`Завершен грандиозный государственный проект «${p.name}».`);
          this.updateHeaderAndResources();
          this.renderEconomyTab();
        } else {
          this.toast("В казне недостаточно средств для финансирования проекта!");
        }
      });
    });

    // Trade Matrix
    const tMatrix = document.getElementById('tradeMatrix');
    tMatrix.innerHTML = '';
    for (let k in this.otherCountries) {
      const c = this.otherCountries[k];
      const rel = this.player.relations[k] || 50;
      const card = document.createElement('div');
      card.className = 'trade-card';
      card.innerHTML = `
        <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
          <strong>${c.flag} ${c.name}</strong>
          <span style="color:var(--text-gold); font-size:0.85rem;">${rel > 40 ? 'Открытая торговля' : 'Санкции / Ограничения'}</span>
        </div>
        <p style="font-size:0.78rem; color:#8b9bb4;">Товарооборот: ~$${Math.round(rel * 0.4)}B/год • Пошлины: ${rel > 50 ? '5%' : '25%'}</p>
      `;
      tMatrix.appendChild(card);
    }
  }

  renderMilitaryTab() {
    const stats = document.getElementById('milStats');
    stats.innerHTML = `
      <div class="mil-stat-box">
        <div class="mil-stat-val">${this.player.stats.military}</div>
        <div class="mil-stat-lbl">Боевой потенциал</div>
      </div>
      <div class="mil-stat-box">
        <div class="mil-stat-val">${["france", "russia"].includes(this.player.id) ? "Да" : "Нет"}</div>
        <div class="mil-stat-lbl">Ядерная триада</div>
      </div>
      <div class="mil-stat-box">
        <div class="mil-stat-val">${Math.round(this.player.stats.military * 2.8)} тыс.</div>
        <div class="mil-stat-lbl">Регулярные войска</div>
      </div>
      <div class="mil-stat-box">
        <div class="mil-stat-val">${this.player.stats.energy > 80 ? "Высокая" : "Средняя"}</div>
        <div class="mil-stat-lbl">Стойкость тыла</div>
      </div>
    `;

    // Doctrines
    const docList = document.getElementById('doctrinesList');
    docList.innerHTML = `
      <div class="focus-item">
        <div class="focus-info">
          <h5>Концепция стратегического сдерживания</h5>
          <p>Многоэшелонированная противоракетная оборона и контрудар возмездия</p>
        </div>
        <span class="regime-badge">Активна</span>
      </div>
      <div class="focus-item" style="margin-top:8px;">
        <div class="focus-info">
          <h5>Беспилотные рои и радиоэлектронная борьба (РЭБ)</h5>
          <p>Подавление связи противника и точечные удары дронов-камикадзе</p>
        </div>
        <span class="regime-badge">Развертывается</span>
      </div>
    `;
  }

  renderPoliciesTab() {
    // Regime selector
    const rSel = document.getElementById('regimeSelector');
    rSel.innerHTML = '';
    this.regimeTypes.forEach(r => {
      const opt = document.createElement('div');
      opt.className = `regime-option ${this.player.regimeStyle === r.id ? 'active' : ''}`;
      opt.innerHTML = `
        <strong style="color:#fff;">${r.name}</strong>
        <p style="font-size:0.82rem; color:#8b9bb4; margin-top:2px;">${r.desc}</p>
      `;
      opt.addEventListener('click', () => {
        this.player.regimeStyle = r.id;
        this.player.regime = r.name;
        this.toast(`Курс государственного стиля изменен на: ${r.name}`);
        this.log(`Глава государства провозгласил переход к доктрине «${r.name}».`);
        this.updateHeaderAndResources();
        this.renderPoliciesTab();
      });
      rSel.appendChild(opt);
    });

    // Decrees
    const dList = document.getElementById('decreesList');
    dList.innerHTML = '';
    this.decrees.forEach(d => {
      const item = document.createElement('div');
      item.className = 'decree-item';
      item.innerHTML = `
        <div>
          <strong style="color:#fff;">${d.name}</strong>
          <div style="font-size:0.8rem; color:#8b9bb4;">${d.desc}</div>
          <div style="font-size:0.75rem; color:var(--text-gold);">Стоимость реформы: $${d.cost}B</div>
        </div>
        <button class="btn btn-sm ${d.passed ? 'btn-active' : ''}" id="decree_${d.id}">
          ${d.passed ? '✓ Действует' : 'Принять указ'}
        </button>
      `;
      dList.appendChild(item);

      document.getElementById(`decree_${d.id}`).addEventListener('click', () => {
        if (d.passed) return;
        if (this.player.stats.treasury >= d.cost) {
          this.player.stats.treasury -= d.cost;
          d.passed = true;
          this.player.stats.stability = Math.min(100, this.player.stats.stability + 8);
          this.toast(`Указ «${d.name}» подписан и вступил в силу!`);
          this.log(`Издан верховный государственный указ: «${d.name}».`);
          this.updateHeaderAndResources();
          this.renderPoliciesTab();
        } else {
          this.toast("В казне недостаточно средств для проведения реформы!");
        }
      });
    });
  }

  log(msg) {
    const timeStr = `${this.seasons[this.seasonIndex]} ${this.year}`;
    this.logs.unshift({ date: timeStr, text: msg });
    const feed = document.getElementById('chronicleFeed');
    if (feed) {
      feed.innerHTML = this.logs.map(l => `
        <div class="chronicle-entry">
          <div class="chronicle-date">${l.date}</div>
          <div>${l.text}</div>
        </div>
      `).join('');
    }
  }

  toast(msg) {
    const container = document.getElementById('toastContainer');
    const t = document.createElement('div');
    t.className = 'toast';
    t.innerText = msg;
    container.appendChild(t);
    setTimeout(() => {
      t.remove();
    }, 3800);
  }

  saveGame() {
    const stateData = {
      year: this.year,
      seasonIndex: this.seasonIndex,
      player: this.player,
      otherCountries: this.otherCountries,
      logs: this.logs,
      decrees: this.decrees
    };
    localStorage.setItem('statecraft_save', JSON.stringify(stateData));
    this.toast("Игра успешно сохранена в локальной памяти браузера! 💾");
  }
}

// Start on load
window.addEventListener('DOMContentLoaded', () => {
  const game = new GameState();
  game.init();
  window.currentGame = game;
});

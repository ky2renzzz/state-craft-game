/**
 * StateCraft — Симулятор государства, макроэкономики, дипломатии и войн
 */
class GameState {
  constructor() {
    this.year = 2026;
    this.seasonIndex = 0;
    this.seasons = ["ВЕСНА", "ЛЕТО", "ОСЕНЬ", "ЗИМА"];
    this.turn = 1;

    // Выбор при старте
    this.selectedCountryId = null;
    this.selectedIdeology = null;
    this.selectedEconomy = null;
    this.selectedDoctrine = null;
    this.selectedTargetAlly = "neutral";

    // Игровое состояние
    this.player = null;
    this.otherCountries = {};
    this.diploState = {};
    this.activeDiploPartner = null;
    this.logs = [];
    this.storyFlags = {};
    this.scheduledEvents = [];
    this.triggeredArcs = new Set();

    // Бюджетные приоритеты (% от базового бюджета)
    this.budget = {
      defense: 30,
      social: 35
    };

    // 1. Политические системы
    this.regimeTypes = [
      { id: "liberal", name: "Парламентская демократия", desc: "Доверие Запада (+10 отн. с блоком), низкая коррупция, но общество острее реагирует на войны." },
      { id: "social_state", name: "Социальное государство", desc: "Стабильность +2% в ход, высокая лояльность городов, но повышенная нагрузка на бюджет." },
      { id: "technocracy", name: "Технократия", desc: "Ускоренный рост ВВП (+10% к налогам) и снижение инфляции, но элиты требуют результатов." },
      { id: "national_conservative", name: "Национал-консерватизм", desc: "Рост армии (+2 в ход) и единства при угрозах, но трения с либеральными блоками." },
      { id: "sovereign_statism", name: "Авторитарный этатизм", desc: "Жёсткий контроль над элитами и армией (+3 мощи в ход), но санкционные риски от Запада." }
    ];

    // 2. Финансово-экономические модели
    this.economyModels = [
      { id: "free_market", name: "Свободный рынок (Капитализм)", desc: "Быстрый рост ВВП, низкая инфляция, но рост неравенства и падение стабильности при кризисах." },
      { id: "social_market", name: "Социально-рыночная модель", desc: "Баланс налогов и соцзащиты, низкая безработица, умеренный рост долга." },
      { id: "state_capitalism", name: "Госкапитализм (Дирижизм)", desc: "Крупные госкорпорации, устойчивость к санкциям, но повышенная коррупция (+1% в ход без аудита)." },
      { id: "planned_mob", name: "Мобилизационная плановая экономика", desc: "Военные расходы дешевле на 40%, безработица падает, но инфляция и дефицит товаров растут." },
      { id: "resource_rent", name: "Сырьевая рента", desc: "Сверхдоходы при наличии энергоресурсов (+$12B/ход при энергии >80%), но уязвимость к ценам." }
    ];

    // 3. Внешнеполитические доктрины
    this.foreignDoctrines = [
      { id: "euro_atlantic", name: "Евроатлантическая интеграция", desc: "+15 к отношениям с США/ЕС, дешевле торговля с Западом, трения с РФ/Ираном." },
      { id: "eurasian", name: "Евразийский контур", desc: "+15 к отношениям с Китаем/РФ/Ираном, энергетические преференции, трения с Западом." },
      { id: "multi_vector", name: "Многовекторный прагматизм", desc: "Ровные отношения со всеми блоками, бонус к торговым пактам (+$2B/ход)." },
      { id: "expansionism", name: "Военный экспансионизм", desc: "Наступление на фронте эффективнее на 25%, но все соседи относятся с подозрением (-2 отн./ход)." }
    ];

    this.decrees = [
      { id: "free_economic_zones", name: "Особые экономические зоны", cost: 12, passed: false, desc: "+$8B дохода в ход, снижает безработицу." },
      { id: "media_sovereignty", name: "Госконтроль информационного поля", cost: 6, passed: false, desc: "Стабильность +10%, но авторитет -6." },
      { id: "defense_priority_order", name: "Круглосуточный гособоронзаказ", cost: 18, passed: false, desc: "Армия +15 сразу, содержание -$5B/ход." },
      { id: "anti_corruption_audit", name: "Жёсткая антикоррупционная чистка", cost: 8, passed: false, desc: "Коррупция -12%, доходы растут, но элиты недовольны (-12%)." },
      { id: "martial_law", name: "Чрезвычайное положение", cost: 4, passed: false, desc: "Армия +10, но падает деловая активность и авторитет (-10)." }
    ];
  }

  init() {
    this.renderWizardStep1();
    this.bindWizardEvents();
    this.bindGlobalEvents();
  }

  /* ====================================================
     МАСТЕР СТАРТА (ШАГ 1, 2, 3)
     ==================================================== */
  renderWizardStep1() {
    const grid = document.getElementById('countriesGrid');
    if (!grid) return;
    grid.innerHTML = '';

    for (const key in COUNTRIES_DATA) {
      const c = COUNTRIES_DATA[key];
      const card = document.createElement('div');
      card.className = `hw-card ${this.selectedCountryId === key ? 'selected' : ''}`;
      card.innerHTML = `
        <div>
          <div class="hw-card-top">
            <span class="hw-flag">${c.flag}</span>
            <span class="chip">${c.capital}</span>
          </div>
          <div class="hw-country-name">${c.name}</div>
          <div class="hw-regime">${c.ideologyName}</div>
          <p class="hw-summary">${c.traits.slice(0, 2).join('. ')}.</p>
        </div>
        <div class="hw-specs">
          <div>Казна: <strong>$${c.stats.treasury}B</strong></div>
          <div>Долг: <strong>$${c.stats.debt}B</strong></div>
          <div>Инфляция: <strong>${c.stats.inflation}%</strong></div>
          <div>Армия: <strong>${c.stats.military}/100</strong></div>
        </div>
      `;

      card.addEventListener('click', () => {
        this.selectedCountryId = key;
        document.querySelectorAll('#countriesGrid .hw-card').forEach(el => el.classList.remove('selected'));
        card.classList.add('selected');
        this.renderCountryPreview(c);
      });

      grid.appendChild(card);
    }
  }

  renderCountryPreview(country) {
    const preview = document.getElementById('countryPreview');
    preview.innerHTML = `
      <div class="dossier-header">
        <div>
          <h2>${country.flag} ${country.fullName}</h2>
          <div style="font-style:italic; color:var(--accent-gold); margin-bottom:10px;">«${country.motto}»</div>
          <div style="display:flex; flex-wrap:wrap; gap:6px;">
            ${country.traits.map(t => `<span class="chip">${t}</span>`).join('')}
          </div>
        </div>
        <div style="text-align:right; font-size:13px; color:var(--ink-secondary);">
          Столица: <strong>${country.capital}</strong><br>
          Блок: <strong>${country.bloc === 'west' ? 'Запад' : country.bloc === 'eurasia' ? 'Евразия' : 'Многовекторный'}</strong>
        </div>
      </div>

      <div class="dossier-body">
        <div>
          <div class="panel-title">Реалии державы</div>
          <p style="margin-bottom:10px; color:var(--ink-secondary);">${country.traits.join('. ')}.</p>
          <p style="font-size:13px; color:var(--ink-muted);">Ключевые города: ${country.cities.map(ct => ct.name).join(', ')}.</p>
        </div>

        <div>
          <div class="panel-title">Макроэкономика и сила</div>
          <div class="spec-line"><span>Казна / Госдолг</span><strong>$${country.stats.treasury}B / $${country.stats.debt}B</strong></div>
          <div class="spec-line"><span>Инфляция / Безработица</span><strong>${country.stats.inflation}% / ${country.stats.unemployment}%</strong></div>
          <div class="spec-line"><span>Военная мощь</span><strong>${country.stats.military} / 100</strong></div>
          <div class="spec-line"><span>Народ / Лояльность элит</span><strong>${country.stats.stability}% / ${country.stats.eliteLoyalty}%</strong></div>
          <button class="btn-danger" id="btnConfirmCountry" style="width:100%; margin-top:16px;">Настроить политический и финансовый курс ➔</button>
        </div>
      </div>
    `;

    document.getElementById('btnConfirmCountry').addEventListener('click', () => this.goToWizardStep2());
  }

  goToWizardStep2() {
    if (!this.selectedCountryId) return;
    const country = COUNTRIES_DATA[this.selectedCountryId];
    this.selectedIdeology = country.defaultIdeology || "liberal";
    this.selectedEconomy = country.defaultEconomy || "social_market";
    this.selectedDoctrine = country.defaultDoctrine || "multi_vector";

    document.getElementById('wzChosenCountry').innerText = country.name;
    document.getElementById('wizardStep1').classList.remove('active');
    document.getElementById('wizardStep2').classList.add('active');
    this.renderWizardStep2Options(country);
  }

  renderWizardStep2Options(country) {
    this.renderAxisSelector('wizardIdeologyOptions', this.regimeTypes, this.selectedIdeology, country.defaultIdeology, (id) => this.selectedIdeology = id);
    this.renderAxisSelector('wizardEconomyOptions', this.economyModels, this.selectedEconomy, country.defaultEconomy, (id) => this.selectedEconomy = id);
    this.renderAxisSelector('wizardDoctrineOptions', this.foreignDoctrines, this.selectedDoctrine, country.defaultDoctrine, (id) => this.selectedDoctrine = id);
  }

  renderAxisSelector(containerId, items, currentId, defaultId, onSelect) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    items.forEach(item => {
      const card = document.createElement('div');
      card.className = `choice-card ${item.id === currentId ? 'selected' : ''}`;
      card.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
          <strong style="font-size:15px;">${item.name}</strong>
          ${item.id === defaultId ? '<span class="chip gold">Историческая</span>' : ''}
        </div>
        <p style="font-size:13px; color:var(--ink-secondary);">${item.desc}</p>
      `;
      card.addEventListener('click', () => {
        onSelect(item.id);
        container.querySelectorAll('.choice-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
      });
      container.appendChild(card);
    });
  }

  goToWizardStep3() {
    const country = COUNTRIES_DATA[this.selectedCountryId];
    const regime = this.regimeTypes.find(r => r.id === this.selectedIdeology);
    const econ = this.economyModels.find(e => e.id === this.selectedEconomy);
    document.getElementById('wzChosenCountry2').innerText = country.name;
    document.getElementById('wzChosenIdeology').innerText = `${regime?.name || ''} • ${econ?.name || ''}`;
    document.getElementById('wizardStep2').classList.remove('active');
    document.getElementById('wizardStep3').classList.add('active');
    this.renderWizardStep3Options();
  }

  renderWizardStep3Options() {
    const container = document.getElementById('wizardAlliesOptions');
    container.innerHTML = '';

    const neutralCard = document.createElement('div');
    neutralCard.className = `choice-card ${this.selectedTargetAlly === 'neutral' ? 'selected' : ''}`;
    neutralCard.innerHTML = `
      <div style="font-size:24px; margin-bottom:6px;">⚖️</div>
      <strong style="display:block; margin-bottom:6px;">Свобода рук</strong>
      <p style="font-size:13px; color:var(--ink-secondary);">Сохранить стартовый баланс отношений со всеми державами мира.</p>
    `;
    neutralCard.addEventListener('click', () => {
      this.selectedTargetAlly = 'neutral';
      container.querySelectorAll('.choice-card').forEach(c => c.classList.remove('selected'));
      neutralCard.classList.add('selected');
    });
    container.appendChild(neutralCard);

    const allPowers = { ...COUNTRIES_DATA, ...WORLD_POWERS };
    for (const k in allPowers) {
      if (k === this.selectedCountryId) continue;
      const other = allPowers[k];
      const card = document.createElement('div');
      card.className = `choice-card ${this.selectedTargetAlly === k ? 'selected' : ''}`;
      card.innerHTML = `
        <div style="font-size:24px; margin-bottom:6px;">${other.flag}</div>
        <strong style="display:block; margin-bottom:6px;">Сближение: ${other.name}</strong>
        <p style="font-size:13px; color:var(--ink-secondary);">${other.ideologyName || ''}. +20 к отношениям на старте.</p>
      `;
      card.addEventListener('click', () => {
        this.selectedTargetAlly = k;
        container.querySelectorAll('.choice-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
      });
      container.appendChild(card);
    }
  }

  startGamePlay() {
    this.player = JSON.parse(JSON.stringify(COUNTRIES_DATA[this.selectedCountryId]));
    const regimeObj = this.regimeTypes.find(r => r.id === this.selectedIdeology);
    const econObj = this.economyModels.find(e => e.id === this.selectedEconomy);
    const docObj = this.foreignDoctrines.find(d => d.id === this.selectedDoctrine);

    this.player.regime = regimeObj ? regimeObj.name : this.player.ideologyName;
    this.player.regimeStyle = this.selectedIdeology;
    this.player.economyStyle = this.selectedEconomy;
    this.player.economyName = econObj ? econObj.name : "";
    this.player.doctrineStyle = this.selectedDoctrine;
    this.player.doctrineName = docObj ? docObj.name : "";

    // Собираем все 12 держав мира (оставшиеся игровые + WORLD_POWERS)
    this.otherCountries = {};
    this.diploState = {};
    const combined = { ...COUNTRIES_DATA, ...WORLD_POWERS };

    for (const k in combined) {
      if (k === this.selectedCountryId) continue;
      this.otherCountries[k] = JSON.parse(JSON.stringify(combined[k]));
      if (this.player.relations[k] === undefined) {
        this.player.relations[k] = 50;
      }

      // Применяем влияние выбранной доктрины на стартовые отношения
      if (this.selectedDoctrine === 'euro_atlantic') {
        if (this.otherCountries[k].bloc === 'west') this.changeRelation(k, 15);
        if (this.otherCountries[k].bloc === 'eurasia') this.changeRelation(k, -15);
      } else if (this.selectedDoctrine === 'eurasian') {
        if (this.otherCountries[k].bloc === 'eurasia') this.changeRelation(k, 15);
        if (this.otherCountries[k].bloc === 'west') this.changeRelation(k, -15);
      }

      this.diploState[k] = {
        war: false,
        warScore: 0,
        allied: false,
        tradePact: false,
        embargo: false,
        chatHistory: [
          {
            sender: "them",
            author: `Посол (${this.otherCountries[k].name})`,
            text: this.otherCountries[k].greeting || `Посольство ${this.otherCountries[k].name} готово к диалогу с вашим новым правительством.`
          }
        ]
      };
    }

    if (this.selectedTargetAlly && this.selectedTargetAlly !== 'neutral') {
      this.changeRelation(this.selectedTargetAlly, 20);
    }

    document.getElementById('wizardStep3').classList.remove('active');
    document.getElementById('screenGame').classList.add('active');
    document.getElementById('headerMeta').style.display = 'flex';
    document.getElementById('instrumentBar').style.display = 'grid';

    this.log(`Старт правления: ${this.player.fullName}. Строй: ${this.player.regime}. Экономика: ${this.player.economyName}.`);
    this.toast(`Вы возглавили державу ${this.player.name}.`);
    this.refreshAllViews();
  }

  refreshAllViews() {
    this.updateHeaderAndResources();
    this.renderOverviewTab();
    this.renderCitiesTab();
    this.renderDiplomacyTab();
    this.renderEconomyTab();
    this.renderMilitaryTab();
  }

  /* ====================================================
     ОБРАБОТЧИКИ КНОПОК И ПОЛЗУНКОВ
     ==================================================== */
  bindWizardEvents() {
    document.getElementById('btnWzBackTo1').addEventListener('click', () => {
      document.getElementById('wizardStep2').classList.remove('active');
      document.getElementById('wizardStep1').classList.add('active');
    });
    document.getElementById('btnWzProceedTo3').addEventListener('click', () => this.goToWizardStep3());
    document.getElementById('btnWzBackTo2').addEventListener('click', () => {
      document.getElementById('wizardStep3').classList.remove('active');
      document.getElementById('wizardStep2').classList.add('active');
    });
    document.getElementById('btnWzStartGame').addEventListener('click', () => this.startGamePlay());
  }

  bindGlobalEvents() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(btn.getAttribute('data-tab')).classList.add('active');
      });
    });

    document.getElementById('btnNextTurn').addEventListener('click', () => this.advanceTurn());

    document.getElementById('taxSlider').addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      document.getElementById('taxRateVal').innerText = `${val}%`;
      if (this.player) this.player.stats.taxRate = val;
    });

    document.getElementById('budDefSlider').addEventListener('input', (e) => {
      this.budget.defense = parseInt(e.target.value, 10);
      document.getElementById('budDefVal').innerText = `${this.budget.defense}%`;
    });

    document.getElementById('budSocSlider').addEventListener('input', (e) => {
      this.budget.social = parseInt(e.target.value, 10);
      document.getElementById('budSocVal').innerText = `${this.budget.social}%`;
    });

    document.getElementById('btnPrintMoney').addEventListener('click', () => {
      this.player.stats.treasury += 25;
      this.player.stats.inflation = +(this.player.stats.inflation + 3.5).toFixed(1);
      this.player.stats.stability = Math.max(0, this.player.stats.stability - 5);
      this.log(`Эмиссия валюты: +$25B в казну, инфляция выросла до ${this.player.stats.inflation}%.`);
      this.toast(`Эмиссия: +$25B, инфляция +3.5%`);
      this.refreshAllViews();
    });

    document.getElementById('btnTakeLoan').addEventListener('click', () => {
      this.player.stats.treasury += 30;
      this.player.stats.debt += 35;
      this.log(`Внешний заём: привлечено $30B, госдолг вырос до $${this.player.stats.debt}B.`);
      this.toast(`Заём получен: +$30B в казну (+$35B к долгу)`);
      this.refreshAllViews();
    });

    document.getElementById('btnPayDebt').addEventListener('click', () => {
      if (this.player.stats.debt <= 0) return this.toast("Госдолг уже равен 0!");
      if (this.player.stats.treasury < 25) return this.toast("Нужно $25B в казне для погашения.");
      const pay = Math.min(25, this.player.stats.debt);
      this.player.stats.treasury -= pay;
      this.player.stats.debt -= pay;
      this.player.stats.influence = Math.min(100, this.player.stats.influence + 3);
      this.log(`Погашение госдолга: выплачено $${pay}B, остаток долга $${this.player.stats.debt}B.`);
      this.refreshAllViews();
    });

    document.getElementById('btnMobilize').addEventListener('click', () => {
      const cost = this.player.economyStyle === 'planned_mob' ? 5 : 8;
      if (this.player.stats.treasury < cost) return this.toast(`Недостаточно средств ($${cost}B)`);
      this.player.stats.treasury -= cost;
      this.player.stats.military = Math.min(100, this.player.stats.military + 8);
      this.player.stats.stability = Math.max(0, this.player.stats.stability - 5);
      this.player.stats.unemployment = Math.max(1.0, +(this.player.stats.unemployment - 0.8).toFixed(1));
      this.log("Мобилизация резерва: военная мощь +8, безработица снизилась, стабильность -5%.");
      this.refreshAllViews();
    });

    document.getElementById('btnModernize').addEventListener('click', () => {
      const cost = this.player.economyStyle === 'planned_mob' ? 11 : 18;
      if (this.player.stats.treasury < cost) return this.toast(`Недостаточно средств ($${cost}B)`);
      this.player.stats.treasury -= cost;
      this.player.stats.military = Math.min(100, this.player.stats.military + 12);
      this.log("Модернизация армии: закуплены новейшие комплексы (+12 к мощи).");
      this.refreshAllViews();
    });

    document.getElementById('btnDrills').addEventListener('click', () => {
      if (this.player.stats.treasury < 5) return this.toast("Недостаточно средств ($5B)");
      this.player.stats.treasury -= 5;
      this.player.stats.military = Math.min(100, this.player.stats.military + 4);
      this.player.stats.influence = Math.min(100, this.player.stats.influence + 4);
      this.log("Военные учения: +4 мощь, +4 авторитет в мире.");
      this.refreshAllViews();
    });
  }

  /* ====================================================
     КВАРТАЛЬНАЯ МАКРОСИМУЛЯЦИЯ И ЖИВОЙ ИИ-МИР
     ==================================================== */
  advanceTurn() {
    this.turn += 1;
    this.seasonIndex = (this.seasonIndex + 1) % 4;
    if (this.seasonIndex === 0) this.year += 1;

    const st = this.player.stats;
    const totalGdp = this.player.cities.reduce((sum, c) => sum + c.gdp, 0);

    // 1. Расчёт налоговых доходов с учётом экономики, безработицы и коррупции
    let eff = 1 - (st.corruption / 150) - (st.unemployment / 120);
    if (this.player.economyStyle === "free_market") eff += 0.15;
    if (this.player.regimeStyle === "technocracy") eff += 0.10;
    let taxIncome = Math.round(totalGdp * (st.taxRate / 100) * 0.55 * Math.max(0.4, eff));

    // Сырьевая рента
    let extraIncome = 0;
    if (this.player.economyStyle === "resource_rent" && st.energy >= 80) extraIncome += 12;
    if (this.decrees.find(d => d.id === "free_economic_zones")?.passed) extraIncome += 8;

    // 2. Расходы бюджета: Оборона, Социалка, Долг, Война, Пакты
    const defCost = Math.round(this.budget.defense * 0.35 * (this.player.economyStyle === "planned_mob" ? 0.65 : 1));
    const socCost = Math.round(this.budget.social * 0.35 * (this.player.regimeStyle === "social_state" ? 1.15 : 1));
    const debtService = Math.round(st.debt * 0.045);

    let diploNet = 0;
    let warCount = 0;
    for (const id in this.diploState) {
      const ds = this.diploState[id];
      if (ds.tradePact && !ds.war) {
        diploNet += this.player.doctrineStyle === "multi_vector" ? 6 : 4;
      }
      if (ds.embargo) {
        diploNet -= 2;
        this.otherCountries[id].stats.treasury -= 6;
      }
      if (ds.war) {
        warCount += 1;
        diploNet -= 9;
      }
    }

    const totalNet = taxIncome + extraIncome + diploNet - defCost - socCost - debtService;
    st.treasury += totalNet;

    // Если казна уходит в минус — автоматически растёт госдолг
    if (st.treasury < 0) {
      const deficit = Math.abs(st.treasury);
      st.debt += deficit;
      st.treasury = 0;
      st.inflation = +(st.inflation + 1.4).toFixed(1);
      this.log(`Дефицит бюджета: нехватка $${deficit}B покрыта ростом госдолга.`);
    }

    // 3. Динамика инфляции и безработицы
    let infDelta = 0;
    if (warCount > 0) infDelta += 1.2;
    if (this.player.economyStyle === "planned_mob") infDelta += 0.9;
    if (this.player.economyStyle === "free_market") infDelta -= 0.6;
    if (this.budget.defense + this.budget.social > 85) infDelta += 0.8;
    else if (this.budget.defense + this.budget.social < 55) infDelta -= 0.7;
    st.inflation = Math.max(0.5, +(st.inflation + infDelta).toFixed(1));

    let unempDelta = (st.taxRate - 30) * 0.08 - (this.budget.social - 30) * 0.04;
    if (this.player.economyStyle === "planned_mob") unempDelta -= 0.8;
    if (this.player.economyStyle === "free_market") unempDelta -= 0.3;
    st.unemployment = Math.max(1.5, Math.min(25, +(st.unemployment + unempDelta).toFixed(1)));

    // 4. Влияние бюджета и макроэкономики на народ, элиты и армию
    if (this.budget.defense >= 40) st.military = Math.min(100, st.military + 2);
    else if (this.budget.defense < 20) st.military = Math.max(10, st.military - 2);

    if (this.budget.social >= 40) st.stability = Math.min(100, st.stability + 2);
    else if (this.budget.social < 20) st.stability = Math.max(0, st.stability - 3);

    if (st.inflation > 10) st.stability = Math.max(0, st.stability - 4);
    if (st.taxRate > 44) st.eliteLoyalty = Math.max(0, st.eliteLoyalty - 3);
    if (this.player.economyStyle === "state_capitalism" && !this.decrees.find(d => d.id === "anti_corruption_audit")?.passed) {
      st.corruption = Math.min(60, st.corruption + 1);
    }
    if (this.player.regimeStyle === "sovereign_statism") st.military = Math.min(100, st.military + 2);
    if (this.player.doctrineStyle === "expansionism") this.shiftAllRelations(-2);

    // 5. Войны и живой мир ИИ
    this.processWarsPerTurn();
    this.simulateAIWorld();

    // 6. Кризис элит / бунт при провале
    if (st.eliteLoyalty < 20) {
      st.stability = Math.max(0, st.stability - 8);
      this.log("ТРЕВОГА: Элиты саботируют приказы правительства из-за низкой лояльности!");
    }

    this.log(`Итог квартала ${this.seasons[this.seasonIndex]} ${this.year}: баланс ${totalNet >= 0 ? '+' : ''}$${totalNet}B, инфляция ${st.inflation}%, долг $${st.debt}B.`);

    // 7. Сюжетные события
    this.triggerTurnEvent();
    this.refreshAllViews();
  }

  simulateAIWorld() {
    // Мировые державы реагируют на агрессию или союзничество игрока
    const activeWars = Object.keys(this.diploState).filter(id => this.diploState[id].war);
    if (activeWars.length > 0 && Math.random() < 0.45) {
      // Западные державы могут ввести санкции, если вы воюете с западной страной
      const enemyId = activeWars[0];
      const enemy = this.otherCountries[enemyId];
      if (enemy.bloc === 'west' && this.otherCountries.usa && !this.diploState.usa.embargo) {
        this.changeRelation('usa', -12);
        this.changeRelation('germany', -10);
        this.player.stats.treasury = Math.max(0, this.player.stats.treasury - 8);
        this.log(`Реакция мира: США и Германия осудили войну против ${enemy.name} (-$8B из-за ограничений).`);
      }
    }

    // Союзники иногда помогают ресурсами
    for (const id in this.diploState) {
      const ds = this.diploState[id];
      if (ds.allied && !ds.war && Math.random() < 0.25) {
        const ally = this.otherCountries[id];
        this.player.stats.treasury += 5;
        this.log(`Союзник ${ally.name} перевёл $5B в рамках партнёрской поддержки.`);
      }
    }
  }

  processWarsPerTurn() {
    for (const id in this.diploState) {
      const ds = this.diploState[id];
      if (!ds.war) continue;
      const enemy = this.otherCountries[id];
      let powerDiff = this.player.stats.military - enemy.stats.military;
      if (this.player.doctrineStyle === 'expansionism') powerDiff += 8;

      const delta = Math.round(powerDiff * 0.35 + (Math.random() * 12 - 6));
      ds.warScore = Math.max(-100, Math.min(100, ds.warScore + delta));

      this.player.stats.military = Math.max(10, this.player.stats.military - 2);
      enemy.stats.military = Math.max(10, enemy.stats.military - 2);
      this.player.stats.stability = Math.max(0, this.player.stats.stability - (this.player.regimeStyle === 'liberal' ? 4 : 2));

      this.log(`Фронт (${enemy.name}): сдвиг ${delta >= 0 ? '+' : ''}${delta} (счёт: ${ds.warScore}).`);

      if (ds.warScore <= -80 && this.player.cities.length > 1) {
        const lostCity = this.player.cities.pop();
        enemy.cities.push(lostCity);
        ds.war = false;
        ds.warScore = 0;
        this.player.stats.debt += 25;
        this.log(`ПОРАЖЕНИЕ: ${enemy.name} захватила город ${lostCity.name} и навязала репарации ($25B в долг)!`);
        this.toast(`Поражение от ${enemy.name}! Потерян город ${lostCity.name}`);
      }
    }
  }

  triggerTurnEvent() {
    for (let i = 0; i < this.scheduledEvents.length; i++) {
      this.scheduledEvents[i].delay -= 1;
    }
    const readyIdx = this.scheduledEvents.findIndex(e => e.delay <= 0);
    if (readyIdx !== -1) {
      const item = this.scheduledEvents.splice(readyIdx, 1)[0];
      const evt = STORY_EVENTS[item.id];
      if (evt) return this.showEventModal(evt);
    }

    const arcKeys = ["arc_energy_1", "arc_border_1", "arc_power_1"];
    for (const key of arcKeys) {
      if (!this.triggeredArcs.has(key) && Math.random() < 0.45) {
        this.triggeredArcs.add(key);
        return this.showEventModal(STORY_EVENTS[key]);
      }
    }

    if (Math.random() < 0.65) {
      const evt = RANDOM_EVENTS[Math.floor(Math.random() * RANDOM_EVENTS.length)];
      this.showEventModal(evt);
    }
  }

  showEventModal(event) {
    const modal = document.getElementById('eventModal');
    document.getElementById('modalCategoryTag').innerText = event.category || 'СРОЧНОЕ ДОНЕСЕНИЕ';
    document.getElementById('modalTitle').innerText = event.title;
    document.getElementById('modalText').innerText = event.text;

    const opts = document.getElementById('modalOptions');
    opts.innerHTML = '';
    event.options.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'modal-option-btn';
      btn.innerHTML = `<strong>${opt.text}</strong><span>Последствия: ${opt.impact}</span>`;
      btn.addEventListener('click', () => {
        opt.action(this);
        if (opt.nextEventId) {
          this.scheduledEvents.push({ id: opt.nextEventId, delay: opt.nextDelay || 2 });
        }
        this.log(`Решение: «${event.title}» — ${opt.text}`);
        modal.style.display = 'none';
        this.refreshAllViews();
      });
      opts.appendChild(btn);
    });
    modal.style.display = 'flex';
  }

  /* ====================================================
     РЕНДЕРИНГ ВКЛАДОК
     ==================================================== */
  updateHeaderAndResources() {
    const st = this.player.stats;
    document.getElementById('playerFlag').innerText = this.player.flag;
    document.getElementById('playerCountryName').innerText = this.player.name.toUpperCase();
    document.getElementById('playerRegimeDisplay').innerText = `${this.player.regime} • ${this.player.economyName}`;
    document.getElementById('seasonDisplay').innerText = `${this.seasons[this.seasonIndex]} ${this.year}`;

    document.getElementById('resTreasury').innerText = `$${st.treasury}B / $${st.debt}B`;
    document.getElementById('resMacro').innerText = `${st.inflation}% / ${st.unemployment}%`;
    document.getElementById('resMilitary').innerText = `${st.military}/100`;
    document.getElementById('resStability').innerText = `${st.stability}% / ${st.eliteLoyalty}%`;
    document.getElementById('resInfluence').innerText = `${st.influence} / ${st.energy}%`;
  }

  renderOverviewTab() {
    const st = this.player.stats;
    const totalGdp = this.player.cities.reduce((sum, c) => sum + c.gdp, 0);
    const activeWars = Object.values(this.diploState).filter(d => d.war).length;

    document.getElementById('leaderBriefing').innerHTML = `
      <p style="margin-bottom:8px;"><strong>${this.player.fullName}</strong></p>
      <p style="font-size:14px; color:var(--ink-secondary); margin-bottom:8px;">
        Строй: <strong>${this.player.regime}</strong> • Экономика: <strong>${this.player.economyName}</strong> • Доктрина: <strong>${this.player.doctrineName}</strong>
      </p>
      <p style="font-size:14px; color:var(--ink-secondary);">
        ВВП городов: <strong>$${totalGdp}B</strong> • Коррупция: <strong>${st.corruption}%</strong> • 
        Инфляция: <strong>${st.inflation}%</strong> • Активных войн: <strong style="color:${activeWars > 0 ? 'var(--accent-crimson)' : 'inherit'};">${activeWars}</strong>
      </p>
    `;

    const storyList = document.getElementById('storyStatusList');
    const items = [];
    if (activeWars > 0) items.push({ title: "Военные действия", desc: `Идут бои (${activeWars}). Управляйте фронтом в «Дипломатии» или «Армии».`, badge: "Война", cls: "war" });
    if (st.inflation > 9) items.push({ title: "Высокая инфляция", desc: `Рост цен (${st.inflation}%) бьёт по гражданам. Снизьте госрасходы или откажитесь от эмиссии.`, badge: "Экономика", cls: "war" });
    if (st.eliteLoyalty < 35) items.push({ title: "Недовольство элит", desc: `Лояльность элит упала до ${st.eliteLoyalty}%. Риск саботажа и переворота!`, badge: "Угроза", cls: "war" });
    if (st.debt > 150) items.push({ title: "Долговая нагрузка", desc: `Госдолг $${st.debt}B требует крупных процентных выплат каждый квартал.`, badge: "Долг", cls: "gold" });
    if (items.length === 0) items.push({ title: "Управляемая обстановка", desc: "Государственные институты работают стабильно. Самое время для реформ или внешней экспансии.", badge: "Норма", cls: "ally" });

    storyList.innerHTML = items.map(i => `
      <div class="item-row">
        <div><h5>${i.title}</h5><p>${i.desc}</p></div>
        <span class="chip ${i.cls}">${i.badge}</span>
      </div>
    `).join('');

    const advList = document.getElementById('advisorsList');
    advList.innerHTML = this.player.advisors.map(a => `
      <div class="item-row">
        <div><h5>${a.role}: ${a.name}</h5><p>«${a.advice}»</p></div>
      </div>
    `).join('');
  }

  renderCitiesTab() {
    const grid = document.getElementById('citiesListGrid');
    grid.innerHTML = '';

    this.player.cities.forEach(city => {
      const card = document.createElement('div');
      card.className = 'city-card';
      card.innerHTML = `
        <div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
            <div class="city-name">${city.name}</div>
            <span class="chip">${city.focus}</span>
          </div>
          <div style="font-size:12px; color:var(--ink-muted); margin-bottom:8px;">Население: ${city.population} • ${city.role}</div>
          <div class="spec-line"><span>Лояльность</span><strong style="color:${city.loyalty >= 65 ? 'var(--accent-olive)' : 'var(--accent-crimson)'};">${city.loyalty}%</strong></div>
          <div class="spec-line"><span>Вклад в ВВП</span><strong>$${city.gdp}B</strong></div>
        </div>
        <div class="city-actions">
          <button class="btn-olive btn-sm" id="btnInvest_${city.id}">Развитие (-$6B, +ВВП)</button>
          <button class="btn-secondary btn-sm" id="btnGarrison_${city.id}">Гарнизон (-$4B, +Лоял.)</button>
          <button class="btn-danger btn-sm" style="grid-column:span 2;" id="btnExploit_${city.id}">Экстренный побор (+$10B, -15% лоял.)</button>
        </div>
      `;
      grid.appendChild(card);

      document.getElementById(`btnInvest_${city.id}`).addEventListener('click', () => {
        if (this.player.stats.treasury < 6) return this.toast("Недостаточно средств ($6B)");
        this.player.stats.treasury -= 6;
        city.gdp += 5;
        city.loyalty = Math.min(100, city.loyalty + 6);
        this.log(`Регионы: инвестиции в ${city.name} (+$5B ВВП).`);
        this.refreshAllViews();
      });

      document.getElementById(`btnGarrison_${city.id}`).addEventListener('click', () => {
        if (this.player.stats.treasury < 4) return this.toast("Недостаточно средств ($4B)");
        this.player.stats.treasury -= 4;
        city.loyalty = Math.min(100, city.loyalty + 10);
        this.player.stats.military = Math.min(100, this.player.stats.military + 2);
        this.log(`Регионы: усилен гарнизон в ${city.name}.`);
        this.refreshAllViews();
      });

      document.getElementById(`btnExploit_${city.id}`).addEventListener('click', () => {
        this.player.stats.treasury += 10;
        city.loyalty = Math.max(0, city.loyalty - 15);
        this.player.stats.stability = Math.max(0, this.player.stats.stability - 4);
        this.log(`Регионы: экстренный побор в ${city.name} (+$10B, -15% лояльность).`);
        this.refreshAllViews();
      });
    });
  }

  /* ====================================================
     МИРОВАЯ ДИПЛОМАТИЯ (12 ДЕРЖАВ) И ВОЙНА
     ==================================================== */
  renderDiplomacyTab() {
    const list = document.getElementById('diploCards');
    list.innerHTML = '';

    for (const key in this.otherCountries) {
      const c = this.otherCountries[key];
      const ds = this.diploState[key];
      const rel = this.player.relations[key] ?? 50;

      let statusBadge = `<span class="chip">Мир (${rel}/100)</span>`;
      if (ds.war) statusBadge = `<span class="chip war">ВОЙНА (${ds.warScore})</span>`;
      else if (ds.allied) statusBadge = `<span class="chip ally">Союз (${rel}/100)</span>`;
      else if (ds.embargo) statusBadge = `<span class="chip war">Эмбарго (${rel}/100)</span>`;

      const card = document.createElement('div');
      card.className = `diplo-country-card ${this.activeDiploPartner === key ? 'active' : ''}`;
      card.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
          <strong>${c.flag} ${c.name}</strong>
          ${statusBadge}
        </div>
        <div style="font-size:12px; color:var(--ink-muted);">Армия: ${c.stats.military}/100 • Блок: ${c.bloc === 'west' ? 'Запад' : c.bloc === 'eurasia' ? 'Евразия' : 'Независ.'}</div>
      `;
      card.addEventListener('click', () => {
        this.activeDiploPartner = key;
        this.renderDiplomacyTab();
        this.openDiploDialogue(key);
      });
      list.appendChild(card);
    }

    if (this.activeDiploPartner && this.otherCountries[this.activeDiploPartner]) {
      this.openDiploDialogue(this.activeDiploPartner);
    }
  }

  openDiploDialogue(targetId) {
    const pane = document.getElementById('diploDialoguePane');
    const target = this.otherCountries[targetId];
    const ds = this.diploState[targetId];
    const rel = this.player.relations[targetId] ?? 50;

    let warHtml = '';
    if (ds.war) {
      const pct = Math.max(0, Math.min(100, Math.round((ds.warScore + 100) / 2)));
      warHtml = `
        <div class="war-banner">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <strong>⚔️ ВОЙНА С ДЕРЖАВОЙ ${target.name.toUpperCase()}</strong>
            <span>Счёт фронта: <strong>${ds.warScore > 0 ? '+' : ''}${ds.warScore}</strong></span>
          </div>
          <div class="progress-bar-bg"><div class="progress-bar-fill" style="width:${pct}%;"></div></div>
          <div style="display:flex; gap:8px; flex-wrap:wrap; margin-top:8px;">
            <button class="btn-danger btn-sm" id="btnWarAttack">Наступление (-$10B)</button>
            <button class="btn-secondary btn-sm" id="btnWarDefend">Оборона (-$4B)</button>
            ${ds.warScore >= 50 ? `<button class="btn-primary-gold btn-sm" id="btnWarCapitulate">Капитуляция (город + $30B)</button>` : ''}
            <button class="btn-olive btn-sm" id="btnWarPeace">Предложить мир</button>
          </div>
        </div>
      `;
    }

    pane.innerHTML = `
      <div class="panel-title">
        <span>${target.flag} ${target.fullName}</span>
        <span class="chip ${ds.war ? 'war' : rel >= 65 ? 'ally' : ''}">Отношения: ${rel}/100</span>
      </div>

      ${warHtml}

      <div class="diplo-chat" id="dialogueChat">
        ${ds.chatHistory.map(m => `
          <div class="msg-bubble ${m.sender}">
            <strong style="font-size:11px; text-transform:uppercase; display:block; margin-bottom:2px;">${m.author}:</strong>
            ${m.text}
          </div>
        `).join('')}
      </div>

      <div style="margin-bottom:14px;">
        <div style="font-size:12px; font-weight:700; color:var(--ink-muted); text-transform:uppercase; margin-bottom:6px;">Живые переговоры</div>
        <div style="display:flex; gap:8px; flex-wrap:wrap;">
          <button class="btn-secondary btn-sm" id="btnTalkTrade">Торговая сделка (+$4B)</button>
          <button class="btn-secondary btn-sm" id="btnTalkLoan">Запросить кредит ($20B)</button>
          <button class="btn-secondary btn-sm" id="btnTalkSecurity">Требовать гарантий</button>
          <button class="btn-secondary btn-sm" id="btnTalkThreat">Пригрозить силой</button>
        </div>
      </div>

      <div style="margin-bottom:14px;">
        <div style="font-size:12px; font-weight:700; color:var(--ink-muted); text-transform:uppercase; margin-bottom:6px;">Помощь и союзы</div>
        <div class="diplo-actions-grid">
          <button class="btn-olive btn-sm" id="btnHelpMoney">Финансовая помощь (-$12B, +18 отн.)</button>
          <button class="btn-olive btn-sm" id="btnHelpArms">Поставки оружия (-$10B, +10 армия цели)</button>
          <button class="btn-primary-gold btn-sm" id="btnDiploTrade">${ds.tradePact ? '✓ Торговый пакт' : 'Торговый пакт (-$5B)'}</button>
          <button class="btn-primary-gold btn-sm" id="btnDiploAlliance">${ds.allied ? '✓ Военный союз' : 'Военный союз (отн. ≥ 65)'}</button>
        </div>
      </div>

      <div>
        <div style="font-size:12px; font-weight:700; color:var(--accent-crimson); text-transform:uppercase; margin-bottom:6px;">Вражда, ультиматумы и война</div>
        <div class="diplo-actions-grid">
          <button class="btn-secondary btn-sm" id="btnHostileEmbargo">${ds.embargo ? 'Снять эмбарго' : 'Эмбарго (-$2B/ход)'}</button>
          <button class="btn-secondary btn-sm" id="btnHostileSubvert">Поддержать оппозицию (-$8B)</button>
          <button class="btn-danger btn-sm" id="btnUltimatumMoney">Ультиматум: дань $25B</button>
          <button class="btn-danger btn-sm" id="btnUltimatumCity">Ультиматум: уступить город</button>
          ${!ds.war ? `<button class="btn-danger btn-sm" id="btnDeclareWar">⚔️ Объявить войну</button>` : ''}
        </div>
      </div>
    `;

    const chat = document.getElementById('dialogueChat');
    chat.scrollTop = chat.scrollHeight;

    document.getElementById('btnTalkTrade').addEventListener('click', () => this.handleDialogue(targetId, 'trade'));
    document.getElementById('btnTalkLoan').addEventListener('click', () => this.handleDialogue(targetId, 'loan'));
    document.getElementById('btnTalkSecurity').addEventListener('click', () => this.handleDialogue(targetId, 'security'));
    document.getElementById('btnTalkThreat').addEventListener('click', () => this.handleDialogue(targetId, 'threat'));

    document.getElementById('btnHelpMoney').addEventListener('click', () => {
      if (ds.war) return this.toast("Нельзя помогать врагу во время войны!");
      if (this.player.stats.treasury < 12) return this.toast("Недостаточно средств ($12B)");
      this.player.stats.treasury -= 12;
      target.stats.treasury += 12;
      target.stats.stability = Math.min(100, target.stats.stability + 8);
      this.changeRelation(targetId, 18);
      this.pushDiploMsg(targetId, "us", "Мы направляем вашей стране финансовую помощь ($12B).");
      this.pushDiploMsg(targetId, "them", "Благодарим за реальную поддержку.");
      this.log(`Дипломатия: финансовая помощь для ${target.name} ($12B).`);
      this.refreshAllViews();
    });

    document.getElementById('btnHelpArms').addEventListener('click', () => {
      if (ds.war) return this.toast("Нельзя поставлять оружие противнику!");
      if (this.player.stats.treasury < 10) return this.toast("Недостаточно средств ($10B)");
      this.player.stats.treasury -= 10;
      target.stats.military = Math.min(100, target.stats.military + 10);
      this.changeRelation(targetId, 15);
      this.pushDiploMsg(targetId, "us", "Передаём вам партию современных вооружений.");
      this.pushDiploMsg(targetId, "them", "Оружие получено. Обороноспособность выросла (+10).");
      this.log(`Дипломатия: поставки оружия для ${target.name}.`);
      this.refreshAllViews();
    });

    document.getElementById('btnDiploTrade').addEventListener('click', () => {
      if (ds.war || ds.tradePact) return;
      if (this.player.stats.treasury < 5) return this.toast("Недостаточно средств ($5B)");
      this.player.stats.treasury -= 5;
      ds.tradePact = true;
      ds.embargo = false;
      this.changeRelation(targetId, 12);
      this.pushDiploMsg(targetId, "system", "Подписан Торговый пакт.");
      this.log(`Дипломатия: торговый пакт с ${target.name}.`);
      this.refreshAllViews();
    });

    document.getElementById('btnDiploAlliance').addEventListener('click', () => {
      if (ds.war || ds.allied) return;
      if (rel < 65) {
        this.pushDiploMsg(targetId, "them", `Для союза нужно доверие минимум 65 (сейчас ${rel}).`);
        return this.openDiploDialogue(targetId);
      }
      ds.allied = true;
      this.changeRelation(targetId, 15);
      this.player.stats.influence = Math.min(100, this.player.stats.influence + 8);
      this.pushDiploMsg(targetId, "system", "Заключён Оборонительный союз!");
      this.log(`Дипломатия: заключён военный союз с ${target.name}.`);
      this.refreshAllViews();
    });

    document.getElementById('btnHostileEmbargo').addEventListener('click', () => {
      ds.embargo = !ds.embargo;
      if (ds.embargo) {
        ds.tradePact = false;
        this.changeRelation(targetId, -20);
        this.pushDiploMsg(targetId, "system", `Введено торговое эмбарго против ${target.name}.`);
      } else {
        this.changeRelation(targetId, 5);
        this.pushDiploMsg(targetId, "system", `Эмбарго против ${target.name} снято.`);
      }
      this.refreshAllViews();
    });

    document.getElementById('btnHostileSubvert').addEventListener('click', () => {
      if (this.player.stats.treasury < 8) return this.toast("Недостаточно средств ($8B)");
      this.player.stats.treasury -= 8;
      const caught = Math.random() < 0.45;
      target.stats.stability = Math.max(0, target.stats.stability - 12);
      if (caught) {
        this.changeRelation(targetId, -25);
        this.pushDiploMsg(targetId, "them", "Ваша подрывная сеть раскрыта! Отношения обрушены (-25).");
      } else {
        this.pushDiploMsg(targetId, "system", `Оппозиция в ${target.name} активизировалась (-12% стабильности цели).`);
      }
      this.refreshAllViews();
    });

    document.getElementById('btnUltimatumMoney').addEventListener('click', () => this.sendUltimatum(targetId, 'tribute'));
    document.getElementById('btnUltimatumCity').addEventListener('click', () => this.sendUltimatum(targetId, 'city'));

    const btnWar = document.getElementById('btnDeclareWar');
    if (btnWar) btnWar.addEventListener('click', () => { this.declareWar(targetId, "Прямое объявление войны"); this.refreshAllViews(); });

    if (ds.war) {
      document.getElementById('btnWarAttack').addEventListener('click', () => this.warAction(targetId, 'attack'));
      document.getElementById('btnWarDefend').addEventListener('click', () => this.warAction(targetId, 'defend'));
      document.getElementById('btnWarPeace').addEventListener('click', () => this.warAction(targetId, 'peace'));
      const btnCap = document.getElementById('btnWarCapitulate');
      if (btnCap) btnCap.addEventListener('click', () => this.warAction(targetId, 'capitulate'));
    }
  }

  handleDialogue(targetId, topic) {
    const target = this.otherCountries[targetId];
    const rel = this.player.relations[targetId] ?? 50;
    const ourPower = this.player.stats.military;
    const theirPower = target.stats.military;

    if (topic === 'trade') {
      this.pushDiploMsg(targetId, "us", "Предлагаем расширить торговлю и снять таможенные барьеры.");
      if (rel >= 40) {
        this.changeRelation(targetId, 6);
        this.player.stats.treasury += 4;
        this.pushDiploMsg(targetId, "them", "Договорились. Сделка принесла +$4B в вашу казну и укрепила отношения.");
      } else {
        this.pushDiploMsg(targetId, "them", "При таком уровне враждебности торговля невозможна.");
      }
    } else if (topic === 'loan') {
      this.pushDiploMsg(targetId, "us", "Мы запрашиваем у вашей страны двусторонний кредит $20B.");
      if (rel >= 55 && target.stats.treasury >= 80) {
        this.player.stats.treasury += 20;
        this.player.stats.debt += 22;
        target.stats.treasury -= 20;
        this.pushDiploMsg(targetId, "them", "Кредит одобрен: +$20B в казну (+$22B к вашему госдолгу).");
      } else {
        this.pushDiploMsg(targetId, "them", "Отказано: недостаточно доверия или свободных резервов.");
      }
    } else if (topic === 'security') {
      this.pushDiploMsg(targetId, "us", "Требуем гарантий безопасности и отвода войск.");
      if (ourPower >= theirPower) {
        this.changeRelation(targetId, -4);
        this.player.stats.influence = Math.min(100, this.player.stats.influence + 4);
        this.pushDiploMsg(targetId, "them", "Мы учитываем ваш военный вес и готовы к разрядке (+4 влияние).");
      } else {
        this.changeRelation(targetId, -8);
        this.pushDiploMsg(targetId, "them", "Вы не вправе диктовать нам условия.");
      }
    } else if (topic === 'threat') {
      this.pushDiploMsg(targetId, "us", "Немедленно измените курс, иначе заговорят пушки!");
      this.changeRelation(targetId, -18);
      if (ourPower > theirPower + 18) {
        target.stats.treasury -= 5;
        this.player.stats.treasury += 5;
        this.pushDiploMsg(targetId, "them", "Мы вынуждены уступить и выплатить $5B компенсации.");
      } else {
        this.pushDiploMsg(targetId, "them", "Ваши угрозы лишь ускорят нашу мобилизацию!");
        if ((this.player.relations[targetId] ?? 50) <= 10) {
          this.declareWar(targetId, "Дипломатические угрозы переросли в войну");
        }
      }
    }
    this.refreshAllViews();
  }

  sendUltimatum(targetId, type) {
    const target = this.otherCountries[targetId];
    const ds = this.diploState[targetId];
    if (ds.war) return this.toast("Вы уже воюете с этой страной!");

    const ratio = this.player.stats.military - target.stats.military;
    this.changeRelation(targetId, -35);

    if (type === 'tribute') {
      this.pushDiploMsg(targetId, "us", "УЛЬТИМАТУМ: Выплатите $25B контрибуции, иначе война!");
      if (ratio >= 12) {
        this.player.stats.treasury += 25;
        target.stats.treasury -= 25;
        this.player.stats.influence = Math.min(100, this.player.stats.influence + 8);
        this.pushDiploMsg(targetId, "them", "Мы принимаем ультиматум и переводим $25B.");
        this.log(`УЛЬТИМАТУМ: ${target.name} выплатила $25B.`);
      } else {
        this.pushDiploMsg(targetId, "them", "Мы не подчинимся шантажу! К оружию!");
        this.declareWar(targetId, `${target.name} отвергла ультиматум`);
      }
    } else if (type === 'city') {
      if (target.cities.length <= 1) return this.toast("У державы остался только столичный город.");
      const targetCity = target.cities[target.cities.length - 1];
      this.pushDiploMsg(targetId, "us", `УЛЬТИМАТУМ: Передайте нам город ${targetCity.name}!`);
      if (ratio >= 22) {
        target.cities.pop();
        targetCity.loyalty = 40;
        this.player.cities.push(targetCity);
        this.player.stats.influence = Math.min(100, this.player.stats.influence + 12);
        this.pushDiploMsg(targetId, "them", `Город ${targetCity.name} переходит под ваш контроль.`);
        this.log(`УЛЬТИМАТУМ: ${target.name} уступила город ${targetCity.name}!`);
      } else {
        this.pushDiploMsg(targetId, "them", `Мы никогда не отдадим ${targetCity.name}!`);
        this.declareWar(targetId, `${target.name} отвергла территориальный ультиматум`);
      }
    }
    this.refreshAllViews();
  }

  declareWar(targetId, reason) {
    const ds = this.diploState[targetId];
    const target = this.otherCountries[targetId];
    if (!ds || ds.war) return;
    ds.war = true;
    ds.warScore = 0;
    ds.allied = false;
    ds.tradePact = false;
    this.player.relations[targetId] = 0;
    this.player.stats.stability = Math.max(0, this.player.stats.stability - 5);
    this.pushDiploMsg(targetId, "system", `⚔️ ОБЪЯВЛЕНА ВОЙНА! (${reason})`);
    this.log(`ВОЙНА: Боевые действия с ${target.name} (${reason}).`);
    this.toast(`Война с ${target.name} началась!`);
  }

  warAction(targetId, action) {
    const ds = this.diploState[targetId];
    const target = this.otherCountries[targetId];
    if (!ds || !ds.war) return;

    if (action === 'attack') {
      if (this.player.stats.treasury < 10) return this.toast("Недостаточно средств ($10B)");
      this.player.stats.treasury -= 10;
      const bonus = this.player.doctrineStyle === 'expansionism' ? 6 : 0;
      const gain = Math.round(12 + bonus + (this.player.stats.military - target.stats.military) * 0.55 + (Math.random() * 16 - 4));
      ds.warScore = Math.max(-100, Math.min(100, ds.warScore + gain));
      this.player.stats.military = Math.max(10, this.player.stats.military - 4);
      target.stats.military = Math.max(10, target.stats.military - 6);
      this.log(`Наступление против ${target.name}: фронт ${gain >= 0 ? '+' : ''}${gain} (счёт: ${ds.warScore}).`);
    } else if (action === 'defend') {
      if (this.player.stats.treasury < 4) return this.toast("Недостаточно средств ($4B)");
      this.player.stats.treasury -= 4;
      ds.warScore = Math.min(100, ds.warScore + 8);
      this.player.stats.stability = Math.min(100, this.player.stats.stability + 3);
    } else if (action === 'capitulate') {
      if (ds.warScore < 50) return;
      ds.war = false;
      ds.warScore = 0;
      this.player.stats.treasury += 30;
      this.player.stats.influence = Math.min(100, this.player.stats.influence + 12);
      let annexed = "";
      if (target.cities.length > 1) {
        const city = target.cities.pop();
        city.loyalty = 35;
        city.population = city.population || "1.0 млн";
        city.role = city.role || "Присоединённый регион";
        city.focus = city.focus || "Промышленность";
        this.player.cities.push(city);
        annexed = ` и присоединён город ${city.name}`;
      }
      this.pushDiploMsg(targetId, "system", `ПОБЕДА! Капитуляция ${target.name}: +$30B${annexed}.`);
      this.log(`ПОБЕДА: ${target.name} капитулировала! +$30B${annexed}.`);
    } else if (action === 'peace') {
      ds.war = false;
      if (ds.warScore >= 0) {
        this.player.stats.treasury += 8;
        this.pushDiploMsg(targetId, "system", "Подписан мирный договор (+$8B).");
      } else {
        this.player.stats.treasury -= 18;
        this.pushDiploMsg(targetId, "system", "Подписан тяжёлый мир (-$18B репараций).");
      }
      ds.warScore = 0;
    }
    this.refreshAllViews();
  }

  /* ====================================================
     ЭКОНОМИКА, ФИНАНСОВАЯ МОДЕЛЬ И ИДЕОЛОГИЯ
     ==================================================== */
  renderEconomyTab() {
    document.getElementById('taxSlider').value = this.player.stats.taxRate;
    document.getElementById('taxRateVal').innerText = `${this.player.stats.taxRate}%`;
    document.getElementById('budDefSlider').value = this.budget.defense;
    document.getElementById('budDefVal').innerText = `${this.budget.defense}%`;
    document.getElementById('budSocSlider').value = this.budget.social;
    document.getElementById('budSocVal').innerText = `${this.budget.social}%`;

    this.renderChangeableAxis('economyModelSelector', this.economyModels, this.player.economyStyle, (m) => {
      this.player.economyStyle = m.id;
      this.player.economyName = m.name;
      this.player.stats.eliteLoyalty = Math.max(0, this.player.stats.eliteLoyalty - 10);
      this.player.stats.stability = Math.max(0, this.player.stats.stability - 6);
      this.log(`Экономика: переход на модель «${m.name}» (-10% лояльность элит, -6% стаб.).`);
      this.refreshAllViews();
    });

    this.renderChangeableAxis('regimeSelector', this.regimeTypes, this.player.regimeStyle, (r) => {
      this.player.regimeStyle = r.id;
      this.player.regime = r.name;
      this.player.stats.stability = Math.max(0, this.player.stats.stability - 6);
      this.log(`Политика: смена строя на «${r.name}» (-6% стаб.).`);
      this.refreshAllViews();
    });

    this.renderChangeableAxis('doctrineSelector', this.foreignDoctrines, this.player.doctrineStyle, (d) => {
      this.player.doctrineStyle = d.id;
      this.player.doctrineName = d.name;
      this.log(`Внешний курс: принята доктрина «${d.name}».`);
      this.refreshAllViews();
    });

    const projList = document.getElementById('ecoProjectsList');
    projList.innerHTML = '';
    this.player.projects.forEach(p => {
      const row = document.createElement('div');
      row.className = 'item-row';
      row.innerHTML = `
        <div><h5>${p.name}</h5><p>${p.effect}</p></div>
        <button class="${p.active ? 'btn-olive' : 'btn-primary-gold'} btn-sm">${p.active ? '✓ Построен' : `$${p.cost}B`}</button>
      `;
      row.querySelector('button').addEventListener('click', () => {
        if (p.active) return;
        if (this.player.stats.treasury < p.cost) return this.toast(`Нужно $${p.cost}B`);
        this.player.stats.treasury -= p.cost;
        p.active = true;
        this.player.stats.energy = Math.min(100, this.player.stats.energy + 10);
        if (this.player.cities[0]) this.player.cities[0].gdp += 10;
        this.log(`Нацпроект: реализован «${p.name}».`);
        this.refreshAllViews();
      });
      projList.appendChild(row);
    });

    const dList = document.getElementById('decreesList');
    dList.innerHTML = '';
    this.decrees.forEach(d => {
      const row = document.createElement('div');
      row.className = 'item-row';
      row.innerHTML = `
        <div><h5>${d.name}</h5><p>${d.desc}</p></div>
        <button class="${d.passed ? 'btn-olive' : 'btn-secondary'} btn-sm">${d.passed ? '✓ Действует' : `$${d.cost}B`}</button>
      `;
      row.querySelector('button').addEventListener('click', () => {
        if (d.passed) return;
        if (this.player.stats.treasury < d.cost) return this.toast(`Нужно $${d.cost}B`);
        this.player.stats.treasury -= d.cost;
        d.passed = true;
        if (d.id === 'media_sovereignty') {
          this.player.stats.stability = Math.min(100, this.player.stats.stability + 10);
          this.player.stats.influence = Math.max(0, this.player.stats.influence - 6);
        } else if (d.id === 'defense_priority_order') {
          this.player.stats.military = Math.min(100, this.player.stats.military + 15);
        } else if (d.id === 'anti_corruption_audit') {
          this.player.stats.corruption = Math.max(0, this.player.stats.corruption - 12);
          this.player.stats.eliteLoyalty = Math.max(0, this.player.stats.eliteLoyalty - 12);
        } else if (d.id === 'martial_law') {
          this.player.stats.military = Math.min(100, this.player.stats.military + 10);
          this.player.stats.influence = Math.max(0, this.player.stats.influence - 10);
        }
        this.log(`Указ: принят «${d.name}».`);
        this.refreshAllViews();
      });
      dList.appendChild(row);
    });
  }

  renderChangeableAxis(containerId, list, currentId, onSelect) {
    const el = document.getElementById(containerId);
    el.innerHTML = '';
    list.forEach(item => {
      const active = item.id === currentId;
      const row = document.createElement('div');
      row.className = 'item-row';
      row.innerHTML = `
        <div><h5>${item.name}</h5><p>${item.desc}</p></div>
        <button class="${active ? 'btn-olive' : 'btn-secondary'} btn-sm">${active ? '✓ Активно' : 'Выбрать'}</button>
      `;
      row.querySelector('button').addEventListener('click', () => {
        if (!active) onSelect(item);
      });
      el.appendChild(row);
    });
  }

  renderMilitaryTab() {
    document.getElementById('milStats').innerHTML = `
      <div class="panel" style="padding:12px;">
        <div class="readout-label">Боеспособность</div>
        <div class="readout-value">${this.player.stats.military}/100</div>
      </div>
      <div class="panel" style="padding:12px;">
        <div class="readout-label">Ядерный щит</div>
        <div class="readout-value">${this.player.nuclear ? 'Есть' : 'Нет'}</div>
      </div>
    `;

    const warsBox = document.getElementById('activeWarsList');
    const warIds = Object.keys(this.diploState).filter(id => this.diploState[id].war);
    if (warIds.length === 0) {
      warsBox.innerHTML = `<p style="color:var(--ink-muted); font-size:14px;">Активных войн нет. Объявить войну или выдвинуть ультиматум можно во вкладке «Мир, Дипломатия и Война».</p>`;
      return;
    }

    warsBox.innerHTML = '';
    warIds.forEach(id => {
      const enemy = this.otherCountries[id];
      const ds = this.diploState[id];
      const pct = Math.max(0, Math.min(100, Math.round((ds.warScore + 100) / 2)));
      const box = document.createElement('div');
      box.className = 'war-banner';
      box.innerHTML = `
        <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
          <strong>${enemy.flag} Война с ${enemy.name}</strong>
          <span>Счёт: <strong>${ds.warScore}</strong></span>
        </div>
        <div style="font-size:12px; margin-bottom:6px;">Армия врага: ${enemy.stats.military}/100 • Городов: ${enemy.cities.length}</div>
        <div class="progress-bar-bg"><div class="progress-bar-fill" style="width:${pct}%;"></div></div>
        <div style="display:flex; gap:8px; flex-wrap:wrap; margin-top:8px;">
          <button class="btn-danger btn-sm" id="milAtk_${id}">Наступление (-$10B)</button>
          <button class="btn-secondary btn-sm" id="milDef_${id}">Оборона (-$4B)</button>
          ${ds.warScore >= 50 ? `<button class="btn-primary-gold btn-sm" id="milCap_${id}">Капитуляция</button>` : ''}
        </div>
      `;
      warsBox.appendChild(box);
      document.getElementById(`milAtk_${id}`).addEventListener('click', () => this.warAction(id, 'attack'));
      document.getElementById(`milDef_${id}`).addEventListener('click', () => this.warAction(id, 'defend'));
      const capBtn = document.getElementById(`milCap_${id}`);
      if (capBtn) capBtn.addEventListener('click', () => this.warAction(id, 'capitulate'));
    });
  }

  /* ====================================================
     УТИЛИТЫ
     ==================================================== */
  changeRelation(targetId, delta) {
    if (this.player.relations[targetId] === undefined) this.player.relations[targetId] = 50;
    this.player.relations[targetId] = Math.max(0, Math.min(100, this.player.relations[targetId] + delta));
  }

  shiftAllRelations(delta) {
    for (const id in this.otherCountries) {
      this.changeRelation(id, delta);
    }
  }

  getMostHostileCountryId() {
    let worstId = null;
    let worstVal = 999;
    for (const id in this.otherCountries) {
      const rel = this.player.relations[id] ?? 50;
      if (rel < worstVal) {
        worstVal = rel;
        worstId = id;
      }
    }
    return worstId;
  }

  pushDiploMsg(targetId, sender, text) {
    const target = this.otherCountries[targetId];
    const author = sender === 'us' ? this.player.name : sender === 'them' ? `Посол (${target.name})` : 'Канцелярия';
    this.diploState[targetId].chatHistory.push({ sender, author, text });
  }

  log(msg) {
    const date = `${this.seasons[this.seasonIndex]} ${this.year}`;
    this.logs.unshift({ date, text: msg });
    const feed = document.getElementById('chronicleFeed');
    if (feed) {
      feed.innerHTML = this.logs.map(l => `
        <div class="item-row">
          <div>
            <span style="font-size:11px; font-weight:700; color:var(--accent-crimson);">${l.date}</span>
            <p style="color:var(--ink-primary);">${l.text}</p>
          </div>
        </div>
      `).join('');
    }
  }

  toast(msg) {
    const container = document.getElementById('toastContainer');
    const t = document.createElement('div');
    t.className = 'toast-item';
    t.innerText = msg;
    container.appendChild(t);
    setTimeout(() => t.remove(), 3600);
  }

  saveGame() {
    if (!this.player) return this.toast("Сначала выберите державу!");
    localStorage.setItem('statecraft_save_v3', JSON.stringify({
      year: this.year, seasonIndex: this.seasonIndex, turn: this.turn,
      player: this.player, otherCountries: this.otherCountries,
      diploState: this.diploState, logs: this.logs, decrees: this.decrees,
      budget: this.budget, storyFlags: this.storyFlags,
      scheduledEvents: this.scheduledEvents, triggeredArcs: Array.from(this.triggeredArcs)
    }));
    this.toast("Игра сохранена.");
  }

  loadGame() {
    const raw = localStorage.getItem('statecraft_save_v3');
    if (!raw) return this.toast("Сохранение не найдено.");
    const data = JSON.parse(raw);
    this.year = data.year;
    this.seasonIndex = data.seasonIndex;
    this.turn = data.turn;
    this.player = data.player;
    this.otherCountries = data.otherCountries;
    this.diploState = data.diploState;
    this.logs = data.logs || [];
    this.decrees = data.decrees || this.decrees;
    this.budget = data.budget || this.budget;
    this.storyFlags = data.storyFlags || {};
    this.scheduledEvents = data.scheduledEvents || [];
    this.triggeredArcs = new Set(data.triggeredArcs || []);

    document.querySelectorAll('.wizard-step').forEach(s => s.classList.remove('active'));
    document.getElementById('screenGame').classList.add('active');
    document.getElementById('headerMeta').style.display = 'flex';
    document.getElementById('instrumentBar').style.display = 'grid';
    this.refreshAllViews();
    this.toast("Сохранение загружено.");
  }
}

window.addEventListener('DOMContentLoaded', () => {
  const game = new GameState();
  game.init();
  window.currentGame = game;
});

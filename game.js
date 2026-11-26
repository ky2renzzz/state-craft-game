/**
 * StateCraft — Историко-политический симулятор
 */
class GameState {
  constructor() {
    this.year = 2026;
    this.seasonIndex = 0;
    this.seasons = ["ВЕСНА", "ЛЕТО", "ОСЕНЬ", "ЗИМА"];
    this.turn = 1;

    // Выбор в мастере старта
    this.selectedCountryId = null;
    this.selectedIdeology = null;
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

    this.regimeTypes = [
      { id: "liberal", name: "Парламентская демократия", desc: "Высокие доходы от торговли и инвестиций (+20% к налогам), но общество острее реагирует на войны." },
      { id: "social_state", name: "Социальное государство", desc: "Высокая лояльность граждан (+2 стабильности в ход), но повышенные бюджетные расходы." },
      { id: "technocracy", name: "Технократия", desc: "Ускоренный рост ВВП и энергетики, эффективная модернизация армии." },
      { id: "sovereign_statism", name: "Авторитарный этатизм", desc: "Жёсткий контроль над регионами и армией (+3 мощи в ход), но напряжённые отношения с демократиями." }
    ];

    this.decrees = [
      { id: "free_economic_zones", name: "Особые экономические зоны", cost: 12, passed: false, desc: "+$8B дохода каждый квартал, приток капитала." },
      { id: "media_sovereignty", name: "Закон о госконтроле печати", cost: 6, passed: false, desc: "Стабильность +10%, но -6 к авторитету в мире." },
      { id: "defense_priority_order", name: "Мобилизация ВПК", cost: 18, passed: false, desc: "Военная мощь +15 сразу, но содержание -$5B каждый квартал." },
      { id: "anti_corruption_audit", name: "Ревизионная палата", cost: 8, passed: false, desc: "Снижает коррупцию на 10%, экономит бюджет." },
      { id: "martial_law", name: "Чрезвычайное положение", cost: 4, passed: false, desc: "Армия +10, но падает доход городов и -10% к авторитету." }
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
          <div>Армия: <strong>${c.stats.military}/100</strong></div>
          <div>Стаб.: <strong>${c.stats.stability}%</strong></div>
          <div>Городов: <strong>${c.cities.length}</strong></div>
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
          Строй: <strong>${country.ideologyName}</strong>
        </div>
      </div>

      <div class="dossier-body">
        <div>
          <div class="panel-title">Историческая справка</div>
          <p style="margin-bottom:10px; color:var(--ink-secondary);">${country.traits.join('. ')}.</p>
          <p style="font-size:13px; color:var(--ink-muted);">Ключевые города: ${country.cities.map(ct => ct.name).join(', ')}.</p>
        </div>

        <div>
          <div class="panel-title">Стартовые ресурсы</div>
          <div class="spec-line"><span>Казна</span><strong>$${country.stats.treasury} млрд</strong></div>
          <div class="spec-line"><span>Военная мощь</span><strong>${country.stats.military} / 100</strong></div>
          <div class="spec-line"><span>Стабильность</span><strong>${country.stats.stability}%</strong></div>
          <div class="spec-line"><span>Авторитет</span><strong>${country.stats.influence} / 100</strong></div>
          <div class="spec-line"><span>Энергонезависимость</span><strong>${country.stats.energy}%</strong></div>
          <button class="btn-danger" id="btnConfirmCountry" style="width:100%; margin-top:16px;">Выбрать державу и перейти к курсу ➔</button>
        </div>
      </div>
    `;

    document.getElementById('btnConfirmCountry').addEventListener('click', () => {
      this.goToWizardStep2();
    });
  }

  goToWizardStep2() {
    if (!this.selectedCountryId) return;
    const country = COUNTRIES_DATA[this.selectedCountryId];
    this.selectedIdeology = country.defaultIdeology || "social_state";
    document.getElementById('wzChosenCountry').innerText = country.name;
    document.getElementById('wizardStep1').classList.remove('active');
    document.getElementById('wizardStep2').classList.add('active');
    this.renderWizardStep2Options(country);
  }

  renderWizardStep2Options(country) {
    const container = document.getElementById('wizardIdeologyOptions');
    container.innerHTML = '';

    this.regimeTypes.forEach(r => {
      const isDefault = r.id === country.defaultIdeology;
      const isSelected = r.id === this.selectedIdeology;
      const card = document.createElement('div');
      card.className = `choice-card ${isSelected ? 'selected' : ''}`;
      card.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
          <strong style="font-size:16px;">${r.name}</strong>
          ${isDefault ? '<span class="chip gold">Исторический</span>' : ''}
        </div>
        <p style="font-size:13px; color:var(--ink-secondary);">${r.desc}</p>
      `;
      card.addEventListener('click', () => {
        this.selectedIdeology = r.id;
        document.querySelectorAll('#wizardIdeologyOptions .choice-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
      });
      container.appendChild(card);
    });
  }

  goToWizardStep3() {
    const country = COUNTRIES_DATA[this.selectedCountryId];
    const regime = this.regimeTypes.find(r => r.id === this.selectedIdeology);
    document.getElementById('wzChosenCountry2').innerText = country.name;
    document.getElementById('wzChosenIdeology').innerText = regime ? regime.name : '';
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
      <strong style="display:block; margin-bottom:6px;">Свобода рук (нейтралитет)</strong>
      <p style="font-size:13px; color:var(--ink-secondary);">Сохранить текущие исторические отношения со всеми державами.</p>
    `;
    neutralCard.addEventListener('click', () => {
      this.selectedTargetAlly = 'neutral';
      document.querySelectorAll('#wizardAlliesOptions .choice-card').forEach(c => c.classList.remove('selected'));
      neutralCard.classList.add('selected');
    });
    container.appendChild(neutralCard);

    for (const k in COUNTRIES_DATA) {
      if (k === this.selectedCountryId) continue;
      const other = COUNTRIES_DATA[k];
      const card = document.createElement('div');
      card.className = `choice-card ${this.selectedTargetAlly === k ? 'selected' : ''}`;
      card.innerHTML = `
        <div style="font-size:24px; margin-bottom:6px;">${other.flag}</div>
        <strong style="display:block; margin-bottom:6px;">Сближение с ${other.name}</strong>
        <p style="font-size:13px; color:var(--ink-secondary);">+25 к стартовым отношениям и готовность к торговому или военному пакту.</p>
      `;
      card.addEventListener('click', () => {
        this.selectedTargetAlly = k;
        document.querySelectorAll('#wizardAlliesOptions .choice-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
      });
      container.appendChild(card);
    }
  }

  startGamePlay() {
    this.player = JSON.parse(JSON.stringify(COUNTRIES_DATA[this.selectedCountryId]));
    const regimeObj = this.regimeTypes.find(r => r.id === this.selectedIdeology);
    if (regimeObj) {
      this.player.regime = regimeObj.name;
      this.player.regimeStyle = regimeObj.id;
    }

    this.otherCountries = {};
    this.diploState = {};
    for (const k in COUNTRIES_DATA) {
      if (k !== this.selectedCountryId) {
        this.otherCountries[k] = JSON.parse(JSON.stringify(COUNTRIES_DATA[k]));
        const preset = this.player.dialoguePresets?.[k];
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
              text: preset ? preset.greeting : `Посольство державы ${this.otherCountries[k].name} готово к предметному разговору.`
            }
          ]
        };
      }
    }

    if (this.selectedTargetAlly && this.selectedTargetAlly !== 'neutral') {
      this.changeRelation(this.selectedTargetAlly, 25);
    }

    document.getElementById('wizardStep3').classList.remove('active');
    document.getElementById('screenGame').classList.add('active');
    document.getElementById('headerMeta').style.display = 'flex';
    document.getElementById('instrumentBar').style.display = 'grid';

    this.log(`Начало правления: ${this.player.fullName}. Политический курс: ${this.player.regime}.`);
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
     СОБЫТИЯ ИНТЕРФЕЙСА
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

    document.getElementById('btnPrintMoney').addEventListener('click', () => {
      this.player.stats.treasury += 25;
      this.player.stats.stability = Math.max(0, this.player.stats.stability - 8);
      this.log("Экономика: проведена внеплановая эмиссия (+$25B), инфляция снизила стабильность на 8%.");
      this.toast("Эмиссия: +$25B в казну, но стабильность -8%");
      this.refreshAllViews();
    });

    document.getElementById('btnSocialRelief').addEventListener('click', () => {
      if (this.player.stats.treasury < 12) return this.toast("Недостаточно средств ($12B)");
      this.player.stats.treasury -= 12;
      this.player.stats.stability = Math.min(100, this.player.stats.stability + 10);
      this.log("Социальная политика: выплачены субсидии населению (-$12B, стабильность +10%).");
      this.toast("Социальный пакет: стабильность +10%");
      this.refreshAllViews();
    });

    document.getElementById('btnMobilize').addEventListener('click', () => {
      if (this.player.stats.treasury < 8) return this.toast("Недостаточно средств ($8B)");
      this.player.stats.treasury -= 8;
      this.player.stats.military = Math.min(100, this.player.stats.military + 8);
      this.player.stats.stability = Math.max(0, this.player.stats.stability - 5);
      this.log("Армия: проведена мобилизация резервистов (мощь +8, стабильность -5%).");
      this.toast("Мобилизация проведена: военная мощь +8");
      this.refreshAllViews();
    });

    document.getElementById('btnModernize').addEventListener('click', () => {
      if (this.player.stats.treasury < 18) return this.toast("Недостаточно средств ($18B)");
      this.player.stats.treasury -= 18;
      this.player.stats.military = Math.min(100, this.player.stats.military + 12);
      this.log("Армия: закуплены новые вооружения (мощь +12).");
      this.toast("Вооружённые силы модернизированы: +12 к мощи");
      this.refreshAllViews();
    });

    document.getElementById('btnDrills').addEventListener('click', () => {
      if (this.player.stats.treasury < 5) return this.toast("Недостаточно средств ($5B)");
      this.player.stats.treasury -= 5;
      this.player.stats.military = Math.min(100, this.player.stats.military + 4);
      this.player.stats.influence = Math.min(100, this.player.stats.influence + 4);
      this.log("Армия: проведены масштабные военные учения (мощь +4, влияние +4).");
      this.toast("Учения завершены успешно");
      this.refreshAllViews();
    });
  }

  /* ====================================================
     ХОД ИГРЫ, ЭКОНОМИКА, ВОЙНЫ И СЮЖЕТ
     ==================================================== */
  advanceTurn() {
    this.turn += 1;
    this.seasonIndex = (this.seasonIndex + 1) % 4;
    if (this.seasonIndex === 0) this.year += 1;

    // 1. Экономика
    const totalGdp = this.player.cities.reduce((sum, c) => sum + c.gdp, 0);
    let taxIncome = Math.round(totalGdp * (this.player.stats.taxRate / 100) * 0.45);
    if (this.player.regimeStyle === "liberal") taxIncome = Math.round(taxIncome * 1.2);
    if (this.player.regimeStyle === "technocracy") taxIncome = Math.round(taxIncome * 1.1);

    let extraIncome = 0;
    let extraExpense = 0;

    // Доход от торговых пактов и убытки от эмбарго
    for (const id in this.diploState) {
      const ds = this.diploState[id];
      if (ds.tradePact && !ds.war) extraIncome += 4;
      if (ds.embargo) {
        extraExpense += 2;
        this.otherCountries[id].stats.treasury -= 6;
      }
      if (ds.war) {
        extraExpense += 8; // военные расходы
      }
    }

    if (this.decrees.find(d => d.id === "free_economic_zones")?.passed) extraIncome += 8;
    if (this.decrees.find(d => d.id === "defense_priority_order")?.passed) {
      extraExpense += 5;
      this.player.stats.military = Math.min(100, this.player.stats.military + 2);
    }

    const net = taxIncome + extraIncome - extraExpense;
    this.player.stats.treasury += net;

    // Налоговое давление на стабильность
    if (this.player.stats.taxRate > 42) {
      this.player.stats.stability = Math.max(0, this.player.stats.stability - 4);
    } else if (this.player.stats.taxRate <= 25) {
      this.player.stats.stability = Math.min(100, this.player.stats.stability + 2);
    }

    if (this.player.regimeStyle === "social_state") {
      this.player.stats.stability = Math.min(100, this.player.stats.stability + 2);
    }
    if (this.player.regimeStyle === "sovereign_statism") {
      this.player.stats.military = Math.min(100, this.player.stats.military + 2);
    }

    // 2. Автоматический ход активных войн
    this.processWarsPerTurn();

    // 3. Проверка критических порогов (банкротство / бунт)
    if (this.player.stats.treasury < -25) {
      this.player.stats.stability = Math.max(0, this.player.stats.stability - 8);
      this.log("КРИЗИС: Казна в глубоком дефиците! Доверие граждан падает.");
    }

    this.log(`Квартал ${this.seasons[this.seasonIndex]} ${this.year}: баланс бюджета ${net >= 0 ? '+' : ''}$${net}B.`);

    // 4. Сюжетные и случайные события
    this.triggerTurnEvent();

    this.refreshAllViews();
  }

  processWarsPerTurn() {
    for (const id in this.diploState) {
      const ds = this.diploState[id];
      if (!ds.war) continue;
      const enemy = this.otherCountries[id];
      const powerDiff = (this.player.stats.military - enemy.stats.military);
      const delta = Math.round(powerDiff * 0.35 + (Math.random() * 12 - 6));
      ds.warScore = Math.max(-100, Math.min(100, ds.warScore + delta));

      // Потери обеих сторон
      this.player.stats.military = Math.max(10, this.player.stats.military - 2);
      enemy.stats.military = Math.max(10, enemy.stats.military - 2);
      this.player.stats.stability = Math.max(0, this.player.stats.stability - 3);

      this.log(`Фронт (${enemy.name}): изменение позиции ${delta >= 0 ? '+' : ''}${delta} (счёт войны: ${ds.warScore}).`);

      if (ds.warScore <= -80 && this.player.cities.length > 1) {
        const lostCity = this.player.cities.pop();
        enemy.cities.push(lostCity);
        ds.war = false;
        ds.warScore = 0;
        this.player.stats.treasury -= 20;
        this.log(`ПОРАЖЕНИЕ: Враг (${enemy.name}) захватил город ${lostCity.name} и навязал мир с контрибуцией $20B!`);
        this.toast(`Поражение в войне с ${enemy.name}! Потерян город ${lostCity.name}`);
      }
    }
  }

  triggerTurnEvent() {
    // Сначала проверяем запланированные сюжетные продолжения
    for (let i = 0; i < this.scheduledEvents.length; i++) {
      this.scheduledEvents[i].delay -= 1;
    }
    const readyIdx = this.scheduledEvents.findIndex(e => e.delay <= 0);
    if (readyIdx !== -1) {
      const item = this.scheduledEvents.splice(readyIdx, 1)[0];
      const evt = STORY_EVENTS[item.id];
      if (evt) return this.showEventModal(evt);
    }

    // Затем запускаем сюжетные арки (с 2-го хода)
    const arcKeys = ["arc_energy_1", "arc_border_1", "arc_power_1"];
    for (const key of arcKeys) {
      if (!this.triggeredArcs.has(key) && Math.random() < 0.45) {
        this.triggeredArcs.add(key);
        return this.showEventModal(STORY_EVENTS[key]);
      }
    }

    // Иначе случайное реалистичное событие (65% шанс)
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
        this.log(`Решение по событию «${event.title}»: ${opt.text}`);
        modal.style.display = 'none';
        this.refreshAllViews();
      });
      opts.appendChild(btn);
    });

    modal.style.display = 'flex';
  }

  /* ====================================================
     ОТОБРАЖЕНИЕ ВКЛАДОК
     ==================================================== */
  updateHeaderAndResources() {
    document.getElementById('playerFlag').innerText = this.player.flag;
    document.getElementById('playerCountryName').innerText = this.player.name.toUpperCase();
    document.getElementById('playerRegimeDisplay').innerText = this.player.regime;
    document.getElementById('seasonDisplay').innerText = `${this.seasons[this.seasonIndex]} ${this.year}`;

    document.getElementById('resTreasury').innerText = `$${this.player.stats.treasury}B`;
    document.getElementById('resMilitary').innerText = `${this.player.stats.military}/100`;
    document.getElementById('resStability').innerText = `${this.player.stats.stability}%`;
    document.getElementById('resInfluence').innerText = `${this.player.stats.influence}/100`;
    document.getElementById('resEnergy').innerText = `${this.player.stats.energy}%`;
  }

  renderOverviewTab() {
    const totalGdp = this.player.cities.reduce((sum, c) => sum + c.gdp, 0);
    const activeWars = Object.values(this.diploState).filter(d => d.war).length;

    document.getElementById('leaderBriefing').innerHTML = `
      <p style="margin-bottom:8px;"><strong>${this.player.fullName}</strong> — ${this.player.regime}.</p>
      <p style="font-size:14px; color:var(--ink-secondary);">
        Совокупный ВВП городов: <strong>$${totalGdp}B</strong> • Ставка налога: <strong>${this.player.stats.taxRate}%</strong> • 
        Активных войн: <strong style="color:${activeWars > 0 ? 'var(--accent-crimson)' : 'inherit'};">${activeWars}</strong>
      </p>
    `;

    const storyList = document.getElementById('storyStatusList');
    const items = [];
    if (activeWars > 0) items.push({ title: "Военное положение на фронтах", desc: `Ведутся боевые действия (${activeWars}). Перейдите в «Дипломатия и Война» или «Армия и Фронт».`, badge: "Война", cls: "war" });
    if (this.player.stats.stability < 35) items.push({ title: "Угроза внутреннего кризиса", desc: "Стабильность критически низкая. Возможны забастовки и потеря лояльности городов.", badge: "Опасность", cls: "war" });
    if (this.scheduledEvents.length > 0) items.push({ title: "Развитие сюжетных последствий", desc: `Принятые ранее решения дадут отложенный эффект в ближайшие кварталы.`, badge: "Сюжет", cls: "gold" });
    if (items.length === 0) items.push({ title: "Относительное затишье", desc: "Используйте дипломатию, ультиматумы или развитие регионов для укрепления державы.", badge: "Штатно", cls: "ally" });

    storyList.innerHTML = items.map(i => `
      <div class="item-row">
        <div><h5>${i.title}</h5><p>${i.desc}</p></div>
        <span class="chip ${i.cls}">${i.badge}</span>
      </div>
    `).join('');

    const advList = document.getElementById('advisorsList');
    advList.innerHTML = this.player.advisors.map(a => `
      <div class="item-row">
        <div>
          <h5>${a.role}: ${a.name}</h5>
          <p>«${a.advice}»</p>
        </div>
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
        this.log(`Регионы: инвестиции в ${city.name} (+$5B ВВП, +6% лояльность).`);
        this.refreshAllViews();
      });

      document.getElementById(`btnGarrison_${city.id}`).addEventListener('click', () => {
        if (this.player.stats.treasury < 4) return this.toast("Недостаточно средств ($4B)");
        this.player.stats.treasury -= 4;
        city.loyalty = Math.min(100, city.loyalty + 10);
        this.player.stats.military = Math.min(100, this.player.stats.military + 2);
        this.log(`Регионы: усилен гарнизон в ${city.name} (+10% лояльность).`);
        this.refreshAllViews();
      });

      document.getElementById(`btnExploit_${city.id}`).addEventListener('click', () => {
        this.player.stats.treasury += 10;
        city.loyalty = Math.max(0, city.loyalty - 15);
        this.player.stats.stability = Math.max(0, this.player.stats.stability - 4);
        this.log(`Регионы: в ${city.name} введён экстренный побор (+$10B в казну, лояльность -15%).`);
        this.toast(`Изъятие средств в ${city.name}: +$10B, но недовольство растёт!`);
        this.refreshAllViews();
      });
    });
  }

  /* ====================================================
     ДИПЛОМАТИЯ, ДИАЛОГИ, ПОМОЩЬ, ВРАЖДА, УЛЬТИМАТУМЫ И ВОЙНА
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
      else if (ds.allied) statusBadge = `<span class="chip ally">Союзник (${rel}/100)</span>`;
      else if (ds.embargo) statusBadge = `<span class="chip war">Эмбарго (${rel}/100)</span>`;

      const card = document.createElement('div');
      card.className = `diplo-country-card ${this.activeDiploPartner === key ? 'active' : ''}`;
      card.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
          <strong>${c.flag} ${c.name}</strong>
          ${statusBadge}
        </div>
        <div style="font-size:12px; color:var(--ink-muted);">Армия: ${c.stats.military}/100 • Городов: ${c.cities.length}</div>
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
            <strong>⚔️ ИДЁТ ВОЙНА С ДЕРЖАВОЙ ${target.name.toUpperCase()}</strong>
            <span>Счёт фронта: <strong>${ds.warScore > 0 ? '+' : ''}${ds.warScore}</strong></span>
          </div>
          <div class="progress-bar-bg"><div class="progress-bar-fill" style="width:${pct}%;"></div></div>
          <div style="display:flex; gap:8px; flex-wrap:wrap; margin-top:8px;">
            <button class="btn-danger btn-sm" id="btnWarAttack">Наступление (-$10B)</button>
            <button class="btn-secondary btn-sm" id="btnWarDefend">Оборона (-$4B)</button>
            ${ds.warScore >= 50 ? `<button class="btn-primary-gold btn-sm" id="btnWarCapitulate">Принудить к капитуляции (город + $30B)</button>` : ''}
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
        <div style="font-size:12px; font-weight:700; color:var(--ink-muted); text-transform:uppercase; margin-bottom:6px;">Вести переговоры (реальный диалог)</div>
        <div style="display:flex; gap:8px; flex-wrap:wrap;">
          <button class="btn-secondary btn-sm" id="btnTalkTrade">Обсудить взаимовыгодную сделку</button>
          <button class="btn-secondary btn-sm" id="btnTalkSecurity">Потребовать гарантий безопасности</button>
          <button class="btn-secondary btn-sm" id="btnTalkThreat">Пригрозить военной силой</button>
        </div>
      </div>

      <div style="margin-bottom:14px;">
        <div style="font-size:12px; font-weight:700; color:var(--ink-muted); text-transform:uppercase; margin-bottom:6px;">Помощь и союзничество</div>
        <div class="diplo-actions-grid">
          <button class="btn-olive btn-sm" id="btnHelpMoney">Финансовая помощь (-$12B, +18 отн.)</button>
          <button class="btn-olive btn-sm" id="btnHelpArms">Поставки оружия (-$10B, +10 армия цели)</button>
          <button class="btn-primary-gold btn-sm" id="btnDiploTrade">${ds.tradePact ? '✓ Торговый пакт активен' : 'Торговый пакт (-$5B)'}</button>
          <button class="btn-primary-gold btn-sm" id="btnDiploAlliance">${ds.allied ? '✓ Военный союз' : 'Заключить союз (отн. ≥ 65)'}</button>
        </div>
      </div>

      <div>
        <div style="font-size:12px; font-weight:700; color:var(--accent-crimson); text-transform:uppercase; margin-bottom:6px;">Вражда, ультиматумы и война</div>
        <div class="diplo-actions-grid">
          <button class="btn-secondary btn-sm" id="btnHostileEmbargo">${ds.embargo ? 'Снять эмбарго' : 'Ввести эмбарго (-$2B/ход)'}</button>
          <button class="btn-secondary btn-sm" id="btnHostileSubvert">Поддержать оппозицию (-$8B)</button>
          <button class="btn-danger btn-sm" id="btnUltimatumMoney">Ультиматум: дань $25B</button>
          <button class="btn-danger btn-sm" id="btnUltimatumCity">Ультиматум: уступить город</button>
          ${!ds.war ? `<button class="btn-danger btn-sm" id="btnDeclareWar">⚔️ Объявить войну</button>` : ''}
        </div>
      </div>
    `;

    const chat = document.getElementById('dialogueChat');
    chat.scrollTop = chat.scrollHeight;

    // Обработчики диалога
    document.getElementById('btnTalkTrade').addEventListener('click', () => this.handleDialogue(targetId, 'trade'));
    document.getElementById('btnTalkSecurity').addEventListener('click', () => this.handleDialogue(targetId, 'security'));
    document.getElementById('btnTalkThreat').addEventListener('click', () => this.handleDialogue(targetId, 'threat'));

    // Помощь
    document.getElementById('btnHelpMoney').addEventListener('click', () => {
      if (ds.war) return this.toast("Нельзя помогать врагу во время войны!");
      if (this.player.stats.treasury < 12) return this.toast("Недостаточно средств ($12B)");
      this.player.stats.treasury -= 12;
      target.stats.treasury += 12;
      target.stats.stability = Math.min(100, target.stats.stability + 8);
      this.changeRelation(targetId, 18);
      this.pushDiploMsg(targetId, "us", "Мы направляем вашей стране безвозмездный финансовый транш ($12B).");
      this.pushDiploMsg(targetId, "them", "Благодарим за реальную поддержку. Это заметно укрепит нашу экономику и доверие к вам.");
      this.log(`Дипломатия: оказана финансовая помощь державе ${target.name} ($12B).`);
      this.refreshAllViews();
    });

    document.getElementById('btnHelpArms').addEventListener('click', () => {
      if (ds.war) return this.toast("Нельзя поставлять оружие противнику!");
      if (this.player.stats.treasury < 10) return this.toast("Недостаточно средств ($10B)");
      this.player.stats.treasury -= 10;
      target.stats.military = Math.min(100, target.stats.military + 10);
      this.changeRelation(targetId, 15);
      this.pushDiploMsg(targetId, "us", "Мы передаём вам партию современных вооружений и боеприпасов.");
      this.pushDiploMsg(targetId, "them", "Ваши военные поставки прибыли вовремя. Боеспособность нашей армии выросла (+10).");
      this.log(`Дипломатия: поставлено вооружение для ${target.name} (+10 армии цели).`);
      this.refreshAllViews();
    });

    document.getElementById('btnDiploTrade').addEventListener('click', () => {
      if (ds.war || ds.tradePact) return;
      if (this.player.stats.treasury < 5) return this.toast("Недостаточно средств ($5B)");
      this.player.stats.treasury -= 5;
      ds.tradePact = true;
      ds.embargo = false;
      this.changeRelation(targetId, 12);
      this.pushDiploMsg(targetId, "system", "Подписан Торговый пакт (+$4B дохода каждый квартал).");
      this.log(`Дипломатия: заключён торговый пакт с ${target.name}.`);
      this.refreshAllViews();
    });

    document.getElementById('btnDiploAlliance').addEventListener('click', () => {
      if (ds.war || ds.allied) return;
      if (rel < 65) {
        this.pushDiploMsg(targetId, "them", `Для военного союза нужно доверие минимум 65 (сейчас ${rel}).`);
        return this.openDiploDialogue(targetId);
      }
      ds.allied = true;
      this.changeRelation(targetId, 15);
      this.player.stats.influence = Math.min(100, this.player.stats.influence + 8);
      this.pushDiploMsg(targetId, "system", "Заключён Оборонительный союз!");
      this.log(`Дипломатия: заключён военный союз с ${target.name}.`);
      this.refreshAllViews();
    });

    // Вражда
    document.getElementById('btnHostileEmbargo').addEventListener('click', () => {
      ds.embargo = !ds.embargo;
      if (ds.embargo) {
        ds.tradePact = false;
        this.changeRelation(targetId, -20);
        this.pushDiploMsg(targetId, "system", `Введено торговое эмбарго против ${target.name}. Их казна теряет $6B каждый ход.`);
        this.log(`Вражда: введено торговое эмбарго против ${target.name}.`);
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
        this.pushDiploMsg(targetId, "them", "Наши спецслужбы раскрыли ваше финансирование беспорядков! Отношения разорваны.");
        this.log(`Диверсия: операция в ${target.name} раскрыта! Отношения -25, стабильность цели -12%.`);
      } else {
        this.pushDiploMsg(targetId, "system", `Тайная операция удалась: в ${target.name} начались протесты (-12% стабильности), следы скрыты.`);
        this.log(`Диверсия: оппозиция в ${target.name} ослабила правительство (-12% стабильности).`);
      }
      this.refreshAllViews();
    });

    // Ультиматумы
    document.getElementById('btnUltimatumMoney').addEventListener('click', () => this.sendUltimatum(targetId, 'tribute'));
    document.getElementById('btnUltimatumCity').addEventListener('click', () => this.sendUltimatum(targetId, 'city'));

    const btnWar = document.getElementById('btnDeclareWar');
    if (btnWar) {
      btnWar.addEventListener('click', () => {
        this.declareWar(targetId, "Прямое объявление войны");
        this.refreshAllViews();
      });
    }

    // Военные действия прямо из дипломатии
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
      this.pushDiploMsg(targetId, "us", "Предлагаем расширить взаимную торговлю и снять барьеры.");
      if (rel >= 40) {
        this.changeRelation(targetId, 6);
        this.player.stats.treasury += 4;
        this.pushDiploMsg(targetId, "them", "Согласны. Взаимный оборот принёс вашей казне +$4B и укрепил доверие.");
      } else {
        this.pushDiploMsg(targetId, "them", "При текущем уровне враждебности мы не готовы к коммерческим уступкам.");
      }
    } else if (topic === 'security') {
      this.pushDiploMsg(targetId, "us", "Мы требуем чётких гарантий безопасности на наших границах.");
      if (ourPower >= theirPower) {
        this.changeRelation(targetId, -4);
        this.player.stats.influence = Math.min(100, this.player.stats.influence + 4);
        this.pushDiploMsg(targetId, "them", "Мы слышим ваши доводы и отводим часть подразделений от границы (+4 влияние).");
      } else {
        this.changeRelation(targetId, -8);
        this.pushDiploMsg(targetId, "them", "Вы не в том положении, чтобы диктовать нам условия размещения войск.");
      }
    } else if (topic === 'threat') {
      this.pushDiploMsg(targetId, "us", "Если вы не измените политику, мы применим силу!");
      this.changeRelation(targetId, -18);
      if (ourPower > theirPower + 18) {
        target.stats.treasury -= 5;
        this.player.stats.treasury += 5;
        this.pushDiploMsg(targetId, "them", "Мы вынуждены уступить под давлением вашей армии и выплатить $5B компенсации.");
      } else {
        this.pushDiploMsg(targetId, "them", "Ваши угрозы лишь ускорят нашу мобилизацию. Остерегайтесь войны!");
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
    if (ds.war) return this.toast("Вы уже находитесь в состоянии войны!");

    const ratio = this.player.stats.military - target.stats.military;
    this.changeRelation(targetId, -35);

    if (type === 'tribute') {
      this.pushDiploMsg(targetId, "us", "УЛЬТИМАТУМ: Немедленно выплатите $25B контрибуции, иначе мы начнём войну!");
      if (ratio >= 12) {
        this.player.stats.treasury += 25;
        target.stats.treasury -= 25;
        this.player.stats.influence = Math.min(100, this.player.stats.influence + 8);
        this.pushDiploMsg(targetId, "them", "Учитывая ваше военное превосходство, мы принимаем ультиматум и переводим $25B.");
        this.log(`УЛЬТИМАТУМ: ${target.name} подчинилась и выплатила $25B!`);
        this.toast(`${target.name} приняла ультиматум: +$25B!`);
      } else {
        this.pushDiploMsg(targetId, "them", "Мы не подчинимся шантажу! Готовьтесь к войне!");
        this.declareWar(targetId, `${target.name} отвергла ультиматум о дани`);
      }
    } else if (type === 'city') {
      if (target.cities.length <= 1) return this.toast("У державы остался только столичный город.");
      const targetCity = target.cities[target.cities.length - 1];
      this.pushDiploMsg(targetId, "us", `УЛЬТИМАТУМ: Передайте нам город ${targetCity.name} под угрозой немедленного вторжения!`);
      if (ratio >= 22) {
        target.cities.pop();
        targetCity.loyalty = 40;
        this.player.cities.push(targetCity);
        this.player.stats.influence = Math.min(100, this.player.stats.influence + 12);
        this.pushDiploMsg(targetId, "them", `Это чёрный день для нашей дипломатии. Город ${targetCity.name} переходит под ваш контроль.`);
        this.log(`УЛЬТИМАТУМ: ${target.name} уступила город ${targetCity.name}!`);
        this.toast(`Территориальный ультиматум принят: город ${targetCity.name} ваш!`);
      } else {
        this.pushDiploMsg(targetId, "them", `Мы никогда не отдадим ${targetCity.name}! Наши армии выступают!`);
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
    this.pushDiploMsg(targetId, "system", `⚔️ ОБЪЯВЛЕНА ВОЙНА! Причина: ${reason}.`);
    this.log(`ВОЙНА: Начались боевые действия с державой ${target.name} (${reason}).`);
    this.toast(`Война с ${target.name} началась!`);
  }

  warAction(targetId, action) {
    const ds = this.diploState[targetId];
    const target = this.otherCountries[targetId];
    if (!ds || !ds.war) return;

    if (action === 'attack') {
      if (this.player.stats.treasury < 10) return this.toast("Недостаточно средств для наступления ($10B)");
      this.player.stats.treasury -= 10;
      const advantage = (this.player.stats.military - target.stats.military) * 0.6 + (Math.random() * 20 - 5);
      const gain = Math.round(12 + advantage);
      ds.warScore = Math.max(-100, Math.min(100, ds.warScore + gain));
      this.player.stats.military = Math.max(10, this.player.stats.military - 4);
      target.stats.military = Math.max(10, target.stats.military - 6);
      this.log(`Наступление против ${target.name}: прогресс фронта ${gain >= 0 ? '+' : ''}${gain} (итог: ${ds.warScore}).`);
      this.toast(`Наступление: счёт фронта ${ds.warScore}`);
    } else if (action === 'defend') {
      if (this.player.stats.treasury < 4) return this.toast("Недостаточно средств ($4B)");
      this.player.stats.treasury -= 4;
      ds.warScore = Math.min(100, ds.warScore + 8);
      this.player.stats.stability = Math.min(100, this.player.stats.stability + 3);
      this.log(`Оборона против ${target.name}: рубежи укреплены (счёт: ${ds.warScore}).`);
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
        this.player.cities.push(city);
        annexed = ` и присоединён город ${city.name}`;
      }
      this.pushDiploMsg(targetId, "system", `ПОБЕДА! Подписана капитуляция ${target.name}: получено $30B контрибуции${annexed}.`);
      this.log(`ПОБЕДА В ВОЙНЕ: ${target.name} капитулировала! Получено $30B${annexed}.`);
      this.toast(`Победа над ${target.name}!`);
    } else if (action === 'peace') {
      ds.war = false;
      if (ds.warScore >= 0) {
        this.player.stats.treasury += 8;
        this.pushDiploMsg(targetId, "system", "Подписан мирный договор (+$8B компенсации).");
        this.log(`Мир с ${target.name} заключён на почётных условиях.`);
      } else {
        this.player.stats.treasury -= 18;
        this.pushDiploMsg(targetId, "system", "Подписан тяжёлый мир: выплачены репарации $18B.");
        this.log(`Мир с ${target.name} заключён с выплатой репараций ($18B).`);
      }
      ds.warScore = 0;
    }

    this.refreshAllViews();
  }

  /* ====================================================
     ЭКОНОМИКА, УКАЗЫ И АРМИЯ
     ==================================================== */
  renderEconomyTab() {
    document.getElementById('taxSlider').value = this.player.stats.taxRate;
    document.getElementById('taxRateVal').innerText = `${this.player.stats.taxRate}%`;

    const projList = document.getElementById('ecoProjectsList');
    projList.innerHTML = '';
    this.player.projects.forEach(p => {
      const row = document.createElement('div');
      row.className = 'item-row';
      row.innerHTML = `
        <div><h5>${p.name}</h5><p>${p.effect}</p></div>
        <button class="${p.active ? 'btn-olive' : 'btn-primary-gold'} btn-sm" id="proj_${p.id}">
          ${p.active ? '✓ Построен' : `$${p.cost}B`}
        </button>
      `;
      projList.appendChild(row);
      document.getElementById(`proj_${p.id}`).addEventListener('click', () => {
        if (p.active) return;
        if (this.player.stats.treasury < p.cost) return this.toast(`Нужно $${p.cost}B`);
        this.player.stats.treasury -= p.cost;
        p.active = true;
        this.player.stats.energy = Math.min(100, this.player.stats.energy + 10);
        this.player.stats.influence = Math.min(100, this.player.stats.influence + 5);
        if (this.player.cities[0]) this.player.cities[0].gdp += 8;
        this.log(`Экономика: реализован нацпроект «${p.name}».`);
        this.refreshAllViews();
      });
    });

    const dList = document.getElementById('decreesList');
    dList.innerHTML = '';
    this.decrees.forEach(d => {
      const row = document.createElement('div');
      row.className = 'item-row';
      row.innerHTML = `
        <div><h5>${d.name}</h5><p>${d.desc}</p></div>
        <button class="${d.passed ? 'btn-olive' : 'btn-secondary'} btn-sm" id="decree_${d.id}">
          ${d.passed ? '✓ Действует' : `Принять ($${d.cost}B)`}
        </button>
      `;
      dList.appendChild(row);
      document.getElementById(`decree_${d.id}`).addEventListener('click', () => {
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
          this.player.stats.corruption = Math.max(0, (this.player.stats.corruption || 12) - 10);
        } else if (d.id === 'martial_law') {
          this.player.stats.military = Math.min(100, this.player.stats.military + 10);
          this.player.stats.influence = Math.max(0, this.player.stats.influence - 10);
        }
        this.log(`Указ: принят закон «${d.name}».`);
        this.refreshAllViews();
      });
    });

    const regSel = document.getElementById('regimeSelector');
    regSel.innerHTML = '';
    this.regimeTypes.forEach(r => {
      const active = r.id === this.player.regimeStyle;
      const row = document.createElement('div');
      row.className = 'item-row';
      row.innerHTML = `
        <div><h5>${r.name}</h5><p>${r.desc}</p></div>
        <button class="${active ? 'btn-olive' : 'btn-secondary'} btn-sm">${active ? '✓ Активен' : 'Перейти (-5% стаб.)'}</button>
      `;
      row.querySelector('button').addEventListener('click', () => {
        if (active) return;
        this.player.regimeStyle = r.id;
        this.player.regime = r.name;
        this.player.stats.stability = Math.max(0, this.player.stats.stability - 5);
        this.log(`Политика: смена курса на «${r.name}» (-5% стабильности).`);
        this.refreshAllViews();
      });
      regSel.appendChild(row);
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
      warsBox.innerHTML = `<p style="color:var(--ink-muted); font-size:14px;">Активных войн нет. Объявить войну или выдвинуть ультиматум можно во вкладке «Дипломатия и Война».</p>`;
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
        <div style="font-size:12px; margin-bottom:6px;">Сила врага: ${enemy.stats.military}/100 • Городов: ${enemy.cities.length}</div>
        <div class="progress-bar-bg"><div class="progress-bar-fill" style="width:${pct}%;"></div></div>
        <div style="display:flex; gap:8px; flex-wrap:wrap; margin-top:8px;">
          <button class="btn-danger btn-sm" id="milAtk_${id}">Наступление (-$10B)</button>
          <button class="btn-secondary btn-sm" id="milDef_${id}">Оборона (-$4B)</button>
          ${ds.warScore >= 50 ? `<button class="btn-primary-gold btn-sm" id="milCap_${id}">Капитуляция врага</button>` : ''}
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
    localStorage.setItem('statecraft_save_v2', JSON.stringify({
      year: this.year,
      seasonIndex: this.seasonIndex,
      turn: this.turn,
      player: this.player,
      otherCountries: this.otherCountries,
      diploState: this.diploState,
      logs: this.logs,
      decrees: this.decrees,
      storyFlags: this.storyFlags,
      scheduledEvents: this.scheduledEvents,
      triggeredArcs: Array.from(this.triggeredArcs)
    }));
    this.toast("Игра сохранена.");
  }

  loadGame() {
    const raw = localStorage.getItem('statecraft_save_v2');
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

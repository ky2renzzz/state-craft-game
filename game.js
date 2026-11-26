/**
 * StateCraft Core Game Engine — Step-by-Step Wizard & City Governance
 */
class GameState {
  constructor() {
    this.year = 2026;
    this.seasonIndex = 0;
    this.seasons = ["ВЕСНА", "ЛЕТО", "ОСЕНЬ", "ЗИМА"];
    
    // Wizard State
    this.selectedCountryId = null;
    this.selectedIdeology = null;
    this.selectedTargetAlly = null;

    this.player = null;
    this.otherCountries = {};
    this.activeDiploPartner = null;
    this.logs = [];

    this.regimeTypes = [
      { id: "liberal", name: "Либеральная демократия", desc: "+15% к иностранным инвестициям, -5% к скорости военных решений" },
      { id: "social_state", name: "Социальное правовое государство", desc: "+20% к счастью граждан, повышенные расходы на субсидии" },
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
    this.renderWizardStep1();
    this.bindWizardEvents();
    this.bindGlobalEvents();
    this.initDotMatrixFooter();
  }

  /* ----------------------------------------------------
     WIZARD STEP 1: SELECT COUNTRY
     ---------------------------------------------------- */
  renderWizardStep1() {
    const grid = document.getElementById('countriesGrid');
    grid.innerHTML = '';

    for (let key in COUNTRIES_DATA) {
      const c = COUNTRIES_DATA[key];
      const card = document.createElement('div');
      card.className = `hw-card ${this.selectedCountryId === key ? 'selected' : ''}`;
      card.innerHTML = `
        <div>
          <div class="hw-card-top">
            <span class="hw-flag">${c.flag}</span>
            <span class="instrument-chip">${c.id.toUpperCase()}</span>
          </div>
          <div class="hw-country-name">${c.name}</div>
          <div class="hw-regime">${c.ideologyName}</div>
          <p class="hw-summary">${c.summary ? c.summary.substring(0, 110) + '...' : ''}</p>
        </div>
        <div class="hw-specs">
          <div>КАЗНА: $${c.stats.treasury}B</div>
          <div>АРМИЯ: ${c.stats.military}/100</div>
          <div>ОДОБРЕНИЕ: ${c.stats.stability}%</div>
          <div>ГОРОДОВ: ${c.cities.length}</div>
        </div>
      `;

      card.addEventListener('click', () => {
        this.selectedCountryId = key;
        document.querySelectorAll('.hw-card').forEach(el => el.classList.remove('selected'));
        card.classList.add('selected');
        this.renderCountryPreview(c);
      });

      grid.appendChild(card);
    }
  }

  renderCountryPreview(country) {
    const preview = document.getElementById('countryPreview');
    preview.innerHTML = `
      <div class="corner-screw tl"></div>
      <div class="corner-screw tr"></div>
      <div class="corner-screw bl"></div>
      <div class="corner-screw br"></div>

      <div class="dossier-header">
        <div>
          <h2>${country.flag} ${country.fullName}</h2>
          <div style="font-family:var(--font-mono); font-size:12px; color:var(--signal-yellow); margin-bottom:12px;">«${country.motto}»</div>
          <div class="chip-group">
            ${country.traits.map(t => `<span class="instrument-chip">${t}</span>`).join('')}
          </div>
        </div>
        <div style="text-align: right; font-family:var(--font-mono); font-size:12px; color:var(--listing-gray);">
          СТОЛИЦА: <strong style="color:#fff;">${country.capital}</strong><br>
          СТАТУС: <strong style="color:var(--signal-yellow);">${country.ideologyName}</strong>
        </div>
      </div>

      <div class="dossier-body">
        <div class="dossier-text">
          <div class="panel-title">ГЕОПОЛИТИЧЕСКИЙ АНАЛИЗ</div>
          <p>${country.history || 'Крупная держава со своей геополитической зоной интересов.'}</p>
          <p style="font-size:13px; color:var(--listing-gray);">Ключевые субъекты управления: ${country.cities.map(ct => ct.name).join(', ')}.</p>
        </div>

        <div class="dossier-specs-box">
          <div>
            <div class="panel-title">СПЕЦИФИКАЦИЯ ДЕРЖАВЫ</div>
            <div class="spec-line"><span>ГОСРЕЗЕРВЫ:</span> <strong>$${country.stats.treasury} млрд</strong></div>
            <div class="spec-line"><span>ОБОРОННЫЙ КОНТУР:</span> <strong>${country.stats.military} / 100</strong></div>
            <div class="spec-line"><span>ОДОБРЕНИЕ ГРАЖДАН:</span> <strong>${country.stats.stability}%</strong></div>
            <div class="spec-line"><span>ГЛОБАЛЬНЫЙ ВЕС:</span> <strong>${country.stats.influence} / 100</strong></div>
            <div class="spec-line"><span>ЭНЕРГОАВТОНОМИЯ:</span> <strong>${country.stats.energy}%</strong></div>
          </div>

          <button class="btn-apply-reveal" id="btnConfirmCountry">ВЫБРАТЬ И ПЕРЕЙТИ К ИДЕОЛОГИИ ➔</button>
        </div>
      </div>
    `;

    document.getElementById('btnConfirmCountry').addEventListener('click', () => {
      this.goToWizardStep2();
    });
  }

  /* ----------------------------------------------------
     WIZARD STEP 2: IDEOLOGY SELECTION
     ---------------------------------------------------- */
  goToWizardStep2() {
    if (!this.selectedCountryId) return;
    const country = COUNTRIES_DATA[this.selectedCountryId];
    this.selectedIdeology = country.defaultIdeology || "social_state";

    document.getElementById('wzChosenCountry').innerText = country.name.toUpperCase();
    document.getElementById('wizardStep1').classList.remove('active');
    document.getElementById('wizardStep2').classList.add('active');

    this.renderWizardStep2Options(country);
  }

  renderWizardStep2Options(country) {
    const container = document.getElementById('wizardIdeologyOptions');
    container.innerHTML = '';

    this.regimeTypes.forEach(r => {
      const isDefault = (r.id === country.defaultIdeology);
      const isSelected = (r.id === this.selectedIdeology);

      const card = document.createElement('div');
      card.className = `ideology-card ${isSelected ? 'selected' : ''}`;
      card.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
          <h4 style="font-size:16px; font-weight:700; color:var(--white-sheet);">${r.name}</h4>
          ${isDefault ? '<span class="instrument-chip">ИСТОРИЧЕСКАЯ</span>' : ''}
        </div>
        <p style="font-size:13px; color:var(--release-gray); line-height:1.5;">${r.desc}</p>
      `;

      card.addEventListener('click', () => {
        this.selectedIdeology = r.id;
        document.querySelectorAll('.ideology-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
      });

      container.appendChild(card);
    });
  }

  /* ----------------------------------------------------
     WIZARD STEP 3: SELECT TARGET ALLY
     ---------------------------------------------------- */
  goToWizardStep3() {
    const country = COUNTRIES_DATA[this.selectedCountryId];
    const regime = this.regimeTypes.find(r => r.id === this.selectedIdeology);

    document.getElementById('wzChosenCountry2').innerText = country.name.toUpperCase();
    document.getElementById('wzChosenIdeology').innerText = regime ? regime.name.toUpperCase() : '';

    document.getElementById('wizardStep2').classList.remove('active');
    document.getElementById('wizardStep3').classList.add('active');

    this.renderWizardStep3Options(country);
  }

  renderWizardStep3Options(country) {
    const container = document.getElementById('wizardAlliesOptions');
    container.innerHTML = '';

    // Default neutral option
    const neutralCard = document.createElement('div');
    neutralCard.className = `ally-card ${this.selectedTargetAlly === 'neutral' || !this.selectedTargetAlly ? 'selected' : ''}`;
    neutralCard.innerHTML = `
      <div style="font-size:2rem; margin-bottom:6px;">⚖️</div>
      <h4 style="font-size:16px; font-weight:700; color:var(--white-sheet); margin-bottom:6px;">Оставить исторический нейтралитет</h4>
      <p style="font-size:13px; color:var(--release-gray);">Сохранить стартовый внешнеполитический баланс без резких односторонних перекосов.</p>
    `;
    neutralCard.addEventListener('click', () => {
      this.selectedTargetAlly = 'neutral';
      document.querySelectorAll('.ally-card').forEach(c => c.classList.remove('selected'));
      neutralCard.classList.add('selected');
    });
    container.appendChild(neutralCard);

    // Other countries
    for (let k in COUNTRIES_DATA) {
      if (k === this.selectedCountryId) continue;
      const other = COUNTRIES_DATA[k];
      const card = document.createElement('div');
      card.className = `ally-card ${this.selectedTargetAlly === k ? 'selected' : ''}`;
      card.innerHTML = `
        <div style="font-size:2rem; margin-bottom:6px;">${other.flag}</div>
        <h4 style="font-size:16px; font-weight:700; color:var(--white-sheet); margin-bottom:6px;">${other.name}</h4>
        <p style="font-size:13px; color:var(--release-gray); line-height:1.4;">
          Приоритетный вектор сближения: +25 к стартовым отношениям, совместные экономические преференции.
        </p>
      `;
      card.addEventListener('click', () => {
        this.selectedTargetAlly = k;
        document.querySelectorAll('.ally-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
      });
      container.appendChild(card);
    }
  }

  /* ----------------------------------------------------
     START GAMEPLAY
     ---------------------------------------------------- */
  startGamePlay() {
    this.player = JSON.parse(JSON.stringify(COUNTRIES_DATA[this.selectedCountryId]));
    
    // Apply ideology
    const regimeObj = this.regimeTypes.find(r => r.id === this.selectedIdeology);
    if (regimeObj) {
      this.player.regime = regimeObj.name;
      this.player.regimeStyle = regimeObj.id;
    }

    // Apply allies
    this.otherCountries = {};
    for (let k in COUNTRIES_DATA) {
      if (k !== this.selectedCountryId) {
        this.otherCountries[k] = JSON.parse(JSON.stringify(COUNTRIES_DATA[k]));
      }
    }

    if (this.selectedTargetAlly && this.selectedTargetAlly !== 'neutral') {
      if (this.player.relations[this.selectedTargetAlly] !== undefined) {
        this.player.relations[this.selectedTargetAlly] = Math.min(100, this.player.relations[this.selectedTargetAlly] + 25);
      }
    }

    // Hide wizard, show game
    document.getElementById('wizardStep3').classList.remove('active');
    document.getElementById('screenGame').classList.add('active');
    document.getElementById('headerMeta').style.display = 'flex';
    document.getElementById('instrumentBar').style.display = 'grid';

    this.log(`ТЕРМИНАЛ: Вступление в должность главы ${this.player.name}. Идеология: ${this.player.regime}.`);
    this.toast(`ДОБРО ПОЖАЛОВАТЬ, ВЛАСТИТЕЛЬ ДЕРЖАВЫ ${this.player.name.toUpperCase()}!`);

    this.updateHeaderAndResources();
    this.renderCitiesTab();
    this.renderOverviewTab();
    this.renderDiplomacyTab();
    this.renderEconomyTab();
    this.renderMilitaryTab();
    this.renderPoliciesTab();
  }

  bindWizardEvents() {
    document.getElementById('btnWzBackTo1').addEventListener('click', () => {
      document.getElementById('wizardStep2').classList.remove('active');
      document.getElementById('wizardStep1').classList.add('active');
    });

    document.getElementById('btnWzProceedTo3').addEventListener('click', () => {
      this.goToWizardStep3();
    });

    document.getElementById('btnWzBackTo2').addEventListener('click', () => {
      document.getElementById('wizardStep3').classList.remove('active');
      document.getElementById('wizardStep2').classList.add('active');
    });

    document.getElementById('btnWzStartGame').addEventListener('click', () => {
      this.startGamePlay();
    });
  }

  bindGlobalEvents() {
    // Navigation Tabs
    document.querySelectorAll('.opal-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.opal-tab-btn').forEach(b => b.classList.remove('active'));
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
        this.toast("МОБИЛИЗАЦИЯ: Резервы развернуты. Обороноспособность +6.");
        this.updateHeaderAndResources();
        this.renderMilitaryTab();
      } else {
        this.toast("ОТКАЗ: Недостаточно средств в казне");
      }
    });

    document.getElementById('btnDrills').addEventListener('click', () => {
      if (this.player.stats.treasury >= 3) {
        this.player.stats.treasury -= 3;
        this.player.stats.military = Math.min(100, this.player.stats.military + 3);
        this.player.stats.influence = Math.min(100, this.player.stats.influence + 4);
        this.toast("МАНЕВРЫ: Учения на границах завершены. Влияние +4.");
        this.updateHeaderAndResources();
        this.renderMilitaryTab();
      } else {
        this.toast("ОТКАЗ: Недостаточно средств в казне");
      }
    });

    document.getElementById('btnModernize').addEventListener('click', () => {
      if (this.player.stats.treasury >= 8) {
        this.player.stats.treasury -= 8;
        this.player.stats.military = Math.min(100, this.player.stats.military + 9);
        this.toast("КОНТРАКТЫ: Высокоточное вооружение поставлено на боевое дежурство.");
        this.updateHeaderAndResources();
        this.renderMilitaryTab();
      } else {
        this.toast("ОТКАЗ: Недостаточно средств в казне");
      }
    });
  }

  updateHeaderAndResources() {
    document.getElementById('playerFlag').innerText = this.player.flag;
    document.getElementById('playerCountryName').innerText = this.player.name.toUpperCase();
    document.getElementById('playerRegimeDisplay').innerText = this.player.regime.toUpperCase();
    document.getElementById('seasonDisplay').innerText = `${this.seasons[this.seasonIndex]} // ${this.year}`;

    document.getElementById('resTreasury').innerText = `$${Math.round(this.player.stats.treasury)}B`;
    document.getElementById('resMilitary').innerText = `${Math.min(100, Math.round(this.player.stats.military))}/100`;
    document.getElementById('resStability').innerText = `${Math.min(100, Math.round(this.player.stats.stability))}%`;
    document.getElementById('resInfluence').innerText = `${Math.min(100, Math.round(this.player.stats.influence))}/100`;
    document.getElementById('resEnergy').innerText = `${Math.min(100, Math.round(this.player.stats.energy))}%`;
  }

  advanceTurn() {
    this.seasonIndex++;
    if (this.seasonIndex >= 4) {
      this.seasonIndex = 0;
      this.year++;
    }

    // Regional economic yield
    let cityBonus = 0;
    if (this.player.cities) {
      this.player.cities.forEach(c => {
        cityBonus += Math.round(c.gdp * 0.12);
      });
    }

    const taxIncome = Math.round((this.player.stats.taxRate * 0.45) + (this.player.stats.incomeBonus || 0) + cityBonus);
    const milExpenses = Math.round(this.player.stats.military * 0.15);
    const netIncome = taxIncome - milExpenses;
    this.player.stats.treasury += netIncome;

    if (this.player.stats.taxRate > 35) {
      this.player.stats.stability = Math.max(0, this.player.stats.stability - 2);
    }

    this.log(`КВАРТАЛ: ${this.seasons[this.seasonIndex]} ${this.year}. Налоги и города: +$${taxIncome}B, Военные расходы: -$${milExpenses}B (Итог: ${netIncome >= 0 ? '+' : ''}$${netIncome}B).`);
    this.updateHeaderAndResources();

    // Trigger Dilemma Event
    const event = HISTORICAL_EVENTS[Math.floor(Math.random() * HISTORICAL_EVENTS.length)];
    this.showEventModal(event);

    for (let c in this.player.relations) {
      const change = (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 3);
      this.player.relations[c] = Math.max(0, Math.min(100, this.player.relations[c] + change));
    }

    this.renderCitiesTab();
    this.renderOverviewTab();
    this.renderDiplomacyTab();
    this.renderEconomyTab();
  }

  showEventModal(evt) {
    const modal = document.getElementById('eventModal');
    document.getElementById('modalCategoryTag').innerText = `${evt.category.toUpperCase()} // ${this.seasons[this.seasonIndex]} ${this.year}`;
    document.getElementById('modalTitle').innerText = evt.title;
    document.getElementById('modalText').innerText = evt.text;

    const optContainer = document.getElementById('modalOptions');
    optContainer.innerHTML = '';

    evt.options.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'modal-choice-btn';
      btn.innerHTML = `
        <strong>[>] ${opt.text}</strong>
        <span>ПОСЛЕДСТВИЯ: ${opt.impact}</span>
      `;
      btn.addEventListener('click', () => {
        opt.action(this);
        modal.style.display = 'none';
        this.log(`РЕШЕНИЕ: ${evt.title} -> ${opt.text}`);
        this.toast("ГОСУДАРСТВЕННОЕ РЕШЕНИЕ ПРИВЕДЕНО В ИСПОЛНЕНИЕ");
        this.updateHeaderAndResources();
        this.renderCitiesTab();
        this.renderOverviewTab();
      });
      optContainer.appendChild(btn);
    });

    modal.style.display = 'flex';
  }

  /* ----------------------------------------------------
     TAB: CITIES & REGIONS
     ---------------------------------------------------- */
  renderCitiesTab() {
    const grid = document.getElementById('citiesListGrid');
    if (!grid) return;
    grid.innerHTML = '';

    this.player.cities.forEach(city => {
      const card = document.createElement('div');
      card.className = 'city-card';
      card.innerHTML = `
        <div>
          <div class="city-header">
            <div>
              <div class="city-name">${city.name}</div>
              <div class="city-pop">НАСЕЛЕНИЕ: ${city.population}</div>
            </div>
            <span class="instrument-chip">${city.focus}</span>
          </div>
          <div class="city-role">${city.role}</div>

          <div class="city-metrics-row">
            <div>ЛОЯЛЬНОСТЬ: <strong style="color:${city.loyalty >= 70 ? 'var(--accent-green)' : 'var(--signal-yellow)};">${city.loyalty}%</strong></div>
            <div>ВКЛАД В ВВП: <strong>$${city.gdp}B</strong></div>
          </div>
        </div>

        <div class="city-actions-cluster">
          <button class="btn-city-act" id="btnInvestCity_${city.id}">Инвестиции ($4B)</button>
          <button class="btn-city-act" id="btnGarrisonCity_${city.id}">Гарнизон ($2B)</button>
        </div>
      `;

      grid.appendChild(card);

      document.getElementById(`btnInvestCity_${city.id}`).addEventListener('click', () => {
        if (this.player.stats.treasury >= 4) {
          this.player.stats.treasury -= 4;
          city.gdp += 4;
          city.loyalty = Math.min(100, city.loyalty + 6);
          this.toast(`ИНФРАСТРУКТУРА: Инвестиции в ${city.name} повысили ВВП и лояльность!`);
          this.log(`Реализована программа городского развития для города ${city.name}.`);
          this.updateHeaderAndResources();
          this.renderCitiesTab();
        } else {
          this.toast("ОТКАЗ: Недостаточно средств в казне");
        }
      });

      document.getElementById(`btnGarrisonCity_${city.id}`).addEventListener('click', () => {
        if (this.player.stats.treasury >= 2) {
          this.player.stats.treasury -= 2;
          city.loyalty = Math.min(100, city.loyalty + 4);
          this.player.stats.military = Math.min(100, this.player.stats.military + 2);
          this.toast(`БЕЗОПАСНОСТЬ: Гарнизон в ${city.name} усилен.`);
          this.updateHeaderAndResources();
          this.renderCitiesTab();
        } else {
          this.toast("ОТКАЗ: Недостаточно средств в казне");
        }
      });
    });
  }

  /* ----------------------------------------------------
     TAB: OVERVIEW & COUNCIL
     ---------------------------------------------------- */
  renderOverviewTab() {
    const briefing = document.getElementById('leaderBriefing');
    briefing.innerHTML = `
      <p style="margin-bottom:8px;"><strong>ВАШЕ ПРЕВОСХОДИТЕЛЬСТВО,</strong> системы управления функционируют штатно.</p>
      <p>Одобрение граждан: ${this.player.stats.stability}%. Коррупционный фон: ${this.player.stats.corruption || 12}%. Базовая ставка налога: ${this.player.stats.taxRate}%.</p>
    `;

    const focuses = document.getElementById('focusList');
    focuses.innerHTML = `
      <div class="tech-item">
        <div class="tech-info">
          <h5>ЭНЕРГЕТИЧЕСКАЯ НЕЗАВИСИМОСТЬ</h5>
          <p>Интеграция сетей и долгосрочные сырьевые коридоры</p>
        </div>
        <span class="instrument-chip">${this.player.stats.energy}% АВТОНОМИЯ</span>
      </div>
      <div class="tech-item">
        <div class="tech-info">
          <h5>МОДЕРНИЗАЦИЯ ОБОРОННОГО КОНТУРА</h5>
          <p>Поставка высокоточных комплексов и интеграция ПВО/РЭБ</p>
        </div>
        <span class="instrument-chip">${this.player.stats.military}/100 МОЩЬ</span>
      </div>
    `;

    const advList = document.getElementById('advisorsList');
    advList.innerHTML = '';
    this.player.advisors.forEach(a => {
      const card = document.createElement('div');
      card.className = 'tech-item';
      card.innerHTML = `
        <div class="tech-info">
          <h5 style="color:var(--title-mist);">${a.role.toUpperCase()} [${a.name}]</h5>
          <p style="font-family:var(--font-mono); font-size:12px; color:var(--release-gray);">«${a.advice}»</p>
        </div>
      `;
      advList.appendChild(card);
    });
  }

  /* ----------------------------------------------------
     TAB: DIPLOMACY & DIALOGUES
     ---------------------------------------------------- */
  renderDiplomacyTab() {
    const list = document.getElementById('diploCards');
    list.innerHTML = '';

    for (let key in this.otherCountries) {
      const c = this.otherCountries[key];
      const rel = this.player.relations[key] !== undefined ? this.player.relations[key] : 50;

      let relColor = "var(--title-mist)";
      if (rel >= 70) relColor = "var(--accent-green)";
      else if (rel <= 30) relColor = "var(--accent-red)";

      const card = document.createElement('div');
      card.className = `diplo-target-card ${this.activeDiploPartner === key ? 'active' : ''}`;
      card.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
          <strong style="font-size:14px; text-transform:uppercase;">${c.flag} ${c.name}</strong>
          <span style="font-family:var(--font-mono); font-size:11px; color:${relColor}; font-weight:700;">${rel}/100</span>
        </div>
        <div style="font-family:var(--font-mono); font-size:11px; color:var(--listing-gray);">${c.ideologyName || c.regime}</div>
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
      greeting: "Мы готовы выслушать ваши предложения на принципах суверенного паритета.",
      proposals: []
    };

    pane.innerHTML = `
      <div class="terminal-header">
        <div>
          <strong style="font-size:15px; text-transform:uppercase;">${target.flag} ДИПЛОМАТИЧЕСКАЯ МИССИЯ: ${target.name}</strong>
          <div style="font-family:var(--font-mono); font-size:11px; color:var(--listing-gray);">${target.capital} • ${target.ideologyName || target.regime}</div>
        </div>
        <span class="instrument-chip">ИНДЕКС ДОВЕРИЯ: ${rel}/100</span>
      </div>

      <div class="terminal-stream" id="dialogueChat">
        <div class="terminal-bubble them">
          <strong style="color:var(--signal-yellow); font-family:var(--font-mono); font-size:11px; display:block; margin-bottom:4px;">ПОСОЛ [${target.name.toUpperCase()}]:</strong>
          «${preset.greeting}»
        </div>
      </div>

      <div class="panel-title" style="margin-bottom:12px;">ПРОТОКОЛЫ ДЕЙСТВИЙ</div>
      <div class="terminal-actions">
        <button class="btn-black-action" id="btnDiploTrade">[+] Торговый пакт ($5B)</button>
        <button class="btn-black-action" id="btnDiploAlliance">[+] Оборонительный союз</button>
        <button class="btn-black-action" id="btnDiploGift">[+] Финансовый грант ($10B)</button>
        <button class="btn-black-action danger" id="btnDiploUltimatum">[!] Выдвинуть ультиматум</button>
      </div>
    `;

    const chat = document.getElementById('dialogueChat');

    document.getElementById('btnDiploTrade').addEventListener('click', () => {
      if (this.player.stats.treasury >= 5) {
        this.player.stats.treasury -= 5;
        this.player.stats.incomeBonus = (this.player.stats.incomeBonus || 0) + 4;
        this.player.relations[targetId] = Math.min(100, this.player.relations[targetId] + 10);
        chat.innerHTML += `
          <div class="terminal-bubble you">ПРЕДЛОЖЕНИЕ: Снижение взаимных пошлин и открытие торговых коридоров.</div>
          <div class="terminal-bubble them">АКЦЕПТОВАНО: Соглашение подписано. Товарооборот начинает приносить взаимный доход.</div>
        `;
        this.toast(`ТОРГОВЫЙ ПАКТ С ${target.name.toUpperCase()} ЗАКЛЮЧЕН`);
        this.updateHeaderAndResources();
        this.renderDiplomacyTab();
      } else {
        this.toast("ОТКАЗ: Недостаточно средств в казне");
      }
    });

    document.getElementById('btnDiploAlliance').addEventListener('click', () => {
      if (rel >= 65) {
        this.player.relations[targetId] = Math.min(100, this.player.relations[targetId] + 15);
        this.player.stats.influence = Math.min(100, this.player.stats.influence + 8);
        chat.innerHTML += `
          <div class="terminal-bubble you">ПРЕДЛОЖЕНИЕ: Договор о взаимных гарантиях безопасности.</div>
          <div class="terminal-bubble them">СОГЛАСОВАНО: Наши генеральные штабы начинают обмен данными. Союз нерушим.</div>
        `;
        this.toast(`ВОЕННЫЙ СОЮЗ С ${target.name.toUpperCase()} ЗАКЛЮЧЕН`);
      } else {
        chat.innerHTML += `
          <div class="terminal-bubble you">ПРЕДЛОЖЕНИЕ: Военный союз.</div>
          <div class="terminal-bubble them">ОТКЛОНЕНО: Уровень взаимного доверия недостаточен (Требуется 65+).</div>
        `;
        this.toast("ОТКЛОНЕНО: НЕДОСТАТОЧНО ДОВЕРИЯ");
      }
      this.updateHeaderAndResources();
    });

    document.getElementById('btnDiploGift').addEventListener('click', () => {
      if (this.player.stats.treasury >= 10) {
        this.player.stats.treasury -= 10;
        this.player.relations[targetId] = Math.min(100, this.player.relations[targetId] + 20);
        chat.innerHTML += `
          <div class="terminal-bubble you">ТРАНШ: Предоставление безвозмездного стабилизационного кредита.</div>
          <div class="terminal-bubble them">БЛАГОДАРНОСТЬ: Транш получен. Отношение элиты и общества резко улучшилось.</div>
        `;
        this.toast(`ОТНОШЕНИЯ С ${target.name.toUpperCase()} ВЫРОСЛИ НА +20`);
        this.updateHeaderAndResources();
        this.renderDiplomacyTab();
      } else {
        this.toast("ОТКАЗ: Недостаточно средств в казне");
      }
    });

    document.getElementById('btnDiploUltimatum').addEventListener('click', () => {
      this.player.relations[targetId] = Math.max(0, this.player.relations[targetId] - 35);
      this.player.stats.stability = Math.max(0, this.player.stats.stability - 5);
      chat.innerHTML += `
        <div class="terminal-bubble you">УЛЬТИМАТУМ: Немедленно прекратить враждебные действия и уступить интересы!</div>
        <div class="terminal-bubble them" style="border-color:var(--accent-red); color:var(--accent-red);">ДЕПЕША ИЗ СТОЛИЦЫ: Это объявление вражды. Дипломатические контакты заморожены!</div>
      `;
      this.toast(`РАЗРЫВ: ОТНОШЕНИЯ С ${target.name.toUpperCase()} КРИТИЧЕСКИ УПАЛИ`);
      this.updateHeaderAndResources();
      this.renderDiplomacyTab();
    });
  }

  /* ----------------------------------------------------
     TAB: ECONOMY & PROJECTS
     ---------------------------------------------------- */
  renderEconomyTab() {
    const pList = document.getElementById('ecoProjectsList');
    pList.innerHTML = '';
    this.player.projects.forEach(p => {
      const item = document.createElement('div');
      item.className = 'tech-item';
      item.innerHTML = `
        <div class="tech-info">
          <h5>${p.name.toUpperCase()}</h5>
          <p>${p.effect}</p>
          <p style="font-family:var(--font-mono); font-size:11px; color:var(--signal-yellow);">СТОИМОСТЬ: $${p.cost}B</p>
        </div>
        <button class="btn-black-download" id="proj_${p.id}">
          ${p.active ? '✓ ВНЕДРЕНО' : 'ФИНАНСИРОВАТЬ'}
        </button>
      `;

      pList.appendChild(item);

      document.getElementById(`proj_${p.id}`).addEventListener('click', () => {
        if (p.active) return;
        if (this.player.stats.treasury >= p.cost) {
          this.player.stats.treasury -= p.cost;
          p.active = true;
          this.player.stats.incomeBonus = (this.player.stats.incomeBonus || 0) + 10;
          this.toast(`МЕГАПРОЕКТ [${p.name.toUpperCase()}] УСПЕШНО ЗАПУЩЕН`);
          this.log(`Внедрен масштабный национальный проект: ${p.name}.`);
          this.updateHeaderAndResources();
          this.renderEconomyTab();
        } else {
          this.toast("ОТКАЗ: Недостаточно средств в казне");
        }
      });
    });

    const tMatrix = document.getElementById('tradeMatrix');
    tMatrix.innerHTML = '';
    for (let k in this.otherCountries) {
      const c = this.otherCountries[k];
      const rel = this.player.relations[k] || 50;
      const card = document.createElement('div');
      card.className = 'tech-item';
      card.innerHTML = `
        <div class="tech-info">
          <h5>${c.flag} ${c.name.toUpperCase()}</h5>
          <p>РЕЖИМ: ${rel > 40 ? 'СВОБОДНАЯ ТОРГОВЛЯ' : 'САНКЦИОННЫЙ РЕЖИМ'}</p>
          <p style="font-family:var(--font-mono); font-size:11px; color:var(--listing-gray);">
            ТОВАРООБОРОТ: ~$${Math.round(rel * 0.4)}B/год • ТАРИФ: ${rel > 50 ? '5%' : '25%'}
          </p>
        </div>
      `;
      tMatrix.appendChild(card);
    }
  }

  /* ----------------------------------------------------
     TAB: MILITARY & ARMED FORCES
     ---------------------------------------------------- */
  renderMilitaryTab() {
    const stats = document.getElementById('milStats');
    stats.innerHTML = `
      <div class="readout-cell" style="border:1px solid var(--etch-border);">
        <div class="readout-label">АРМИЯ И ФЛОТ</div>
        <div class="readout-value">${this.player.stats.military}</div>
      </div>
      <div class="readout-cell" style="border:1px solid var(--etch-border);">
        <div class="readout-label">ЯДЕРНЫЙ СТАТУС</div>
        <div class="readout-value">${this.player.nuclear ? "АКТИВЕН" : "НЕТ"}</div>
      </div>
      <div class="readout-cell" style="border:1px solid var(--etch-border);">
        <div class="readout-label">РЕГУЛЯРНЫЕ ВОЙСКА</div>
        <div class="readout-value">${Math.round(this.player.stats.military * 2.8)}k</div>
      </div>
      <div class="readout-cell" style="border:1px solid var(--etch-border);">
        <div class="readout-label">СТОЙКОСТЬ ТЫЛА</div>
        <div class="readout-value">${this.player.stats.energy > 80 ? "ВЫСОКАЯ" : "СРЕДНЯЯ"}</div>
      </div>
    `;

    const docList = document.getElementById('doctrinesList');
    docList.innerHTML = `
      <div class="tech-item">
        <div class="tech-info">
          <h5>СТРАТЕГИЧЕСКОЕ СДЕРЖИВАНИЕ</h5>
          <p>Многоэшелонированная система контрудара и ПВО</p>
        </div>
        <span class="instrument-chip">АКТИВНА</span>
      </div>
      <div class="tech-item">
        <div class="tech-info">
          <h5>РОИ БЕСПИЛОТНИКОВ И РЭБ</h5>
          <p>Подавление каналов связи противника и автономные дроны</p>
        </div>
        <span class="instrument-chip">РАЗВЕРТЫВАЕТСЯ</span>
      </div>
    `;
  }

  /* ----------------------------------------------------
     TAB: POLICIES & DECREES
     ---------------------------------------------------- */
  renderPoliciesTab() {
    const rSel = document.getElementById('regimeSelector');
    rSel.innerHTML = '';
    this.regimeTypes.forEach(r => {
      const opt = document.createElement('div');
      opt.className = `tech-item ${this.player.regimeStyle === r.id ? 'active' : ''}`;
      opt.style.cursor = 'pointer';
      opt.innerHTML = `
        <div class="tech-info">
          <h5>${r.name.toUpperCase()}</h5>
          <p>${r.desc}</p>
        </div>
        <span class="instrument-chip">${this.player.regimeStyle === r.id ? '✓ ТЕКУЩИЙ' : 'ВЫБРАТЬ'}</span>
      `;
      opt.addEventListener('click', () => {
        this.player.regimeStyle = r.id;
        this.player.regime = r.name;
        this.toast(`ДОКТРИНА ИЗМЕНЕНА: ${r.name.toUpperCase()}`);
        this.log(`Провозглашен переход к стилю правления: ${r.name}.`);
        this.updateHeaderAndResources();
        this.renderPoliciesTab();
      });
      rSel.appendChild(opt);
    });

    const dList = document.getElementById('decreesList');
    dList.innerHTML = '';
    this.decrees.forEach(d => {
      const item = document.createElement('div');
      item.className = 'tech-item';
      item.innerHTML = `
        <div class="tech-info">
          <h5>${d.name.toUpperCase()}</h5>
          <p>${d.desc}</p>
          <p style="font-family:var(--font-mono); font-size:11px; color:var(--signal-yellow);">СТОИМОСТЬ: $${d.cost}B</p>
        </div>
        <button class="btn-black-download" id="decree_${d.id}">
          ${d.passed ? '✓ ДЕЙСТВУЕТ' : 'ПРИНЯТЬ УКАЗ'}
        </button>
      `;
      dList.appendChild(item);

      document.getElementById(`decree_${d.id}`).addEventListener('click', () => {
        if (d.passed) return;
        if (this.player.stats.treasury >= d.cost) {
          this.player.stats.treasury -= d.cost;
          d.passed = true;
          this.player.stats.stability = Math.min(100, this.player.stats.stability + 8);
          this.toast(`УКАЗ [${d.name.toUpperCase()}] ВСТУПИЛ В СИЛУ`);
          this.log(`Издан верховный указ: ${d.name}.`);
          this.updateHeaderAndResources();
          this.renderPoliciesTab();
        } else {
          this.toast("ОТКАЗ: Недостаточно средств в казне");
        }
      });
    });
  }

  log(msg) {
    const timeStr = `${this.seasons[this.seasonIndex]} // ${this.year}`;
    this.logs.unshift({ date: timeStr, text: msg });
    const feed = document.getElementById('chronicleFeed');
    if (feed) {
      feed.innerHTML = this.logs.map(l => `
        <div class="tech-item" style="padding:10px 14px;">
          <div class="tech-info">
            <span style="font-family:var(--font-mono); font-size:11px; color:var(--signal-yellow);">${l.date}</span>
            <p style="color:var(--white-sheet);">${l.text}</p>
          </div>
        </div>
      `).join('');
    }
  }

  toast(msg) {
    const container = document.getElementById('toastContainer');
    const t = document.createElement('div');
    t.className = 'opal-toast';
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
    this.toast("СОХРАНЕНО: Данные записаны в локальное хранилище");
  }

  initDotMatrixFooter() {
    const canvas = document.getElementById('dotMatrixCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let width = canvas.width = canvas.offsetWidth;
    let height = canvas.height = canvas.offsetHeight;
    let mouse = { x: -1000, y: -1000 };

    window.addEventListener('resize', () => {
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    });

    canvas.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    });

    canvas.addEventListener('mouseleave', () => {
      mouse.x = -1000;
      mouse.y = -1000;
    });

    const spacing = 14;
    function render() {
      ctx.clearRect(0, 0, width, height);

      for (let x = 0; x < width; x += spacing) {
        for (let y = 0; y < height; y += spacing) {
          const dx = mouse.x - x;
          const dy = mouse.y - y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          let radius = 1.2;
          let alpha = 0.12;

          if (dist < 120) {
            const factor = 1 - dist / 120;
            radius = 1.2 + factor * 2.5;
            alpha = 0.12 + factor * 0.88;
          }

          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          if (dist < 120) {
            ctx.fillStyle = `rgba(255, 219, 1, ${alpha})`;
          } else {
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
          }
          ctx.fill();
        }
      }

      ctx.fillStyle = "rgba(255,255,255,0.04)";
      ctx.font = "700 48px Inter, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("STATECRAFT", width / 2, height / 2);

      requestAnimationFrame(render);
    }
    render();
  }
}

window.addEventListener('DOMContentLoaded', () => {
  const game = new GameState();
  game.init();
  window.currentGame = game;
});

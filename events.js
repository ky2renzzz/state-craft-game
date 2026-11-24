const HISTORICAL_EVENTS = [
  {
    id: "evt_global_energy_shock",
    title: "Глобальный кризис на мировых рынках углеводородов",
    category: "Экономика & Энергетика",
    icon: "⚡",
    text: "Обострение в Ормузском проливе привело к скачку цен на нефть до $120 за баррель и дефициту сжиженного газа. Промышленность стран-импортеров под угрозой стагфляции, тогда как державы-экспортеры получают колоссальные сверхдоходы.",
    options: [
      {
        text: "Ввести государственное субсидирование энерготарифов для населения",
        impact: "Казна -$15B, Стабильность +10%",
        action: (g) => {
          g.player.stats.treasury -= 15;
          g.player.stats.stability = Math.min(100, g.player.stats.stability + 10);
        }
      },
      {
        text: "Переложить бремя на свободный рынок и стимулировать ускоренный энергопереход",
        impact: "Казна +$5B, Стабильность -8%, Энергетика +5%",
        action: (g) => {
          g.player.stats.treasury += 5;
          g.player.stats.stability = Math.max(0, g.player.stats.stability - 8);
          g.player.stats.energy = Math.min(100, g.player.stats.energy + 5);
        }
      },
      {
        text: "Использовать кризис для заключения эксклюзивных двусторонних энергетических сделок",
        impact: "Влияние +12, Казна +$10B (для экспортеров) / -$5B (для импортеров)",
        action: (g) => {
          g.player.stats.influence = Math.min(100, g.player.stats.influence + 12);
          if (["azerbaijan", "russia"].includes(g.player.id)) {
            g.player.stats.treasury += 18;
          } else {
            g.player.stats.treasury -= 8;
          }
        }
      }
    ]
  },
  {
    id: "evt_cyber_warfare",
    title: "Массированная кибератака на критическую инфраструктуру",
    category: "Оборона & Безопасность",
    icon: "💻",
    text: "Неизвестная высокопрофессиональная хакерская группа атаковала серверы управления энергосетями, центробанка и диспетчерских служб. Подозрения падают на иностранные спецслужбы.",
    options: [
      {
        text: "Ответить зеркальным асимметричным киберударом по серверам подозреваемой державы",
        impact: "Военная мощь +4, Влияние -6, Риск эскалации отношений",
        action: (g) => {
          g.player.stats.military = Math.min(100, g.player.stats.military + 4);
          g.player.stats.influence = Math.max(0, g.player.stats.influence - 6);
        }
      },
      {
        text: "Создать национальное суверенное командование киберобороны",
        impact: "Казна -$10B, Стабильность +6%, Военная мощь +5%",
        action: (g) => {
          g.player.stats.treasury -= 10;
          g.player.stats.stability = Math.min(100, g.player.stats.stability + 6);
          g.player.stats.military = Math.min(100, g.player.stats.military + 5);
        }
      },
      {
        text: "Созвать экстренную международную комиссию и обнародовать логи",
        impact: "Влияние +8, Казна -$2B",
        action: (g) => {
          g.player.stats.influence = Math.min(100, g.player.stats.influence + 8);
          g.player.stats.treasury -= 2;
        }
      }
    ]
  },
  {
    id: "evt_civil_unrest",
    title: "Волна социального недовольства и уличных манифестаций",
    category: "Внутренняя политика",
    icon: "📢",
    text: "Повышение пенсионного возраста, инфляция и споры о миграционной политике вывели сотни тысяч людей на площади столицы. Оппозиция требует роспуска кабинета министров.",
    options: [
      {
        text: "Пойти на компромисс: провести налоговую амнистию и расширить социальный пакет",
        impact: "Казна -$12B, Стабильность +15%",
        action: (g) => {
          g.player.stats.treasury -= 12;
          g.player.stats.stability = Math.min(100, g.player.stats.stability + 15);
        }
      },
      {
        text: "Проявить 'твердую руку': задействовать полицию и ограничить несогласованные митинги",
        impact: "Стабильность +5% (наведение порядка), Влияние -10% (критика на Западе)",
        action: (g) => {
          g.player.stats.stability = Math.min(100, g.player.stats.stability + 5);
          g.player.stats.influence = Math.max(0, g.player.stats.influence - 10);
        }
      },
      {
        text: "Объявить общенациональный референдум по спорным реформам",
        impact: "Стабильность +8%, Казна -$4B, Влияние +5%",
        action: (g) => {
          g.player.stats.stability = Math.min(100, g.player.stats.stability + 8);
          g.player.stats.treasury -= 4;
          g.player.stats.influence = Math.min(100, g.player.stats.influence + 5);
        }
      }
    ]
  },
  {
    id: "evt_baltic_tensions",
    title: "Инцидент в нейтральных водах Балтийского моря",
    category: "Геополитика",
    icon: "⚓",
    text: "Военный корабль и разведывательный самолет опасно сблизились в нейтральных водах Балтики. Обе стороны обвиняют друг друга в провокации. В штабах объявлена повышенная готовность.",
    options: [
      {
        text: "Немедленно задействовать горячую линию военных ведомств для деэскалации",
        impact: "Влияние +10, Отношения с соседями +8",
        action: (g) => {
          g.player.stats.influence = Math.min(100, g.player.stats.influence + 10);
          for (let c in g.player.relations) {
            g.player.relations[c] = Math.min(100, g.player.relations[c] + 6);
          }
        }
      },
      {
        text: "Начать масштабные демонстративные маневры с боевыми стрельбами",
        impact: "Военная мощь +6, Казна -$6B, Рост напряженности",
        action: (g) => {
          g.player.stats.military = Math.min(100, g.player.stats.military + 6);
          g.player.stats.treasury -= 6;
          for (let c in g.player.relations) {
            g.player.relations[c] = Math.max(0, g.player.relations[c] - 5);
          }
        }
      }
    ]
  },
  {
    id: "evt_trade_corridor_boom",
    title: "Прорыв в трансконтинентальной логистике",
    category: "Торговля & Транзит",
    icon: "🚂",
    text: "Из-за кризисов морских перевозок сухопутные железнодорожные маршруты Евразии бьют исторические рекорды. Страны-транзитеры получают шанс закрепить статус мировых артерий.",
    options: [
      {
        text: "Срочно инвестировать в расширение пропускной способности узловых станций и портов",
        impact: "Казна -$14B, Ежеходный доход +$8B",
        action: (g) => {
          g.player.stats.treasury -= 14;
          g.player.stats.incomeBonus = (g.player.stats.incomeBonus || 0) + 8;
        }
      },
      {
        text: "Повысить транзитные тарифы для иностранных грузов",
        impact: "Казна +$12B прямо сейчас, Влияние -4",
        action: (g) => {
          g.player.stats.treasury += 12;
          g.player.stats.influence = Math.max(0, g.player.stats.influence - 4);
        }
      }
    ]
  }
];

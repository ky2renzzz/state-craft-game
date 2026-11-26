/**
 * Сюжетные цепочки и реалистичные геополитические события с ветвлениями
 */
const STORY_EVENTS = {
  // СЮЖЕТНАЯ АРКА 1: Энергетический и проливной кризис
  arc_energy_1: {
    id: "arc_energy_1",
    arc: "Энергетический передел",
    category: "Сюжетная линия • Энергетика",
    title: "Блокада морских путей и скачок цен на сырьё",
    text: "Обострение вокруг ключевых морских проливов обрушило привычные цепочки поставок. Нефть и газ взлетели в цене, промышленники требуют срочных мер, а соседние державы пытаются переделить рынок.",
    options: [
      {
        text: "Ввести госрегулирование цен и субсидировать тарифы для граждан",
        impact: "Казна -$16B, Стабильность +10% (риск дефицита бюджета)",
        nextEventId: "arc_energy_2_subsidy",
        nextDelay: 2,
        action: (g) => {
          g.player.stats.treasury -= 16;
          g.player.stats.stability = Math.min(100, g.player.stats.stability + 10);
          g.storyFlags.energyPolicy = "subsidy";
        }
      },
      {
        text: "Отпустить цены и перенаправить ресурсы на экспорт / ВПК",
        impact: "Казна +$14B, Стабильность -12%, Армия +4",
        nextEventId: "arc_energy_2_market",
        nextDelay: 2,
        action: (g) => {
          g.player.stats.treasury += 14;
          g.player.stats.stability = Math.max(0, g.player.stats.stability - 12);
          g.player.stats.military = Math.min(100, g.player.stats.military + 4);
          g.storyFlags.energyPolicy = "market";
        }
      },
      {
        text: "Направить военный конвой и силой гарантировать торговый коридор",
        impact: "Влияние +10, Казна -$8B, Отношения со всеми -10",
        nextEventId: "arc_energy_2_convoy",
        nextDelay: 2,
        action: (g) => {
          g.player.stats.treasury -= 8;
          g.player.stats.influence = Math.min(100, g.player.stats.influence + 10);
          g.shiftAllRelations(-10);
          g.storyFlags.energyPolicy = "force";
        }
      }
    ]
  },

  arc_energy_2_subsidy: {
    id: "arc_energy_2_subsidy",
    arc: "Энергетический передел",
    category: "Последствия • Бюджет",
    title: "Исчерпание резервов на субсидии",
    text: "Два квартала искусственного сдерживания цен разогрели спрос, но казна пустеет. Промышленное лобби требует либо отменить льготы, либо найти внешний заём.",
    options: [
      {
        text: "Свернуть субсидии и поднять налоги на корпорации",
        impact: "Казна +$12B, Стабильность -10%",
        action: (g) => {
          g.player.stats.treasury += 12;
          g.player.stats.stability = Math.max(0, g.player.stats.stability - 10);
        }
      },
      {
        text: "Продолжить дотации за счёт сокращения военных расходов",
        impact: "Стабильность +6%, Армия -8, Энергия +4%",
        action: (g) => {
          g.player.stats.stability = Math.min(100, g.player.stats.stability + 6);
          g.player.stats.military = Math.max(10, g.player.stats.military - 8);
          g.player.stats.energy = Math.min(100, g.player.stats.energy + 4);
        }
      }
    ]
  },

  arc_energy_2_market: {
    id: "arc_energy_2_market",
    arc: "Энергетический передел",
    category: "Последствия • Общество",
    title: "Забастовка транспортников и профсоюзов",
    text: "Рост цен на топливо ударил по регионам. Водители и рабочие перекрыли ключевые трассы, требуя отставки кабинета и возврата льгот.",
    options: [
      {
        text: "Пойти на уступки и выплатить компенсации регионам",
        impact: "Казна -$12B, Стабильность +12%, Лояльность городов +8%",
        action: (g) => {
          g.player.stats.treasury -= 12;
          g.player.stats.stability = Math.min(100, g.player.stats.stability + 12);
          g.player.cities.forEach(c => c.loyalty = Math.min(100, c.loyalty + 8));
        }
      },
      {
        text: "Разогнать стачку силами полиции и ввести штрафы",
        impact: "Стабильность -10%, Армия +3, Влияние -6",
        action: (g) => {
          g.player.stats.stability = Math.max(0, g.player.stats.stability - 10);
          g.player.stats.military = Math.min(100, g.player.stats.military + 3);
          g.player.stats.influence = Math.max(0, g.player.stats.influence - 6);
        }
      }
    ]
  },

  arc_energy_2_convoy: {
    id: "arc_energy_2_convoy",
    arc: "Энергетический передел",
    category: "Последствия • Геополитика",
    title: "Инцидент с военным конвоем в нейтральных водах",
    text: "Ваш эскорт вступил в опасное сближение с иностранным флотом. Мировая пресса говорит о грани вооружённого столкновения.",
    options: [
      {
        text: "Усилить давление и закрепить контроль над маршрутом",
        impact: "Влияние +8, Энергия +8%, Риск войны и -15 отношений с недругами",
        action: (g) => {
          g.player.stats.influence = Math.min(100, g.player.stats.influence + 8);
          g.player.stats.energy = Math.min(100, g.player.stats.energy + 8);
          g.shiftAllRelations(-15);
        }
      },
      {
        text: "Отвести корабли и подписать многостороннюю конвенцию",
        impact: "Влияние -5, Отношения со всеми +10, Казна +$6B",
        action: (g) => {
          g.player.stats.influence = Math.max(0, g.player.stats.influence - 5);
          g.player.stats.treasury += 6;
          g.shiftAllRelations(10);
        }
      }
    ]
  },

  // СЮЖЕТНАЯ АРКА 2: Пограничная провокация и выбор силы
  arc_border_1: {
    id: "arc_border_1",
    arc: "Пограничный узел",
    category: "Сюжетная линия • Безопасность",
    title: "Вооружённый инцидент на границе",
    text: "На спорном участке границы произошла перестрелка с участием неизвестных формирований. Разведка считает, что за этим стоит одна из соседних держав, проверяющая вашу решимость.",
    options: [
      {
        text: "Стянуть войска к границе и выдвинуть жёсткий протест",
        impact: "Армия +5, Казна -$7B, Отношения с соседями -15",
        nextEventId: "arc_border_2_escalation",
        nextDelay: 2,
        action: (g) => {
          g.player.stats.treasury -= 7;
          g.player.stats.military = Math.min(100, g.player.stats.military + 5);
          g.shiftAllRelations(-15);
        }
      },
      {
        text: "Инициировать закрытые переговоры и совместную комиссию",
        impact: "Стабильность -4%, Влияние +5, Отношения +8",
        action: (g) => {
          g.player.stats.stability = Math.max(0, g.player.stats.stability - 4);
          g.player.stats.influence = Math.min(100, g.player.stats.influence + 5);
          g.shiftAllRelations(8);
        }
      },
      {
        text: "Замолчать инцидент, чтобы не пугать инвесторов",
        impact: "Казна +$8B, Стабильность -8%, Армия -4",
        action: (g) => {
          g.player.stats.treasury += 8;
          g.player.stats.stability = Math.max(0, g.player.stats.stability - 8);
          g.player.stats.military = Math.max(10, g.player.stats.military - 4);
        }
      }
    ]
  },

  arc_border_2_escalation: {
    id: "arc_border_2_escalation",
    arc: "Пограничный узел",
    category: "Последствия • Кризис",
    title: "Мобилизация на сопредельной стороне",
    text: "В ответ на вашу демонстрацию силы соседняя держава начала переброску бронетехники к границе. Генералитет ждёт приказа.",
    options: [
      {
        text: "Нанести упреждающий удар и объявить войну самому враждебному соседу",
        impact: "Начинается реальная война с наиболее враждебной страной!",
        action: (g) => {
          const targetId = g.getMostHostileCountryId();
          if (targetId) g.declareWar(targetId, "Пограничный конфликт перерос в открытую войну");
        }
      },
      {
        text: "Укрепить оборонительные рубежи и ждать",
        impact: "Казна -$10B, Армия +6, Стабильность +4%",
        action: (g) => {
          g.player.stats.treasury -= 10;
          g.player.stats.military = Math.min(100, g.player.stats.military + 6);
          g.player.stats.stability = Math.min(100, g.player.stats.stability + 4);
        }
      },
      {
        text: "Отвести войска при посредничестве третьих стран",
        impact: "Влияние -10, Отношения +12",
        action: (g) => {
          g.player.stats.influence = Math.max(0, g.player.stats.influence - 10);
          g.shiftAllRelations(12);
        }
      }
    ]
  },

  // СЮЖЕТНАЯ АРКА 3: Внутренняя политика и борьба за власть
  arc_power_1: {
    id: "arc_power_1",
    arc: "Кризис легитимности",
    category: "Сюжетная линия • Внутренняя политика",
    title: "Раскол в парламенте и утечка секретных документов",
    text: "Оппозиция опубликовала досье о коррупции в высших эшелонах власти. Улица бурлит, а министры требуют либо жёсткой зачистки, либо досрочных уступок.",
    options: [
      {
        text: "Начать публичную чистку элит и конфисковать активы виновных",
        impact: "Казна +$15B, Коррупция -10%, Стабильность +6%, Армия -3",
        action: (g) => {
          g.player.stats.treasury += 15;
          g.player.stats.corruption = Math.max(0, (g.player.stats.corruption || 15) - 10);
          g.player.stats.stability = Math.min(100, g.player.stats.stability + 6);
          g.player.stats.military = Math.max(10, g.player.stats.military - 3);
        }
      },
      {
        text: "Закрыть оппозиционные СМИ и арестовать зачинщиков",
        impact: "Стабильность -8%, Влияние -10, Контроль городов +10% (авторитарный сдвиг)",
        action: (g) => {
          g.player.stats.stability = Math.max(0, g.player.stats.stability - 8);
          g.player.stats.influence = Math.max(0, g.player.stats.influence - 10);
          g.player.cities.forEach(c => c.loyalty = Math.min(100, c.loyalty + 10));
        }
      },
      {
        text: "Сформировать коалиционное правительство с оппозицией",
        impact: "Стабильность +12%, Влияние +6, Казна -$10B",
        action: (g) => {
          g.player.stats.stability = Math.min(100, g.player.stats.stability + 12);
          g.player.stats.influence = Math.min(100, g.player.stats.influence + 6);
          g.player.stats.treasury -= 10;
        }
      }
    ]
  }
};

// Случайные реалистичные кризисы (если не сработало сюжетное продолжение)
const RANDOM_EVENTS = [
  {
    id: "rnd_sanctions_pressure",
    category: "Дипломатия • Давление",
    title: "Угроза вторичных санкций",
    text: "Крупные финансовые центры требуют от вашей страны присоединиться к торговому бойкоту против конкурента, угрожая заморозкой ваших счетов.",
    options: [
      {
        text: "Подчиниться и ввести ограничения против конкурента",
        impact: "Влияние +5, Казна -$8B, Отношения с враждебным соседом -20",
        action: (g) => {
          g.player.stats.influence = Math.min(100, g.player.stats.influence + 5);
          g.player.stats.treasury -= 8;
          const t = g.getMostHostileCountryId();
          if (t) g.changeRelation(t, -20);
        }
      },
      {
        text: "Отказаться и выстроить альтернативные расчёты",
        impact: "Казна -$5B, Влияние -4, Стабильность +5%, Энергия +4%",
        action: (g) => {
          g.player.stats.treasury -= 5;
          g.player.stats.influence = Math.max(0, g.player.stats.influence - 4);
          g.player.stats.stability = Math.min(100, g.player.stats.stability + 5);
          g.player.stats.energy = Math.min(100, g.player.stats.energy + 4);
        }
      }
    ]
  },
  {
    id: "rnd_region_revolt",
    category: "Внутренний кризис • Регионы",
    title: "Волнения в промышленном регионе",
    text: "Из-за роста налогов и усталости от политики центра в одном из городов начались массовые митинги с требованием автономии.",
    options: [
      {
        text: "Выделить экстренные дотации городу",
        impact: "Казна -$10B, Лояльность городов +12%",
        action: (g) => {
          g.player.stats.treasury -= 10;
          g.player.cities.forEach(c => c.loyalty = Math.min(100, c.loyalty + 12));
        }
      },
      {
        text: "Ввести войска и комендантский час",
        impact: "Стабильность -10%, Лояльность городов -8%, Армия +3",
        action: (g) => {
          g.player.stats.stability = Math.max(0, g.player.stats.stability - 10);
          g.player.stats.military = Math.min(100, g.player.stats.military + 3);
          g.player.cities.forEach(c => c.loyalty = Math.max(0, c.loyalty - 8));
        }
      }
    ]
  },
  {
    id: "rnd_tech_breakthrough",
    category: "Экономика • Промышленность",
    title: "Прорыв в оборонном и гражданском производстве",
    text: "Ведущие конструкторские бюро страны представили новую платформу двойного назначения. Нужны инвестиции для запуска серии.",
    options: [
      {
        text: "Профинансировать военный заказ",
        impact: "Казна -$12B, Армия +10",
        action: (g) => {
          g.player.stats.treasury -= 12;
          g.player.stats.military = Math.min(100, g.player.stats.military + 10);
        }
      },
      {
        text: "Направить технологию в гражданскую экономику",
        impact: "Казна -$8B, Доход городов +12B, Энергия +6%",
        action: (g) => {
          g.player.stats.treasury -= 8;
          g.player.stats.energy = Math.min(100, g.player.stats.energy + 6);
          if (g.player.cities[0]) g.player.cities[0].gdp += 12;
        }
      },
      {
        text: "Продать лицензию за рубеж ради быстрых денег",
        impact: "Казна +$16B, Армия -4",
        action: (g) => {
          g.player.stats.treasury += 16;
          g.player.stats.military = Math.max(10, g.player.stats.military - 4);
        }
      }
    ]
  }
];

/**
 * Играбельные державы (с уникальными реалиями) + Внешние мировые державы (ИИ)
 */
const COUNTRIES_DATA = {
  france: {
    id: "france",
    nuclear: true,
    bloc: "west",
    name: "Франция",
    fullName: "Французская Республика",
    flag: "🇫🇷",
    motto: "Liberté, Égalité, Fraternité",
    defaultIdeology: "liberal",
    defaultEconomy: "social_market",
    defaultDoctrine: "euro_atlantic",
    ideologyName: "Пятая республика",
    capital: "Париж",
    stats: {
      treasury: 140,
      debt: 110,
      inflation: 3.1,
      unemployment: 7.4,
      eliteLoyalty: 64,
      military: 80,
      stability: 54,
      influence: 88,
      energy: 92,
      taxRate: 38,
      corruption: 12
    },
    traits: [
      "Ядерная триада и постоянный член СБ ООН",
      "Мощный парк АЭС (92% энергонезависимости)",
      "Высокий госдолг и сильные профсоюзы",
      "Влияние в Африке и оборонная промышленность"
    ],
    cities: [
      { id: "paris", name: "Париж", population: "11.1 млн", role: "Финансовый и политический центр", loyalty: 58, gdp: 46, focus: "Финансы" },
      { id: "marseille", name: "Марсель", population: "1.8 млн", role: "Средиземноморский порт", loyalty: 52, gdp: 22, focus: "Торговля" },
      { id: "lyon", name: "Лион", population: "2.3 млн", role: "Промышленность и фармацевтика", loyalty: 68, gdp: 26, focus: "Индустрия" },
      { id: "toulouse", name: "Тулуза", population: "1.4 млн", role: "Авиакосмический и военный хаб", loyalty: 76, gdp: 28, focus: "ВПК" }
    ],
    relations: {
      russia: 25, finland: 80, poland: 72, azerbaijan: 40,
      usa: 78, china: 48, germany: 86, uk: 76, turkey: 38, iran: 20, india: 70, ukraine: 78
    },
    advisors: [
      { role: "Премьер-министр", name: "Мишель Дюпон", advice: "Профсоюзы угрожают всеобщей стачкой, если мы повысим пенсионный возраст или урежем социалку." },
      { role: "Министр финансов", name: "Клер Лоран", advice: "Госдолг требует обслуживания. Без роста ВВП или контроля расходов нам грозит понижение рейтинга." },
      { role: "Начальник штаба", name: "Генерал Марсо", advice: "Мы можем проецировать силу за рубежом, но запасы боеприпасов требуют расширения ВПК." }
    ],
    projects: [
      { id: "fr_epr", name: "Реакторы EPR-2 нового поколения", cost: 32, effect: "+8% энергии, +$10B ВВП", active: false },
      { id: "fr_pang", name: "Атомный авианосец PANG", cost: 42, effect: "+14 армия, +10 влияние", active: false },
      { id: "fr_ai", name: "Европейский кластер ИИ и микрочипов", cost: 26, effect: "+$14B ВВП", active: false }
    ]
  },

  russia: {
    id: "russia",
    nuclear: true,
    bloc: "eurasia",
    name: "Россия",
    fullName: "Российская Федерация",
    flag: "🇷🇺",
    motto: "Суверенитет и евразийский масштаб",
    defaultIdeology: "sovereign_statism",
    defaultEconomy: "state_capitalism",
    defaultDoctrine: "eurasian",
    ideologyName: "Президентская республика",
    capital: "Москва",
    stats: {
      treasury: 210,
      debt: 28,
      inflation: 8.5,
      unemployment: 3.1,
      eliteLoyalty: 74,
      military: 92,
      stability: 68,
      influence: 84,
      energy: 100,
      taxRate: 26,
      corruption: 28
    },
    traits: [
      "Крупнейший ядерный арсенал и ВПК",
      "100% сырьевая и энергетическая автономия",
      "Жёсткое санкционное давление Запада",
      "Перегрев военной экономики и инфляция"
    ],
    cities: [
      { id: "moscow", name: "Москва", population: "13.1 млн", role: "Столица и финансовый центр", loyalty: 74, gdp: 52, focus: "Управление" },
      { id: "spb", name: "Санкт-Петербург", population: "5.6 млн", role: "Балтийский порт и наука", loyalty: 66, gdp: 28, focus: "Логистика" },
      { id: "ekb", name: "Екатеринбург", population: "1.5 млн", role: "Уральский оборонно-промышленный пояс", loyalty: 76, gdp: 24, focus: "ВПК" },
      { id: "novosib", name: "Новосибирск", population: "1.6 млн", role: "Сибирский научный и транзитный узел", loyalty: 72, gdp: 20, focus: "Наука" }
    ],
    relations: {
      france: 25, finland: 18, poland: 12, azerbaijan: 64,
      usa: 10, china: 84, germany: 20, uk: 12, turkey: 58, iran: 78, india: 76, ukraine: 5
    },
    advisors: [
      { role: "Глава Центробанка", name: "Елена Соколова", advice: "Высокие военные расходы разгоняют инфляцию. Нужно либо охладить бюджет, либо готовиться к росту цен." },
      { role: "Министр обороны", name: "Маршал Волков", advice: "ВПК работает в три смены, но длительные конфликты истощают кадры и технику." },
      { role: "Глава МИД", name: "Сергей Громов", advice: "Поворот на Восток приносит валюту, но зависимость от одного крупного партнёра снижает наш манёвр." }
    ],
    projects: [
      { id: "ru_nsr", name: "Северный морской путь", cost: 34, effect: "+$16B ВВП, +8 влияние", active: false },
      { id: "ru_micro", name: "Суверенная литография и чипы", cost: 38, effect: "+10 армия, +$12B ВВП", active: false },
      { id: "ru_east", name: "Восточный нефтегазовый коридор", cost: 28, effect: "+$18B казны сразу", active: false }
    ]
  },

  finland: {
    id: "finland",
    nuclear: false,
    bloc: "west",
    name: "Финляндия",
    fullName: "Финляндская Республика",
    flag: "🇫🇮",
    motto: "Sisu — стойкость и порядок",
    defaultIdeology: "technocracy",
    defaultEconomy: "social_market",
    defaultDoctrine: "euro_atlantic",
    ideologyName: "Северная парламентская демократия",
    capital: "Хельсинки",
    stats: {
      treasury: 78,
      debt: 65,
      inflation: 2.2,
      unemployment: 7.8,
      eliteLoyalty: 82,
      military: 64,
      stability: 84,
      influence: 60,
      energy: 78,
      taxRate: 42,
      corruption: 4
    },
    traits: [
      "Минимальная коррупция и высокая стабильность",
      "Мощная мобилизационная система резерва",
      "Длинная сухопутная граница с Россией",
      "Высокая стоимость социального государства"
    ],
    cities: [
      { id: "helsinki", name: "Хельсинки", population: "1.6 млн", role: "Столица и технологический центр", loyalty: 86, gdp: 30, focus: "Технологии" },
      { id: "tampere", name: "Тампере", population: "0.4 млн", role: "Машиностроение и оборонка", loyalty: 84, gdp: 18, focus: "Инженерия" },
      { id: "turku", name: "Турку", population: "0.3 млн", role: "Судостроение и морской выход", loyalty: 80, gdp: 16, focus: "Флот" },
      { id: "oulu", name: "Оулу", population: "0.25 млн", role: "Северный телеком-кластер", loyalty: 82, gdp: 14, focus: "Связь" }
    ],
    relations: {
      france: 80, russia: 18, poland: 78, azerbaijan: 48,
      usa: 82, china: 45, germany: 84, uk: 82, turkey: 52, iran: 22, india: 55, ukraine: 82
    },
    advisors: [
      { role: "Министр финансов", name: "Мика Корхонен", advice: "Старение населения давит на бюджет. Без реформы рынка труда долг будет расти." },
      { role: "Командующий силами обороны", name: "Генерал Ниеми", advice: "Нам критически важно поддерживать ПВО и резерв на восточном направлении." }
    ],
    projects: [
      { id: "fi_olkiluoto", name: "Малые модульные АЭС", cost: 24, effect: "+14% энергии, +$8B ВВП", active: false },
      { id: "fi_arctic", name: "Арктический ледокольный флот", cost: 26, effect: "+10 влияние, +$10B ВВП", active: false }
    ]
  },

  poland: {
    id: "poland",
    nuclear: false,
    bloc: "west",
    name: "Польша",
    fullName: "Республика Польша",
    flag: "🇵🇱",
    motto: "Za naszą i waszą wolność",
    defaultIdeology: "national_conservative",
    defaultEconomy: "free_market",
    defaultDoctrine: "euro_atlantic",
    ideologyName: "Парламентско-президентская республика",
    capital: "Варшава",
    stats: {
      treasury: 125,
      debt: 54,
      inflation: 4.8,
      unemployment: 3.4,
      eliteLoyalty: 58,
      military: 82,
      stability: 62,
      influence: 72,
      energy: 64,
      taxRate: 28,
      corruption: 15
    },
    traits: [
      "Быстрорастущая армия Восточной Европы",
      "Высокий рост ВВП, но зависимость от угля",
      "Жёсткий раскол между политическими лагерями",
      "Главный логистический узел Восточного фланга"
    ],
    cities: [
      { id: "warsaw", name: "Варшава", population: "1.8 млн", role: "Политический и деловой центр", loyalty: 64, gdp: 34, focus: "Финансы" },
      { id: "gdansk", name: "Гданьск", population: "0.5 млн", role: "Ключевой порт и СПГ-терминал", loyalty: 70, gdp: 20, focus: "Логистика" },
      { id: "krakow", name: "Краков", population: "0.8 млн", role: "Наука и IT-аутсорсинг", loyalty: 66, gdp: 22, focus: "IT и Наука" },
      { id: "katowice", name: "Катовице", population: "2.1 млн", role: "Угольно-промышленный бассейн", loyalty: 56, gdp: 24, focus: "Тяжпром" }
    ],
    relations: {
      france: 72, russia: 12, finland: 78, azerbaijan: 60,
      usa: 88, china: 42, germany: 66, uk: 80, turkey: 58, iran: 18, india: 52, ukraine: 80
    },
    advisors: [
      { role: "Министр обороны", name: "Ян Ковальский", advice: "Закупки танков и ПВО требуют огромных денег, но без них мы уязвимы." },
      { role: "Министр энергетики", name: "Анна Новак", advice: "Уголь давит на экологию и цены в ЕС. Нам нужна первая АЭС." }
    ],
    projects: [
      { id: "pl_cpk", name: "Центральный транспортный порт", cost: 30, effect: "+$15B ВВП, +8 влияние", active: false },
      { id: "pl_atom", name: "Первая польская АЭС", cost: 34, effect: "+20% энергии", active: false }
    ]
  },

  azerbaijan: {
    id: "azerbaijan",
    nuclear: false,
    bloc: "nonaligned",
    name: "Азербайджан",
    fullName: "Азербайджанская Республика",
    flag: "🇦🇿",
    motto: "Баланс сил на перекрёстке Евразии",
    defaultIdeology: "sovereign_statism",
    defaultEconomy: "resource_rent",
    defaultDoctrine: "multi_vector",
    ideologyName: "Президентская республика",
    capital: "Баку",
    stats: {
      treasury: 105,
      debt: 18,
      inflation: 4.5,
      unemployment: 5.4,
      eliteLoyalty: 80,
      military: 74,
      stability: 80,
      influence: 64,
      energy: 100,
      taxRate: 24,
      corruption: 22
    },
    traits: [
      "Энергетический хаб Каспия и Южный газовый коридор",
      "Сверхмалый госдолг и профицит нефти/газа",
      "Стратегический союз с Турцией и баланс с РФ/ЕС",
      "Риск падения нефтяных доходов при диверсификации"
    ],
    cities: [
      { id: "baku", name: "Баку", population: "2.4 млн", role: "Нефтяная столица и каспийский порт", loyalty: 82, gdp: 36, focus: "Энергетика" },
      { id: "ganja", name: "Гянджа", population: "0.35 млн", role: "Западный промышленный центр", loyalty: 78, gdp: 16, focus: "Индустрия" },
      { id: "sumgait", name: "Сумгайыт", population: "0.4 млн", role: "Нефтехимия и технопарки", loyalty: 76, gdp: 18, focus: "Химия" },
      { id: "shusha", name: "Шуша", population: "0.05 млн", role: "Восстанавливаемый регион и символ", loyalty: 90, gdp: 10, focus: "Реконструкция" }
    ],
    relations: {
      france: 40, russia: 64, finland: 48, poland: 60,
      usa: 55, china: 68, germany: 58, uk: 72, turkey: 92, iran: 28, india: 38, ukraine: 62
    },
    advisors: [
      { role: "Министр экономики", name: "Рашад Алиев", advice: "Пока нефть и газ дают приток валюты, важно переложить прибыль в ненефтяной сектор и Средний коридор." },
      { role: "Глава МИД", name: "Лейла Мамедова", advice: "Наша сила — в многовекторности: тесный союз с Турцией и прагматизм с Москвой, Пекином и Брюсселем." }
    ],
    projects: [
      { id: "az_corridor", name: "Транскаспийский Средний коридор", cost: 24, effect: "+$14B ВВП, +10 влияние", active: false },
      { id: "az_green", name: "Черноморский зелёный энергокабель", cost: 28, effect: "+$12B ВВП, +8 влияние в ЕС", active: false }
    ]
  }
};

/**
 * Внешние мировые державы (неиграбельные, но полноценные участники дипломатии, торговли, войн и ИИ)
 */
const WORLD_POWERS = {
  usa: {
    id: "usa", name: "США", fullName: "Соединённые Штаты Америки", flag: "🇺🇸", bloc: "west", nuclear: true,
    ideologyName: "Сверхдержава • Президентская республика",
    stats: { treasury: 420, military: 98, stability: 66, influence: 96 },
    cities: [{ name: "Вашингтон", gdp: 80 }, { name: "Нью-Йорк", gdp: 95 }, { name: "Лос-Анджелес", gdp: 70 }],
    greeting: "Вашингтон внимательно следит за балансом сил в регионе и ожидает уважения к международным правилам."
  },
  china: {
    id: "china", name: "Китай", fullName: "Китайская Народная Республика", flag: "🇨🇳", bloc: "eurasia", nuclear: true,
    ideologyName: "Сверхдержава • Госсоциализм",
    stats: { treasury: 390, military: 94, stability: 78, influence: 92 },
    cities: [{ name: "Пекин", gdp: 75 }, { name: "Шанхай", gdp: 90 }, { name: "Шэньчжэнь", gdp: 70 }],
    greeting: "Пекин заинтересован в стабильных торговых маршрутах «Пояса и пути» и прагматичном сотрудничестве."
  },
  germany: {
    id: "germany", name: "Германия", fullName: "Федеративная Республика Германия", flag: "🇩🇪", bloc: "west", nuclear: false,
    ideologyName: "Локомотив ЕС • Парламентская республика",
    stats: { treasury: 230, military: 70, stability: 68, influence: 84 },
    cities: [{ name: "Берлин", gdp: 50 }, { name: "Мюнхен", gdp: 45 }, { name: "Франкфурт", gdp: 55 }],
    greeting: "Берлин готов обсуждать инвестиции, промышленную кооперацию и устойчивую европейскую политику."
  },
  uk: {
    id: "uk", name: "Великобритания", fullName: "Соединённое Королевство", flag: "🇬🇧", bloc: "west", nuclear: true,
    ideologyName: "Парламентская монархия",
    stats: { treasury: 190, military: 82, stability: 64, influence: 85 },
    cities: [{ name: "Лондон", gdp: 65 }, { name: "Манчестер", gdp: 30 }],
    greeting: "Лондон ценит морскую безопасность, финансовое партнёрство и жёсткое сдерживание агрессии."
  },
  turkey: {
    id: "turkey", name: "Турция", fullName: "Турецкая Республика", flag: "🇹🇷", bloc: "nonaligned", nuclear: false,
    ideologyName: "Региональная держава • Президентская республика",
    stats: { treasury: 135, military: 84, stability: 62, influence: 80 },
    cities: [{ name: "Анкара", gdp: 34 }, { name: "Стамбул", gdp: 54 }, { name: "Измир", gdp: 26 }],
    greeting: "Анкара контролирует проливы и проводит самостоятельную политику в интересах стабильности региона."
  },
  iran: {
    id: "iran", name: "Иран", fullName: "Исламская Республика Иран", flag: "🇮🇷", bloc: "eurasia", nuclear: false,
    ideologyName: "Теократическая республика",
    stats: { treasury: 95, military: 78, stability: 56, influence: 72 },
    cities: [{ name: "Тегеран", gdp: 32 }, { name: "Исфахан", gdp: 20 }],
    greeting: "Тегеран не приемлет внешнего диктата и готов к диалогу только на равноправной основе."
  },
  india: {
    id: "india", name: "Индия", fullName: "Республика Индия", flag: "🇮🇳", bloc: "nonaligned", nuclear: true,
    ideologyName: "Крупнейшая демократия • Многовекторность",
    stats: { treasury: 250, military: 86, stability: 72, influence: 83 },
    cities: [{ name: "Нью-Дели", gdp: 55 }, { name: "Мумбаи", gdp: 65 }],
    greeting: "Нью-Дели открыт к технологическому, оборонному и торговому сотрудничеству со всеми полюсами мира."
  },
  ukraine: {
    id: "ukraine", name: "Украина", fullName: "Украина", flag: "🇺🇦", bloc: "west", nuclear: false,
    ideologyName: "Парламентско-президентская республика",
    stats: { treasury: 60, military: 79, stability: 58, influence: 68 },
    cities: [{ name: "Киев", gdp: 24 }, { name: "Львов", gdp: 14 }, { name: "Одесса", gdp: 16 }],
    greeting: "Киев заинтересован в оборонной поддержке, защите суверенитета и интеграции с европейским рынком."
  }
};

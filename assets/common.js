/* Shared content and helpers for all three concepts.
   Each page defines window.TPL = { listName: item => html } and marks containers with data-list / data-t. */
const SITE = 'https://dominanta74.ru';
const img = p => SITE + p;
/* Photos prepared from the client's originals, see assets/img */
const local = name => 'assets/img/' + name;
const thumb = (p, w) => `${SITE}/phpThumb/phpThumb.php?src=${p}&w=${w}&q=78`;

/* doctor index in DATA.doctors -> number of the video file taken from the landing */
const DOCTOR_VIDEOS = { 0: 1, 1: 2, 3: 3, 2: 4, 7: 5, 12: 6 };

const DATA = {
  phone: '+7 (351) 225-15-05',
  phoneHref: 'tel:+73512251505',
  address: 'г. Челябинск, ул. Российская, 49',
  hours: 'Ежедневно 9:00–20:00',
  email: 'info@dominanta74.ru',
  logo: local('logo.svg'),

  photos: {
    chief: local('chief.png'),
    chiefFace: local('doctor-01.jpg'),
    macro: local('macro.jpg'),
    family: local('family.jpg'),
    girl: local('girl.jpg'),
    woman: img('/new_layout/img/video_about_clinic_image-2.png'),
    video: local('team.jpg'),
    lab: local('lab.jpg'),
    equipment: local('equipment.jpg'),
    lounge: local('lounge.jpg'),
    dsd: local('dsd.jpg'),
    tmj: local('tmj.jpg'),
    credit: img('/new_layout/img/credit/credit_girl-2.png'),
    sirona: local('sirona.png'),
    rda: local('rda.png')
  },

  facts: [
    { value: '3D', label: 'томография и сканирование перед лечением — прямо в клинике' },
    { value: '1,5 часа', label: 'весь цикл имплантации, без разрезов и швов' },
    { value: 'с 2009', label: 'работаем по цифровым технологиям' },
    { value: '9–20', label: 'принимаем каждый день, без выходных' }
  ],

  problems: [
    { title: 'Болит зуб', to: 'Лечение зубов' },
    { title: 'Нет одного или нескольких зубов', to: 'Имплантация и протезирование' },
    { title: 'Неровные зубы', to: 'Брекеты и элайнеры' },
    { title: 'Хочу улыбку светлее и ровнее', to: 'Отбеливание, виниры, DSD' },
    { title: 'Щёлкает челюсть, болит голова', to: 'Лечение ВНЧС' },
    { title: 'Кровоточат дёсны', to: 'Лечение дёсен' },
    { title: 'Нужно привести ребёнка', to: 'Детская стоматология' },
    { title: 'Давно не был у врача', to: 'Осмотр и гигиена' }
  ],

  services: [
    { title: 'Диагностика', text: '3D-томография и 3D-сканирование полости рта', icon: img('/netcat_files/4/5/serv_computerdiag.svg') },
    { title: 'Лечение дёсен', text: 'На основе микробиологических исследований', icon: img('/netcat_files/4/5/advant_07.svg') },
    { title: 'Имплантация', text: 'Весь цикл за 1,5 часа. Никаких разрезов и швов', icon: img('/netcat_files/4/5/advant_03.svg') },
    { title: 'Протезирование', text: 'Цифровое, по немецким технологиям', icon: img('/netcat_files/4/5/advant_04.svg') },
    { title: 'Лечение ВНЧС', text: 'Даже сложные и запущенные дисфункции височного сустава', icon: img('/netcat_files/4/5/advant_05.svg') },
    { title: 'Эстетика улыбки', text: 'Виниры и реставрации по цифровому проекту улыбки', icon: img('/netcat_files/4/5/advant_06.svg') },
    { title: 'Исправление прикуса', text: 'Брекеты и элайнеры для детей и взрослых', icon: img('/netcat_files/4/5/advant_08.svg') }
  ],

  advantages: [
    { title: 'Полный цифровой цикл', text: 'Диагностика, планирование и изготовление реставраций проходят под компьютерным контролем.' },
    { title: 'Своя лаборатория', text: 'Коронки, вкладки и элайнеры делаем в клинике — на фрезерном станке и 3D-принтере.' },
    { title: 'Своё оборудование', text: '3D-томограф, микроскоп, внутриротовой сканер, лазер — всё на месте, никуда ехать не нужно.' },
    { title: 'Врачи по призванию', text: 'Специалисты с большим опытом и сильным образованием. Случайных людей в команде нет.' },
    { title: 'Лечение с обезболиванием', text: 'Перед болезненными манипуляциями делаем анестезию. Препарат врач подбирает под процедуру и пациента.' }
  ],

  doctors: [
    ['Кузнецов Борис', 'Главный врач. Победитель чемпионата России по стоматологическому мастерству', '24 года', 'Frame_1.png'],
    ['Нуриева Оксана', 'Стоматолог-хирург, имплантолог', '27 лет', 'Frame_37.png'],
    ['Губанов Игорь', 'Стоматолог-терапевт, ортопед. Протезирование CEREC', '19 лет', 'Frame_91.png'],
    ['Лаптева Анастасия', 'Стоматолог-хирург, имплантолог', '12 лет', 'Frame_28.png'],
    ['Лавриненко Ольга', 'Стоматолог-терапевт', '20 лет', 'Frame_10.png'],
    ['Кузнецов Игорь', 'Врач-остеопат. Коррекция соматических дисфункций', '', 'Frame_73.png'],
    ['Вавилина Галина', 'Гигиенист', '8 лет', 'Frame_19.png'],
    ['Попов Евгений', 'Стоматолог-ортопед. Протезирование CEREC', '8 лет', 'Frame_82__1_.png'],
    ['Сидорова Виктория', 'Стоматолог-ортодонт', '9 лет', 'Frame_100.png'],
    ['Попова Лидия', 'Стоматолог общей практики, детский стоматолог', '5 лет', 'Frame_55.png'],
    ['Фокина Вера', 'Гигиенист', '3 года', 'Frame_1_0.png'],
    ['Алисов Данил', 'Гигиенист', '1 год', 'Frame_119_0.png'],
    ['Ризаева Анастасия', 'Стоматолог-ортопед', '10 лет', 'Frame_110_0.png']
  ].map(([name, role, exp], index) => ({
    name, role, exp,
    photo: local(`doctor-${String(index + 1).padStart(2, '0')}.jpg`),
    /* Video portraits from the landing exist for six doctors only */
    video: DOCTOR_VIDEOS[index] ? `assets/video/doctor-${DOCTOR_VIDEOS[index]}.mp4` : '',
    poster: DOCTOR_VIDEOS[index] ? `assets/video/doctor-${DOCTOR_VIDEOS[index]}.jpg` : ''
  })),

  cycle: [
    { title: 'Компьютерная диагностика', text: 'Совмещаем 3D-томографию с 3D-сканированием и получаем точную цифровую модель челюсти: поверхности зубов, дёсны, анатомия кости.', photo: local('cycle-1.jpg') },
    { title: 'Моделирование операции', text: 'Планируем вмешательство на 3D-модели с учётом строения кости, корневой системы и формы дёсен.', photo: local('cycle-2.jpg') },
    { title: 'Изготовление на CAD/CAM', text: 'Вкладки, коронки, элайнеры, протезы и шаблоны для имплантации делаем на фрезерном станке или медицинском 3D-принтере.', photo: local('cycle-3.jpg') }
  ],

  equipment: ['Стоматологический микроскоп', '3D-томограф высокого разрешения Sirona', 'Цифровая лаборатория CEREC', 'Миограф «Колибри»', '3D-принтер ASIGA', 'Лазер LiteTouch'],

  steps: [
    { title: 'Консультация и осмотр', text: 'Врач выслушает жалобы и осмотрит полость рта. Набор инструментов — индивидуальный, стерильный.' },
    { title: 'Диагностика', text: 'При необходимости сделаем рентгеновский снимок или 3D-томографию прямо в клинике.' },
    { title: 'Оценка зубов и дёсен', text: 'Объясним на снимках, что происходит и что с этим можно сделать.' },
    { title: 'План лечения', text: 'Получите комплексный план с этапами и стоимостью. Решение принимаете вы.' }
  ],

  prices: [
    { title: 'Первичная консультация терапевта, хирурга, ортопеда или ортодонта', price: '1 759 ₽' },
    { title: 'Рентгеновский снимок', price: 'от 439 ₽' },
    { title: 'Коронка из диоксида циркония', price: '49 600 ₽' },
    { title: 'Протезирование на имплантах', price: '52 350 ₽' }
  ],

  reviews: [
    ['13 октября 2026', 'Алексеева Анастасия', 'review-01.jpg'],
    ['16 сентября 2026', 'Лысякова Виктория', 'review-02.jpg'],
    ['1 августа 2026', 'Шарипова С. Ю.', 'review-03.jpg'],
    ['21 июня 2026', 'Савельева Нажия', 'review-04.jpg'],
    ['20 июня 2026', 'Старикова Ульяна', 'review-05.jpg'],
    ['29 мая 2026', 'Трефилова Полина', 'review-06.jpg'],
    ['27 февраля 2026', 'Бурма Тамара', 'review-07.jpg'],
    ['4 февраля 2026', 'Кузнецова Светлана', 'review-08.jpg']
  ].map(([date, name, file]) => ({ date, name, scan: local(file) })),

  /* Official logos (Wikimedia Commons), same six banks as on the current site.
     Note: Vostochny and Home Credit (HCF) were merged into Sovcombank — confirm the partner list with the clinic */
  bankLogos: [
    { name: 'Т-Банк', file: 'tbank.svg', height: 30 },
    { name: 'Кредит Европа Банк', file: 'crediteurope.svg', height: 22 },
    { name: 'ХКФ Банк', file: 'homecredit.svg', height: 44 },
    { name: 'Совкомбанк', file: 'sovcombank.svg', height: 22 },
    { name: 'МТС Банк', file: 'mtsbank.png', height: 30 },
    { name: 'Восточный', file: 'vostochny.svg', height: 22 }
  ],

  banks: ['Тинькофф Банк', 'Кредит Европа Банк', 'ХКФ Банк', 'Совкомбанк', 'МТС-Банк', 'Восточный'],

  news: [
    { date: '13 мая 2023', title: 'Благодарность' },
    { date: '25 февраля 2023', title: 'Новый 3D-принтер ASIGA (Австралия)' },
    { date: '11 октября 2021', title: 'Борис Кузнецов и Оксана Нуриева посетили Евразийский конгресс стоматологов' },
    { date: '20 июля 2021', title: 'Борис Кузнецов получил сертификат за участие в лекции «Физиологическая окклюзия»' }
  ],

  articles: [
    { title: 'Лечение зубов стоматологическим лазером LiteTouch', text: 'Какие лазеры действительно используют в стоматологии, как они работают и почему нельзя рассчитывать на «чудо-устройство».', photo: local('article-1.jpg') },
    { title: 'Разные подходы в лечении кариеса и пульпита', text: 'Почему важны не только технологии, но и подход к лечению кариеса и его осложнений.', photo: local('article-2.jpg') },
    { title: 'Зачем нужны элайнеры?', text: 'Как работает методика исправления прикуса и кому она подходит.', photo: local('article-3.jpg') }
  ],

  faq: [
    { q: 'Будет ли больно?', a: 'Перед болезненными манипуляциями врач делает анестезию. Препарат и дозировку подбирает под процедуру и ваше состояние — расскажите на приёме об аллергии и страхах.' },
    { q: 'Сколько стоит первый приём?', a: 'Первичная консультация терапевта, хирурга, ортопеда или ортодонта — 1 759 ₽. Цены в прайсе включают материалы, работу и контрольные осмотры, скрытых платежей нет.' },
    { q: 'Зачем нужна 3D-диагностика?', a: 'Томография и сканирование дают цифровую модель челюсти: на ней видно строение кости и положение корней. По этой модели врач планирует лечение и операции.' },
    { q: 'Можно ли лечиться в кредит?', a: 'Да. Кредит оформляется прямо в клинике после консультации и получения плана лечения, нужен только паспорт РФ.' },
    { q: 'Принимаете ли вы по ДМС?', a: 'Да, если у вас полис добровольного медицинского страхования одной из наших страховых компаний-партнёров.' },
    { q: 'Принимаете ли детей?', a: 'Да. В клинике работает детский стоматолог, к нам приходят и с молочными зубами.' },
    { q: 'Можно ли оформить налоговый вычет?', a: 'Да. Подготовим документы для налоговой — обратитесь к администратору.' }
  ],

  text: {
    slogan: 'Технологичная стоматология',
    lead: 'Технологичная стоматология в Челябинске. 3D-диагностика, компьютерное планирование и собственная лаборатория — для взрослых и детей.',
    about: 'К нам приходят и малыши с молочными зубами вместе с родителями, и пожилые люди, которые хотят жить комфортно и улыбаться без стеснения. Каждый получает лечение, профилактику и консультацию у врача нужного направления — в одной клинике на Российской.',
    digital: 'Компьютер помогает врачу на каждом этапе: томограмма показывает строение кости и корней, лечение планируется на 3D-модели, а коронку или вкладку изготавливают по этой же модели. План лечения вы видите ещё до его начала.',
    lab: 'Можно своими глазами увидеть, как в реальном времени изготавливается протез по технологии CEREC или как на 3D-принтере печатается шаблон для имплантации.',
    cycle: 'В «Доминанте» полный цифровой цикл: диагностика, планирование и изготовление реставраций проходят на компьютере и в одной клинике.',
    status: 'Клиника авторизована немецким производителем оборудования Sirona и имеет статус передового инновационного центра Ассоциации стоматологов РФ.',
    complex: 'Сложные случаи разбираем всей командой: к лечению подключаются хирург, ортопед, ортодонт и остеопат. Задача — не просто вылечить зуб, а вернуть комфорт при жевании и разговоре.',
    dsd: 'Вместе со стоматологом выбираете цвет и форму новых зубов на компьютере. Результат примеряем на пластиковой модели, напечатанной на 3D-принтере, и только потом утверждаем план реставрации.',
    tmj: 'Дисфункция височно-нижнечелюстного сустава может проявляться щелчками в челюсти и головной болью. Диагностируем её на миографе «Колибри», а лечение ведём вместе с сертифицированным остеопатом.',
    lounge: 'Пока ждёте приёма, можно выпить кофе на диване или пройтись по холлу и рассмотреть экспозицию настоящих зубов древних млекопитающих и рептилий.',
    credit: 'Оформить кредит можно прямо в клинике — нужен только паспорт РФ. Услуга доступна после консультации с врачом и получения плана лечения.',
    insurance: 'Сотрудничаем со страховыми компаниями России. Обращайтесь, если у вас есть полис ДМС одного из наших партнёров.',
    car: 'Парковка для пациентов — прямо у входа, места есть всегда.',
    transit: 'Остановка «Дворец спорта ЧЭМК»: маршрутки № 11/81, № 478, трамваи № 6 и № 7.',
    legal: 'ООО «Доминанта». Лицензия ЛО-74-01-003355 от 05.12.2015. ИНН 7448082217, ОГРН 1067448054739. Информация на сайте не является публичной офертой.',
    warning: 'Имеются противопоказания. Необходима консультация специалиста'
  }
};

/* Non-breaking spaces after short words, before dashes, between numbers and units */
function fixTypography(root) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const short = /(^|[\s («„])([А-Яа-яЁё]{1,2}|без|для|при|над|под|про|или|что|как|это|где|от|до|№)[ ]/g;
  let node;
  while ((node = walker.nextNode())) {
    if (/^(SCRIPT|STYLE)$/.test(node.parentNode.nodeName)) continue;
    let s = node.nodeValue;
    s = s.replace(short, '$1$2 ').replace(short, '$1$2 ');
    s = s.replace(/ ([—–])/g, ' $1');
    s = s.replace(/(\d) (?=[₽%а-яё№])/gi, '$1 ');
    node.nodeValue = s;
  }
}

function renderPage() {
  const tpl = window.TPL || {};
  document.querySelectorAll('[data-list]').forEach(box => {
    const name = box.dataset.list;
    const limit = Number(box.dataset.limit) || Infinity;
    if (tpl[name]) box.innerHTML = DATA[name].slice(0, limit).map(tpl[name]).join('');
  });
  document.querySelectorAll('[data-t]').forEach(el => { el.textContent = DATA.text[el.dataset.t]; });
  document.querySelectorAll('[data-photo]').forEach(el => {
    const src = DATA.photos[el.dataset.photo];
    if (el.tagName === 'IMG') el.src = src; else el.style.backgroundImage = `url("${src}")`;
  });
  document.querySelectorAll('[data-phone]').forEach(el => { el.textContent = DATA.phone; el.href = DATA.phoneHref; });
  document.querySelectorAll('[data-logo]').forEach(el => { el.src = DATA.logo; el.alt = 'Доминанта'; });
  fixTypography(document.body);
  initForms();
  initCarousels();
  initAutoVideos();
  if (window.self === window.top) {
    initSwitcher();
    setTimeout(initReveal, 0);
  }
}

/* Reveal on load and on scroll: opacity + translate, once per element, 60 ms stagger.
   Uses the `translate` property so elements keep their own `transform` (rotated stickers etc.). */
const REVEAL_CSS = `
.rv{opacity:0;translate:0 18px}
.rv.rv-in{opacity:1;translate:0 0;transition:opacity .6s cubic-bezier(0.23,1,0.32,1) var(--rv-delay,0ms),translate .6s cubic-bezier(0.23,1,0.32,1) var(--rv-delay,0ms)}
@media (prefers-reduced-motion:reduce){.rv{translate:none}.rv.rv-in{transition:opacity .3s ease var(--rv-delay,0ms)}}`;
const REVEAL_ATOMIC = 'p,h1,h2,h3,ul,ol,dl,a,form,figure,article,details,button,img,table,[data-carousel]';
const REVEAL_STAGGER = 60;
const REVEAL_LINE = 0.22;

function collectRevealTargets(element, depth, targets) {
  const style = getComputedStyle(element);
  if (!element.offsetHeight || /absolute|fixed|sticky/.test(style.position)) return;
  const children = [...element.children].filter(child => child.offsetHeight);
  if (element.matches('[data-list]:not([data-carousel])') && children.length > 1) {
    targets.push(...children);
    return;
  }
  const isBig = element.offsetHeight > window.innerHeight * 0.55;
  if (isBig && children.length && depth < 5 && !element.matches(REVEAL_ATOMIC)) {
    children.forEach(child => collectRevealTargets(child, depth + 1, targets));
    return;
  }
  targets.push(element);
}

function initReveal() {
  if (!('IntersectionObserver' in window)) return;
  const style = document.createElement('style');
  style.textContent = REVEAL_CSS;
  document.head.append(style);

  const targets = [];
  document.querySelectorAll('main > *, .page > *').forEach(root => collectRevealTargets(root, 0, targets));
  targets.forEach(target => target.classList.add('rv'));

  const pending = new Set(targets);
  const finish = target => target.classList.remove('rv', 'rv-in');
  const reveal = (target, order) => {
    if (!pending.delete(target)) return;
    const delay = Math.min(order, 8) * REVEAL_STAGGER;
    target.style.setProperty('--rv-delay', delay + 'ms');
    target.classList.add('rv-in');
    observer.unobserve(target);
    setTimeout(() => { finish(target); target.style.removeProperty('--rv-delay'); }, delay + 700);
  };

  /* On scroll an element starts only after it has risen REVEAL_LINE of the viewport height,
     so the whole animation plays on screen, not at the bottom edge */
  const observer = new IntersectionObserver(entries => {
    let order = 0;
    entries.forEach(entry => {
      if (entry.isIntersecting) { reveal(entry.target, order++); return; }
      if (entry.boundingClientRect.top < 0 && pending.delete(entry.target)) {
        finish(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { rootMargin: `0px 0px -${REVEAL_LINE * 100}% 0px` });

  /* Load: everything already on the first screen plays right away, in order */
  let order = 0;
  targets.forEach(target => {
    if (target.getBoundingClientRect().top < window.innerHeight) reveal(target, order++);
    else observer.observe(target);
  });

  /* The last blocks of the page can never reach the line — show them when the page ends */
  window.addEventListener('scroll', () => {
    if (!pending.size || window.innerHeight + window.scrollY < document.documentElement.scrollHeight - 40) return;
    let last = 0;
    [...pending].forEach(target => {
      if (target.getBoundingClientRect().top < window.innerHeight) reveal(target, last++);
    });
  }, { passive: true });
}

/* Video portraits: play only while on screen; with reduced motion the poster stays */
function initAutoVideos() {
  const videos = document.querySelectorAll('video[data-autovideo]');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!videos.length || reduced || !('IntersectionObserver' in window)) return;
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      const video = entry.target;
      if (entry.isIntersecting) { video.preload = 'auto'; video.play().catch(() => {}); } else video.pause();
    });
  }, { threshold: 0.3 });
  videos.forEach(video => observer.observe(video));
}

/* Small switcher between concepts (desktop only) */
const CONCEPT_COUNT = 7;
function initSwitcher() {
  const match = location.pathname.match(/concept-(\d)\.html/);
  if (!match) return;
  const current = Number(match[1]);
  const prev = current > 1 ? current - 1 : CONCEPT_COUNT;
  const next = current < CONCEPT_COUNT ? current + 1 : 1;
  const style = document.createElement('style');
  style.textContent = `
.cswitch{position:fixed;left:16px;bottom:16px;z-index:50;display:flex;align-items:center;gap:4px;background:rgba(20,22,24,.92);color:#fff;border-radius:999px;padding:5px;font:500 13px/1 Arial,sans-serif;box-shadow:0 8px 24px -8px rgba(0,0,0,.5)}
.cswitch a{color:#fff;text-decoration:none;padding:9px 12px;border-radius:999px}
.cswitch a:hover{background:rgba(255,255,255,.16)}
.cswitch span{padding:0 6px;opacity:.6}
@media(max-width:1000px){.cswitch{display:none}}`;
  document.head.append(style);
  const bar = document.createElement('div');
  bar.className = 'cswitch';
  bar.innerHTML = `<a href="index.html">Все концепты</a><a href="concept-${prev}.html" aria-label="Предыдущий концепт">←</a><span>${current} / ${CONCEPT_COUNT}</span><a href="concept-${next}.html" aria-label="Следующий концепт">→</a>`;
  document.body.append(bar);
}

/* Carousels: no scrollbar, arrow buttons, mouse drag. Mark the scroll container with data-carousel */
const CAROUSEL_CSS = `
[data-carousel]{scrollbar-width:none;cursor:grab;user-select:none;-webkit-user-select:none}
[data-carousel]::-webkit-scrollbar{display:none}
[data-carousel] img,[data-carousel] video{pointer-events:none}
[data-carousel].dragging{cursor:grabbing;scroll-snap-type:none!important;scroll-behavior:auto!important}
.car-nav{display:flex;gap:8px;justify-content:flex-end;margin-top:20px}
.car-nav button{width:52px;height:52px;border-radius:50%;border:1.5px solid currentColor;background:none;color:inherit;font:inherit;font-size:20px;line-height:1;cursor:pointer;transition:opacity .2s,transform .15s}
.car-nav button:hover:not(:disabled){transform:scale(1.08)}
.car-nav button:disabled{opacity:.25;cursor:default}`;

function initCarousels() {
  const tracks = document.querySelectorAll('[data-carousel]');
  if (!tracks.length) return;
  const style = document.createElement('style');
  style.textContent = CAROUSEL_CSS;
  document.head.prepend(style);

  tracks.forEach(track => {
    const nav = document.createElement('div');
    nav.className = 'car-nav';
    nav.innerHTML = '<button type="button" aria-label="Назад">←</button><button type="button" aria-label="Вперёд">→</button>';
    const padding = getComputedStyle(track);
    nav.style.paddingLeft = padding.paddingLeft;
    nav.style.paddingRight = padding.paddingRight;
    track.insertAdjacentElement('afterend', nav);
    const [prev, next] = nav.children;

    const updateButtons = () => {
      prev.disabled = track.scrollLeft < 4;
      next.disabled = track.scrollLeft > track.scrollWidth - track.clientWidth - 4;
    };
    const scrollByPage = direction => track.scrollBy({ left: direction * track.clientWidth * 0.8, behavior: 'smooth' });
    prev.addEventListener('click', () => scrollByPage(-1));
    next.addEventListener('click', () => scrollByPage(1));
    track.addEventListener('scroll', updateButtons, { passive: true });
    window.addEventListener('resize', updateButtons);
    updateButtons();

    let startX = 0;
    let startScroll = 0;
    let pressed = false;
    let moved = false;
    track.addEventListener('pointerdown', event => {
      if (event.pointerType !== 'mouse' || event.button !== 0) return;
      pressed = true;
      moved = false;
      startX = event.clientX;
      startScroll = track.scrollLeft;
    });
    window.addEventListener('pointermove', event => {
      if (!pressed) return;
      const shift = event.clientX - startX;
      if (!moved && Math.abs(shift) < 6) return;
      moved = true;
      track.classList.add('dragging');
      track.scrollLeft = startScroll - shift;
    });
    window.addEventListener('pointerup', () => {
      if (!pressed) return;
      pressed = false;
      track.classList.remove('dragging');
    });
    track.addEventListener('click', event => {
      if (moved) { event.preventDefault(); event.stopPropagation(); moved = false; }
    }, true);
  });
}

/* All form logic lives here */
function initForms() {
  /* Submit: works for forms added or restored later too */
  document.addEventListener('submit', event => {
    const form = event.target.closest('form[data-booking]');
    if (!form) return;
    event.preventDefault();
    form.innerHTML = '<p class="form-done">Заявка отправлена. Администратор перезвонит и подберёт время.</p>';
  });

  /* Placeholder links (href="#") do nothing instead of jumping to the top */
  document.addEventListener('click', event => {
    if (event.target.closest('a[href="#"]')) event.preventDefault();
  });

  initBookingModal();
}

/* Booking modal: any element with data-book="Title" opens <dialog data-booking-modal>.
   data-book-note adds a line under the title, the title is also sent in the hidden "service" field. */
function initBookingModal() {
  const modal = document.querySelector('dialog[data-booking-modal]');
  if (!modal) return;
  const form = modal.querySelector('form');
  const template = form.innerHTML;
  const noSpaceBreak = text => text.replace(/ (?=[—–])/g, ' ');

  document.addEventListener('click', event => {
    const trigger = event.target.closest('[data-book]');
    if (!trigger) return;
    event.preventDefault();
    form.innerHTML = template;
    form.querySelector('[data-modal-title]').textContent = noSpaceBreak(trigger.dataset.book);
    form.querySelector('[name="service"]').value = trigger.dataset.book;
    const note = form.querySelector('[data-modal-note]');
    note.textContent = trigger.dataset.bookNote ? `Вы выбрали: «${trigger.dataset.bookNote}»` : 'Перезвоним и подберём удобное время';
    fixTypography(form);
    modal.showModal();
  });

  modal.addEventListener('click', event => {
    if (event.target === modal || event.target.closest('[data-modal-close]')) modal.close();
  });
}

document.addEventListener('DOMContentLoaded', renderPage);

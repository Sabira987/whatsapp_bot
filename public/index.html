const express = require('express');
const twilio = require('twilio');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'public')));

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// ── Деректер сақтау ──────────────────────────────────────────────────────────
const DATA_FILE = path.join(__dirname, 'data', 'products.json');
if (!fs.existsSync(path.join(__dirname, 'data'))) {
  fs.mkdirSync(path.join(__dirname, 'data'));
}
if (!fs.existsSync(DATA_FILE)) {
  const defaultProducts = [
    {
      id: 1,
      name: { kz: 'Жазғы көйлек', ru: 'Летнее платье' },
      price: '12500',
      desc: { kz: 'Жеңіл жазғы көйлек, 100% мақта.', ru: 'Лёгкое летнее платье, 100% хлопок.' },
      sizes: ['XS', 'S', 'M', 'L', 'XL'],
      colors: { kz: 'Ақ, Қызыл, Көк', ru: 'Белый, Красный, Синий' },
      emoji: '👗',
      images: [],
      inStock: true
    },
    {
      id: 2,
      name: { kz: 'Джинс шалбар', ru: 'Джинсы' },
      price: '18900',
      desc: { kz: 'Классикалық прямой кесілген джинс.', ru: 'Классические прямые джинсы.' },
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      colors: { kz: 'Көк, Қара', ru: 'Синий, Чёрный' },
      emoji: '👖',
      images: [],
      inStock: true
    }
  ];
  fs.writeFileSync(DATA_FILE, JSON.stringify(defaultProducts, null, 2));
}

function getProducts() {
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
}
function saveProducts(products) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(products, null, 2));
}

// ── Клиент күйін сақтау (сессия) ─────────────────────────────────────────────
const sessions = {};
function getSession(from) {
  if (!sessions[from]) sessions[from] = { lang: null, step: 'start', cart: [] };
  return sessions[from];
}

// ── Аудармалар ────────────────────────────────────────────────────────────────
const T = {
  kz: {
    welcome: '👗 Сәлем! Дүкенімізге қош келдіңіз!\n\n1️⃣ Каталогты көру\n2️⃣ Тапсырыс беру\n3️⃣ Төлем ақпараты\n\nНөмір жазыңыз немесе сөз жазыңыз:',
    chooseLang: '🌐 Тіл таңдаңыз:\n\n1 - Қазақша\n2 - Русский',
    catalog: '📋 Каталогымыз:\n\n',
    askNum: '\nНөмір жазыңыз (мыс: 1):',
    productDetail: (p) =>
      `${p.emoji} *${p.name.kz}*\n💰 Баға: ${Number(p.price).toLocaleString()} ₸\n📝 ${p.desc.kz}\n📐 Размерлер: ${p.sizes.join(', ')}\n🎨 Түстер: ${p.colors.kz}\n\n✅ Тапсырыс беру үшін "тапсырыс ${p.id}" жазыңыз`,
    orderStart: (p) => `✅ Жақсы! *${p.name.kz}* таңдадыңыз.\n\nҚай размер? (${p.sizes.join(', ')})\nРазмер жазыңыз:`,
    askAddress: (size) => `📐 Размер: *${size}*\n\nЖеткізу адресіңізді жазыңыз:`,
    orderDone: (p, size, address) =>
      `🎉 Тапсырысыңыз қабылданды!\n\n👗 ${p.name.kz}\n📐 Размер: ${size}\n📍 Адрес: ${address}\n💰 Сома: ${Number(p.price).toLocaleString()} ₸\n\n💳 Төлем:\nKaspi: +7 705 000 0000 (Дүкен иесі)\n\nТөлегеннен кейін скриншот жіберіңіз. Менеджер 10 минутта хабарласады! 📞`,
    payment: '💳 Төлем тәсілдері:\n\n🏦 Kaspi: +7 705 000 0000\n💵 Нақты ақша: курьермен\n\nСұрақ болса жазыңыз!',
    noUnderstand: '🙏 Түсінбедім. Каталог үшін *1* жазыңыз немесе *каталог* деп жазыңыз.',
    outOfStock: '😔 Қазір қорда жоқ. Басқа өнімді таңдаңыз.'
  },
  ru: {
    welcome: '👗 Привет! Добро пожаловать в наш магазин!\n\n1️⃣ Посмотреть каталог\n2️⃣ Сделать заказ\n3️⃣ Способы оплаты\n\nНапишите номер или слово:',
    chooseLang: '🌐 Выберите язык:\n\n1 - Қазақша\n2 - Русский',
    catalog: '📋 Наш каталог:\n\n',
    askNum: '\nНапишите номер (напр: 1):',
    productDetail: (p) =>
      `${p.emoji} *${p.name.ru}*\n💰 Цена: ${Number(p.price).toLocaleString()} ₸\n📝 ${p.desc.ru}\n📐 Размеры: ${p.sizes.join(', ')}\n🎨 Цвета: ${p.colors.ru}\n\n✅ Чтобы заказать, напишите "заказ ${p.id}"`,
    orderStart: (p) => `✅ Отлично! Вы выбрали *${p.name.ru}*.\n\nКакой размер? (${p.sizes.join(', ')})\nНапишите размер:`,
    askAddress: (size) => `📐 Размер: *${size}*\n\nНапишите адрес доставки:`,
    orderDone: (p, size, address) =>
      `🎉 Ваш заказ принят!\n\n👗 ${p.name.ru}\n📐 Размер: ${size}\n📍 Адрес: ${address}\n💰 Сумма: ${Number(p.price).toLocaleString()} ₸\n\n💳 Оплата:\nKaspi: +7 705 000 0000 (Владелец магазина)\n\nПришлите скриншот после оплаты. Менеджер свяжется за 10 минут! 📞`,
    payment: '💳 Способы оплаты:\n\n🏦 Kaspi: +7 705 000 0000\n💵 Наличными: курьеру\n\nЕсть вопросы — пишите!',
    noUnderstand: '🙏 Не понял. Напишите *1* для каталога или *каталог*.',
    outOfStock: '😔 Нет в наличии. Выберите другой товар.'
  }
};

function getCatalogText(lang) {
  const products = getProducts();
  let text = T[lang].catalog;
  products.forEach((p, i) => {
    if (p.inStock) {
      text += `${i + 1}. ${p.emoji} ${p.name[lang]} — ${Number(p.price).toLocaleString()} ₸\n`;
    }
  });
  text += T[lang].askNum;
  return text;
}

// ── Twilio webhook ────────────────────────────────────────────────────────────
app.post('/webhook', (req, res) => {
  const from = req.body.From;
  const body = (req.body.Body || '').trim();
  const session = getSession(from);
  const twiml = new twilio.twiml.MessagingResponse();
  const products = getProducts();

  let reply = '';

  // Тіл таңдалмаған — алдымен тіл сұра
  if (!session.lang) {
    if (body === '1') { session.lang = 'kz'; reply = T.kz.welcome; }
    else if (body === '2') { session.lang = 'ru'; reply = T.ru.welcome; }
    else { reply = T.kz.chooseLang; }
    twiml.message(reply);
    return res.type('text/xml').send(twiml.toString());
  }

  const lang = session.lang;
  const lc = body.toLowerCase();

  // Тіл ауыстыру
  if (lc === 'тіл' || lc === 'язык' || lc === 'change language') {
    session.lang = null; session.step = 'start';
    reply = T.kz.chooseLang;
  }
  // Сәлем / бастау
  else if (lc.match(/сәлем|привет|салем|hello|hi|start|бастау|начать/)) {
    session.step = 'start';
    reply = T[lang].welcome;
  }
  // Каталог
  else if (lc === '1' || lc.match(/катал|товар|өнім|одежда|көру/)) {
    session.step = 'catalog';
    reply = getCatalogText(lang);
  }
  // Төлем
  else if (lc === '3' || lc.match(/тöлем|оплат|payment|kaspi|каспи/)) {
    reply = T[lang].payment;
  }
  // Өнімді таңдау (каталогтан нөмір)
  else if (session.step === 'catalog' && /^\d+$/.test(body)) {
    const idx = parseInt(body) - 1;
    if (idx >= 0 && idx < products.length && products[idx].inStock) {
      session.selectedProduct = products[idx].id;
      session.step = 'view_product';
      reply = T[lang].productDetail(products[idx]);
    } else {
      reply = T[lang].noUnderstand + '\n' + getCatalogText(lang);
    }
  }
  // Тапсырыс беру (тапсырыс 1 / заказ 1)
  else if (lc === '2' || lc.match(/тапсырыс|заказ|order/) ) {
    const match = lc.match(/(\d+)/);
    const pid = match ? parseInt(match[1]) : session.selectedProduct;
    const product = products.find(p => p.id === pid) || products[0];
    if (product && product.inStock) {
      session.selectedProduct = product.id;
      session.step = 'ask_size';
      reply = T[lang].orderStart(product);
    } else {
      reply = T[lang].outOfStock + '\n' + getCatalogText(lang);
    }
  }
  // Размер таңдау
  else if (session.step === 'ask_size') {
    const product = products.find(p => p.id === session.selectedProduct);
    const sizeInput = body.toUpperCase();
    if (product && product.sizes.map(s => s.toUpperCase()).includes(sizeInput)) {
      session.selectedSize = sizeInput;
      session.step = 'ask_address';
      reply = T[lang].askAddress(sizeInput);
    } else {
      reply = lang === 'kz'
        ? `❌ Дұрыс размер жоқ. Мыналардан таңдаңыз: ${product ? product.sizes.join(', ') : ''}`
        : `❌ Неверный размер. Выберите из: ${product ? product.sizes.join(', ') : ''}`;
    }
  }
  // Адрес алу — тапсырыс аяқталды
  else if (session.step === 'ask_address') {
    const product = products.find(p => p.id === session.selectedProduct);
    const size = session.selectedSize;
    reply = T[lang].orderDone(product, size, body);
    // Логке жазу
    const orderLog = {
      date: new Date().toISOString(),
      from,
      product: product.name[lang],
      size,
      address: body,
      price: product.price,
      lang
    };
    const logFile = path.join(__dirname, 'data', 'orders.json');
    let orders = [];
    if (fs.existsSync(logFile)) orders = JSON.parse(fs.readFileSync(logFile));
    orders.push(orderLog);
    fs.writeFileSync(logFile, JSON.stringify(orders, null, 2));
    session.step = 'start';
    session.selectedProduct = null;
    session.selectedSize = null;
  }
  else {
    reply = T[lang].noUnderstand;
  }

  twiml.message(reply);
  res.type('text/xml').send(twiml.toString());
});

// ── Админ API ─────────────────────────────────────────────────────────────────
const ADMIN_KEY = process.env.ADMIN_KEY || 'admin123';

function checkAdmin(req, res, next) {
  const key = req.headers['x-admin-key'] || req.query.key;
  if (key !== ADMIN_KEY) return res.status(403).json({ error: 'Forbidden' });
  next();
}

app.get('/api/products', checkAdmin, (req, res) => {
  res.json(getProducts());
});

app.post('/api/products', checkAdmin, (req, res) => {
  const products = getProducts();
  const newProduct = {
    id: Date.now(),
    name: req.body.name || { kz: 'Жаңа өнім', ru: 'Новый товар' },
    price: req.body.price || '0',
    desc: req.body.desc || { kz: '', ru: '' },
    sizes: req.body.sizes || ['M', 'L'],
    colors: req.body.colors || { kz: '', ru: '' },
    emoji: req.body.emoji || '👕',
    images: [],
    inStock: true
  };
  products.push(newProduct);
  saveProducts(products);
  res.json(newProduct);
});

app.put('/api/products/:id', checkAdmin, (req, res) => {
  const products = getProducts();
  const idx = products.findIndex(p => p.id == req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  products[idx] = { ...products[idx], ...req.body, id: products[idx].id };
  saveProducts(products);
  res.json(products[idx]);
});

app.delete('/api/products/:id', checkAdmin, (req, res) => {
  let products = getProducts();
  products = products.filter(p => p.id != req.params.id);
  saveProducts(products);
  res.json({ ok: true });
});

app.post('/api/products/:id/upload', checkAdmin, upload.single('image'), (req, res) => {
  const products = getProducts();
  const idx = products.findIndex(p => p.id == req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  const imgUrl = `/uploads/${req.file.filename}`;
  products[idx].images = products[idx].images || [];
  products[idx].images.push(imgUrl);
  saveProducts(products);
  res.json({ url: imgUrl });
});

app.get('/api/orders', checkAdmin, (req, res) => {
  const logFile = path.join(__dirname, 'data', 'orders.json');
  if (!fs.existsSync(logFile)) return res.json([]);
  res.json(JSON.parse(fs.readFileSync(logFile)));
});

// ── Админ панелі (HTML) ───────────────────────────────────────────────────────
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.get('/', (req, res) => {
  res.send('<h2>WhatsApp Bot is running ✅</h2><p><a href="/admin">Admin Panel →</a></p>');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Bot running on port ${PORT}`));

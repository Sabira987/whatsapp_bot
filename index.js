const express = require('express');
const bodyParser = require('body-parser');
const twilio = require('twilio');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('public'));

// ─── Деректер сақтау / Хранение данных ───────────────────────────────────────
const DATA_FILE = './data.json';

function loadData() {
  if (!fs.existsSync(DATA_FILE)) {
    const defaults = {
      botActive: true,
      delaySeconds: 15,
      language: 'both',
      texts: {
        greeting: 'Сәлеметсіз бе! 👋 Үй заттары дүкеніне қош келдіңіз!\nЗдравствуйте! Добро пожаловать в наш магазин товаров для дома!\n\nМен сізге көмектесе аламын / Я могу вам помочь:\n• Тауарлар тізімі / Список товаров — "каталог"\n• Бағасы / Цена — "баға" немесе "цена"\n• Жеткізу / Доставка — "доставка"\n• Байланыс / Контакты — "контакт"',
        contacts: '📞 +7 700 000 00 00\n🏪 Алматы, үйіңіздің мекенжайы\n⏰ Дүйсенбі-Жексенбі: 9:00-21:00',
        delivery: '🚚 Алматы бойынша жеткізу: 500₸\nДоставка по Алматы: 500₸\n✅ 5000₸-тан жоғары тапсырыста тегін!\nБесплатно от 5000₸!',
        unknown: 'Сұрағыңыз үшін рахмет! 🙏\nСпасибо за вопрос!\n\nБіздің менеджер жақын арада хабарласады.\nНаш менеджер скоро свяжется с вами.\n\n📞 +7 700 000 00 00'
      },
      products: [
        { id: 1, name: 'Жұмсақ диван / Мягкий диван', price: 85000, desc: '3 адамдық, сұр түс / 3-местный, серый цвет', photo: '', video: '' },
        { id: 2, name: 'Ас үй үстелі / Кухонный стол', price: 32000, desc: '140×80 см, ағаш / 140×80 см, дерево', photo: '', video: '' },
        { id: 3, name: 'Сөреқор / Стеллаж', price: 18500, desc: '5 қабат, ақ / 5 полок, белый', photo: '', video: '' }
      ]
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(defaults, null, 2));
    return defaults;
  }
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}

function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// ─── Бот логикасы / Логика бота ──────────────────────────────────────────────
function getBotReply(msg, data) {
  const lower = msg.toLowerCase().trim();
  const { texts, products } = data;

  // Сәлемдесу
  if (/сәлем|салем|привет|здравствуй|сәлеметсіз|hello|hi|бот|старт|start/.test(lower)) {
    return texts.greeting;
  }

  // Каталог / барлық тауарлар
  if (/каталог|тауар|товар|ассортимент|өнім|список|барлығы|все/.test(lower)) {
    if (products.length === 0) return 'Қазір тауар жоқ / Товаров пока нет 😔';
    const list = products.map(p =>
      `🛋 *${p.name}*\n💰 ${p.price.toLocaleString()}₸\n📝 ${p.desc}` +
      (p.photo ? `\n🖼 ${p.photo}` : '') +
      (p.video ? `\n🎬 ${p.video}` : '')
    ).join('\n\n');
    return `📦 *Тауарлар тізімі / Список товаров:*\n\n${list}`;
  }

  // Баға сұрау
  if (/баға|бағасы|цена|стоимость|почем|қанша тұрады|сколько/.test(lower)) {
    const list = products.map(p => `• ${p.name} — *${p.price.toLocaleString()}₸*`).join('\n');
    return `💰 *Бағалар / Цены:*\n\n${list}\n\nТапсырыс беру үшін / Для заказа:\n${texts.contacts}`;
  }

  // Жеткізу
  if (/жеткізу|доставка|delivery|жеткізе|привезут/.test(lower)) {
    return texts.delivery;
  }

  // Байланыс
  if (/байланыс|контакт|телефон|адрес|мекен|связь/.test(lower)) {
    return texts.contacts;
  }

  // Нақты тауар іздеу
  for (const p of products) {
    const names = p.name.toLowerCase().split('/').map(s => s.trim());
    const keywords = names.flatMap(n => n.split(' '));
    if (keywords.some(k => k.length > 3 && lower.includes(k))) {
      return `📦 *${p.name}*\n\n💰 Баға / Цена: *${p.price.toLocaleString()}₸*\n📝 ${p.desc}` +
        (p.photo ? `\n\n🖼 Фото: ${p.photo}` : '') +
        (p.video ? `\n🎬 Видео: ${p.video}` : '') +
        `\n\n✅ Тапсырыс беру үшін жазыңыз!\nДля заказа — напишите нам!`;
    }
  }

  return texts.unknown;
}

// ─── WhatsApp Webhook ─────────────────────────────────────────────────────────
app.post('/webhook', (req, res) => {
  const data = loadData();

  if (!data.botActive) {
    res.type('text/xml').send('<Response></Response>');
    return;
  }

  const incomingMsg = req.body.Body || '';
  const from = req.body.From || '';
  const delayMs = (data.delaySeconds || 15) * 1000;

  console.log(`[${new Date().toISOString()}] Хабарлама: ${from} → "${incomingMsg}"`);

  // 15 секунд кейін жауап / Ответ через 15 секунд
  setTimeout(() => {
    const reply = getBotReply(incomingMsg, data);
    const twiml = new twilio.twiml.MessagingResponse();
    twiml.message(reply);

    // Twilio арқылы жіберу
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    client.messages.create({
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
      to: from,
      body: reply
    }).then(msg => {
      console.log(`✅ Жіберілді / Отправлено: ${msg.sid}`);
    }).catch(err => {
      console.error('❌ Қате / Ошибка:', err.message);
    });
  }, delayMs);

  // Twilio-ға бірден бос жауап (ол кейін жібереміз)
  res.type('text/xml').send('<Response></Response>');
});

// ─── Admin API ────────────────────────────────────────────────────────────────
app.get('/api/data', (req, res) => res.json(loadData()));

app.post('/api/data', (req, res) => {
  saveData(req.body);
  res.json({ ok: true });
});

app.get('/api/status', (req, res) => {
  res.json({ status: 'running', time: new Date().toISOString() });
});

// ─── Admin панелі / Панель ────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Бот іске қосылды / Бот запущен: http://localhost:${PORT}`);
  console.log(`📱 Webhook URL: http://your-domain/webhook`);
});

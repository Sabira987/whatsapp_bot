# 👗 WhatsApp Clothing Store Bot

WhatsApp арқылы киім сататын бот. Twilio + Node.js + Render.com

## 🚀 Орнату

### 1. Render Environment Variables
Render → Settings → Environment Variables:
```
ADMIN_KEY = өзіңіз ойлап тапқан құпия кілт (мыс: mySuperSecret2025)
PORT = 3000
```

### 2. Twilio Webhook
Twilio Console → Messaging → WhatsApp Sandbox → Sandbox Settings:
```
WHEN A MESSAGE COMES IN:
https://whatsapp-bot-tq63.onrender.com/webhook
Method: HTTP POST
```

### 3. Админ панелі
```
https://whatsapp-bot-tq63.onrender.com/admin
```
Кілтті (ADMIN_KEY) енгізіп кіріңіз.

## 📱 Бот мүмкіндіктері
- Қазақша / Орысша екі тілде жұмыс жасайды
- Каталогты автоматты көрсетеді
- Размер, адрес сұрайды
- Тапсырысты orders.json-ға сақтайды
- Админ панелінен өнім қосу/өзгерту/жою
- Фото жүктеу мүмкіндігі

## 🛠 Локальды іске қосу
```bash
npm install
node index.js
```

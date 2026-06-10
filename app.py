import os
import json
from flask import Flask, request, jsonify, send_file
from twilio.twiml.messaging_response import MessagingResponse
import anthropic
from functools import wraps

app = Flask(__name__)
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "admin123")
PRODUCTS_FILE = "products.json"
client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))

def load_products():
    if os.path.exists(PRODUCTS_FILE):
        with open(PRODUCTS_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return {"products": [], "shop_info": {"name": "Дүкен", "description": "", "seller_name": "Айгүл"}}

def save_products(data):
    with open(PRODUCTS_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

def build_system_prompt():
    data = load_products()
    shop = data.get("shop_info", {})
    products = data.get("products", [])
    seller_name = shop.get("seller_name", "Айгүл")

    catalog_text = ""
    for p in products:
        catalog_text += f"""
— {p.get('name', '')}
  Баға: {p.get('price', '')}
  Размер: {p.get('sizes', '')}
  Сипаттама: {p.get('description', '')}
  Фото: {p.get('photo_url', '') or 'жоқ'}
  Видео: {p.get('video_url', '') or 'жоқ'}
"""

    return f"""Сен — {seller_name}, {shop.get('name', 'дүкеннің')} сатушысысың. {shop.get('description', '')}

МАҢЫЗДЫ ЕРЕЖЕЛЕР:
1. Ешқашан өзіңнің бот немесе AI екеніңді айтпа — сен тірі адамсың, {seller_name} атты сатушысың
2. Клиент қай тілде жазса, сол тілде жауап бер (қазақша немесе орысша)
3. Достық, жылы, табиғи түрде сөйлес — смайл, эмодзи қолдана аласың
4. Фото немесе видео бар болса — сілтемені жібер, "міне, қарап шығыңыз 😊" деп
5. Размер, баға, жеткізу туралы нақты жауап бер
6. Сатып алуға жұмсақ ынталандыр, күштеме
7. Егер тауар жоқ болса — "кешіріңіз, бұл тауар бізде жоқ" де
8. Табиғи сөйле: "иә", "жарайды", "міне", "сізге ұнайды деп ойлаймын" т.б.
9. Егер клиент "жанды адаммен сөйлесем" десе — "мен онлайнмын, айтыңыз 😊" де

Каталог:
{catalog_text if catalog_text else "Тауарлар әзірге жоқ."}

Жауаптарың қысқа, нақты, адамша болсын. Ресми тон ЕМЕС."""

conversation_history = {}

@app.route("/webhook", methods=["POST"])
def webhook():
    incoming_msg = request.values.get("Body", "").strip()
    from_number = request.values.get("From", "")
    media_url = request.values.get("MediaUrl0", "")

    if from_number not in conversation_history:
        conversation_history[from_number] = []

    user_content = incoming_msg
    if media_url:
        user_content += f"\n[Клиент фото/видео жіберді]"

    if not user_content.strip():
        user_content = "[Клиент медиа файл жіберді]"

    conversation_history[from_number].append({"role": "user", "content": user_content})

    if len(conversation_history[from_number]) > 30:
        conversation_history[from_number] = conversation_history[from_number][-30:]

    resp = MessagingResponse()
    try:
        ai = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=600,
            system=build_system_prompt(),
            messages=conversation_history[from_number]
        )
        reply = ai.content[0].text
        conversation_history[from_number].append({"role": "assistant", "content": reply})
        resp.message(reply)
    except Exception as e:
        print(f"Error: {e}")
        resp.message("Кешіріңіз, қазір байланыс нашар. Бір минуттан соң жазыңыз 🙏")

    return str(resp)

def check_admin(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if request.headers.get("X-Admin-Password") != ADMIN_PASSWORD:
            return jsonify({"error": "Рұқсат жоқ"}), 401
        return f(*args, **kwargs)
    return decorated

@app.route("/admin/products", methods=["GET"])
@check_admin
def get_products():
    return jsonify(load_products())

@app.route("/admin/products", methods=["POST"])
@check_admin
def add_product():
    data = load_products()
    product = request.json
    existing_ids = [p.get("id", 0) for p in data["products"]]
    product["id"] = max(existing_ids, default=0) + 1
    data["products"].append(product)
    save_products(data)
    return jsonify({"success": True, "product": product})

@app.route("/admin/products/<int:pid>", methods=["PUT"])
@check_admin
def update_product(pid):
    data = load_products()
    for i, p in enumerate(data["products"]):
        if p.get("id") == pid:
            data["products"][i].update(request.json)
            save_products(data)
            return jsonify({"success": True})
    return jsonify({"error": "Табылмады"}), 404

@app.route("/admin/products/<int:pid>", methods=["DELETE"])
@check_admin
def delete_product(pid):
    data = load_products()
    data["products"] = [p for p in data["products"] if p.get("id") != pid]
    save_products(data)
    return jsonify({"success": True})

@app.route("/admin/shop-info", methods=["PUT"])
@check_admin
def update_shop_info():
    data = load_products()
    data["shop_info"].update(request.json)
    save_products(data)
    return jsonify({"success": True})

@app.route("/admin")
def admin_panel():
    return send_file("admin.html")

@app.route("/")
def home():
    return "Bot is running 🤖"

if __name__ == "__main__":
    if not os.path.exists(PRODUCTS_FILE):
        save_products({
            "products": [],
            "shop_info": {"name": "Менің дүкенім", "description": "Сапалы киімдер", "seller_name": "Айгүл"}
        })
    app.run(debug=False, host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))

from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os

app = Flask(__name__)
CORS(app)  # Permite que o frontend (HTML) se comunique com o servidor Python

DB_FILE = 'users.json'

def load_db():
    if not os.path.exists(DB_FILE):
        return {"users": [], "reviews": []}
    with open(DB_FILE, 'r', encoding='utf-8') as f:
        return json.load(f)

def save_db(db):
    with open(DB_FILE, 'w', encoding='utf-8') as f:
        json.dump(db, f, indent=4, ensure_ascii=False)

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    db = load_db()
    
    # Procura usuário pelo email (ou cria se não existir - simulando o comportamento anterior)
    user = next((u for u in db['users'] if u['email'] == data['email']), None)
    
    if not user:
        user = {
            "name": data.get('name', 'Visitante'),
            "email": data['email'],
            "pic": data.get('pic', ''),
            "points": 0,
            "orders": []
        }
        db['users'].append(user)
        save_db(db)
        
    return jsonify(user)

@app.route('/update_points', methods=['POST'])
def update_points():
    data = request.json
    db = load_db()
    
    user = next((u for u in db['users'] if u['email'] == data['email']), None)
    if user:
        user['points'] += data.get('points', 0)
        if 'order' in data:
            user['orders'].insert(0, data['order'])
        save_db(db)
        return jsonify({"success": True, "new_points": user['points']})
    
    return jsonify({"error": "User not found"}), 404

@app.route('/ranking', methods=['GET'])
def get_ranking():
    db = load_db()
    # Ordena usuários por pontos (Top 10)
    sorted_users = sorted(db['users'], key=lambda x: x['points'], reverse=True)
    ranking = [{
        "name": u['name'],
        "points": u['points'],
        "pic": u.get('pic', '')
    } for u in sorted_users[:10]]
    return jsonify(ranking)

@app.route('/add_review', methods=['POST'])
def add_review():
    data = request.json
    db = load_db()
    
    review = {
        "user_email": data['email'],
        "user_name": data['name'],
        "product": data['product'],
        "rating": data['rating'],
        "comment": data['comment'],
        "date": data['date']
    }
    db['reviews'].append(review)
    
    # Dá pontos por avaliar (5 pontos como sugerido)
    user = next((u for u in db['users'] if u['email'] == data['email']), None)
    if user:
        user['points'] += 5
        
    save_db(db)
    return jsonify({"success": True, "points_earned": 5})

if __name__ == '__main__':
    print("Servidor Ouro Negro rodando em http://localhost:5000")
    app.run(port=5000, debug=True)

from flask import Flask,request,jsonify
from flask_cors import CORS
import sqlite3
import bcrypt
from flask_jwt_extended import JWTManager, create_access_token



app = Flask(__name__)
CORS(app)
app.config['JWT_SECRET_KEY']='your_secret_key'
jwt = JWTManager(app)
DB = "database.db"
def get_db():
    conn = sqlite3.connect(DB)
    conn.row_factory = sqlite3.Row
    return conn
def init_db():
    conn = get_db()
    conn.execute('''
             CREATE TABLE IF NOT EXISTS spots(id INTEGER PRIMARY KEY AUTOINCREMENT,
             name TEXT NOT NULL,
             type TEXT,
             description TEXT,
             latitude REAL NOT NULL,
             longitude REAL NOT NULL,
             last_seen DATETIME DEFAULT CURRENT_TIMESTAMP
             )    
                 
                 
                 ''')
    conn.execute('''
                CREATE TABLE IF NOT EXISTS users(
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL UNIQUE,
                password TEXT NOT NULL,
                role TEXT DEFAULT 'user'
                                          )
                        ''')
    conn.commit()
    conn.close()

@app.route('/spots',methods =['GET'])
def get_spots():
    conn = get_db()
    spots = conn.execute("select * from spots").fetchall()
    conn.close()
    return jsonify([dict(row) for row in spots])
@app.route('/spots', methods=['POST'])
def add_spot():
    data = request.get_json()
    name = data['name']
    type = data.get('type')
    description = data.get('description')
    latitude = data['latitude']
    longitude = data['longitude']
    
    conn = get_db()
    cursor =conn.execute('''
                 
                 INSERT INTO spots(name,type,description,latitude,longitude)
                 VALUES (?,?,?,?,?)
                 ''',(name,type,description,latitude,longitude))
    conn.commit()
    new_id = cursor.lastrowid
    conn.close()
    return jsonify({"id": new_id,
        "name": name,
        "type": type,
        "description": description,
        "latitude": latitude,
        "longitude": longitude}),201
@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    if not password or not username:
        return jsonify({"error":"username and password required"}),400
    conn = sqlite3.connect("database.db")
    cursor = conn.cursor()
    
    cursor.execute("SELECT * from users where username = ?",(username,))
    existing_user=cursor.fetchone()
    if existing_user:
        conn.close()
        return jsonify({"error": "username already exists"}),400
    
    hashed_password = bcrypt.hashpw(password.encode('utf-8'),bcrypt.gensalt())
    
    cursor.execute("INSERT INTO users(username,password,role) VALUES(?,?,?)",(username,hashed_password,'user'))
    conn.commit()
    conn.close()
    return jsonify({"message" : "user registered succesfully"}),201

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username=data.get('username')
    password =data.get('password')
    conn = sqlite3.connect("database.db")
    cursor =conn.cursor()
    cursor.execute("SELECT * FROM users WHERE username = ?", (username,))
    user = cursor.fetchone()

    conn.close()
    if not user:
        return jsonify({"error":"user not found"}),400
    db_password=user[2]
    if not bcrypt.checkpw(password.encode('utf-8'),db_password):
        return jsonify({"error":"wrong password"}),401
    token = create_access_token(identity=username)
    return jsonify({"token":token}),200    

if __name__ == "__main__":
    init_db()
    app.run(debug=True)
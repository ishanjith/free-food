from flask import Flask,request,jsonify
from flask_cors import CORS
import sqlite3
app = Flask(__name__)
CORS(app)
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
if __name__ == "__main__":
    init_db()
    app.run(debug=True)
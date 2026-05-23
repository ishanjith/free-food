from flask import Flask,request,jsonify
from flask_cors import CORS
import bcrypt
from flask_jwt_extended import JWTManager, create_access_token
from functools import wraps
import jwt
import psycopg2
import psycopg2.extras
import os



app = Flask(__name__)
CORS(app)
app.config['JWT_SECRET_KEY']='your_secret_key'
jwt_manager = JWTManager(app)
def get_db():
    conn = psycopg2.connect(os.environ.get('DATABASE_URL'))
    
    return conn
def init_db():
    conn = get_db()
    cursor=conn.cursor()
    cursor.execute('''
             CREATE TABLE IF NOT EXISTS spots(id SERIAL PRIMARY KEY,
             name TEXT NOT NULL,
             type TEXT,
             description TEXT,
             latitude REAL NOT NULL,
             longitude REAL NOT NULL,
             last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
             status TEXT DEFAULT 'pending'
             )    
                 
                 
                 ''')
    cursor.execute('''
                CREATE TABLE IF NOT EXISTS users(
                id SERIAL PRIMARY KEY,
                username TEXT NOT NULL UNIQUE,
                password TEXT NOT NULL,
                role TEXT DEFAULT 'user'
                                          )
                        ''')
    conn.commit()
    conn.close()
SECRET_KEY = "your_secret_key"
def token_required(f):
    @wraps(f)
    def decorated(*args,**kwargs):
        token=None
        auth_header=request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token=auth_header.split(" ")[1]
        if not token:
            return jsonify({"message":"token missisng"}),401
        try:
            data =jwt.decode(token,SECRET_KEY,algorithms=["HS256"])
        except jwt.ExpiredSignatureError:
            return jsonify({"message":"token expired"}),401
        except jwt.InvalidTokenError:
            return jsonify({"message":"invalid token"}),401
        return f(*args,**kwargs)
    return decorated

@app.route('/spots',methods =['GET'])

def get_spots():
    conn = get_db()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cursor.execute("select * from spots where status = 'approved'")
    spots=cursor.fetchall()
    conn.close()
    return jsonify([dict(row) for row in spots])
@app.route('/spots', methods=['POST'])
@token_required
def add_spot():
    data = request.get_json()
    name = data['name']
    type = data.get('type')
    description = data.get('description')
    latitude = data['latitude']
    longitude = data['longitude']
    
    conn = get_db()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cursor.execute('''
                 
                 INSERT INTO spots(name,type,description,latitude,longitude)
                 VALUES (%s,%s,%s,%s,%s) RETURNING id
                 ''',(name,type,description,latitude,longitude))
    conn.commit()
    new_id = cursor.fetchone()['id']
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
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * from users where username = %s",(username,))
    existing_user=cursor.fetchone()
    if existing_user:
        conn.close()
        return jsonify({"error": "username already exists"}),400
    
    hashed_password = bcrypt.hashpw(password.encode('utf-8'),bcrypt.gensalt())
    
    cursor.execute("INSERT INTO users(username,password,role) VALUES(%s,%s,%s)",(username,hashed_password,'user'))
    conn.commit()
    conn.close()
    return jsonify({"message" : "user registered succesfully"}),201

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username=data.get('username')
    password =data.get('password')
    conn = get_db()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    
    cursor.execute("SELECT * FROM users WHERE username = %s", (username,))
    user = cursor.fetchone()

    conn.close()
    if not user:
        return jsonify({"error":"user not found"}),400
    db_password=user['password']
    if not bcrypt.checkpw(password.encode('utf-8'),db_password):
        return jsonify({"error":"wrong password"}),401
    token = create_access_token(identity=username)
    return jsonify({"token":token,"role":user['role']}),200    

def admin_required(f):
    @wraps(f)
    def decorated(*args,**kwargs):
        token = None
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer"):
            token=auth_header.split(" ")[1]
        if not token:
            return jsonify({"message":"token missing"}),401
        try:
            data = jwt.decode(token,SECRET_KEY,algorithms=["HS256"])
            username = data["sub"]
            conn = get_db()
            cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
            
            cursor.execute("SELECT role FROM users WHERE username = %s", (username,))
            result = cursor.fetchone()
            conn.close()
            
            if not result:
                return jsonify({"message": "User not found"}), 401

            role = result['role']
            
            if role != "admin":
                return jsonify({"message": "Forbidden: Admins only"}), 403

        except jwt.ExpiredSignatureError:
            return jsonify({"message": "Token expired"}), 401

        except jwt.InvalidTokenError:
            return jsonify({"message": "Invalid token"}), 401
        return f(*args, **kwargs)

    return decorated
@app.route('/admin/spots', methods = ['GET'])
@admin_required
def get_pending_spots():
    conn = get_db()
    cursor =conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cursor.execute(
        "SELECT * FROM spots WHERE status = 'pending'"
    )
    spots=cursor.fetchall()
    conn.close()

    return jsonify([dict(row) for row in spots])

@app.route('/admin/spots/<int:id>/approve', methods=["PUT"])
@admin_required
def approve_spot(id):
    conn = get_db()
    cursor =conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cursor.execute(
        "UPDATE spots SET status = 'approved' WHERE id = %s",
        (id,)
    )
    conn.commit()
    conn.close()

    return jsonify({"message": f"Spot {id} approved"})

@app.route('/admin/spots/<int:id>/reject', methods=['PUT'])
@admin_required
def reject_spot(id):
    conn = get_db()
    cursor =conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cursor.execute(
        "UPDATE spots SET status = 'rejected' WHERE id = %s",
        (id,)
    )
    conn.commit()
    conn.close()

    return jsonify({"message": f"Spot {id} rejected"})
    
init_db()
if __name__ == "__main__":
    
    app.run(debug=True)
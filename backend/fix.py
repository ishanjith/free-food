import sqlite3
conn = sqlite3.connect('database.db')
conn.execute("UPDATE users SET role = 'admin' WHERE username = 'ishan123'")
conn.commit()
conn.close()
print("done")
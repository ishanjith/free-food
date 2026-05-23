import psycopg2
conn = psycopg2.connect("postgresql://foodfinder_ovim_user:hbOfz2peJWb8ojpuDN8hkQJ9BWSExI7r@dpg-d88le2ojo6nc73d1fspg-a.oregon-postgres.render.com/foodfinder_ovim")
cursor = conn.cursor()
cursor.execute("UPDATE users SET role = 'admin' WHERE username = 'ishanadmin'")
conn.commit()
print("done")
conn.close()
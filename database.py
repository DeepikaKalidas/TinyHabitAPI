import sqlite3

connection = sqlite3.connect("habits.db")

connection.execute("""
CREATE TABLE IF NOT EXISTS habits (
    id integer primary key,
    name text not null,
    completed boolean not null
)
""")

connection.commit()

def get_connection():
    return sqlite3.connect("habits.db")
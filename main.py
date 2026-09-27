from database import get_connection
from fastapi import FastAPI
from pydantic import BaseModel

app=FastAPI();

class Habit(BaseModel):
    name: str
    completed: bool

@app.get("/")
def home():
    return {"message": "TinyHabitAPI is alive!"}

@app.get("/habits")
def get_habits():
    connection=get_connection()
    cursor=connection.execute("SELECT * FROM habits")
    rows=cursor.fetchall()
    connection.close()
    return{ "habits": rows }

@app.post("/habits")
def create_habit(habit: Habit):
    connection=get_connection()
    cursor=connection.execute("INSERT INTO habits (name, completed) VALUES (?, ?)", (habit.name, habit.completed))
    connection.commit()
    connection.close()
    return {"message": f"Created {habit.name}!"}

@app.delete("/habits/{habit_id}")
def delete_habit(habit_id:int):
    connection=get_connection()
    connection.execute(
        "DELETE FROM habits WHERE id=?",
        (habit_id,)
    )
    connection.commit()
    connection.close()
    return {"message": f"Deleted habit with id {habit_id}!"}

@app.put("/habits/{habit_id}")
def update_habit(habit_id: int, habit: Habit):
    connection=get_connection()
    connection.execute(
        "UPDATE habits SET name=?, completed=? WHERE id=?",
        (habit.name, habit.completed, habit_id)
    )
    connection.commit()
    connection.close()
    return {"message": f"Updated habit with id {habit_id}!"}

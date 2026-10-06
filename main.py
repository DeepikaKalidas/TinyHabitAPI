from database import get_connection
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app=FastAPI();

class Habit(BaseModel):
    name: str
    priority: int
    frequency: int          #for now: per week
    completion_state: bool

@app.get("/")
def home():
    return {"message": "Welcome to the TinyHabitAPI!"}

@app.get("/habits")
def get_habits():
    connection=get_connection()
    cursor=connection.execute("SELECT * FROM habits")
    rows=cursor.fetchall()
    habits = []
    for row in rows:
        habit = {
            "id": row[0],
            "name": row[1],
            "priority": row[2],
            "frequency": row[3],
            "completion_state": bool(row[4])
        }
        habits.append(habit)
    connection.close()
    return{ "habits": habits }

@app.post("/habits")
def create_habit(habit: Habit):
    connection=get_connection()
    cursor=connection.execute("INSERT INTO habits (name, priority, frequency, completion_state) VALUES (?, ?, ?, ?)", (habit.name, habit.priority, habit.frequency, habit.completion_state))
    habit_id=cursor.lastrowid
    connection.commit()
    connection.close()
    habit_data={
        "id": habit_id,
        "name": habit.name,
        "priority": habit.priority,
        "frequency": habit.frequency,
        "completion_state": habit.completion_state
    }
    return {"habit": habit_data}

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
        "UPDATE habits SET name=?, priority=?, frequency=?, completion_state=? WHERE id=?",
        (habit.name, habit.priority, habit.frequency, habit.completion_state, habit_id)
    )
    connection.commit()
    connection.close()
    return {"message": f"Updated habit with id {habit_id}!"}

@app.get("/habits/{habit_id}")
def get_habit(habit_id: int):
    connection=get_connection()
    cursor=connection.execute(
        "SELECT * FROM habits WHERE id=?",
        (habit_id,)
    )
    row=cursor.fetchone()
    habit ={
        "id": row[0],
        "name": row[1],
        "priority": row[2],
        "frequency": row[3],
        "completion_state": bool(row[4])
    } if row else None
    connection.close()
    if row:
        return {"habit": habit}
    else:
        raise HTTPException(status_code=404, detail=f"Habit with id {habit_id} not found.")
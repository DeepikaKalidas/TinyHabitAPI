from fastapi import FastAPI
from pydantic import BaseModel

habits=[]
next_id=1
app=FastAPI();

class Habit(BaseModel):
    name: str
    completed: bool

@app.get("/")
def home():
    return {"message": "TinyHabitAPI is alive!"}

@app.get("/habits")
def get_habits():
    return{ "habits": habits }

@app.post("/habits")
def create_habit(habit: Habit):
    global next_id
    habits.append({
        "id":next_id,
        "name": habit.name,
        "completed": False
    })
    next_id+=1
    return {"message":f"Created {habit.name}!"}

@app.delete("/habits/{habit_id}")
def delete_habit(habit_id:int):
    global habits
    habits=[habit for habit in habits if habit["id"]!=habit_id]
    return {"message":f"Deleted habit with id {habit_id}!"}

@app.put("/habits/{habit_id}")
def update_habit(habit_id: int, habit: Habit):
    for h in habits:
        if h["id"]==habit_id:
            h["name"]=habit.name
            h["completed"]=habit.completed
            
            return {"message":f"Updated habit with id {habit_id}!"}
    return {"message":f"Habit with id {habit_id} not found!"}
from fastapi import FastAPI
app=FastAPI();

@app.get("/")
def home():
    return {"message": "TinyHabitAPI is alive!"}

@app.get("/habits")
def get_habits():
    return{
        "habits":[
            "Do LeetCode",
            "Play Footie",
            "Study"
        ]
    }

@app.post("/habits")
def create_habit():
    return {"message":"Habit created!"} 
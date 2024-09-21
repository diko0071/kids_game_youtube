from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from .services import get_transcript, generate_exercise_with_transcript
import json
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], 
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"], 
)

class TranscriptionRequest(BaseModel):
    url: str

class ExerciseRequest(BaseModel):
    current_time: str
    previous_answer: str
    transcript: str

@app.get("/")
async def read_root():
    return {"message": "Hello World"}

@app.post("/generate_transcription")
async def generate_transcription(request: TranscriptionRequest):
    transcript = await get_transcript(request.url)
    return {"transcript": transcript}

@app.post("/generate_exercise")
async def generate_exercise(request: ExerciseRequest):
    exercise = await generate_exercise_with_transcript(
        request.current_time, request.previous_answer, request.transcript
    )
    json_exercise = json.loads(exercise)
    return {
        "question": json_exercise["question"],
        "options": json_exercise["options"],
        "correct_option": json_exercise["correct_option"]
    }
from fastapi import FastAPI, BackgroundTasks
from src.ai_convertor.routers import router as ai_convertor_router
from src.notion.routers import router as notion_router
from src.telegram_bot.routers import router as telegram_bot_router
from src.telegram_bot.services import handle_telegram_update, set_webhook
import json

app = FastAPI()

@app.get("/")
async def read_root():
    return {"message": "Hello World"}

@app.post("/youtube-transcription")
async def youtube_transcription(url: str):
    return {"message": "Hello World"}

from langchain_openai import ChatOpenAI, OpenAI
from langchain_core.messages import HumanMessage, SystemMessage
import os 
from langchain_community.document_loaders import YoutubeLoader
from youtube_transcript_api import YouTubeTranscriptApi
from .prompts import generate_exercise_prompt
import json

async def generate_exercise(transcript: str, current_time: int, previous_exercises: str):
    llm = ChatOpenAI(model_name="gpt-4o-2024-05-13", temperature=0, api_key=os.getenv("OPENAI_API_KEY"), response_format={"type": "json_object"})

    messages = [
        SystemMessage(content=generate_exercise_prompt),
        HumanMessage(content=f"Transcript: {transcript}, Current time: {current_time}, Previous exercises: {previous_exercises}"),
    ]

    response = await llm.agenerate([messages])

    return response.generations[0][0].text

async def get_transcript(url: str):
    video_id = url.split("v=")[1]
    
    try:
        transcript = YouTubeTranscriptApi.get_transcript(video_id, languages=['en', 'ru'])
        full_transcript = " ".join([entry['text'] for entry in transcript])
        return full_transcript
    except Exception as e:
        print(f"Error fetching transcript: {str(e)}")
        return None


async def generate_exercise_with_transcript(current_time: int, previous_exercises: str, transcript: str):
    exercise = await generate_exercise(transcript, current_time, previous_exercises)
    print(exercise)
    return exercise
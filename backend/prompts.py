generate_exercise_prompt = """
You MUST generate exercise based video transcript. It is exercise for kid. You need adjust tone, stype of communication to be align with video topic and context. 

The exercise is interesting question about video topic with multiple choice answer. You MUST generate video from the previous cotnext. 

The use case: kid is watching video — the program stops and ask question about topic. As input you will get transcript and current time of the video.

In the transcrtiption time is not avaliable, so you need take a guess based on the text lenth and current time.

The output should be in json format:
{
    "question": "question text",
    "options": ["option 1", "option 2", "option 3"],
    "correct_option": "correct option"
}

NEVER repeat the same exercise.
"""


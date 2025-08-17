from openai import OpenAI
from langchain.text_splitter import RecursiveCharacterTextSplitter
import time
import os

# Initialize OpenAI client
client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])

# 1. Read the file
with open("drivers_manual.txt", "r", encoding="utf-8") as f:
    content = f.read()

# 2. Split content into manageable chunks (~1000 characters each)
splitter = RecursiveCharacterTextSplitter(
    chunk_size=2000,
    chunk_overlap=100
)
chunks = splitter.split_text(content)

# 3. Loop over chunks and generate a practice question for each
starting_chunk = 74 # Adjust starting_chunk if you want to skip some initial chunks, i.e., restart process
for i, chunk in enumerate(chunks[starting_chunk:], start=starting_chunk):
    prompt = f"""
    You are a helpful assistant. You will be given the text of the state of Minnesota driver's manual containing information about the rules and regulations for driving. 
    You are tasked with creating multiple-choice questions that could appear on a driver's license exam to help learners prepare. Your quesitons will be used in practice exams where learners can test their knowledge of driving laws.
   Create 5 multiple-choice questions with 4 options. Make sure that the questions span a variety of topics covered in the text by reading the entire document.
   Ensure that your questions are likely to appear on a driver's license exam by focusing on key rules, regulations, and safety practices.
    Do not refer to the text as "the text" or "the document". Instead, refer to it as "state driving laws".

    Return in JSON format as follows:
    {{
        "question": "Which is an exception to driving on the right half of the roadway in Minnesota?",
        "answers": {{
            "A": "When overtaking or passing another vehicle where passing is permitted",
            "B": "When the roadway is divided into three marked lanes",
            "C": "When necessary to comply with the move over law for authorized vehicles stopped on the roadway",
            "D": "All of the above"
        }},
        "correct_option": "D",
        "why_correct": "Minnesota law lists all of these as exceptions to the requirement to drive on the right half of the roadway.",
        "why_incorrect": {{
            "A": "Passing in a permitted zone is one valid exception, but it is not the only one.",
            "B": "Three-lane roadways also allow deviation, but there are additional exceptions.",
            "C": "Moving over for authorized stopped vehicles is an exception, but not the only one."
        }}
    }}


    Here is the driver's manual text for your task:
    {chunk}

    """

    response = client.responses.create(
        model="gpt-5-mini",
        input=prompt
    )

    print(f"--- Question from chunk {i+1} of {len(chunks)}---")
    print(response.output_text)
    print("\n")

    # 6. Save output
    json_response = response.output_text

    timestamp = int(time.time())
    filename = f"questions_{timestamp}_{i}.json"

    with open(filename, "w", encoding="utf-8") as f:
        f.write(json_response)
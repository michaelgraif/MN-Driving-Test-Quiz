import os
import glob
import json
import random

# Directory containing the files
directory = '.'

# Find all files matching questions*.json
file_pattern = os.path.join(directory, 'questions*.json')
files = glob.glob(file_pattern)

all_questions = []

# Load and combine all questions
for file in files:
    try:
        with open(file, 'r', encoding='utf-8') as f:
            data = json.load(f)
            if isinstance(data, list):
                all_questions.extend(data)
            elif isinstance(data, dict) and 'questions' in data:
                all_questions.extend(data['questions'])
    except json.JSONDecodeError as e:
        print(f"Error decoding JSON in file {file}: {e}")

# Shuffle questions
random.shuffle(all_questions)

# Write combined questions to a new file
with open('combined_questions.json', 'w', encoding='utf-8') as f:
    json.dump(all_questions, f, ensure_ascii=False, indent=2)

# Print total number of questions
print(f"Total questions: {len(all_questions)}")

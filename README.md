# MN-Driving-Test-Quiz

A Python toolkit for automatically generating multiple-choice practice questions from driver's manual PDFs using AI. This project extracts content from PDF driver's manuals and uses OpenAI's API to create realistic practice exam questions.

## Live Demo

For a live demo see https://mn-driving-test-quiz.s3.ap-south-1.amazonaws.com/index.html.

## Overview

This repository contains three main scripts that work together to:
1. Extract text content from a driver's manual PDF
2. Generate practice questions using AI based on the extracted content
3. Combine multiple question files into a single dataset

## Files Description

### `extract_pdf_content.py`
Extracts text content from a PDF driver's manual and saves it as a text file.

**Features:**
- Uses PyPDF2 to extract text from specific page ranges
- Configured for Minnesota Driver's Manual (pages 32-113)
- Outputs clean text to `drivers_manual.txt`

### `create_questions.py`
The main question generation script that uses OpenAI's API to create practice questions.

**Features:**
- Splits the driver's manual text into manageable chunks (2000 characters each)
  -  This is done for expediency because of some dependency and support limitations on my older MacBook Air. If you have newer hardware, especially with a GPU, a better approach might be to use a vector store like ChromaDB. The PDF content by itself is too large (exceeds token limits) to process without chunking or using a vector store.
- Generates 5 multiple-choice questions per chunk using GPT
- Creates detailed explanations for correct and incorrect answers
- Saves each batch as individual JSON files with timestamps
- Supports resuming from a specific chunk if interrupted

### `combine_quetion_json_files.py`
Utility script to merge all generated question files into a single dataset.

**Features:**
- Automatically finds all `questions*.json` files in the directory
- Combines questions from multiple files
- Shuffles questions randomly
- Outputs a single `combined_questions.json` file

## Prerequisites

```bash
pip install openai langchain pypdf2
```

## Environment Setup

Set your OpenAI API key as an environment variable:

```bash
export OPENAI_API_KEY="your-api-key-here"
```

Or on Windows:
```cmd
set OPENAI_API_KEY=your-api-key-here
```

## Usage

### Step 1: Extract PDF Content

1. Place your driver's manual PDF in the project directory
2. Update the `PDF_PATH` variable in `extract_pdf_content.py` if needed
3. Adjust the page range if necessary (currently set to pages 32-113 for MN manual)

```bash
python extract_pdf_content.py
```

This creates `drivers_manual.txt` with the extracted content.

### Step 2: Generate Practice Questions

```bash
python create_questions.py
```

**Important Notes:**
- The script processes chunks sequentially and can be resumed
- Modify `starting_chunk` variable to resume from a specific point
- Each run creates timestamped JSON files (e.g., `questions_1640995200_0.json`)
- Questions follow driver's exam format with realistic scenarios

### Step 3: Combine Question Files

After generating all questions:

```bash
python combine_quetion_json_files.py
```

This creates `combined_questions.json` with all questions in a single, shuffled file.

## Question Format

Each generated question follows this JSON structure:

```json
{
  "question": "Which is an exception to driving on the right half of the roadway in Minnesota?",
  "answers": {
    "A": "When overtaking or passing another vehicle where passing is permitted",
    "B": "When the roadway is divided into three marked lanes", 
    "C": "When necessary to comply with the move over law for authorized vehicles stopped on the roadway",
    "D": "All of the above"
  },
  "correct_option": "D",
  "why_correct": "Minnesota law lists all of these as exceptions to the requirement to drive on the right half of the roadway.",
  "why_incorrect": {
    "A": "Passing in a permitted zone is one valid exception, but it is not the only one.",
    "B": "Three-lane roadways also allow deviation, but there are additional exceptions.", 
    "C": "Moving over for authorized stopped vehicles is an exception, but not the only one."
  }
}
```

## Customization

### For Different States/Manuals:
- Update PDF path and page ranges in `extract_pdf_content.py`
- Modify the prompt in `create_questions.py` to reference your state's laws
- Adjust chunk size if needed for your manual's content density

### Question Generation:
- Change `chunk_size` in `create_questions.py` for different content amounts per batch
- Modify the number of questions generated per chunk (currently 5)
- Customize the prompt to focus on specific topics or question types

## Output Files

- `drivers_manual.txt` - Extracted PDF text
- `questions_[timestamp]_[chunk].json` - Individual question batches
- `combined_questions.json` - Final combined question dataset

## Cost Considerations

Using OpenAI's API incurs costs based on token usage. This uses gpt5-mini which is adequate for these purposes. See pricing details from OpenAI.

## Future Enhancements

Beyond overall improvement of the quiz app, the question bank could be enhanced by categorizing the questions (e.g., traffic signs, vehicle operation, driving under the influence laws, etc.) as well as direct references to the page(s) covering the topic so the user could read the manual for incorrect responses to reinforce learning.

## License

This project is intended for educational purposes. Ensure you have proper rights to use the driver's manual content and comply with your state's regulations regarding driver education materials.

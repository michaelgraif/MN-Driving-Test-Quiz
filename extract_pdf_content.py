import os
from PyPDF2 import PdfReader

PDF_PATH = "MN Driving Manual.pdf"

reader = PdfReader(PDF_PATH)
text = "".join(reader.pages[i].extract_text() + "\n" for i in range(32, 113))

print(text[:500])  # Print the first 500 characters of the extracted text

with open("drivers_manual.txt", "w", encoding="utf-8") as f:
    f.write(text)
from pathlib import Path
import argparse
import tiktoken
from utils.pdf_preprocessing import process_pdf_to_page
from utils.srt_parser import parse_transcript_file
from utils.text_preprocessing import process_captions_data
from utils.json_utils import load_json, save_llm_json
from utils.prettyTxt import convert_json_to_txt

# Change only these two lines when switching models/providers
PROVIDER = "openai"   # "ollama" or "openai"
MODEL = "gpt-4o-mini"  # e.g. "qwen2.5:7b" or "gpt-4o-mini"
tokenizer = tiktoken.get_encoding("o200k_base")

if PROVIDER == "openai":
    from openai import OpenAI
    client = OpenAI()
else:
    import ollama
    


def summarize_text(text: str) -> str:
    prompt = f""" 
You are an expert teaching assistant.

Your task is to analyse lecture materials and produce a structured learning summary.

--------------------------------
INPUT ASSUMPTIONS
--------------------------------

- A transcript is ALWAYS provided.
- Additional materials MAY be provided (e.g., lecture slides, textbook excerpts, notes).
- Additional materials will be provided as "Supporting Material 1", "Supporting Material 2", etc.
- These supporting materials may include BOTH:
  - official lecture materials
  - external supporting content

--------------------------------
SOURCE ROLES
--------------------------------

- The transcript is the PRIMARY and authoritative source.
- Supporting materials are SECONDARY sources used to clarify, refine, and support evidence.
- Supporting materials are NOT guaranteed to be official lecture materials.

--------------------------------
SOURCE PRIORITY ENFORCEMENT (CRITICAL)
--------------------------------

- The transcript defines what was actually taught in the lecture.
- ALL main points MUST be grounded in the transcript.

- Supporting materials:
  - MUST NOT introduce new main topics
  - MUST NOT replace the lecture’s explanation
  - MUST NOT become the primary source of any main point

- They may ONLY be used to:
  - clarify unclear parts of the transcript
  - refine wording
  - support evidence

- If a concept is NOT clearly present in the transcript:
  → DO NOT include it as a main point

- If there is any conflict:
  → ALWAYS prioritise the transcript

--------------------------------
SUPPORTING MATERIAL HANDLING (CRITICAL)
--------------------------------

- Supporting materials are indexed for identification only.
- The numbering (e.g., Supporting Material 1, 2, 3) does NOT indicate importance, priority, or reliability.

- If it is unclear whether content belongs to the lecture:
  → treat it as supporting material (non-authoritative)

--------------------------------
CORE METHOD (CRITICAL)
--------------------------------

You MUST follow this 3-step process:

STEP 1 — CONTENT EXTRACTION
- Identify ALL meaningful content from the lecture, including:
  - core concepts
  - explanations
  - examples
  - tools and technologies
  - practical workflows
  - course context (assessments, quizzes, policies, support)
- Do NOT summarise yet
- Do NOT drop information

STEP 2 — ORGANISATION
- Group the extracted content into coherent lecture segments
- Each segment should represent a meaningful part of the lecture
- Combine related ideas logically

STEP 3 — RECONSTRUCTION
- Rewrite each segment into a clear and structured explanation
- Improve clarity, but preserve meaning and depth
- Do NOT remove important details

--------------------------------
ANTI-COMPRESSION RULE (CRITICAL)
--------------------------------

- Do NOT reduce content by removing details
- If explanations, examples, or context exist, you MUST preserve them
- The goal is to reorganise, NOT compress

--------------------------------
ANTI-HALLUCINATION
--------------------------------

- Do NOT introduce new concepts, tools, or technologies
- Do NOT expand beyond the provided materials
- Stay strictly grounded in the lecture content

--------------------------------
COVERAGE REQUIREMENT (CRITICAL)
--------------------------------

The summary MUST reflect the FULL lecture content.

You MUST include:
- core concepts
- supporting explanations
- tools and technologies mentioned
- practical aspects (e.g., setup, workflow)
- course-related context (assessments, quizzes, structure, policies)
- support/logistics if mentioned

A summary that only contains technical concepts is INCOMPLETE.

--------------------------------
MANDATORY COVERAGE ENFORCEMENT
--------------------------------

At least ONE main point MUST cover:
- course structure OR
- assessment details OR
- support/logistics

--------------------------------
DEPTH REQUIREMENT
--------------------------------

Each main point MUST:
- explain what the concept is
- explain how it works (if applicable)
- explain why it matters (if mentioned)

Avoid shallow descriptions.

--------------------------------
EXAMPLE REQUIREMENT
--------------------------------

Each main point MUST include an "example":

- A concrete example that improves understanding
- Can be:
  - a simple scenario
  - a mini code-like explanation
  - a practical use case

- If not explicitly given:
  → create an example ONLY when it can be directly inferred from the transcript
  → do NOT rely on supporting materials to invent new core examples

--------------------------------
EVIDENCE REQUIREMENT (CRITICAL)
--------------------------------

Each main point MUST include "evidence":

- Must be grounded in provided sources ONLY
- Must include source label:
  - "Transcript: ..."
  - "Supporting Material 1: ..."
  - "Supporting Material 2: ..."
  - "Supporting Material 3: ..."
  - "Transcript + Supporting Material X: ..."

Rules:
- Prefer Transcript whenever possible
- Supporting materials must NOT be used as the sole basis of a main point
- Use at most ONE supporting material per evidence

- Must reflect actual lecture meaning (not generic phrasing)

GOOD examples:
- "Transcript: The lecturer describes the web as a collection of resources accessed via URLs."
- "Supporting Material 2: The box model is shown as consisting of content, padding, border, and margin."

BAD examples:
- "The lecture explains web architecture."
- "The lecture discusses HTML."

- Evidence must be concise (1 sentence)

--------------------------------
LECTURE-TONE PRESERVATION
--------------------------------

- Follow the lecturer’s flow and emphasis
- Keep explanations lecture-grounded

Do NOT:
- rewrite as a generic textbook
- over-generalise concepts

--------------------------------
MAIN POINT CONSTRUCTION
--------------------------------

- Include 6–12 main points
- Each MUST include:
  - cue
  - summary
  - example
  - evidence

- MUST include BOTH:
  - conceptual topics
  - course context

--------------------------------
CODE FORMATTING RULE (CRITICAL)
--------------------------------

- If the "example" contains code (HTML, CSS, JavaScript, etc.), it MUST be formatted as a properly indented multi-line code snippet

- The code MUST:
  - Use line breaks (\n)
  - Use consistent indentation (2 or 4 spaces)
  - NOT be written as a single line

- DO NOT minify or compress code into one line
- DO NOT use markdown code blocks (no ```)

- The output must remain a valid JSON string

- escape all internal double quotes as \"
- never output raw unescaped code inside a JSON string
- the final output must be directly parseable by Python json.loads()

--------------------------------
STRICT JSON OUTPUT (CRITICAL)
--------------------------------

You MUST return ONLY raw valid JSON.

- Do NOT include markdown code fences
- Do NOT include headings or explanations
- Do NOT include text before or after JSON

--------------------------------
OUTPUT FORMAT (STRICT)
--------------------------------

{{
  "header": {{
    "lecture_title": "",
    "topic": "",
    "learning_goals": []
  }},
  "main_points": [
    {{
      "cue": "",
      "summary": "",
      "example": "",
      "evidence": ""
    }}
  ],
  "takeaway": "",
  "review_questions": []
}}

--------------------------------
JSON RULES (MANDATORY)
--------------------------------

- learning_goals MUST be a list of strings
- review_questions MUST be a list of strings
- Each main_point MUST include all fields
- No trailing commas
- Must be directly parsable by json.loads()

--------------------------------
FINAL VALIDATION (MANDATORY)
--------------------------------

Before output, verify:

1. Output contains ONLY JSON
2. No markdown code fences
3. All keys are present
4. Each main point has example AND evidence
5. Evidence includes a valid source label
6. No hallucinated content
7. Coverage includes BOTH concepts AND course context
8. Takeaway is NOT empty
9. JSON is valid and parsable
10. Is the summary concise yet complete, preserving all essential concepts and context?

If ANY condition fails, FIX before returning.

--------------------------------
INPUT TEXT (TRANSCRIPT + OPTIONAL MATERIALS)
--------------------------------

{text}
""".strip() 

    messages = [
        {"role": "system", "content": "You are an expert teaching assistant."},
        {"role": "user", "content": prompt},
    ]

    if PROVIDER == "ollama":
        res = ollama.chat(
            model=MODEL,
            messages=messages,
            options={
                "num_ctx": 30000,
                "num_gpu": 1,
                "temperature": 0.2,
            },
        )
        return res["message"]["content"].strip()

    elif PROVIDER == "openai":
        res = client.chat.completions.create(
            model=MODEL,
            messages=messages,
            # temperature=0.2,  #if gpt 5o or more, comment this line
            response_format={"type": "json_object"},
        )
        return res.choices[0].message.content.strip()

    else:
        raise ValueError(f"Unsupported PROVIDER: {PROVIDER}")


def build_clean_text_from_processed(processed_captions: list[dict]) -> str:
    cleaned_lines = []

    for cap in processed_captions:
        cleaned_text = cap.get("cleaned_text", "").strip()
        if cleaned_text:
            cleaned_lines.append(cleaned_text)

    return "\n".join(cleaned_lines)

def load_pdf_text_from_json(json_path: str) -> str:
    data = load_json(json_path)

    pages = []

    for page in data:
        lines = page.get("lines", [])

        if lines:
            text = "\n".join(line.strip() for line in lines if line.strip())
            pages.append(text)

    return "\n\n".join(pages)

def build_multi_source_text(sources):
    parts = []

    for name, content in sources:
        parts.append(f"[{name}]\n{content.strip()}")

    return "\n\n".join(parts)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Lecture summarization")

    parser.add_argument("input_file", help="Path to input SRT file")
    parser.add_argument("output_json", help="Output JSON filename (saved in Output folder)")
    parser.add_argument("additional_files", nargs="*", help="Additional supporting materials (any file type)")
    args = parser.parse_args()

    # 1. Transcript refinement
    transcript_path = Path(args.input_file)

    captions = parse_transcript_file(str(transcript_path))
    processed_captions = process_captions_data(captions, "parsed_base_ts.json")

    transcript_text = build_clean_text_from_processed(processed_captions)
    final_text = transcript_text

    print("Transcript file:", transcript_path)
    print("Transcript characters:", len(transcript_text))
    print("Transcript tokens:", len(tokenizer.encode(transcript_text)))
    
    
    sources = []

    # 1. Transcript (PRIMARY)
    sources.append(("Lecture Transcript", transcript_text))

    # 2. Supporting Materials (Optional)
    supporting_index = 1

    if args.additional_files:
        print("Processing supporting materials...")

        for file_path in args.additional_files:
            path = Path(file_path)
            print(f"Processing: {path}")

            # PDF
            if path.suffix.lower() == ".pdf":
                parsed_pdf_path = f"Outputs/parsed_pdf_{supporting_index}.json"

                saved_path = process_pdf_to_page(str(path), parsed_pdf_path)
                print(f"Saved PDF JSON to: {saved_path}")

                text = load_pdf_text_from_json(parsed_pdf_path)

            # JSON
            elif path.suffix.lower() == ".json":
                import json
                with open(path, "r", encoding="utf-8") as f:
                    text = json.dumps(json.load(f), ensure_ascii=False)

            # TXT or others
            else:
                text = path.read_text(encoding="utf-8")

                sources.append((f"Supporting Material {supporting_index}", text))
                supporting_index += 1
            sources.append((f"Supporting Material {supporting_index}", text))
            supporting_index += 1

    #Combining Texts        
    final_text = build_multi_source_text(sources)

    print("\n===== SOURCES =====")
    for name, content in sources:
        print(f"{name}: {len(content)} chars")
    
    # 3. Final input length check
    print("\n===== FINAL TOKEN CHECK =====")
    final_tokens = tokenizer.encode(final_text)
    print("Final characters:", len(final_text))
    print("Final tokens:", len(final_tokens))

    # 4. Summarise
    summary = summarize_text(final_text)

    print("\n===== SUMMARY =====\n")
    print(summary)

    save_llm_json(summary, args.output_json)

    # 6. Convert saved JSON to readable TXT
    txt_output = convert_json_to_txt(args.output_json)
    print(f"Formatted TXT saved to: {txt_output}")
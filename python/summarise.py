from pathlib import Path
import argparse
import tiktoken
from utils.pdf_preprocessing import process_pdf_to_page
from utils.srt_parser import parse_transcript_file
from utils.text_preprocessing import process_captions_data, slugify
from utils.json_utils import load_json, save_llm_json
from utils.prettyTxt import convert_json_to_txt
from prompts import SUMMARISE_PROMPT
from openai.types.chat import ChatCompletionMessageParam

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
    prompt = SUMMARISE_PROMPT.replace("{{INPUT_TEXT}}", text).strip() 

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
        messages: list[ChatCompletionMessageParam] = [
            {"role": "system", "content": "You are an expert teaching assistant."},
            {"role": "user", "content": prompt},
        ]
        res = client.chat.completions.create(
            model=MODEL,
            messages=messages,
            # temperature=0.2,  #if gpt 5o or more, comment this line
            response_format={"type": "json_object"},
        )
        content = res.choices[0].message.content
        if content is None:
            raise ValueError("Model returned empty content.")
        return content.strip()
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
        page_num = page.get("page", "Unknown")
        lines = page.get("lines", [])

        if lines:
            text = "\n".join(line.strip() for line in lines if line.strip())
            page_block = f"[Page {page_num}]\n{text}"
            pages.append(page_block)

    return "\n\n".join(pages)

def build_multi_source_text(sources):
    parts = []

    for name, content in sources:
        parts.append(f"[{name}]\n{content.strip()}")

    return "\n\n".join(parts)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Lecture summarization")

    parser.add_argument("input_file", help="Path to transcript file (e.g. .srt, .txt)")
    parser.add_argument("output_file", help="Output JSON filename")

    parser.add_argument("--subject", required=True, help="Subject / course name")
    parser.add_argument("--topic", required=True, help="Lecture topic")

    parser.add_argument("--slide", help="Path to lecture slide file")
    parser.add_argument("--materials", nargs="*", default=[], help="Additional supporting material files")

    args = parser.parse_args()

    subject_slug = slugify(args.subject)
    topic_slug = slugify(args.topic)

    # output structure: outputs/{subject}_{topic}/parsed, processed, results, logs
    output_root_path = Path("outputs") / f"{subject_slug}_{topic_slug}"
    output_root_path.mkdir(parents=True, exist_ok=True)
    output_parsed_path = output_root_path / "parsed"
    output_parsed_path.mkdir(parents=True, exist_ok=True)
    output_processed_path = output_root_path / "processed"
    output_processed_path.mkdir(parents=True, exist_ok=True)
    output_results_path = output_root_path / "results"
    output_results_path.mkdir(parents=True, exist_ok=True)
    output_log_path = output_root_path / "logs"
    output_log_path.mkdir(parents=True, exist_ok=True)

    # Process sources in order of priority: Transcript → Slides → Supporting Materials
    sources = []
    # 1. Transcript (PRIMARY)
    transcript_path = Path(args.input_file)

    captions = parse_transcript_file(str(transcript_path))
    processed_captions = process_captions_data(captions, output_parsed_path, "raw_transcript.json")

    transcript_text = build_clean_text_from_processed(processed_captions)
    final_text = transcript_text

    print("Transcript file:", transcript_path)
    print("Transcript characters:", len(transcript_text))
    print("Transcript tokens:", len(tokenizer.encode(transcript_text)))

    sources.append(("Lecture Transcript", transcript_text))

    # 2. Slides (STRUCTURAL SECONDARY)
    if args.slide:
        slide_path = Path(args.slide)
        print(f"Processing slides: {slide_path}")

        parsed_slide_path = output_parsed_path / "parsed_slides.json"
        saved_slide_json = process_pdf_to_page(str(slide_path), str(parsed_slide_path))
        print(f"Saved parsed slides to: {saved_slide_json}")

        slide_text = load_pdf_text_from_json(str(parsed_slide_path))
        sources.append(("Slides", slide_text))
        
    # 2. Supporting Materials (Optional)
    supporting_index = 1

    if args.materials:
        print("Processing supporting materials...")

        for file_path in args.materials:
            path = Path(file_path)
            print(f"Processing: {path}")

            # PDF
            if path.suffix.lower() == ".pdf":
                parsed_pdf_path = output_parsed_path / f"parsed_pdf_{supporting_index}.json"
                saved_path = process_pdf_to_page(str(path), str(parsed_pdf_path))
                print(f"Saved PDF JSON to: {saved_path}")

                text = load_pdf_text_from_json(str(parsed_pdf_path))

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

    result_output_path = output_results_path / args.output_file
    save_llm_json(summary, str(result_output_path))
    print(f"\nSummary saved to: {result_output_path}")

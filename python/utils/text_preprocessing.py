import json
import re
from pathlib import Path

def slugify(text: str) -> str:
    text = text.strip().lower()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s-]+", "_", text)
    return text.strip("_")

def clean_caption_text(text: str) -> str:
    """
    Conservative text cleaning.

    Steps:
    1. Normalize whitespace
    2. Remove leading filler words
    """

    # normalize whitespace
    text = re.sub(r"\s+", " ", text).strip()

    # remove leading fillers
    filler_pattern = re.compile(
        r"^(?:(?:um|uh|ah|er|erm)\b[\s,.\-:;!?]*)+",
        flags=re.IGNORECASE
    )
    text = filler_pattern.sub("", text).strip()

    return text


def process_captions_data(captions: list[dict], output_root_path: Path, output_json: str) -> list[dict]:
    """
    Process caption list directly and save result to JSON.
    """

    output_path = output_root_path / output_json
    output_path.parent.mkdir(parents=True, exist_ok=True)

    processed = []

    total_original_chars = 0
    total_cleaned_chars = 0

    for cap in captions:
        original_text = cap["text"]
        cleaned_text = clean_caption_text(original_text)

        total_original_chars += len(original_text)
        total_cleaned_chars += len(cleaned_text)

        new_cap = {
            **cap,
            "cleaned_text": cleaned_text
        }
        processed.append(new_cap)

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(processed, f, indent=2, ensure_ascii=False)

    reduction = total_original_chars - total_cleaned_chars
    reduction_rate = (
        (reduction / total_original_chars) * 100 if total_original_chars > 0 else 0
    )

    print("\n===== CLEANING STATISTICS =====")
    print(f"Original characters : {total_original_chars}")
    print(f"Cleaned characters  : {total_cleaned_chars}")
    print(f"Reduced characters  : {reduction}")
    print(f"Reduction rate      : {reduction_rate:.2f}%")
    print("================================\n")

    print(f"Processed captions saved to {output_path}")

    return processed
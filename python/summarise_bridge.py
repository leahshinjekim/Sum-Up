import argparse
import json
from pathlib import Path


def build_dummy_summary(payload: dict) -> dict:
    transcript = payload.get("transcript", "").strip()
    slides = payload.get("slides", "").strip()
    materials = payload.get("materials", "").strip()
    subject = payload.get("subject", "").strip()
    topic = payload.get("topic", "").strip()

    transcript_words = len(transcript.split()) if transcript else 0
    slides_words = len(slides.split()) if slides else 0
    materials_words = len(materials.split()) if materials else 0

    return {
        "header": {
            "lecture_title": topic or "Untitled Lecture",
            "topic": topic,
            "learning_goals": [
                "Validate Next.js to Python integration",
                "Confirm uploaded text reaches Python correctly"
            ]
        },
        "main_points": [
            {
                "cue": "Transcript received",
                "summary": f"Transcript text was received successfully with about {transcript_words} words.",
                "example": "The frontend sends lecture transcript text to the API, which passes it to Python.",
                "evidence": "Transcript: Input text was delivered from the frontend request."
            },
            {
                "cue": "Slides received",
                "summary": f"Slides text was received successfully with about {slides_words} words.",
                "example": "Optional slides can be included as a secondary source.",
                "evidence": "Slides: Optional slides text was included in the request."
            },
            {
                "cue": "Supporting materials received",
                "summary": f"Supporting materials text was received successfully with about {materials_words} words.",
                "example": "Readings or notes can be included as additional context.",
                "evidence": "Supporting Material 1: Optional supporting text was included in the request."
            }
        ],
        "takeaway": f"Python bridge executed successfully for subject '{subject}' and topic '{topic}'.",
        "review_questions": [
            "Did the transcript reach Python correctly?",
            "Did the API route execute the Python script successfully?"
        ]
    }


def main():
    parser = argparse.ArgumentParser(description="Temporary bridge for Next.js -> Python")
    parser.add_argument("--input", required=True, help="Path to input JSON")
    parser.add_argument("--output", required=True, help="Path to output JSON")
    args = parser.parse_args()

    input_path = Path(args.input)
    output_path = Path(args.output)

    with input_path.open("r", encoding="utf-8") as f:
        payload = json.load(f)

    result = build_dummy_summary(payload)

    with output_path.open("w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=2)

    print("Python bridge executed successfully.")
    print(f"Input file: {input_path}")
    print(f"Output file: {output_path}")


if __name__ == "__main__":
    main()
import json
from pathlib import Path
from typing import Any, Dict, List


def load_json(path: str) -> Dict[str, Any]:
    """Load a JSON file and return it as a dictionary."""
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def format_learning_goals(goals: List[str]) -> str:
    """Format the learning goals section."""
    if not goals:
        return "Learning Goals\n- None\n"

    lines = ["Learning Goals"]
    for goal in goals:
        lines.append(f"- {goal}")
    return "\n".join(lines)


def format_main_points(main_points: List[Dict[str, str]]) -> str:
    """Format the main points section in a readable note style."""
    if not main_points:
        return "Main Points\n- None\n"

    lines = ["Main Points"]

    for idx, point in enumerate(main_points, start=1):
        cue = point.get("cue", "Untitled")
        summary = point.get("summary", "").strip()
        example = point.get("example", "").strip()
        evidence = point.get("evidence", "").strip()

        lines.append("")
        lines.append(f"{idx}. {cue}")

        if summary:
            lines.append("   Summary:")
            lines.append(f"   {summary}")

        if example:
            lines.append("   Example:")
            lines.append(f"   {example}")

        if evidence:
            lines.append("   Evidence:")
            lines.append(f"   {evidence}")

    return "\n".join(lines)


def format_review_questions(questions: List[str]) -> str:
    """Format the review questions section."""
    if not questions:
        return "Review Questions\n- None\n"

    lines = ["Review Questions"]
    for idx, question in enumerate(questions, start=1):
        lines.append(f"{idx}. {question}")
    return "\n".join(lines)


def format_summary(data: Dict[str, Any]) -> str:
    """Convert the summary JSON into a human-readable text document."""
    header = data.get("header", {})
    lecture_title = header.get("lecture_title", "Untitled Lecture")
    topic = header.get("topic", "No topic provided")
    learning_goals = header.get("learning_goals", [])

    main_points = data.get("main_points", [])
    takeaway = data.get("takeaway", "").strip()
    review_questions = data.get("review_questions", [])

    sections = [
        f"{lecture_title}",
        "=" * len(lecture_title),
        "",
        f"Topic: {topic}",
        "",
        format_learning_goals(learning_goals),
        "",
        format_main_points(main_points),
        "",
        "Takeaway",
        takeaway if takeaway else "None",
        "",
        format_review_questions(review_questions),
        "",
    ]

    return "\n".join(sections)


def save_text(path: str, content: str) -> None:
    """Save formatted text to a file."""
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)


def convert_json_to_txt(input_json: str, output_txt: str | None = None) -> str:
    """
    Convert a structured lecture-summary JSON file into a human-readable TXT file.
    Returns the output file path.
    """
    input_path = Path(input_json)

    if output_txt is None:
        output_txt = str(input_path.with_suffix(".txt"))

    data = load_json(str(input_path))
    formatted_text = format_summary(data)
    save_text(output_txt, formatted_text)

    return output_txt


import argparse

import argparse

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Convert JSON to TXT")

    parser.add_argument(
        "input_files",
        nargs="+",  # Multiple input
        help="List of JSON files"
    )

    args = parser.parse_args()

    for file in args.input_files:
        output = convert_json_to_txt(file)
        print(f"Converted: {output}")
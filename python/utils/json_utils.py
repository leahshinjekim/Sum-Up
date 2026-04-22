"""
json_utils.py

Utility functions for common JSON operations.

Provides helpers to:
- load JSON files
- save JSON files
- append data
- pretty print JSON
"""
import json
import re
from pathlib import Path
################# Load Area #######################################
def load_json(file_path: str):
    """
    Load a JSON file and return its content.

    Args:
        file_path (str): Path to the JSON file.

    Returns:
        dict or list: Parsed JSON data.
    """
    path = Path(file_path)

    if not path.exists():
        raise FileNotFoundError(f"JSON file not found: {file_path}")

    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def load_llm_text_from_json(json_path: str) -> str:
    """
    Read JSON captions and convert to LLM input format:
    'id text'
    """

    with open(json_path, "r", encoding="utf-8") as f:
        captions = json.load(f)

    lines = []

    for cap in captions:
        lines.append(f"{cap['id']} {cap['text']}")

    return "\n".join(lines)

def load_pure_text_from_json(json_path: str) -> str:
    """
    Extract only the text field from captions JSON.
    """
    with open(json_path, "r", encoding="utf-8") as f:
        captions = json.load(f)

    texts = [cap["text"] for cap in captions]

    return "\n".join(texts)

################# Save Area #######################################
def save_json(data, output_path):
    """
    Save JSON data with pretty formatting.
    """
    output_path = Path(output_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

################# Parse Area #######################################
def _extract_json_region(text: str) -> str:
    start = text.find("{")
    end = text.rfind("}")
    if start == -1 or end == -1 or end < start:
        raise ValueError("Could not find a valid JSON object region in LLM output.")
    return text[start:end + 1]


def _escape_newlines_inside_strings(text: str) -> str:
    """
    Replace raw newline characters that appear INSIDE JSON strings
    with the escaped sequence \\n.
    """
    result = []
    in_string = False
    escaped = False

    for ch in text:
        if in_string:
            if escaped:
                result.append(ch)
                escaped = False
            elif ch == "\\":
                result.append(ch)
                escaped = True
            elif ch == '"':
                result.append(ch)
                in_string = False
            elif ch == "\n":
                result.append("\\n")
            elif ch == "\r":
                # ignore raw CR inside strings
                continue
            else:
                result.append(ch)
        else:
            result.append(ch)
            if ch == '"':
                in_string = True

    return "".join(result)


def _repair_unescaped_quotes_in_strings(text: str) -> str:
    """
    Heuristically repair unescaped double quotes inside JSON string values.

    Example:
      "example": "<label for="text">"
    becomes:
      "example": "<label for=\"text\">"

    Strategy:
    - Walk character by character
    - When inside a string and we see a quote, decide whether it is:
      1) the real end of the string
      2) or just an internal quote that should be escaped
    - If the next meaningful character is not one that can legally follow
      the end of a JSON string (, } ] : or whitespace before them),
      we treat it as an internal quote and escape it.
    """
    result = []
    in_string = False
    escaped = False
    i = 0
    n = len(text)

    while i < n:
        ch = text[i]

        if not in_string:
            result.append(ch)
            if ch == '"':
                in_string = True
            i += 1
            continue

        # inside string
        if escaped:
            result.append(ch)
            escaped = False
            i += 1
            continue

        if ch == "\\":
            result.append(ch)
            escaped = True
            i += 1
            continue

        if ch == '"':
            # look ahead to next non-space char
            j = i + 1
            while j < n and text[j] in " \t\r\n":
                j += 1

            next_char = text[j] if j < n else ""

            # Valid JSON string endings are usually followed by:
            # comma, closing brace, closing bracket, colon
            # colon matters for key strings: "key":
            if next_char in [",", "}", "]", ":"] or j >= n:
                result.append(ch)
                in_string = False
            else:
                # likely an internal quote inside the string value
                result.append('\\"')
            i += 1
            continue

        if ch == "\n":
            result.append("\\n")
            i += 1
            continue

        if ch == "\r":
            i += 1
            continue

        result.append(ch)
        i += 1

    return "".join(result)


def _debug_json_error(text: str, err: json.JSONDecodeError):
    start = max(0, err.pos - 200)
    end = min(len(text), err.pos + 200)
    snippet = text[start:end]
    print("\n[JSON ERROR DEBUG]")
    print(f"Message : {err.msg}")
    print(f"Line    : {err.lineno}")
    print(f"Column  : {err.colno}")
    print(f"Pos     : {err.pos}")
    print("Context :")
    print(snippet)
    print("[/JSON ERROR DEBUG]\n")


def parse_llm_json(llm_output: str):
    text = llm_output.strip()

    # 1) remove markdown fences
    text = re.sub(r"```json\s*", "", text, flags=re.IGNORECASE)
    text = re.sub(r"```", "", text)

    # 2) remove summary headings
    text = re.sub(r"=+.*?=+", "", text)

    # 3) extract JSON region
    text = _extract_json_region(text)

    # 4) small cleanup
    text = text.replace("\\(", "(")
    text = text.replace("\\)", ")")

    # 5) convert backtick strings to normal quotes
    text = re.sub(r'`([^`]*)`', r'"\1"', text)

    # 6) repair common LLM JSON issues
    text = _escape_newlines_inside_strings(text)
    text = _repair_unescaped_quotes_in_strings(text)

    # 7) parse
    try:
        return json.loads(text)
    except json.JSONDecodeError as e:
        _debug_json_error(text, e)
        raise

def save_llm_json(llm_output, output_path, subject=None):
    data = parse_llm_json(llm_output)
    
    if subject is not None:
        data["subject"] = subject

    save_json(data, output_path)

def append_json(new_data, file_path: str):
    """
    Append data to an existing JSON file.

    If the file does not exist, it will be created.

    Args:
        new_data (dict): Data to append
        file_path (str): JSON file path
    """

    path = Path(file_path)

    if path.exists():
        data = load_json(file_path)
    else:
        data = []

    if not isinstance(data, list):
        raise ValueError("append_json requires JSON root to be a list")

    data.append(new_data)

    save_json(data, file_path)


def print_json(data):
    """
    Pretty print JSON to console.
    """

    print(json.dumps(data, indent=2, ensure_ascii=False))

def format_json_for_prompt(data) -> str:
    """
    Convert JSON data into a formatted string for LLM prompts.
    """
    return json.dumps(data, indent=2, ensure_ascii=False)

import json

def print_json_human_style(summary_json: str):

    data = json.loads(summary_json)

    print("\n================ FINAL SUMMARY ================\n")

    print(f"### Lecture: {data.get('lecture_title', '')}\n")

    sections = data.get("sections", [])

    for sec in sections:

        topic = sec.get("topic", "")
        explanation = sec.get("expanded_explanation", "")
        key_ideas = sec.get("key_ideas", [])
        examples = sec.get("examples", [])
        connections = sec.get("concept_connections", [])

        print(f"## {topic}\n")

        if explanation:
            print(explanation)
            print()

        if key_ideas:
            print("Key Ideas:")
            for k in key_ideas:
                print(f"- {k}")
            print()

        if examples:
            print("Examples:")
            for e in examples:
                print(f"- {e}")
            print()

        if connections:
            print("Concept Connections:")
            for c in connections:
                print(f"- {c}")
            print()

        print("--------------------------------------------\n")
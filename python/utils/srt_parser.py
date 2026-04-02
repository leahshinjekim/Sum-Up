import re
from pathlib import Path

def parse_srt_time(time_str: str) -> str:
    """
    Validate subtitle timestamp string and normalize to SRT style.
    Supports:
    - 00:00:13,590
    - 00:00:13.590

    Returns:
    - 00:00:13,590
    """
    normalized = time_str.strip().replace(".", ",")

    pattern = r"^\d{2}:\d{2}:\d{2},\d{3}$"
    if not re.match(pattern, normalized):
        raise ValueError(f"Invalid SRT timestamp format: {time_str}")

    return normalized

def parse_transcript_file(file_path: str) -> list[dict]:
    """
    Parse subtitle-like files (SRT / index-less VTT style) into a list of caption dictionaries.

    Supported formats:
    1) Standard SRT
       1
       00:00:13,590 --> 00:00:15,150
       Okay.

    2) Index-less subtitle block
       00:00:13.590 --> 00:00:15.150
       Okay.

    Output format:
    [
        {
            "id": 1,
            "start": "00:00:13,590",
            "end": "00:00:15,150",
            "text": "Okay."
        },
        ...
    ]
    """
    path = Path(file_path)

    if not path.exists():
        raise FileNotFoundError(f"File not found: {file_path}")

    content = path.read_text(encoding="utf-8-sig").strip()

    # Remove WEBVTT header if present
    content = re.sub(r"^\s*WEBVTT\s*", "", content, flags=re.IGNORECASE).strip()

    # Split caption blocks by blank lines
    blocks = re.split(r"\n\s*\n", content)

    captions = []
    generated_id = 1

    for block in blocks:
        lines = [line.strip() for line in block.splitlines() if line.strip()]

        if not lines:
            continue

        caption_id = None
        timestamp_line = None
        text_lines = None

        # Case 1: Standard SRT with numeric index
        if len(lines) >= 3 and lines[0].isdigit() and "-->" in lines[1]:
            caption_id = int(lines[0])
            timestamp_line = lines[1]
            text_lines = lines[2:]

        # Case 2: No index, timestamp starts on first line
        elif len(lines) >= 2 and "-->" in lines[0]:
            caption_id = generated_id
            timestamp_line = lines[0]
            text_lines = lines[1:]

        else:
            continue

        # Parse timestamp line
        try:
            start_str, end_str = [part.strip() for part in timestamp_line.split("-->")]
        except ValueError:
            continue

        start_time = parse_srt_time(start_str)
        end_time = parse_srt_time(end_str)

        # Merge multi-line caption text into a single line
        text = " ".join(text_lines).strip()

        captions.append({
            "id": caption_id,
            "start": start_time,
            "end": end_time,
            "text": text
        })

        generated_id += 1

    return captions


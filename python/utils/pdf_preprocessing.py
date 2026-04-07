from pathlib import Path
import json
import re
import fitz  # PyMuPDF


def normalize_line(line: str) -> str:
    """
    Clean a single extracted line.
    - Strip leading/trailing whitespace
    - Collapse repeated spaces
    """
    line = line.strip()
    line = re.sub(r"\s+", " ", line)
    return line


def is_meaningful_line(line: str) -> bool:
    """
    Decide whether a line should be kept.
    Current policy is conservative:
    - Remove empty lines
    - Remove lines that are only page numbers or separators
    - Keep most content lines for LLM processing
    """
    if not line:
        return False

    # Remove lines that are just page numbers
    if re.fullmatch(r"\d+", line):
        return False

    # Remove very short decorative separators
    if re.fullmatch(r"[-_=*~•.]{2,}", line):
        return False

    return True


def clean_page_lines(raw_text: str) -> list[str]:
    """
    Convert raw page text into a cleaned list of lines.
    """
    if not raw_text:
        return []

    split_lines = raw_text.splitlines()
    cleaned_lines = []

    for line in split_lines:
        line = normalize_line(line)
        if is_meaningful_line(line):
            cleaned_lines.append(line)

    return cleaned_lines


def remove_repeated_header_by_previous_page(
    lines: list[str],
    previous_first_line: str | None
) -> list[str]:
    """
    Remove the first line if it is exactly the same as the previous page's first line.
    """
    if not lines or not previous_first_line:
        return lines

    if lines[0] == previous_first_line:
        return lines[1:]

    return lines


def extract_pdf_pages(pdf_path: str) -> list[dict]:
    """
    Extract page-level text from a PDF and convert it into:
    {
      "page": <page_number>,
      "lines": [...],
      "line_count": <int>
    }
    """
    pdf_path = Path(pdf_path)

    if not pdf_path.exists():
        raise FileNotFoundError(f"PDF file not found: {pdf_path}")

    results = []
    previous_first_line = None

    with fitz.open(pdf_path) as doc:
        for page_index, page in enumerate(doc):
            raw_text = page.get_text("text")
            lines = clean_page_lines(raw_text)

            # Save the current page's original first line before removal
            current_first_line = lines[0] if lines else None

            # From page 2 onward, remove repeated header if it matches the previous page's first line
            if page_index > 0:
                lines = remove_repeated_header_by_previous_page(lines, previous_first_line)

            results.append({
                "page": page_index + 1,
                "lines": lines,
                "line_count": len(lines)
            })

            # Update comparison target using the ORIGINAL first line
            previous_first_line = current_first_line

    return results


def save_page_structure_json(data: list[dict], output_filename: str) -> Path:
    """
    Save extracted page structures into the outputs folder.
    """

    output_path = output_filename

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    return output_path


def process_pdf_to_page(pdf_path: str, output_filename: str) -> Path:
    """
    Full preprocessing pipeline:
    PDF -> page-level structured JSON
    """
    page_data = extract_pdf_pages(pdf_path)
    output_path = save_page_structure_json(page_data, output_filename)
    return output_path


# if __name__ == "__main__":
#     pdf_file = "inputs/input_SINA_pdf.pdf"
#     output_file = "lecture_pages.json"

#     saved_path = process_pdf_to_page_json(pdf_file, output_file)
#     print(f"Saved JSON to: {saved_path}")
from fastapi import UploadFile, HTTPException

from app_config import MetadataKeys, init_logger


async def read_file_content(file: UploadFile) -> str:
    try:
        content = await file.read()
        init_logger().info("📄 File content read successfully.")
        return content.decode("utf-8")
    except Exception as e:
        init_logger().error(f"❌ Error reading file content: {e}")
        raise HTTPException(status_code=500, detail="Error reading file content.")


def generate_prompt(script_content: str, file_extension: str) -> str:
    init_logger().info("📝 Generating prompt for the script.")
    return f"""
    Analyze the following {file_extension} script and provide the following metadata in the specified format:

    Title: <Descriptive title>
    Language: <Programming language>
    Tags: <Comma-separated tags>
    Description: <Detailed description of what the script does>
    How it works: <Brief explanation of how the script works>
    Category: <Category of the script (e.g., Image Processing, Web Scraper, Data Analyzer)>

    Ensure that all fields are filled out completely and accurately.

    Script:
    {script_content}
    """


def extract_metadata(response_text: str) -> dict:
    init_logger().info("🔍 Extracting metadata from the response.")
    generated_metadata = response_text.strip().split("\n")
    metadata = {key.value: None for key in MetadataKeys}
    for line in generated_metadata:
        for key in MetadataKeys:
            if line.lower().startswith(f"{key.value.lower()}:"):
                metadata[key.value] = line.split(":", 1)[-1].strip() or None
    return metadata


def validate_metadata(metadata: dict):
    init_logger().info("✅ Validating extracted metadata.")
    REQUIRED_FIELDS = [key.value for key in MetadataKeys]
    for field in REQUIRED_FIELDS:
        if not metadata[field]:
            init_logger().error(f"❌ Metadata validation failed: {field} is missing.")
            raise ValueError(f"Failed to generate complete metadata: {field} is missing.")
    return metadata

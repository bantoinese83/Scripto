import logging
import os
from enum import Enum

import google.generativeai as genai
from fastapi import FastAPI
from google.generativeai import GenerationConfig
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware

DATABASE_URL = "postgresql://root:password@localhost:5432/dev_club_db"
GEMINI_API_KEY_ENV_VAR = "GEMINI_API_KEY"
ALLOWED_ORIGINS = ["http://localhost:5173"]


class MetadataKeys(Enum):
    TITLE = "Title"
    LANGUAGE = "Language"
    TAGS = "Tags"
    DESCRIPTION = "Description"
    HOW_IT_WORKS = "How it works"
    CATEGORY = "Category"


def init_logger():
    logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
    return logging.getLogger(__name__)


def init_cors_middleware(app: FastAPI):
    try:
        app.add_middleware(
            CORSMiddleware,
            allow_origins=ALLOWED_ORIGINS,
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )
    except Exception as e:
        init_logger().error(f"❌ Error configuring CORS middleware: {e}")
        exit(1)

def init_gzip_middleware(app: FastAPI):
    try:
        app.add_middleware(GZipMiddleware, minimum_size=1000)
    except Exception as e:
        init_logger().error(f"❌ Error configuring GZip middleware: {e}")
        exit(1)

def init_genai():
    try:
        genai.configure(api_key=os.environ[GEMINI_API_KEY_ENV_VAR])
        generation_config = GenerationConfig(
            temperature=1,
            top_p=0.95,
            top_k=40,
            max_output_tokens=8192,
            response_mime_type="text/plain",
        )
        model = genai.GenerativeModel(
            model_name="gemini-1.5-flash",
            generation_config=generation_config,
        )
        init_logger().info("✅ Google Gemini API configured successfully.")
        return model
    except KeyError:
        init_logger().error(f"❌ Environment variable {GEMINI_API_KEY_ENV_VAR} not set.")
        exit(1)
    except Exception as e:
        init_logger().error(f"❌ Error configuring Gemini API: {e}")
        exit(1)

import uvicorn
from fastapi import FastAPI
from contextlib import asynccontextmanager

from db_config import create_tables
from routes import router
from websockets_routes import websocket_router
from app_config import init_cors_middleware

# --- FastAPI App Setup ---
@asynccontextmanager
async def lifespan(app_instance: FastAPI):
    # Startup event
    create_tables()
    print("🚀 FastAPI application started successfully!")
    yield
    # Shutdown event
    print("🛑 FastAPI application is shutting down!")

app = FastAPI(
    title="📜 Scripto Metadata API",
    description="🚀 API for anonymously uploading scripts and building a collaborative script library for all developers! 🌟",
    version="1.0.0",
    docs_url="/",
    lifespan=lifespan
)

# --- Middleware Setup ---
init_cors_middleware(app)

# --- Include Routers ---
app.include_router(router)
app.include_router(websocket_router)

if __name__ == "__main__":
    uvicorn.run(app, host="localhost", port=8000)
import logging
from threading import Lock
from typing import List

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

websocket_router = APIRouter()


# --- WebSocket Manager ---
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.lock = Lock()
        self.logger = logging.getLogger("ConnectionManager")

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        with self.lock:
            self.active_connections.append(websocket)
        self.logger.info(f"WebSocket connected: {websocket.client}")

    def disconnect(self, websocket: WebSocket):
        with self.lock:
            if websocket in self.active_connections:
                self.active_connections.remove(websocket)
                self.logger.info(f"WebSocket disconnected: {websocket.client}")
            else:
                self.logger.warning(f"Attempted to disconnect a non-existent WebSocket: {websocket.client}")

    async def broadcast(self, message: str):
        with self.lock:
            connections = list(self.active_connections)
        for connection in connections:
            try:
                await connection.send_text(message)
            except Exception as e:
                self.logger.error(f"Error sending message to {connection.client}: {e}")
                self.disconnect(connection)


manager = ConnectionManager()


# --- API Endpoints ---

@websocket_router.websocket("/ws/notifications/")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        logging.error(f"Unexpected error: {e}")
        manager.disconnect(websocket)
    finally:
        await websocket.close()

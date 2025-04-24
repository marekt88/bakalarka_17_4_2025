import enum
from typing import Annotated
from livekit.agents import llm
import logging
from flask import Flask, jsonify, request
from knowledge_indexer import run_indexer
from rag_manager import rag_manager
import os
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

logger = logging.getLogger("temperature-control")
logger.setLevel(logging.INFO)

# API endpoint to process knowledgebase files
@app.route('/api/process-knowledgebase', methods=['POST'])
def process_knowledgebase():
    try:
        # Run the RAG indexer to process knowledgebase files
        updated = run_indexer()
        
        if updated:
            # Reload the RAG manager with new data
            rag_manager.load()
            return jsonify({
                "success": True,
                "message": "Knowledge base updated successfully!"
            }), 200
        else:
            return jsonify({
                "success": True,
                "message": "No new knowledge files found to process."
            }), 200
    except Exception as e:
        return jsonify({
            "success": False,
            "message": f"Error processing knowledge base: {str(e)}"
        }), 500

class Zone(enum.Enum):
    LIVING_ROOM = "living_room"
    BEDROOM = "bedroom"
    KITCHEN = "kitchen"
    BATHROOM = "bathroom"
    OFFICE = "office"


class AssistantFnc(llm.FunctionContext):
    def __init__(self) -> None:
        super().__init__()

        self._temperature = {
            Zone.LIVING_ROOM: 22,
            Zone.BEDROOM: 20,
            Zone.KITCHEN: 24,
            Zone.BATHROOM: 23,
            Zone.OFFICE: 21,
        }

    @llm.ai_callable(description="get the temperature in a specific room")
    def get_temperature(
        self, zone: Annotated[Zone, llm.TypeInfo(description="The specific zone")]
    ):
        logger.info("get temp - zone %s", zone)
        temp = self._temperature[Zone(zone)]
        return f"The temperature in the {zone} is {temp}C"

    @llm.ai_callable(description="set the temperature in a specific room")
    def set_temperature(
        self,
        zone: Annotated[Zone, llm.TypeInfo(description="The specific zone")],
        temp: Annotated[int, llm.TypeInfo(description="The temperature to set")],
    ):
        logger.info("set temo - zone %s, temp: %s", zone, temp)
        self._temperature[Zone(zone)] = temp
        return f"The temperature in the {zone} is now {temp}C"

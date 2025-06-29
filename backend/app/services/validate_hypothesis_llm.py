import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

from langchain.chat_models import ChatOpenAI
from langchain.schema import HumanMessage

# Instantiate the OpenAI chat model
llm = ChatOpenAI(temperature=0, model_name="gpt-4")

def validate_hypothesis(claim: str):
    prompt = f"""
You are a hypothesis validation assistant.

Instruction:
- Determine if the input is a scientific claim suitable for forming a null hypothesis.
- Return JSON with: 
  - is_valid (true/false), 
  - reason (why it is or isn't valid), 
  - null_hypothesis (if valid), 
  - suggestion (if invalid).

Input: "{claim}"
"""

    try:
        response = llm([HumanMessage(content=prompt)])

        # Ensure valid JSON output
        import json
        result = json.loads(response.content)
        return result

    except Exception as e:
        print("Error during LLM validation:", e)
        return {
            "is_valid": False,
            "reason": "LLM error occurred",
            "null_hypothesis": None,
            "suggestion": "Please try again later."
        }

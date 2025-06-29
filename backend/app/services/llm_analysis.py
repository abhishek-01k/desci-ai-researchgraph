import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

from langchain.chat_models import ChatOpenAI
from langchain.schema import HumanMessage

# Instantiate the OpenAI chat model
llm = ChatOpenAI(temperature=0, model_name="gpt-4")

def analyze_claim_support(claim, abstracts):
    context = "\n\n".join([f"{a['title']}\n{a['abstract']}" for a in abstracts])
    
    prompt = f"""You are an AI scientific reviewer.

Given the following scientific claim:
"{claim}"

And the abstracts from papers below, determine if any of the papers contradict or do not support the claim (i.e., suggest a null hypothesis). Respond with a summary verdict and brief reasoning.

Abstracts:
{context}
"""
    response = llm([HumanMessage(content=prompt)])
    return response.content




# in is deprecated. Importing from langchain will no longer be supported as of langchain==0.2.0. Please import from langchain-community instead:
# in is deprecated. Importing from langchain will no longer be supported as of langchain==0.2.0. Please import from langchain-community instead:

# in is deprecated. Importing from langchain will no longer be supported as of langchain==0.2.0. Please import from langchain-community instead:

# `from langchain_community.chat_models import ChatOpenAI`.

# To install langchain-community run `pip install -U langchain-community`.        
#   warnings.warn(
import os



from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from groq import Groq
from hindsight_client import Hindsight


# --------------------------------------------------
# LOAD ENVIRONMENT VARIABLES
# --------------------------------------------------

load_dotenv()

HINDSIGHT_BASE_URL = os.getenv("HINDSIGHT_BASE_URL")
HINDSIGHT_API_KEY = os.getenv("HINDSIGHT_API_KEY")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")


# --------------------------------------------------
# CLIENTS
# --------------------------------------------------

hindsight = Hindsight(
    base_url=HINDSIGHT_BASE_URL,
    api_key=HINDSIGHT_API_KEY
)

groq = Groq(
    api_key=GROQ_API_KEY
)


# --------------------------------------------------
# FASTAPI
# --------------------------------------------------

app = FastAPI(
    title="SupportMind API",
    description="Memory-powered customer support agent",
    version="1.0"
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --------------------------------------------------
# MEMORY BANK
# --------------------------------------------------

BANK_ID = "supportmind"


# --------------------------------------------------
# REQUEST MODEL
# --------------------------------------------------

class ChatRequest(BaseModel):
    customer_id: str
    message: str


# --------------------------------------------------
# TEST ENDPOINT
# --------------------------------------------------

@app.get("/")
def home():
    return {
        "message": "SupportMind API is running!"
    }


# --------------------------------------------------
# CHAT ENDPOINT
# --------------------------------------------------

@app.post("/chat")
def chat(request: ChatRequest):

    # ----------------------------------------------
    # 1. RECALL PREVIOUS CUSTOMER MEMORY
    # ----------------------------------------------

    memory_result = hindsight.recall(
    bank_id=BANK_ID,
    query=f"""
    Customer ID: {request.customer_id}

    Find relevant previous support interactions for this
    specific customer.

    Current customer message:
    {request.message}
    """
)

    memories = []

    for memory in memory_result.results:
        memories.append(memory.text)

    memory_context = "\n".join(memories)

    # ----------------------------------------------
    # 2. CREATE PROMPT
    # ----------------------------------------------

    prompt = f"""
You are SupportMind, an AI customer support agent.

You have access to memories from previous customer
interactions.

Previous memories:
{memory_context}

Current customer:
{request.customer_id}

Current message:
{request.message}

Instructions:

1. Answer the customer's question clearly.
2. Use relevant previous memories when appropriate.
3. Do not invent customer history.
4. If previous memory is relevant, acknowledge it naturally.
5. Be helpful and professional.
"""

    # ----------------------------------------------
    # 3. CALL LLM
    # ----------------------------------------------

    response = groq.chat.completions.create(
        model="openai/gpt-oss-120b",
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0.3
    )

    answer = response.choices[0].message.content

    # ----------------------------------------------
    # 4. STORE NEW INTERACTION
    # ----------------------------------------------

    hindsight.retain(
    bank_id=BANK_ID,
    content=f"""
Customer ID: {request.customer_id}

Customer message:
{request.message}

SupportMind response:
{answer}
"""
)

    # ----------------------------------------------
    # 5. RETURN RESPONSE
    # ----------------------------------------------

    return {
        "customer_id": request.customer_id,
        "message": request.message,
        "answer": answer,
        "memories_used": memories
    }
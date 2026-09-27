import os
from dotenv import load_dotenv
from hindsight_client import Hindsight

# Load variables from .env
load_dotenv()

# Get Hindsight configuration
base_url = os.getenv("HINDSIGHT_BASE_URL")
api_key = os.getenv("HINDSIGHT_API_KEY")

# Check that the key was loaded
if not api_key:
    print("ERROR: HINDSIGHT_API_KEY was not found.")
    exit()

print("API key loaded successfully!")

# Connect to Hindsight
client = Hindsight(
    base_url=base_url,
    api_key=api_key
)

# Our memory bank
BANK_ID = "supportmind"

print("Creating SupportMind memory bank...")

client.create_bank(
    bank_id=BANK_ID,
    name="SupportMind Customer Support"
)

print("Memory bank created!")

# Store our first customer memory
print("\nStoring customer memory...")

client.retain(
    bank_id=BANK_ID,
    content="""
    Customer Rahul Sharma previously experienced a payment
    failure while purchasing the Pro plan.
    The issue was resolved by retrying the payment gateway.
    Rahul prefers email communication.
    """
)

print("Customer memory stored!")

# Search memory
print("\nRecalling customer memory...")

result = client.recall(
    bank_id=BANK_ID,
    query="What payment problem did Rahul Sharma have previously?"
)

print("\nRelevant memories:")

for memory in result.results:
    print("-", memory.text)

print("\nSUCCESS! Hindsight is working.")
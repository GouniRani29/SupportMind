# 🧠 SupportMind

### Memory-Powered AI Customer Support Agent

SupportMind is an AI-powered customer support application that remembers
previous customer interactions and uses relevant memories to provide
more personalized and contextual responses.

Unlike a basic chatbot that treats every conversation independently,
SupportMind uses **Hindsight memory** to recall relevant information
from previous customer interactions.

---

## 🎯 Problem Statement

Traditional customer-support chatbots often treat every conversation
as a new conversation.

This can lead to:

- Repeated questions from customers
- Loss of previous conversation context
- Generic responses
- Poor personalization
- Inefficient customer support

SupportMind addresses this problem by giving the AI agent a memory
layer that allows it to recall relevant previous interactions.

---

## 💡 Solution

SupportMind combines:

- **React** for the customer interface
- **FastAPI** for the backend API
- **Hindsight** for long-term memory
- **Groq** for AI-powered response generation

The system retrieves relevant customer memories before generating a
response and stores the new interaction for future conversations.

---

## ✨ Key Features

### 🧠 Memory-Powered Conversations

SupportMind remembers previous customer interactions and retrieves
relevant information during future conversations.

### 👤 Dynamic Customer Profiles

The application supports any customer name instead of relying on
predefined users.

A customer name is converted into a unique customer ID.

Example:

```text
Priya Sharma → priya-sharma

import { useState } from "react";
import axios from "axios";
import "./App.css";

function createCustomerId(name) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function App() {
  const [customerName, setCustomerName] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [started, setStarted] = useState(false);

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(false);

  // Start a new customer chat
  const startChat = () => {
    const name = customerName.trim();

    if (!name) {
      alert("Please enter your name.");
      return;
    }

    const id = createCustomerId(name);

    setCustomerId(id);
    setStarted(true);
    setMessages([]);
    setMemories([]);
  };

  // Send message to backend
  const sendMessage = async (e) => {
    e.preventDefault();

    const userMessage = message.trim();

    if (!userMessage || loading) {
      return;
    }

    // Show user's message immediately
    setMessages((prev) => [
      ...prev,
      {
        sender: "user",
        text: userMessage,
      },
    ]);

    setMessage("");
    setLoading(true);

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/chat",
        {
          customer_id: customerId,
          message: userMessage,
        }
      );

      // Add AI response
      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: response.data.answer,
        },
      ]);

      // Update memories
      setMemories(response.data.memories_used || []);
    } catch (error) {
      console.error(error);

      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: "Sorry, I couldn't connect to the SupportMind server. Please make sure the backend is running.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Start another customer
  const newChat = () => {
    setStarted(false);
    setCustomerName("");
    setCustomerId("");
    setMessages([]);
    setMemories([]);
    setMessage("");
  };

  // ---------------- START SCREEN ----------------

  if (!started) {
    return (
      <div className="app">
        <div className="start-page">
          <div className="start-card">

            <div className="brand-icon">🧠</div>

            <h1>SupportMind</h1>

            <p className="tagline">
              Memory-powered AI Customer Support
            </p>

            <p className="description">
              SupportMind remembers previous customer interactions
              and uses that context to provide more personalized
              support.
            </p>

            <div className="start-form">
              <label>Enter your name</label>

              <input
                type="text"
                placeholder="e.g. Priya Sharma"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    startChat();
                  }
                }}
              />

              <button
                className="start-button"
                onClick={startChat}
              >
                Start Chat →
              </button>
            </div>

            <div className="privacy-text">
              🔒 Your conversation is associated with your
              customer profile.
            </div>

          </div>
        </div>
      </div>
    );
  }

  // ---------------- CHAT SCREEN ----------------

  return (
    <div className="app">

      {/* HEADER */}
      <header className="header">

        <div className="brand">
          <div className="brand-small-icon">🧠</div>

          <div>
            <h1>SupportMind</h1>
            <span>AI Customer Support Agent</span>
          </div>
        </div>

        <div className="customer-section">

          <div className="customer-info">
            <span className="customer-label">Customer</span>

            <strong>{customerName}</strong>

            <small>ID: {customerId}</small>
          </div>

          <button
            className="new-chat-button"
            onClick={newChat}
          >
            + New Chat
          </button>

        </div>

      </header>

      {/* MAIN CONTENT */}
      <main className="main-container">

        {/* CHAT SECTION */}
        <section className="chat-card">

          <div className="chat-header">
            <div>
              <h2>Customer Support</h2>
              <p>
                Ask anything and SupportMind will use relevant
                previous interactions.
              </p>
            </div>

            <div className="online-status">
              <span></span>
              AI Online
            </div>
          </div>

          {/* MESSAGES */}
          <div className="messages">

            {messages.length === 0 && (
              <div className="empty-chat">

                <div className="empty-icon">💬</div>

                <h3>How can I help you?</h3>

                <p>
                  Start a conversation with SupportMind.
                  Your previous interactions can be remembered
                  for future conversations.
                </p>

                <div className="suggestions">

                  <button
                    onClick={() =>
                      setMessage("My order has not arrived yet.")
                    }
                  >
                    📦 Order issue
                  </button>

                  <button
                    onClick={() =>
                      setMessage("I am having a payment problem.")
                    }
                  >
                    💳 Payment issue
                  </button>

                  <button
                    onClick={() =>
                      setMessage("I need help with my account.")
                    }
                  >
                    👤 Account help
                  </button>

                </div>

              </div>
            )}

            {messages.map((msg, index) => (
              <div
                key={index}
                className={`message-row ${
                  msg.sender === "user"
                    ? "user-row"
                    : "ai-row"
                }`}
              >

                {msg.sender === "ai" && (
                  <div className="avatar ai-avatar">
                    🧠
                  </div>
                )}

                <div
                  className={`message-bubble ${
                    msg.sender === "user"
                      ? "user-message"
                      : "ai-message"
                  }`}
                >
                  {msg.text}
                </div>

                {msg.sender === "user" && (
                  <div className="avatar user-avatar">
                    {customerName.charAt(0).toUpperCase()}
                  </div>
                )}

              </div>
            ))}

            {loading && (
              <div className="message-row ai-row">

                <div className="avatar ai-avatar">
                  🧠
                </div>

                <div className="message-bubble ai-message">
                  <div className="typing">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>

              </div>
            )}

          </div>

          {/* MESSAGE INPUT */}
          <form
            className="message-form"
            onSubmit={sendMessage}
          >

            <input
              type="text"
              placeholder="Type your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={loading}
            />

            <button
              type="submit"
              disabled={loading || !message.trim()}
            >
              {loading ? "..." : "Send"}
            </button>

          </form>

        </section>

        {/* MEMORY PANEL */}
        <aside className="memory-card">

          <div className="memory-header">

            <div className="memory-title">
              <div className="memory-icon">
                🧠
              </div>

              <div>
                <h2>Memory</h2>
                <p>Powered by Hindsight</p>
              </div>
            </div>

            <span className="memory-count">
              {memories.length}
            </span>

          </div>

          <div className="memory-content">

            {memories.length === 0 ? (
              <div className="no-memory">

                <div className="no-memory-icon">
                  🔍
                </div>

                <h3>No memories yet</h3>

                <p>
                  Relevant previous interactions will
                  appear here when SupportMind recalls them.
                </p>

              </div>
            ) : (
              <>
                <p className="memory-info">
                  Relevant memories used for this response:
                </p>

                {memories.map((memory, index) => (
                  <div
                    className="memory-item"
                    key={index}
                  >
                    <div className="memory-number">
                      {index + 1}
                    </div>

                    <p>{memory}</p>
                  </div>
                ))}
              </>
            )}

          </div>

          <div className="memory-footer">
            <span className="status-dot"></span>
            Hindsight Memory Active
          </div>

        </aside>

      </main>

      {/* FOOTER */}
      <footer className="footer">
        <span>
          SupportMind • Memory-powered customer support
        </span>

        <span>
          FastAPI + Hindsight + Groq + React
        </span>
      </footer>

    </div>
  );
}

export default App;
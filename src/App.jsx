import React, { useState } from "react";
import axios from "axios";
import "./App.css";

const API_URL = `${import.meta.env.VITE_BACKEND_URL}`;
console.log(API_URL)


// Function to format bot messages - remove markdown formatting
const formatBotMessage = (text) => {
  return text
    .replace(/\*\*/g, "") // Remove bold markers
    .replace(/\*/g, "") // Remove italic markers
    .replace(/\\n/g, "\n") // Convert escaped newlines to actual newlines
    .replace(/\\/g, "") // Remove backslashes
    .trim();
};

export default function App() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([{role:"assistant",text:"Hello and welcome to Ninewells Hospital. How can I help you today?"}]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState(null);
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { role: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await axios.post(API_URL, {
        message: input,
        session_id: sessionId,
      });

      setSessionId(res.data.session_id);

      const botMsg = { role: "assistant", text: formatBotMessage(res.data.response) };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "Error connecting to backend" },
      ]);
    }

    setLoading(false);
  };

  return (
    <div>
      <div className="chat-button" onClick={() => setOpen(!open)}>
        💬
      </div>

      {open && (
        <div className="chat-popup">
          <div className="chat-header">Hospital Assistant</div>

          <div className="chat-body">
            {messages.map((m, i) => (
              <div
                key={i}
                className={m.role === "user" ? "user-msg" : "bot-msg"}
              >
                {m.text}
              </div>
            ))}
            {loading && <div className="bot-msg">Typing...</div>}
          </div>

          <div className="chat-input">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask something..."
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              disabled={loading}
            />
            <button onClick={sendMessage} disabled={loading}>Send</button>
          </div>
        </div>
      )}
    </div>
  );
}

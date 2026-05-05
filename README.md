🚀 Sum-Up — Context-Aware Lecture Summarisation

A full-stack AI-powered web application that generates structured, context-aware lecture summaries by combining transcripts with optional course materials.

✨ Overview

Sum-Up is a modern educational tool designed to improve how university students review lectures. Unlike traditional summarisation tools that rely solely on transcripts, this system incorporates lecture slides and supplementary materials as contextual input to produce more accurate and structured summaries.

The output follows a Cornell-inspired format, transforming raw lecture content into a learning-oriented structure that supports efficient revision and active recall.

🧠 Key Idea

Most AI summarisation tools compress text.
Sum-Up restructures knowledge for learning.

Instead of generating a paragraph summary, Sum-Up produces:

🎯 Learning Goals
📌 Structured Main Points
💡 Key Takeaways
❓ Review Questions

This improves readability, comprehension, and long-term retention.

⚙️ Tech Stack
Frontend: Next.js + Material UI
Backend: Next.js API Routes (Node.js)
AI Pipeline: Python (LLM-based summarisation)
Database: MongoDB (document-based storage)
Deployment: Vercel

🚀 Features
🧾 Context-Aware Summarisation
Uses transcript as primary source
Enhances output with slides & supplementary materials
Prevents hallucination via strict source control

🧩 Structured Learning Output
Cornell-inspired format for better study experience
Improves:
Readability
Information hierarchy
Active recall

🔄 Full Learning Workflow (CRUD)
Create summaries
View & search history
Delete entries
Download summaries for offline use

⚡ Smart Input System
Required: Transcript
Optional: Slides & materials
Flexible usage:
Quick summaries (transcript only)
High-quality summaries (context-enhanced)

📊 Dashboard & History Management
Summary table with metadata (subject, topic, date)
Search & filter functionality
Persistent storage via MongoDB

⏳ Real-Time Feedback
Loading state during AI processing
Clear UI guidance to prevent invalid input

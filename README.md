# 🚀 Sum-Up — Context-Aware Lecture Summarisation

A full-stack AI-powered web application that generates **structured, context-aware lecture summaries** by combining transcripts with optional course materials.

---

## ✨ Overview

**Sum-Up** is an educational tool designed to improve how university students review lectures. Unlike traditional summarisation tools that rely solely on transcripts, this system incorporates **lecture slides and supplementary materials as contextual input** to produce more accurate and structured summaries.

The output follows a **Cornell-inspired format**, transforming raw lecture content into a learning-oriented structure that supports **efficient revision and active recall**.

---

## 🧠 Key Idea

> Most AI summarisation tools compress text.  
> **Sum-Up restructures knowledge for learning.**

Instead of generating a paragraph summary, Sum-Up produces:

- 🎯 Learning Goals  
- 📌 Structured Main Points  
- 💡 Key Takeaways  
- ❓ Review Questions  

---

## ⚙️ Tech Stack

- Frontend: Next.js + Material UI  
- Backend: Next.js API Routes (Node.js)  
- AI Pipeline: Python (LLM-based summarisation)  
- Database: MongoDB  
- Deployment: Vercel  

---

## 🚀 Features

### 🧾 Context-Aware Summarisation
- Transcript as primary input  
- Optional slides & materials for enhanced context  
- Controlled generation to reduce hallucination  

### 🧩 Structured Learning Output
- Cornell-inspired format  
- Improves readability, structure, and retention  

### 🔄 Full Learning Workflow (CRUD)
- Create summaries  
- View & search history  
- Delete entries  
- Download summaries  

### ⚡ Smart Input System
- Required: Transcript  
- Optional: Slides & materials  
- Supports both quick and enhanced workflows  

### 📊 Dashboard & History Management
- Summary table with metadata  
- Search and filtering  
- Persistent storage  

### ⏳ Real-Time Feedback
- Loading state during processing  
- Guided user input validation  

---

## 🧠 AI System Design

### 🔹 Multi-Stage Pipeline
- Input preprocessing  
- Multi-source input construction  
- Controlled LLM generation  
- Output post-processing  

### 🔹 Source Hierarchy
- Transcript = authoritative source  
- Slides = structural guide  
- Materials = supporting context  

### 🔹 Prompt Engineering
- Anti-hallucination constraints  
- Coverage enforcement  
- Structured JSON output  

### 🔹 Output Stability
- Handles malformed LLM responses  
- Ensures consistent rendering  

---

## 🖥️ Application Workflow

1. Dashboard  
   - View and manage summaries  

2. Upload  
   - Input subject and topic  
   - Upload transcript  
   - Add optional materials  

3. Processing  
   - AI generates structured summary  

4. Results  
   - Learning Goals  
   - Summary  
   - Takeaway  
   - Review Questions  

5. Post-Use  
   - Save to database  
   - Download  
   - Revisit anytime  

---

## 📱 User Experience

- Designed for university students  
- Minimal interaction and clear navigation  
- Reduced cognitive load  
- Fully responsive (mobile + desktop)  

---

## 📊 Evaluation

Baseline vs Enhanced comparison:

- Baseline: Transcript only  
- Enhanced: Transcript + context  

### Results:
- Improved accuracy and coherence  
- Better structure and terminology  
- Reduced transcription errors  

---

## 📂 Project Structure

/app        → Pages (Dashboard, Upload, Results)  
/components → Reusable UI components  
/python     → AI summarisation pipeline  
/api        → Backend routes  
/models     → Database schemas  

---

## 🚀 Getting Started

```bash
npm install
npm run dev
```
---

## 🧠 AI Setup (Python + LLM)

This project uses a Python-based pipeline for AI-powered lecture summarisation.

### 🔹 1. Install Python

Ensure you have Python installed:

- Python 3.14.x (supported)

Verify installation:

```bash
python --version
pip install pymupdf openai ollama
```


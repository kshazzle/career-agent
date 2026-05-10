# 🧠 OfferForge — AI Resume Optimization Agent

## 🌌 Overview

OfferForge is a lightweight AI-powered web application that helps users tailor their resumes for specific job descriptions.

Instead of sending a generic resume to every job, users generate **job-specific, ATS-optimized resumes in seconds**, improving their chances of getting shortlisted.

The product focuses on:
- Resume-job alignment
- ATS optimization
- Impact-driven rewriting

---

## 🎯 Goals

### Primary Goal
Increase interview callback rates by improving resume relevance and quality.

### Secondary Goals
- Reduce time spent customizing resumes
- Showcase a strong full-stack + AI project

---

## 👤 Target Users

### Primary Users
- Software engineers (0–5 years experience)
- Candidates transitioning into AI / Quant roles
- Active job seekers applying to multiple roles

### Secondary Users
- Students applying for internships
- Career switchers across domains

---

## 🧩 Core Features (MVP)

### 1. Resume Input
- User pastes resume text into input field

### 2. Job Description Input
- User pastes job description

### 3. Resume Optimization
- AI rewrites resume to:
  - Improve clarity
  - Add impact and metrics
  - Align with job requirements

### 4. Match Score
- Displays a percentage score indicating alignment with the job

### 5. Missing Keywords
- Highlights important skills/keywords missing from the resume

### 6. Optimized Output
- Clean, copyable optimized resume

---

## 🧪 User Flow

1. User opens the app  
2. Inputs resume and job description  
3. Clicks "Optimize"  
4. Sees loading indicator  
5. Receives:
   - Optimized resume
   - Match score
   - Missing keywords  
6. Copies output and applies to jobs  

---

## 🎨 Frontend (React)

### Tech Stack
- React (Vite recommended)
- Axios for API calls

### Component Structure

```
App
 ├── Header
 ├── InputSection
 │     ├── ResumeInput
 │     ├── JobInput
 │     └── OptimizeButton
 ├── Loader
 └── OutputSection
       ├── MatchScore
       ├── MissingKeywords
       └── OptimizedResume
```

### UI Requirements
- Minimal, clean interface
- Dark theme preferred
- Responsive layout
- Copy-to-clipboard functionality
- Loading spinner during processing

---

## ⚙️ Backend (FastAPI - Python)

### Tech Stack
- Python
- FastAPI
- OpenAI API (LLM)

### API Endpoint

#### POST `/optimize`

**Request**
```json
{
  "resume": "string",
  "job_description": "string"
}
```

**Response**
```json
{
  "optimized_resume": "string",
  "match_score": 72,
  "missing_keywords": ["Python", "SQL", "Machine Learning"]
}
```

---

## 🧠 Core Logic

### 1. Job Description Parsing
- Extract relevant skills and keywords

### 2. Resume Parsing
- Identify existing skills and experience

### 3. Keyword Matching
- Compute overlap between resume and job description

### 4. Match Score Calculation
- Based on:
  - Keyword overlap
  - Semantic similarity

### 5. Resume Optimization (LLM)
- Rewrite resume using:
  - Strong action verbs
  - Quantified impact
  - Role-specific keywords

---

## 🏗️ Architecture

```
React Frontend → FastAPI Backend → LLM API → Response → Frontend
```

- Stateless backend
- No database required for MVP

---

## ⚖️ Constraints & Assumptions

### Constraints
- No authentication (MVP)
- No persistent storage
- Dependent on LLM latency

### Assumptions
- Users provide clean text input
- Users manually copy output for applications

---

## ⚠️ Risks

### 1. Generic Output
LLM responses may lack uniqueness  
→ Mitigation: strong prompt engineering

### 2. Over-Optimization
Too many keywords may reduce readability  
→ Balance natural language and optimization

### 3. Latency
Slow responses due to LLM  
→ Show loader and optimize prompts

---

## 🚀 Future Enhancements

### Phase 2
- PDF upload and parsing
- Download formatted resume (PDF)
- Resume version history

### Phase 3
- Application tracking dashboard
- Feedback loop (learn from outcomes)

### Phase 4
- Quant/AI specialization mode
- Recruiter simulation feedback
- Personalized career recommendations

---

## 💡 Differentiation

OfferForge is not a resume builder.

It is:
- Context-aware
- Job-specific
- Outcome-focused

It optimizes for **getting shortlisted**, not just looking good.

---

## 🏁 Success Criteria

- Users generate tailored resumes in < 30 seconds
- Match score improves across iterations
- Increased interview callbacks (self-reported)

---

## ⚡ Tech Decisions

### Backend Choice: Python (FastAPI)

**Why:**
- Strong AI ecosystem
- Faster iteration
- Better tooling for NLP and prompt experimentation

### Frontend Choice: React

**Why:**
- Clean UI/UX
- Industry standard
- Demonstrates full-stack capability

---

## 📌 Summary

OfferForge is a focused AI agent designed to improve job application outcomes through intelligent resume optimization.

It combines:
- AI-powered rewriting
- Keyword alignment
- Simple UX

to help users move from **applying blindly → applying strategically**.
`
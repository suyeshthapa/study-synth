# Study - Synth 

## About 

Study-Synth is a web application designed to improve the study habits of students through a variety of features discussed below. 


### **Automatic Lesson Plan Generation**
Study-Synth uses AI to create personalized lesson plans based on the student’s goals, study pace, and subject focus. Each plan adapts over time to help learners stay consistent and productive without overwhelming them.

### **Comprehensive Note Summaries**
The platform can condense lengthy notes, lecture recordings, and reading material into concise, structured summaries. This helps students quickly review key concepts and retain important information more effectively.

### ** Calendar **
A built-in calendar helps students organize classes, assignments, revision deadlines, and planned study sessions in one place. It brings clarity to long-term academic planning and reduces missed commitments.

### ** Ratings Section **
Students can rate lessons, materials, and personalized suggestions to provide feedback. These ratings help improve recommendation quality and make the platform more responsive to student needs.


## AI Architecture
Study-Synth will use special AI agents to coordinate lesson planning, summarization, scheduling, and recommendation flows. These agents work together to interpret academic inputs, generate useful study guidance, and support a more adaptive learning experience.

## Project Design and Tech Stack
Study-Synth is designed as a modern student productivity platform combining AI-driven insights with a clean user experience. The system is structured around a web frontend, an intelligent backend, and a data layer that supports user progress, notes, and planning.

```text
Frontend: Web application for study planning, summaries, and learning feedback
Backend: AI orchestration, APIs, and business logic
Data Layer: User information, study records, plans, and scheduling data
AI Layer: Personalized lesson generation and content summarization
```

| Technology | Function | Version |
| ----------- | -------- | ------- |
| Python | Core backend logic and AI service orchestration | 3.11+ |
| FastAPI | API development for backend services | 0.115+ |
| React | Frontend interface for the student experience | 18.x |
| PostgreSQL | Relational database for user and study data | 15.x |
| OpenAI / LLM APIs | AI-powered lesson planning and summarization | Latest |
| Docker | Containerization for consistent deployment | Latest |
| GitHub Actions | CI/CD automation and repository workflows | Latest |

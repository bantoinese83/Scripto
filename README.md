# Scripto: Your Collaborative Script Hub

Scripto is a web application designed to help developers discover, share, and collaborate on code snippets and scripts.  It features:

* **Anonymous Uploads:** Share your scripts without revealing your identity.
* **Searchable Database:** Easily find scripts using keywords, languages, tags, and categories.
* **Metadata Generation:**  Uses AI to automatically generate metadata for uploaded scripts (Title, Description, Tags, etc.).
* **Community Collaboration:**  Connect with other developers and share your knowledge.

## Technologies Used

* **Frontend:** React, Tailwind CSS, Lucide-React, react-syntax-highlighter
* **Backend:** FastAPI, SQLAlchemy, SQLite, Google Gemini

## Getting Started

1. **Clone the repository:** `git clone <https://github.com/bantoinese83/Scripto.git`
2. **Install dependencies:**
   * Frontend: `cd frontend && npm install`
   * Backend: `cd backend && pip install -r requirements.txt`
3. **Set up the database:** Create an empty SQLite database file named `metadata.db` in the backend directory.
4. **Set Environment Variables:**  Set the `GEMINI_API_KEY` environment variable with your Google Gemini API key.
5. **Run the application:**
   * Backend: `cd backend && uvicorn main:app --reload`
   * Frontend: `cd frontend && npm start`


## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

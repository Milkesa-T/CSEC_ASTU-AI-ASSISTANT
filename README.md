# CSEC ASTU AI Assistant

An intelligent RAG (Retrieval-Augmented Generation) chatbot system built for CSEC ASTU, featuring document upload, knowledge base management, and AI-powered question answering.

## 🚀 Features

- **AI-Powered Chat**: Intelligent responses using RAG technology with ChromaDB vector database
- **Document Management**: Upload and process PDF documents to build a knowledge base
- **User Authentication**: Secure login and registration system with role-based access
- **Admin Dashboard**: Manage documents and monitor system usage
- **Chat History**: Persistent conversation storage and retrieval
- **Modern UI**: Beautiful, responsive React interface with smooth animations

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **CSS3** with modern animations and glassmorphism effects
- **Context API** for state management

### Backend
- **FastAPI** - High-performance Python web framework
- **SQLAlchemy** - Database ORM
- **ChromaDB** - Vector database for RAG
- **Groq API** - LLM integration
- **Passlib** - Password hashing
- **PyPDF2** - PDF processing

## 📋 Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.8+
- **Git**

## 🔧 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/Milkesa-T/CSEC_ASTU-AI-ASSISTANT-.git
cd CSEC_ASTU-AI-ASSISTANT-
```

### 2. Backend Setup

```bash
cd Back-End

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
# Add the following variables:
# GROQ_API_KEY=your_groq_api_key
# SECRET_KEY=your_secret_key_for_jwt
# MAIL_USERNAME=your_email@gmail.com
# MAIL_PASSWORD=your_app_password

# Run the backend
uvicorn app.main:app --reload
```

The backend will run on `http://localhost:8000`

### 3. Frontend Setup

```bash
cd Front-End

# Install dependencies
npm install

# Create .env file (optional)
# VITE_API_URL=http://localhost:8000

# Run the development server
npm run dev
```

The frontend will run on `http://localhost:5173`

## 🎯 Usage

### For Users

1. **Register/Login**: Create an account or login with existing credentials
2. **Ask Questions**: Type your questions in the chat interface
3. **View History**: Access previous conversations from the sidebar

### For Admins

1. **Upload Documents**: Navigate to the admin dashboard to upload PDF files
2. **Manage Knowledge Base**: View and delete uploaded documents
3. **Monitor Usage**: Track system usage and user interactions

## 📁 Project Structure

```
RAG-Project/
├── Back-End/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py          # FastAPI application
│   │   ├── auth.py          # Authentication logic
│   │   ├── database.py      # Database configuration
│   │   ├── models.py        # SQLAlchemy models
│   │   ├── rag.py           # RAG implementation
│   │   └── mail.py          # Email functionality
│   ├── uploads/             # Uploaded documents
│   ├── chroma_db/           # Vector database (gitignored)
│   ├── requirements.txt
│   └── .env                 # Environment variables (gitignored)
│
├── Front-End/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── context/         # Context providers
│   │   ├── pages/           # Page components
│   │   ├── App.tsx          # Main app component
│   │   └── main.tsx         # Entry point
│   ├── public/              # Static assets
│   ├── package.json
│   └── vite.config.ts
│
└── .gitignore
```

## 🔐 Environment Variables

### Backend (.env)

```env
GROQ_API_KEY=your_groq_api_key
SECRET_KEY=your_jwt_secret_key
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_gmail_app_password
```

### Frontend (.env - optional)

```env
VITE_API_URL=http://localhost:8000
```

## 🚀 Deployment

### Frontend (Vercel)

1. Push your code to GitHub
2. Import the project in Vercel
3. Set the root directory to `Front-End`
4. Deploy

### Backend (Render/Railway)

1. Create a new web service
2. Connect your GitHub repository
3. Set the root directory to `Back-End`
4. Add environment variables
5. Deploy

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the MIT License.

## 👥 Authors

- **Milkesa-T** - [GitHub](https://github.com/Milkesa-T)

## 🙏 Acknowledgments

- CSEC ASTU for project inspiration
- Groq for LLM API
- ChromaDB for vector database
- FastAPI and React communities

---

**Note**: Make sure to keep your `.env` files secure and never commit them to version control.

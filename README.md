## Backend Setup

### 19 October 2026 — FastAPI Backend Initialization

- Initialized FastAPI backend
- Configured CORS for React frontend integration
- Added SQLite database connection using SQLAlchemy
- Created initial Document database model
- Added health check API endpoint
- Added `.gitignore` rules for Python environment, local database, uploads, and secrets

### Technologies

- **Frontend:** React, Vite, Tailwind CSS, Lucide React
- **Backend:** Python, FastAPI, Uvicorn
- **Database:** SQLite, SQLAlchemy

### Run the Project Locally

**1. Clone the repository**

```bash
git clone https://github.com/aryanhiremath/Secure_Trace_AI.git
cd Secure_Trace_AI
```

**2. Start the frontend**

```bash
cd frontend
npm install
npm run dev
```

**3. Start the backend**

Open a separate terminal from the project root:

```bash
cd backend
python -m venv venv
```

Activate the virtual environment on Windows PowerShell:

```powershell
.\venv\Scripts\Activate.ps1
```

Install backend dependencies:

```bash
pip install fastapi "uvicorn[standard]" python-multipart sqlalchemy
```

Run the backend:

```bash
uvicorn main:app --reload
```

**Backend URLs**

- Health Check: http://127.0.0.1:8000/api/health
- API Documentation: http://127.0.0.1:8000/docs

### Team Workflow

1. Pull the latest changes before starting work:

   ```bash
   git pull origin main
   ```

2. Create a separate feature branch for new features when possible.
3. Test changes locally before committing.
4. Use meaningful commit messages and push completed changes.
5. Never commit virtual environments, private uploads, database files, or secrets.

**Note:** The backend currently contains the initial API setup and document model. Document upload APIs, authentication, encryption, and secure sharing backend functionality are still to be implemented.
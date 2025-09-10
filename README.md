# Space Debris Risk Model

This project simulates and visualizes potential space debris close-approach events, powered by a FastAPI backend (Python) and a Next.js frontend (React). Deployment and additional features are in progress.

## Project Structure

- `api/` — Python backend for data processing and serving APIs
- `web/` — Next.js frontend for 3D visualization and UI

## Getting Started

### 1. Clone the repository

```sh
git clone <your-repo-url>
cd space-debris-risk-model
```

### 2. API (Python)

- Navigate to `api/`
- Install dependencies:
  ```sh
  pip install -r requirements.txt
  ```
- Run the API:
  ```sh
  python main.py
  ```

### 3. Web (Next.js)

- Navigate to `web/`
- Install dependencies:
  ```sh
  npm install
  ```
- Run the development server:
  ```sh
  npm run dev
  ```
- Visit [http://localhost:3000](http://localhost:3000) in your browser.

## Quick Start for Contributors

1. **Clone the repository:**

   ```sh
   git clone <your-repo-url>
   cd space-debris-risk-model
   ```

2. **Set up the Python API:**

   - Go to the `api` folder:
     ```sh
     cd api
     ```
   - (Optional but recommended) Create a virtual environment:
     ```sh
     python -m venv .venv
     .venv\Scripts\activate  # On Windows
     # or
     source .venv/bin/activate  # On Mac/Linux
     ```
   - Install dependencies:
     ```sh
     pip install -r requirements.txt
     ```
   - Run the API server:
     ```sh
     python main.py
     ```

3. **Set up the Web Frontend:**

   - Open a new terminal and go to the `web` folder:
     ```sh
     cd web
     ```
   - Install dependencies:
     ```sh
     npm install
     ```
   - Start the development server:
     ```sh
     npm run dev
     ```
   - Visit [http://localhost:3000](http://localhost:3000) in your browser.

4. **Notes:**
   - The `.gitignore` is set up to avoid committing dependencies, build artifacts, and environment files for both Python and Node.js.
   - The API will be available at [http://localhost:8000](http://localhost:8000) by default.
   - For deployment or production, see the respective `README.md` files in `api/` and `web/` (if present) for more details.

## License


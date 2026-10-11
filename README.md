# FSU Citation Network

A small web app for exploring citation links between Florida State University papers. It displays papers as nodes and citation links as edges; hover over a node to see paper details, and drag or zoom to explore the network.

## Motivation

The project makes connections among FSU research papers easier to see than they are in a list, helping reveal how the papers relate through citations.

## Tech stack

- **Frontend:** Vue 3, D3.js, and Vite
- **Backend:** Python, Flask, Flask-CORS, and pandas
- **Data:** CSV files in `backend/data/`

## Run locally

You will need Miniconda or Anaconda, plus Node.js/npm. Start the backend and frontend in separate terminals. On Windows, use **Anaconda Prompt (Miniconda3)** for the backend commands.

1. Create and activate the course Conda environment. If you already created `dvjupyter` for the course, skip the `conda create` command:

   ```text
   conda create -n dvjupyter python=3.11 -y
   conda activate dvjupyter
   ```

2. Install the backend packages and start the API:

   ```text
   python -m pip install Flask Flask-Cors pandas
   python backend/app.py
   ```

   The API runs at `http://127.0.0.1:5001`.

3. In a second terminal, install the frontend packages and start Vite:

   ```text
   cd frontend
   npm install
   npm run dev
   ```

4. Open the local URL printed by Vite in your browser. Keep both servers running while using the app.

The backend reads citation links from `backend/data/paper_citation_links_within_fsu.csv` and paper metadata from `backend/data/fsu_works_2021_2026.csv`.

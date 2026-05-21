# Battleship RL Command Center Webapp (`battleship-rl-webapp`)

This is a crisp, responsive, high-fidelity Next.js web application designed to connect to the containerized Battleship Reinforcement Learning game backend. Play Battleship in real-time against state-of-the-art Deep Q-Learning (`q-agent`) and Bayesian Probability agents.

Built with a **Clean Tactical Ocean / Blueprint Theme** utilizing standard Next.js, React Hooks, and CSS modules. Optimized for seamless, native deployment on **Vercel**.

---

## Visual Design & User Experience
- **Tactical Blueprint Theme**: A clean maritime radar blueprint aesthetic with primary deep navy accents, slate gray grids, coral red indicators for hits, and seafoam details for ships.
- **Manual Fleet Placement**: Intuitive click-to-deploy placement mechanism. Hover grid cells to visualize ship lengths, press `R` or right-click to rotate, and click to deploy.
- **Interactive Battle Boards**: Tracks hit and miss indicators (`✕` and `•`), handles screen shakes on successful hit impacts, and provides live operational log columns.
- **Dynamic Accuracy Statistics**: Shows progress bars for fleet health/integrity alongside total direct hits.

---

## Local Development

### 1. Prerequsite: Run the Backend
Ensure the FastAPI game server is running locally (e.g., from the `containerization` branch of `battleship_rl` on port `8888` or `8080`):
```bash
conda activate battleship-rl
pip install fastapi uvicorn[standard]
uvicorn server:app --reload --port 8080
```

### 2. Run the Webapp
Install npm packages and launch the Next.js development server:
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser. Configure the Setup input box to connect to your backend URL (`http://localhost:8080`).

---

## Vercel Deployment

This project is fully ready for a 1-click zero-config deployment on Vercel:

1. **Push to GitHub**: Push this repository to your GitHub account under `battleship-rl-webapp`.
2. **Import to Vercel**: Connect your Vercel account to GitHub and import the `battleship-rl-webapp` repository.
3. **Environment Variables**: (Optional) Add `NEXT_PUBLIC_API_URL` pointing to your FastAPI backend hosted on GCP Cloud Run.
4. **Deploy**: Click Deploy. Vercel will automatically compile, optimize, and serve your app globally.

### Secure WebSockets (WS vs WSS)
Since Vercel serves the webapp over HTTPS, modern browsers enforce secure WebSocket connections (`wss://`). The state engine of this application automatically handles mapping `https://` backend endpoints to secure `wss://` WebSockets, ensuring seamless out-of-the-box compatibility.

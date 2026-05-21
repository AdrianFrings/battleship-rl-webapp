# Battleship RL - Command Center Webapp

This repository contains the interactive, responsive React/Next.js front-end web application for the Battleship Reinforcement Learning project. 

It provides a premium, clean navy tactical interface allowing players to deploy their fleets manually and play Battleship in real-time against state-of-the-art AI agents (including Deep Q-Learning DQN and Bayesian models) over secure WebSockets.

---

## 🔗 Main Project Repository

The core game logic, agent training pipelines, cognitive human-like placement heuristics, and containerized FastAPI backend are hosted in the primary repository:

👉 **[battleship_rl (Core Agent & Environment Repo)](https://github.com/HumbleHominid/battleship_rl)**

Please refer to the main repository for:
* **Reinforcement Learning Models**: DQN architectures, reward function configurations, and training pipelines.
* **FastAPI Backend Server**: The containerized game runner that exposes WebSockets for real-time play.
* **Simulation & Analysis**: Heatmaps and training convergence analysis for tactical agents.

---

## Local Development Quickstart

1. **Install dependencies**:
   ```bash
   npm install
   ```
2. **Run the development server**:
   ```bash
   npm run dev
   ```
3. Open [http://localhost:3000](http://localhost:3000) in your browser.
4. Input your active running backend server URL (e.g. `http://localhost:8080`) in the *Operational API Gateway* input inside the control room to launch your game session.

---

## Vercel Deployment

This web application is optimized for native, zero-config deployment on Vercel:
1. Import this repository into Vercel.
2. Deploy! The front-end automatically upgrades your HTTP connection to Secure WebSockets (`wss://`) when pointing to production cloud APIs (e.g. FastAPI on GCP Cloud Run).

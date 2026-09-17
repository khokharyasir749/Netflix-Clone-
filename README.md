# Netflix Clone

A pixel-perfect, responsive Netflix streaming web application built with React, Vite, and Tailwind CSS. Features dynamic video player simulation, authentic hero billboards, horizontal movie carousels, detailed modals, profile switching, real TMDB movie artwork, and watchlist persistence.

## ✨ Features

- **Cinematic Hero Billboard**: Full-bleed dynamic billboard featuring random featured titles with high-res TMDB backdrops, maturity ratings, match rates, sound controls, and action buttons.
- **Authentic Movie Rows & Carousels**:
  - Netflix Originals (large portrait aspect ratio)
  - Trending Now, Top Rated, Action, Comedy, Horror, Romance, Documentaries
  - Smooth hover expansion with quick action overlays (Play, Add to List, Like, Expand)
  - Permanent title, match percentage, release year, and maturity tags beneath every card
- **Interactive Detail Modal**:
  - Full backdrop video banner preview
  - Synopsis overview, creators, cast list, audio/subtitle information
  - "More Like This" recommended movies grid
  - Add to / remove from Watchlist
- **Simulated Video Player**: Fullscreen player with real-time scrub bar, playback controls, skip 10s forward/back, volume toggle, and fullscreen support.
- **Profile Switching & Gate**: Switch between user profiles (e.g. Yasir, Kids, Guest) with persistent local storage.
- **Search & Live Filtering**: Real-time debounced search bar with dedicated results page and navbar category filters (TV Shows, Movies, New & Popular).
- **Watchlist (My List)**: Persistent local storage for user watchlist.
- **100% Verified TMDB Media**: Zero stock photos; all titles feature genuine, high-resolution official TMDB posters and backdrops.

## 🛠️ Tech Stack

- **Framework**: React 19 + Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Routing**: React Router DOM
- **State Management**: React Context API + LocalStorage
- **Data & Artwork**: The Movie Database (TMDB) API & Official CDN

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/khokharyasir749/Netflix-Clone-.git
   cd Netflix-Clone-
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. (Optional) Configure TMDB API Key:
   Create a `.env` file in the root directory:
   ```env
   VITE_TMDB_API_KEY=your_tmdb_api_key_here
   ```
   *Note: If no API key is provided, the application seamlessly falls back to the curated 100% verified TMDB catalog.*

4. Run development server:
   ```bash
   npm run dev
   ```

5. Build for production:
   ```bash
   npm run build
   ```

## 📄 License

This project is open-source and available under the MIT License.

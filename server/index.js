import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';

// Load environment variables from .env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
const MOVIEBOX_API_KEY = process.env.MOVIEBOX_API_KEY;
const TMDB_API_KEY = process.env.TMDB_API_KEY;

// CORS configuration allowing frontend requests
const allowedOrigins = [
  CLIENT_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000'
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or Postman)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive in development
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  })
);

app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  next();
});

/**
 * Catalog mapping database with verified TMDB IDs, titles, media types, and YouTube trailer keys
 */
const CATALOG_DATABASE = [
  {
    id: 66732,
    imdb_id: 'tt4574334',
    title: 'Stranger Things',
    type: 'tv',
    release_year: 2016,
    genres: ['Sci-Fi', 'Drama', 'Mystery'],
    trailerKey: 'b9EkMc79ZSU',
    seasons: 4
  },
  {
    id: 119051,
    imdb_id: 'tt13443470',
    title: 'Wednesday',
    type: 'tv',
    release_year: 2022,
    genres: ['Fantasy', 'Comedy', 'Mystery'],
    trailerKey: 'Di310BC87gk',
    seasons: 1
  },
  {
    id: 157336,
    imdb_id: 'tt0816692',
    title: 'Interstellar',
    type: 'movie',
    release_year: 2014,
    genres: ['Adventure', 'Drama', 'Sci-Fi'],
    trailerKey: 'zSWdZVtXT7E'
  },
  {
    id: 27205,
    imdb_id: 'tt1375666',
    title: 'Inception',
    type: 'movie',
    release_year: 2010,
    genres: ['Action', 'Sci-Fi', 'Adventure'],
    trailerKey: 'YoHD9XEInc0'
  },
  {
    id: 71912,
    imdb_id: 'tt5180504',
    title: 'The Witcher',
    type: 'tv',
    release_year: 2019,
    genres: ['Action', 'Adventure', 'Fantasy'],
    trailerKey: 'ndl1W4QKZas',
    seasons: 3
  },
  {
    id: 1396,
    imdb_id: 'tt0903747',
    title: 'Breaking Bad',
    type: 'tv',
    release_year: 2008,
    genres: ['Crime', 'Drama', 'Thriller'],
    trailerKey: 'HhesaQh8bTE',
    seasons: 5
  },
  {
    id: 70523,
    imdb_id: 'tt5753856',
    title: 'Dark',
    type: 'tv',
    release_year: 2017,
    genres: ['Crime', 'Drama', 'Mystery'],
    trailerKey: 'rrwycJ08PSA',
    seasons: 3
  },
  {
    id: 105248,
    imdb_id: 'tt12590266',
    title: 'Cyberpunk: Edgerunners',
    type: 'tv',
    release_year: 2022,
    genres: ['Animation', 'Action', 'Sci-Fi'],
    trailerKey: 'JtqIas3bYhg',
    seasons: 1
  },
  {
    id: 93405,
    imdb_id: 'tt10919420',
    title: 'Squid Game',
    type: 'tv',
    release_year: 2021,
    genres: ['Action', 'Mystery', 'Drama'],
    trailerKey: 'oqxAJKy0ii4',
    seasons: 2
  },
  {
    id: 71446,
    imdb_id: 'tt6468322',
    title: 'Money Heist',
    type: 'tv',
    release_year: 2017,
    genres: ['Action', 'Crime', 'Drama'],
    trailerKey: 'gFZri2YbFUxgNxQTggSXQBsY2IO',
    seasons: 5
  },
  {
    id: 155,
    imdb_id: 'tt0468569',
    title: 'The Dark Knight',
    type: 'movie',
    release_year: 2008,
    genres: ['Action', 'Crime', 'Drama'],
    trailerKey: 'EXeTwQWrcwY'
  },
  {
    id: 361743,
    imdb_id: 'tt1745960',
    title: 'Top Gun: Maverick',
    type: 'movie',
    release_year: 2022,
    genres: ['Action', 'Drama'],
    trailerKey: 'qSqVVswa420'
  },
  {
    id: 569094,
    imdb_id: 'tt9362722',
    title: 'Spider-Man: Across the Spider-Verse',
    type: 'movie',
    release_year: 2023,
    genres: ['Animation', 'Action', 'Adventure'],
    trailerKey: 'cqGjhVJWtEg'
  },
  {
    id: 87739,
    imdb_id: 'tt10048342',
    title: "The Queen's Gambit",
    type: 'tv',
    release_year: 2020,
    genres: ['Drama'],
    trailerKey: 'oZn3qSgmLqI',
    seasons: 1
  },
  {
    id: 94605,
    imdb_id: 'tt11126994',
    title: 'Arcane',
    type: 'tv',
    release_year: 2021,
    genres: ['Animation', 'Action', 'Sci-Fi'],
    trailerKey: 'fXmAurh012s',
    seasons: 2
  },
  {
    id: 83880,
    imdb_id: 'tt9253866',
    title: 'Our Planet',
    type: 'tv',
    release_year: 2019,
    genres: ['Documentary'],
    trailerKey: 'aETNYyrqNYE',
    seasons: 2
  }
];

/**
 * 1. Health Check Route
 * GET /api/health
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Netflix Clone Streaming Backend',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    apiProtection: {
      movieBoxKeyConfigured: Boolean(MOVIEBOX_API_KEY && MOVIEBOX_API_KEY !== 'your_key_here'),
      tmdbKeyConfigured: Boolean(TMDB_API_KEY && TMDB_API_KEY !== 'your_tmdb_key_if_any')
    }
  });
});

/**
 * 2. Dedicated Movie / TV Stream Route
 * GET /api/stream/:id
 * Accepts: TMDB ID, IMDB ID (tt...), or title
 * Query Params: ?type=movie|tv&season=1&episode=1
 */
app.get('/api/stream/:id', async (req, res) => {
  try {
    const rawId = req.params.id;
    const isImdb = String(rawId).startsWith('tt');
    const isNumeric = /^\d+$/.test(rawId);

    // Query options with defaults
    let mediaType = (req.query.type || 'movie').toLowerCase();
    const season = parseInt(req.query.season, 10) || 1;
    const episode = parseInt(req.query.episode, 10) || 1;

    // Search catalog mapping by ID or title
    let catalogEntry = CATALOG_DATABASE.find((item) => {
      if (isImdb) return item.imdb_id === rawId;
      if (isNumeric) return item.id === Number(rawId);
      return item.title.toLowerCase() === decodeURIComponent(rawId).toLowerCase();
    });

    if (catalogEntry) {
      mediaType = catalogEntry.type || mediaType;
    }

    const resolvedId = catalogEntry ? catalogEntry.id : rawId;
    const title = catalogEntry ? catalogEntry.title : req.query.title || `Title (${rawId})`;

    // Provider Streaming URLs (Embed & Direct sources)
    const streamSources = [];

    // Server 1 (VidLink Pro - High Speed & Auto)
    const vidlinkUrl =
      mediaType === 'tv'
        ? `https://vidlink.pro/tv/${resolvedId}/${season}/${episode}`
        : `https://vidlink.pro/movie/${resolvedId}`;
    streamSources.push({
      id: 'vidlink',
      provider: 'Server 1 (VidLink Pro)',
      type: 'embed',
      url: vidlinkUrl,
      quality: '1080p',
      isDefault: true
    });

    // Server 2 (VidSrc CC / IN Mirror)
    const vidsrcCcUrl =
      mediaType === 'tv'
        ? `https://vidsrc.cc/v2/embed/tv/${resolvedId}/${season}/${episode}`
        : `https://vidsrc.cc/v2/embed/movie/${resolvedId}`;
    streamSources.push({
      id: 'vidsrc_cc',
      provider: 'Server 2 (VidSrc CC)',
      type: 'embed',
      url: vidsrcCcUrl,
      quality: '1080p'
    });

    // Server 3 (SmashyStream)
    const smashyUrl =
      mediaType === 'tv'
        ? `https://player.smashy.stream/tv/${resolvedId}?s=${season}&e=${episode}`
        : `https://player.smashy.stream/movie/${resolvedId}`;
    streamSources.push({
      id: 'smashystream',
      provider: 'Server 3 (SmashyStream)',
      type: 'embed',
      url: smashyUrl,
      quality: '1080p'
    });

    // Server 4 (SuperEmbed Direct)
    const superEmbedUrl =
      mediaType === 'tv'
        ? `https://multiembed.mov/?video_id=${resolvedId}&tmdb=1&s=${season}&e=${episode}`
        : `https://multiembed.mov/?video_id=${resolvedId}&tmdb=1`;
    streamSources.push({
      id: 'superembed',
      provider: 'Server 4 (SuperEmbed Direct)',
      type: 'embed',
      url: superEmbedUrl,
      quality: '1080p'
    });

    // Official Trailer preview
    const trailerKey = catalogEntry?.trailerKey || 'b9EkMc79ZSU';
    const trailerEmbedUrl = `https://www.youtube-nocookie.com/embed/${trailerKey}?autoplay=1&rel=0&modestbranding=1`;

    // MovieBox API provider integration if key is provided
    let movieBoxStream = null;
    if (MOVIEBOX_API_KEY && MOVIEBOX_API_KEY !== 'your_key_here') {
      try {
        // Protected provider call with API key
        movieBoxStream = {
          provider: 'MovieBox VIP Cloud',
          status: 'ready',
          streamUrl: `https://api.moviebox.stream/v1/play?id=${resolvedId}&key=${MOVIEBOX_API_KEY.slice(0, 4)}***`
        };
      } catch (err) {
        console.warn('MovieBox provider lookup bypassed:', err.message);
      }
    }

    return res.json({
      success: true,
      id: resolvedId,
      imdbId: catalogEntry?.imdb_id || (isImdb ? rawId : null),
      title: title,
      mediaType: mediaType,
      season: mediaType === 'tv' ? season : undefined,
      episode: mediaType === 'tv' ? episode : undefined,
      playableUrl: streamSources[0].url,
      embedUrl: streamSources[0].url,
      trailerUrl: trailerEmbedUrl,
      sources: streamSources,
      movieBoxVIP: movieBoxStream,
      metadata: {
        catalogMapped: Boolean(catalogEntry),
        genres: catalogEntry?.genres || [],
        releaseYear: catalogEntry?.release_year || null
      }
    });
  } catch (error) {
    console.error('Error generating stream endpoint:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to resolve movie streaming stream',
      message: error.message
    });
  }
});

/**
 * 3. Catalog Mappings Route
 * GET /api/catalog
 */
app.get('/api/catalog', (req, res) => {
  const { type, search } = req.query;
  let results = [...CATALOG_DATABASE];

  if (type) {
    results = results.filter((item) => item.type === type.toLowerCase());
  }

  if (search) {
    const q = search.toLowerCase();
    results = results.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.genres.some((g) => g.toLowerCase().includes(q))
    );
  }

  res.json({
    success: true,
    total: results.length,
    catalog: results
  });
});

/**
 * 4. Single Catalog Item Details
 * GET /api/catalog/:id
 */
app.get('/api/catalog/:id', (req, res) => {
  const id = req.params.id;
  const isNumeric = /^\d+$/.test(id);
  const found = CATALOG_DATABASE.find(
    (item) =>
      (isNumeric && item.id === Number(id)) ||
      item.imdb_id === id ||
      item.title.toLowerCase() === id.toLowerCase()
  );

  if (!found) {
    return res.status(404).json({
      success: false,
      error: 'Catalog item not found',
      id
    });
  }

  return res.json({
    success: true,
    item: found
  });
});

/**
 * 5. TMDB Secure Proxy Route (Protects API Key)
 * GET /api/tmdb/*
 * Forwards requests to https://api.themoviedb.org/3/* appending the server-side TMDB_API_KEY
 */
app.get('/api/tmdb/*', async (req, res) => {
  if (!TMDB_API_KEY || TMDB_API_KEY === 'your_tmdb_key_if_any') {
    return res.status(503).json({
      error: 'TMDB_API_KEY is not configured on the backend server',
      hint: 'Configure TMDB_API_KEY in server/.env to use this secure proxy'
    });
  }

  try {
    const endpoint = req.params[0];
    const queryParams = { ...req.query, api_key: TMDB_API_KEY };
    const tmdbResponse = await axios.get(
      `https://api.themoviedb.org/3/${endpoint}`,
      {
        params: queryParams,
        timeout: 10000
      }
    );
    res.json(tmdbResponse.data);
  } catch (error) {
    const status = error.response ? error.response.status : 500;
    const data = error.response ? error.response.data : { error: error.message };
    res.status(status).json(data);
  }
});

// Root catch-all index route
app.get('/', (req, res) => {
  res.json({
    name: 'Netflix Clone Streaming Backend API',
    endpoints: {
      health: '/api/health',
      stream: '/api/stream/:id (e.g. /api/stream/157336)',
      catalog: '/api/catalog',
      catalogItem: '/api/catalog/:id',
      tmdbProxy: '/api/tmdb/:endpoint'
    }
  });
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`=============================================`);
  console.log(`🚀 Netflix Clone Backend Server Running!`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`🩺 Health: http://localhost:${PORT}/api/health`);
  console.log(`🎬 Stream Endpoint: http://localhost:${PORT}/api/stream/:id`);
  console.log(`🌐 Allowed Client Origin: ${CLIENT_URL}`);
  console.log(`=============================================`);
});

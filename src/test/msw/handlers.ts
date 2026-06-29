import { http, HttpResponse } from 'msw';

const BASE = 'https://api.themoviedb.org/3';

function listItem(id: number, title: string, extra: Record<string, unknown> = {}) {
  return {
    id,
    title,
    poster_path: '/poster.jpg',
    release_date: '2021-10-22',
    vote_average: 8,
    genre_ids: [878],
    overview: 'An overview.',
    ...extra,
  };
}

const movieDetail = {
  id: 1,
  title: 'Dune',
  overview: 'A noble family becomes embroiled in a war for a desert planet.',
  poster_path: '/dune.jpg',
  backdrop_path: '/dune-bg.jpg',
  release_date: '2021-10-22',
  runtime: 155,
  vote_average: 8.1,
  tagline: 'Beyond fear, destiny awaits.',
  genres: [{ id: 878, name: 'Science Fiction' }],
  credits: {
    cast: [
      { id: 11, name: 'Timothée Chalamet', character: 'Paul Atreides', profile_path: '/tc.jpg' },
    ],
    crew: [{ id: 22, name: 'Denis Villeneuve', job: 'Director' }],
  },
  videos: {
    results: [
      { key: 'abc123', site: 'YouTube', type: 'Trailer', name: 'Official Trailer', official: true },
    ],
  },
  similar: { page: 1, total_pages: 1, results: [listItem(3, 'Arrival')] },
};

export const handlers = [
  // Multi search (must precede /search/:mediaType). Returns media_type per item.
  http.get(`${BASE}/search/multi`, () =>
    HttpResponse.json({
      page: 1,
      total_pages: 1,
      results: [
        { ...listItem(300, 'Dune Suggestion'), media_type: 'movie' },
        { id: 301, name: 'Severance Suggestion', media_type: 'tv', poster_path: null },
      ],
    }),
  ),

  http.get(`${BASE}/genre/:mediaType/list`, () =>
    HttpResponse.json({ genres: [{ id: 878, name: 'Science Fiction' }] }),
  ),

  http.get(`${BASE}/search/:mediaType`, ({ request }) => {
    const query = new URL(request.url).searchParams.get('query') ?? '';
    if (query === 'boom') return new HttpResponse(null, { status: 500 });
    if (query === 'nothing') {
      return HttpResponse.json({ page: 1, total_pages: 1, total_results: 0, results: [] });
    }
    return HttpResponse.json({
      page: 1,
      total_pages: 1,
      total_results: 2,
      results: [listItem(1, 'Dune'), listItem(2, 'Dune: Part Two')],
    });
  }),

  http.get(`${BASE}/discover/:mediaType`, () =>
    HttpResponse.json({ page: 1, total_pages: 1, results: [listItem(10, 'Popular Pick')] }),
  ),

  // Home rails
  http.get(`${BASE}/trending/movie/week`, () =>
    HttpResponse.json({ page: 1, total_pages: 1, results: [listItem(100, 'Trending Movie')] }),
  ),
  http.get(`${BASE}/movie/popular`, () =>
    HttpResponse.json({ page: 1, total_pages: 1, results: [listItem(101, 'Popular Movie')] }),
  ),
  http.get(`${BASE}/movie/upcoming`, () =>
    HttpResponse.json({ page: 1, total_pages: 1, results: [listItem(102, 'Upcoming Movie')] }),
  ),
  http.get(`${BASE}/tv/popular`, () =>
    HttpResponse.json({ page: 1, total_pages: 1, results: [listItem(103, 'Popular Show')] }),
  ),
  http.get(`${BASE}/movie/top_rated`, () =>
    HttpResponse.json({ page: 1, total_pages: 1, results: [listItem(150, 'Top Rated Movie')] }),
  ),

  // Recommendations (per-seed)
  http.get(`${BASE}/movie/:id/recommendations`, () =>
    HttpResponse.json({ page: 1, total_pages: 1, results: [listItem(200, 'Recommended Movie')] }),
  ),
  http.get(`${BASE}/tv/:id/recommendations`, () =>
    HttpResponse.json({ page: 1, total_pages: 1, results: [listItem(201, 'Recommended Show')] }),
  ),

  http.get(`${BASE}/movie/:id`, ({ params }) => {
    if (params.id === '500') return new HttpResponse(null, { status: 500 });
    if (params.id === '999') return new HttpResponse(null, { status: 404 });
    if (params.id === '2') {
      // Minimal/incomplete data: no backdrop, no credits, no videos, no similar.
      return HttpResponse.json({ id: 2, title: 'Minimal Movie', genres: [] });
    }
    return HttpResponse.json(movieDetail);
  }),
];

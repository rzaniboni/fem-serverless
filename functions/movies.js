const { URL } = require('url')
const fetch = require('node-fetch')
const { query } = require('./util/hasura')

// const movies = require('../data/movies.json')

exports.handler = async () => {
  const { movies } = await query({
    query: `
      query {
        movies {
          id
          poster
          tagline
          title
        }
      }
    `
  })

  const api = new URL('https://www.omdbapi.com/')

  api.searchParams.set('apiKey', process.env.OMDB_API_KEY)

  const promises = movies.map(movie => {
    // use the movie's IMDb ID to lookup details
    api.searchParams.set('i', movie.id)

    return fetch(api).then(response => response.json()).then(data => {
      const scores = data.Ratings;
      // console.log(data)
      return {
        ...movie,
        scores,
        actors: data.Actors
      }
    })
  })

  const moviesWithRatings = await Promise.all(promises)

  return {
    statusCode: 200,
    body: JSON.stringify(moviesWithRatings)
  }
}
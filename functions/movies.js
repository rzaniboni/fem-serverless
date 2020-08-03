const { URL } = require('url')
const fetch = require('node-fetch')

const movies = require('../data/movies.json')

exports.handler = async () => {
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
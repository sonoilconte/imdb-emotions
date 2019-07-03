const axios = require('axios');
const handleError = require('./handleError');
const SEARCH_URL = "https://movie-database-imdb-alternative.p.rapidapi.com/?page=1&r=json";
const axiosOptions = {
  method: 'get',
  headers: {
    'X-RapidAPI-Host': 'movie-database-imdb-alternative.p.rapidapi.com',
    'X-RapidAPI-Key': '44a1754a56msh7e591ca0b5f6bf8p177e0ejsne4c363ff2286',
  }
};


function searchImdb(req, searchResponse) {
  console.log('searching IMDB with query', req.query);
  if (!req.query.title) {
    handleError(422, 'Please include a title query parameter', searchResponse);
    return;
  }
  axiosOptions.url = `${SEARCH_URL}&s=${req.query.title}`;
  axios(axiosOptions)
  .then(res => {
    if (res.data && res.data.Search && res.data.Search.length) {
      console.log({ data: res.data });
      searchResponse.json({
        status: 200,
        data: res.data.Search
      });
    } else {
      handleError(404, `Film with title ${req.query.title} could not be found`, searchResponse);
    }
  })
  .catch(err => {
    console.log({ err });
    handleError(500, 'Something went wrong. Please try again later', searchResponse);
  });
}

module.exports = searchImdb;

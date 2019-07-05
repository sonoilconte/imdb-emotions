const axios = require('axios');
const sendError = require('./sendError');
const SEARCH_URL = "https://movie-database-imdb-alternative.p.rapidapi.com/?page=1&r=json";
const imdbOptions = {
  method: 'get',
  headers: {
    'X-RapidAPI-Host': 'movie-database-imdb-alternative.p.rapidapi.com',
    'X-RapidAPI-Key': '44a1754a56msh7e591ca0b5f6bf8p177e0ejsne4c363ff2286',
  }
};

class apiError extends Error {
  constructor(code, message) {
    super(code, message);
    this.code = code;
    this.message = message;
  }
}


function searchImdb(req, searchResponse) {
  console.log('searching IMDB with query', req.query);
  if (!req.query.title) {
    sendError(422, 'Please include a title query parameter', searchResponse);
    return;
  }
  imdbOptions.url = `${SEARCH_URL}&s=${req.query.title}`;
  axios(imdbOptions)
  .then(res => {
    if (res.data && res.data.Search && res.data.Search.length) {
      console.log({ data: res.data });
      const firstResultId = res.data.Search[0].imdbID;
      console.log({ firstResultId });
      imdbOptions.url = `${SEARCH_URL}&i=${firstResultId}&plot=full`;
      return axios(imdbOptions);
    } else {
      console.log({ res });
      throw new apiError(200, `Film with title ${req.query.title} could not be found`);
    }
  })
  .then(res => {
    console.log('get by ID res', res.data);
    searchResponse.json({
      status: 200,
      data: res.data
    });
  })
  .catch(err => {
    console.log({ err });
    sendError(err.code, err.message, searchResponse);
  });
}

module.exports = searchImdb;

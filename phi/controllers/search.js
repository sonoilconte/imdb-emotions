const axios = require('axios');
const sendError = require('./sendError');
const SEARCH_URL = "https://movie-database-imdb-alternative.p.rapidapi.com/?page=1&r=json";

const imdbOptions = {
  method: 'get',
  headers: {
    'X-RapidAPI-Host': process.env.IMDB_HOST,
    'X-RapidAPI-Key': process.env.RAPID_API_KEY,
  }
};

const emotionsOptions = {
  method: 'post',
  headers: {
    'X-RapidAPI-Host': process.env.EMOTIONS_HOST,
    'X-RapidAPI-Key': process.env.RAPID_API_KEY,
  },
  url: `https://${process.env.EMOTIONS_HOST}/analyze/`
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
  const emotionsSummary = {};
  imdbOptions.url = `${SEARCH_URL}&s=${req.query.title}`;
  axios(imdbOptions)
  .then(res => {
    if (res.data && res.data.Search && res.data.Search.length) {
      console.log({ data: res.data });
      const firstResultId = res.data.Search[0].imdbID;
      emotionsSummary.imdbID = firstResultId;
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
    if (res.data && res.data.Plot) {
      emotionsSummary.plotAnalyzed = res.data.Plot;
      emotionsSummary.title = res.data.Title ? res.data.Title : 'unknown';
      emotionsSummary.year = res.data.Year ? res.data.Year : 'unknown';
      emotionsOptions.data = `text=${res.data.Plot}`;
      return axios(emotionsOptions);
    } else {
      throw new apiError(200, `Error finding film plot for film ${emotionsSummary.title}`);
    }
  })
  .then(res => {
    console.log( { res } );
    if (res.data && res.data.emotion_scores) {
      emotionsSummary.emotionScores = res.data.emotion_scores;
      searchResponse.json({
        status: 200,
        data: emotionsSummary
      });
    } else {
      throw new apiError(200, `Error finding emotion scores for film ${emotionsSummary.title}`);
    }
  })
  .catch(err => {
    console.log({ err });
    sendError(err.code, err.message, searchResponse);
  });
}

module.exports = searchImdb;

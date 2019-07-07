const axios = require('axios');
const sendError = require('./sendError');

const SEARCH_URL = 'https://movie-database-imdb-alternative.p.rapidapi.com/?page=1&r=json';
// Options for HTTP requests to vendor APIs
const imdbOptions = {
  method: 'get',
  headers: {
    'X-RapidAPI-Host': process.env.IMDB_HOST,
    'X-RapidAPI-Key': process.env.RAPID_API_KEY,
  },
};

const emotionsOptions = {
  method: 'post',
  headers: {
    'X-RapidAPI-Host': process.env.EMOTIONS_HOST,
    'X-RapidAPI-Key': process.env.RAPID_API_KEY,
  },
  url: `https://${process.env.EMOTIONS_HOST}/analyze/`,
};

class ApiError extends Error {
  constructor(code, message) {
    super(code, message);
    this.code = code;
    this.message = message;
  }
}

function getEmotions(req, emotionsResponse) {
  console.log('searching IMDB with query', req.query);
  if (!req.query.title) {
    sendError(422, 'Please include a title query parameter', emotionsResponse);
    return;
  }
  const emotionsSummary = {};
  imdbOptions.url = `${SEARCH_URL}&s=${req.query.title}`;
  axios(imdbOptions)
    .then((res) => {
      if (res.data && res.data.Search && res.data.Search.length) {
        console.log({ data: res.data });
        const firstResultId = res.data.Search[0].imdbID;
        emotionsSummary.imdbID = firstResultId;
        console.log({ firstResultId });
        imdbOptions.url = `${SEARCH_URL}&i=${firstResultId}&plot=full`;
        return axios(imdbOptions);
      }
      console.log({ res });
      throw new ApiError(200, `Film with title ${req.query.title} could not be found`);
    })
    .then((res) => {
      console.log('get by ID res', res.data);
      if (res.data && res.data.Plot) {
        emotionsSummary.plotAnalyzed = res.data.Plot;
        emotionsSummary.title = res.data.Title ? res.data.Title : 'unknown';
        emotionsSummary.year = res.data.Year ? res.data.Year : 'unknown';
        emotionsOptions.data = `text=${res.data.Plot}`;
        return axios(emotionsOptions);
      }
      throw new ApiError(200, `Error finding film plot for film ${emotionsSummary.title}`);
    })
    .then((res) => {
      console.log({ res });
      if (res.data && res.data.emotion_scores) {
        emotionsSummary.emotionScores = res.data.emotion_scores;
        emotionsResponse.json({
          status: 200,
          data: emotionsSummary,
        });
      } else {
        throw new ApiError(200, `Error finding emotion scores for film ${emotionsSummary.title}`);
      }
    })
    .catch((err) => {
      console.log({ err });
      if (err.code && err.message) {
        sendError(err.code, err.message, emotionsResponse);
      } else {
        sendError(500, 'Something went wrong. Please try again.', emotionsResponse);
      }
    });
}

module.exports = getEmotions;
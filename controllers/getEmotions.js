const axios = require('axios');
const Bottleneck = require('bottleneck');
const sendError = require('./sendError');

// Rate-limiting configuration for outgoing requests to first vendor API
const limiter = new Bottleneck({
  minTime: 1000,
  maxConcurrent: 1,
});

// Options for HTTP requests to vendor APIs
const imdbSearchOptions = {
  method: 'get',
  headers: {
    'X-RapidAPI-Host': process.env.IMDB_HOST,
    'X-RapidAPI-Key': process.env.RAPID_API_KEY,
  },
};

const imdbByIdOptions = { ...imdbSearchOptions };

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
  if (!req.query.title) {
    sendError(422, 'Please include a title query parameter', emotionsResponse);
    return;
  }
  // Check that only allow query parameters are present
  if (Object.keys(req.query).length !== 1) {
    sendError(422, 'Please only include title query parameter. Ensure reserved characters like "&" are percent encoded', emotionsResponse);
    return;
  }
  const emotionsSummary = {};
  limiter
    .schedule(() => {
      // Verifying that rate limiting of outgoing requests is occurring
      console.log('Outgoing request at', new Date().getTime());
      // Make request to IMDB API with film title query for details on matching film(s)
      imdbSearchOptions.url = `https://${process.env.IMDB_HOST}?page=1&r=json&s=${req.query.title}`;
      return axios(imdbSearchOptions);
    })
    .then((res) => {
      if (res.data && res.data.Search && res.data.Search.length) {
        const firstResultId = res.data.Search[0].imdbID;
        emotionsSummary.imdbID = firstResultId;
        // With film ID in the response from first call, make request to the second
        // endpoint, which will provide more film details, like the plot
        imdbByIdOptions.url = `https://${process.env.IMDB_HOST}?page=1&r=json&i=${firstResultId}&plot=full`;
        return axios(imdbByIdOptions);
      }
      throw new ApiError(200, `Film with title ${req.query.title} could not be found`);
    })
    .then((res) => {
      if (res.data && res.data.Plot) {
        emotionsSummary.plotAnalyzed = res.data.Plot;
        emotionsSummary.title = res.data.Title ? res.data.Title : 'unknown';
        emotionsSummary.year = res.data.Year ? res.data.Year : 'unknown';
        // With plot from response of 2nd call, make request to the third endpoint,
        // which will provide an emotions analysis of the film plot
        emotionsOptions.data = `text=${res.data.Plot}`;
        return axios(emotionsOptions);
      }
      throw new ApiError(200, `Error finding film plot for film ${emotionsSummary.title}`);
    })
    .then((res) => {
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
      console.error({ err });
      if (err.code && err.message) {
        sendError(err.code, err.message, emotionsResponse);
      } else {
        sendError(500, 'Something went wrong. Please try again.', emotionsResponse);
      }
    });
}

module.exports = getEmotions;

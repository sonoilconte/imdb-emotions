# Data processing pipeline

## Problem

Pick two APIs from https://rapidapi.com/, one that produces text
content and the other one that consumes it. One example is, Reddit API
and Yoda Translator API.

Design the following:

- Another API that is a composition of the ones you've chosen

- As a bonus, simulate (if needed) different rate limits
  on the APIs you've chosen and design an efficient pipeline
  that continuously processes the data via composition of the
  two APIs.


## Solution

I have provided a solution that stiches together two APIs-
1. [https://rapidapi.com/imdb/api/movie-database-imdb-alternative](Movie Database API)
2. [https://rapidapi.com/twinword/api/emotion-analysis](Emotion Analysis API)

To run locally, clone this repository, and run `npm install`, then `node server.js` to start the server.

Test the API by making a GET request to
http://localhost:3000/films?title={title}, for example, http://localhost:3000/films?title=gremlins

A response to a valid request will provide basic information on the movie, including its plot, and an
emotions analysis of the plot. For example,
#+BEGIN_EXAMPLE
{
  status: 200,
  data: {
    imdbID: "tt0087363",
    plotAnalyzed: "Minature green monsters tear through the small town of Kingston Falls. Hijinks ensue as a mild-mannered bank teller releases these hideous loonies after gaining a new pet and violating two of three simple rules: No water (violated), no food after midnight (violated), and no bright light. Hilarious mayhem and destruction in a town straight out of Norman Rockwell. So, when your washing machine blows up or your TV goes on the fritz, before you call the repair man, turn on all the lights and look under all the beds. 'Cause you never can tell, there just might be a gremlin in your house.",
    title: "Gremlins",
    year: "1984",
    emotionScores: {
      fear: 0.18077003383633,
      sadness: 0.074569747768044,
      surprise: 0.065499617731342,
      anger: 0.044530763520042,
      joy: 0.030528182192787,
      disgust: 0
    }
  }
}
#+END_EXAMPLE


To run the app locally yourself, create a .env file where you specify `EMOTIONS_HOST`, `IMDB_HOST`, `RAPID_API_KEY`. Visit Rapid API for docs on the APIs and your key. 

### Tests

I'm using [https://www.npmjs.com/package/supertest](supertest) to make test requests to the API.
If you are running the app locally and would like to run the API tests, make sure Mocha is installed,
and run ~npm test~.

### Rate Limiting
The [https://www.npmjs.com/package/bottleneck](bottleneck) library is used to limit the rate of outgoing requests to the vendor APIs.
The bottleneck is currently set to limit outgoing requests to a maximum of 1 concurrent request and
a maximum of 1 outgoing request per second. Requests will remain queued in app until the bottleneck is clear.


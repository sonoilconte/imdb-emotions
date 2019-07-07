const app = require('../server.js');
const supertest = require('supertest')(app);

describe('Tests for endpoint /films?title={title}', function() {

  it('Can find emotions for the movie Gremlins', function(done) {
    this.timeout(10000);
    supertest
      .get('/films?title=Gremlins')
      .expect(200)
      .expect((res) => {
        if (!(res.body.data.title === 'Gremlins')) {
          throw new Error(`title does not match 'Gremlins'`);
        }
        if (!res.body.data.emotionScores) {
          throw new Error('emotionScores property not present');
        }
      })
      .end(done);
  });

  it('Will respond with status 204 if film cannot be found, /films?title=Gremlinz', function(done) {
    this.timeout(10000);
    supertest
      .get('/films?title=Gremlinz')
      .expect(204)
      .end(done);
  });

  it('Will respond with status 422 if no title query parameter provided, /films', function(done) {
    this.timeout(10000);
    supertest
      .get('/films')
      .expect(422)
      .end(done);
  });

  it('Will respond with status 422 if title query parameter left empty, /films?title=', function(done) {
    this.timeout(10000);
    supertest
      .get('/films?title=')
      .expect(422)
      .end(done);
  });
});

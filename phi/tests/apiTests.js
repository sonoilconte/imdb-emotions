console.log('test file');

const app = require('../server.js');
const supertest = require('supertest')(app);

describe("Tests for endpoint /films?title={title}", function() {
  it("Can find emotions for the movie Gremlins", function(done) {
    this.timeout(10000);
    supertest
      .get('/films?title=Gremlins')
      .expect(200)
      .expect((res) => {
        if (!(res.body.data.title === 'Gremlins')) {
          throw new Error('title does not match Gremlins');
        }
      })
      .end(done);
  });
});

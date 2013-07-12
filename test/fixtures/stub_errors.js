/*global sinon */
sinon.stub(Conductor, '_error', function (error) {
  throw error;
});

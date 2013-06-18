/*global sinon */
if (window.console && window.console.error) {
  sinon.stub(console, 'error');
}
if (window.console && window.console.assert) {
  sinon.stub(console, 'assert');
}

function CardDependencies() {
  this.requiredJavaScriptURLs = [];
  this.requiredCSSURLs = [];
}

CardDependencies.prototype = {
  requireJavaScript: function(url) {
    this.requiredJavaScriptURLs.push(url);
  },
  requireCSS: function(url) {
    this.requiredCSSURLs.push(url);
  }
};

export default CardDependencies;

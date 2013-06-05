/*global DomUtils*/

Conductor.renderConsumer = function(promise, card) {
  var options = Object.create(card.options);
  var domInitialized = false;

  function resetCSS() {
    var css = "",
        newStyle;

    css += "html, body {";
    css += "  margin: 0px;";
    css += "  padding: 0px;";
    css += "}";

    css += "iframe {";
    css += "  display: block;";
    css += "}";

    newStyle = DomUtils.createStyleElement(css);

    document.head.insertBefore(newStyle, document.head.children[0]);
  }

  options.events.render = function(args) {
    if(!domInitialized) {
      resetCSS();

      if(card.initializeDOM) {
        card.initializeDOM();
      }

      domInitialized = true;
    }
    card.render.apply(card, args);
  };

  return Conductor.Oasis.Consumer.extend(options);
};

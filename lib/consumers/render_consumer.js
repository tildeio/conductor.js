Conductor.renderConsumer = function(promise, card) {
  var options = Object.create(card.options);
  var domInitialized = false;

  options.events.render = function(args) {
    if(!domInitialized && card.initializeDOM) {
      domInitialized = true;
      card.initializeDOM();
    }
    card.render.apply(card, args);
  };

  return Conductor.Oasis.Consumer.extend(options);
};

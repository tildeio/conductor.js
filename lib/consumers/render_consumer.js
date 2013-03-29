Conductor.renderConsumer = function(promise, card) {
  var options = Object.create(card.options);

  options.events.render = function(args) {
    card.render.apply(card, args);
  };

  return Conductor.Oasis.Consumer.extend(options);
};

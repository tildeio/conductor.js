/*global Playground*/

(function() {
  "use strict";

  // Add card management functionality to the
  // Playground app.
  $.extend(Playground, {
    initializeCard: function() {
      // Create a new card and save it on the
      // application.
      var card = this.conductor.load('../cards/render_card.js');
      this.card = card;

      // Insert the card into DOM, starting events flowing
      // in both directions. Once the card has been activated,
      // tell it to render itself as a thumbnail.

      card.appendTo('.cards').then(function() {
        card.render('thumbnail', {
          width: 100,
          height: 100
        });
      });
    }
  });

})();

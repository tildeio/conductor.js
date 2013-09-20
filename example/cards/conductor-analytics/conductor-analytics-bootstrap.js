function initializeAnalyticsTab() {
  var $analytics = $('.analytics');

  $analytics.find('.tab').on('click', function() {
    $analytics.toggleClass('showing');
  });
}

function initializeConductorAnalytics( conductor, card_path ) {
  var analyticsCard = conductor.load(card_path, 1, {
    capabilities: ['analytics'],
    services: {
      analytics: Conductor.Oasis.Service
    }
  });

  var printWiretapEvent = function( service, messageEvent ) {
    var timestamp = new Date(),
        cardName = this.sandbox.name();

    analyticsCard.waitForLoad().then( function() {
      analyticsCard.sandbox.capabilities.analytics.send(
        'printWiretapEvent',
        {
          service: service,
          event: messageEvent,
          card: cardName,
          time: timestamp
        }
      );
    }, Conductor.Oasis.RSVP.rethrow);
  };

  analyticsCard.track = function(card) {
    card.wiretap( printWiretapEvent, card );
  };

  return analyticsCard;
}

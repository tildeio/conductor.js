Conductor.require('/vendor/jquery.js');
Conductor.requireCSS('/example/cards/tutorial/youtube_card.css');

Conductor.card({
  consumers: {
    video: Conductor.Oasis.Consumer.extend({
      events: {
        play: function () {
          this.card.loadPlayer().then(function (player) {
            player.playVideo();
          });
        }
      }
    })
  },

  videoId: null,

  activate: function (data) {
    Conductor.Oasis.RSVP.EventTarget.mixin(this);
    this.consumers.height.autoUpdate = false;
    this.videoId = data.videoId;
    this.loadYouTubeAPI();
  },

  didUpdateData: function (bucket, data) {
    this.videoId = data.videoId;
    this.trigger('videoChanged');
  },

  initializeDOM: function () {
    $('body').html('<img id="thumbnail" /><div id="player"></div>');
    $('head').append('<script src="https://www.youtube.com/iframe_api"></script>');

    this.updateThumbnail();
    this.on('resize', this.resizeThumbnail);
    this.on('videoChanged', this.updateThumbnail);
    this.loadVideo();
  },

  render: function (intent, dimensions) {
    this.setDimensions(dimensions);

    switch (intent) {
      case "thumbnail":
        // $('#player').hide();
        // $('#thumbnail').show();
        // break;
      case "small":
      case "large":
        $('#thumbnail').hide();
        $('#player').show();
        break;
      default:
        throw new Error("Unsupported intent '" + intent + "'");
    }
  },

  resizeThumbnail: function () {
    var dimensions = this.getDimensions();
    $('#thumbnail').css( dimensions );
  },

  updateThumbnail: function () {
    $('#thumbnail').attr('src', 'http://img.youtube.com/vi/' + this.videoId + '/0.jpg');
  },

  getDimensions: function () {
    if (!this._dimensions) { this.setDimensions(); }
    return this._dimensions;
  },

  setDimensions: function (dimensions) {
    if (dimensions !== undefined) {
      this._dimensions = dimensions;
    } else {
      this._dimensions = {
        height: window.innerHeight,
        width: window.innerWidth
      };
    }

    this.trigger('resize');
  },

  loadVideo: function () {
    var card = this;

    this.loadYouTubeAPI().then(function (YT) {
      card.loadPlayer(YT);
    });
  },

  loadYouTubeAPI: function () {
    if (!this._youtubeDefer) {
      var promise = this._youtubeDefer = Conductor.Oasis.RSVP.defer();
      if (window.YT) {
        promise.resolve(window.YT);
      } else {
        window.onYouTubeIframeAPIReady = function () {
          promise.resolve(window.YT);
        };
      }
    }

    return this._youtubeDefer.promise;
  },

  loadPlayer: function (YT) {
    if (!this._playerDefer) {
      var promise = this._playerDefer = Conductor.Oasis.RSVP.defer(),
          card = this;

      card.waitForActivation().then(function () {
        var dimensions = card.getDimensions();

        var player = card.player = new YT.Player('player', {
          height: dimensions.height,
          width: dimensions.width,
          videoId: card.videoId,
          playerVars: {
            rel: 0
          },
          events: {
            onReady: function() {
              promise.resolve(player);
            },
            onStateChange: function (event) {
              var playerState = event.data;
              if (playerState === YT.PlayerState.ENDED &&
                  card.consumers.video) {

                card.consumers.video.send('videoWatched');
              }
            }
          }
        });

        card.on('videoChanged', function () {
          card.player.cueVideoById(card.videoId, 0);
        });

        card.on('resize', function () {
          var dimensions = this.getDimensions();
          this.player.setSize(dimensions.width, dimensions.height);
        });
      });
    }

    return this._playerDefer.promise;
  }

});

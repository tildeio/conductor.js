Conductor.require('/example/libs/jquery-1.9.1.js');
// Youtube doesn't allow iframe_api via CORS
//Conductor.require('https://www.youtube.com/iframe_api');
Conductor.requireCSS('/example/cards/video/style.css');

Conductor.card({
  consumers: {
    video: function (card) {
      return Conductor.Oasis.Consumer.extend({
        events: {
          play: function () {
            card.youtube.then(function () {
              card.player.playVideo();
            });
          }
        }
      });
    }
  },

  activate: function (data) {
    Conductor.Oasis.RSVP.EventTarget.mixin(this);
    this.youtube = this._youtubePromise();

    $('head').append('<script src="https://www.youtube.com/iframe_api"></script>');
    $('body').html('<img id="thumbnail" /><div id="player"></div>');

    this.on('resize', this.resizeThumbnail);
    this.loadVideo(data.videoId);
  },

  didUpdateData: function (bucket, data) {
    this.loadVideo(data.videoId);
  },

  render: function (intent, dimensions) {
    this.setDimensions(dimensions);

    switch (intent) {
      case "thumbnail":
        $('#player').hide();
        $('#thumbnail').show();
        break;
      case "small":
      case "large":
        $('#thumbnail').hide();
        $('#player').show();
        break;
      default:
        throw new Error("Unuspported intent '" + intent + "'");
    }
  },

  loadVideo: function (videoId) {
    var card = this;

    $('#thumbnail').attr('src', 'http://img.youtube.com/vi/' + videoId + '/0.jpg');
    this.youtube.then( function (YT) {
      var dimensions = card.getDimensions();
      card.player = new YT.Player('player', {
        height: dimensions.height,
        width: dimensions.width,
        videoId: videoId,
        playerVars: {
          rel: 0
        },
        events: {
          onStateChange: function (event) {
            var playerState = event.data;
            if (playerState === 0) {
              card.consumers.video.send('videoWatched');
            }
          }
        }
      });

      card.on('resize', function () {
        var dimensions = this.getDimensions();
        this.player.setSize(dimensions.width, dimensions.height);
      });
    });
  },

  resizeThumbnail: function () {
    var dimensions = this.getDimensions();
    $('#thumbnail').css({ height: dimensions.height });
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

  _youtubePromise: function () {
    var promise = new Conductor.Oasis.RSVP.Promise();
    if (window.YT) {
      promise.resolve(window.YT);
    } else {
      window.onYouTubeIframeAPIReady = function () {
        promise.resolve(window.YT);
      };
    }

    return promise;
  }
});

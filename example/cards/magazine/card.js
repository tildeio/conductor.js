/*global Handlebars*/

Conductor.require('/vendor/jquery.js');
Conductor.require('/example/libs/handlebars-1.0.0-rc.3.js');
Conductor.requireCSS('/example/cards/magazine/style.css');

// Pretend this data is being loaded from a JSON feed.
var data = {
  title: "Welcome to McGraw-Hill Education 2.0",
  author: "Chris Tse",
  thumbnail: "/example/cards/magazine/images/logo-thumbnail.png",
  date: "Fri Feb 08 2013 00:00:00 GMT-0800 (PST)",
  lede: "They say that a busy life is a happy one. If that's true, consider us ecstatic.",
  content: "<p>It's been a whirlwind couple of months at McGraw-Hill Education. For starters, you may have noticed that in late November, we announced our sale to Apollo Global Management.</p><p>We're very excited about the sale and what it means for our customers. As an independent company, we will have the opportunity to pursue new growth opportunities. Our new ownership represents a significant step forward towards building the new McGraw-Hill Education as the leading digital learning company. We can also drive real change in how teaching and learning are delivered.  We'll work with our customers to make education better, because it must be better, for all students around the globe.</p><p>The changes didn't stop there. In December, we implemented a plan to make McGraw-Hill School Education, our K-12 division, faster, stronger and more responsive with the goal of becoming the leader in K-12 digital learning. The changes - which include optimizing our product mix, improving our product development processes to increase collaboration and innovation, and reshaping our sales and marketing operations to be even more customer-focused - will impact nearly every facet of McGraw-Hill School Education's business.</p><p>Why did we make these changes? It is no secret that the K-12 educational landscape has evolved over the past few years. We've long been making adjustments to account for this evolution, but after spending a considerable amount of time talking with our customers about how their needs are changing and what they're looking for from learning companies, we decided that we needed to accelerate this change.</p>",
  categories: ['announcements']
};

var thumbnailTemplate = '<img src="{{thumbnail}}">';
var smallTemplate = '<img src="{{thumbnail}}"> {{title}} <em>by {{author}}</em>';
var largeTemplate = '<img src="{{thumbnail}}"> {{title}} <em>by {{author}}</em><div class="lede">{{{lede}}}</div><div class="content">{{{content}}}</div>';


Conductor.card({
  activate: function() {
    this.compileTemplates();

    // Load Google Web Font
    (function() {
      window.WebFontConfig = {
        google: { families: [ 'Merriweather+Sans::latin' ] }
      };
      var wf = document.createElement('script');
      wf.src = ('https:' === document.location.protocol ? 'https' : 'http') +
        '://ajax.googleapis.com/ajax/libs/webfont/1/webfont.js';
      wf.type = 'text/javascript';
      wf.async = 'true';
      var s = document.getElementsByTagName('script')[0];
      s.parentNode.insertBefore(wf, s);
    })();
  },

  compileTemplates: function() {
    thumbnailTemplate = Handlebars.compile(thumbnailTemplate);
    smallTemplate = Handlebars.compile(smallTemplate);
    largeTemplate = Handlebars.compile(largeTemplate);
  },

  render: function(intent, dimensions) {
    $('body').attr('class', intent);

    switch (intent) {
      case "thumbnail":
        this.renderThumbnail(dimensions);
        break;
      case "small":
        this.renderSmall();
        break;
      case "large":
        this.renderLarge();
        break;
      default:
        $('body').html("This card does not support the " + intent + " intent.");
    }

    this.renderIntent = intent;
  },

  renderThumbnail: function(dimensions) {
    if (this.renderIntent !== 'thumbnail') {
      $('body').html(thumbnailTemplate(data));
    }

    var width = Math.min(dimensions.width, 50);
    var height = Math.min(dimensions.height, 50);
    var size = Math.min(width, height);

    $('img').css({
      width: size,
      height: size
    });
  },

  renderSmall: function() {
    if (this.renderIntent !== 'small') {
      $('body').html(smallTemplate(data));
    }
  },

  renderLarge: function() {
    if (this.renderIntent !== 'large') {
      $('body').html(largeTemplate(data));
    }
  }
});

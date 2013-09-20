define("app/application",
  ["app/routes/index","app/controllers/index","app/routes/filters","app/routes/events","app/controllers/events","app/views/events","app/views/event","app/controllers/services","app/controllers/cards","app/models/service","app/models/event_type","app/models/event","app/models/card"],
  function(IndexRoute, IndexController, FiltersRoute, EventsRoute, EventsController, EventsView, EventView, ServicesController, CardsController, Service, EventType, Event, Card) {
    "use strict";

    var App = Ember.Application.create({
      readyPromise: Ember.RSVP.defer(),
      rootElement: '#analytics',
      ready: function() {
        this.readyPromise.resolve();
      }
    });

    App.IndexRoute = IndexRoute;
    App.IndexController = IndexController;

    App.EventsRoute = EventsRoute;
    App.EventsController = EventsController;
    App.EventsIndexView = EventsView; //TODO: this is a hack
    App.EventView = EventView;

    App.FiltersRoute = FiltersRoute;

    App.ServicesController = ServicesController;
    App.CardsController = CardsController;

    App.Router.map( function() {
      this.route("events");
      this.route("filters");
    });

    App.createEvent= function(time, service, event, cardId) {
      var store = this.__container__.lookup('store:main'),
          card;

      if( store.hasRecordForId(App.Service, service) ) {
        service = store.recordForId(App.Service, service);
      } else {
        service = store.createRecord('service', {
          id: service,
          isVisible: true
        });
      }

      var eventTypes = service.get('eventTypes'),
          eventType = eventTypes.findBy('id', event.type);
      if( !eventType ) {
        eventType = eventTypes.createRecord({
          id: event.type,
          isVisible: true
        });
      }

      event = eventType.get('events').createRecord({
        direction: event.direction,
        data: (JSON.stringify(event.data) || ""),
        time: time
      });

      if( store.hasRecordForId(App.Card, cardId) ) {
        card = store.recordForId(App.Card, cardId);
      } else {
        card = store.createRecord('card', {
          id: cardId,
          isVisible: true
        });
      }
      event.set('card', card);
    };



    App.ApplicationAdapter = DS.RESTAdapter;
    App.Service = Service;
    App.EventType = EventType;
    App.Card = Card;
    App.Event = Event;

    App.deferReadiness();
    requireModule('templates');

    //TODO: This is bad.
    //I'm doing something wrong when inserting the `App.EventsView` in the `index` template
    window.App = App;


    return App;
  });
define("app/controllers/cards",
  [],
  function() {
    "use strict";
    var CardsController = Ember.ArrayController.extend({
    });


    return CardsController;
  });
define("app/controllers/events",
  [],
  function() {
    "use strict";
    var EventsController = Ember.ArrayController.extend({
    });


    return EventsController;
  });
define("app/controllers/index",
  [],
  function() {
    "use strict";
    /* global $ */

    var IndexController = Ember.ObjectController.extend({
    });


    return IndexController;
  });
define("app/controllers/services",
  [],
  function() {
    "use strict";
    var ServicesController = Ember.ArrayController.extend({
    });


    return ServicesController;
  });
define("app/models/card",
  [],
  function() {
    "use strict";
    var Card = DS.Model.extend({
      isVisible: DS.attr('boolean', true),
      events: DS.hasMany('event')
    });


    return Card;
  });
define("app/models/event",
  [],
  function() {
    "use strict";
    // Pad a single-digit number with a zero, if necessary.
    // zeroPad(3)  => "03"
    // zeroPad(10) => "10"
    function zeroPad(number) {
      number = number+'';
      if (number.length === 1) {
        return "0"+number;
      }
      return number;
    }

    var Event = DS.Model.extend({
      eventType: DS.belongsTo('eventType'),
      card: DS.belongsTo('card'),
      direction: DS.attr(),
      data: DS.attr(),
      time: DS.attr('date'),

      formattedTime: function() {
        var date = this.get('time'),
            year = date.getFullYear(),
            month = zeroPad(date.getMonth()+1),
            day = zeroPad(date.getDate()),
            hour = zeroPad(date.getHours()),
            minute = zeroPad(date.getMinutes());

        return "%@-%@-%@ %@:%@ ".fmt(year, month, day, hour, minute);
      }.property('time')
    });


    return Event;
  });
define("app/models/event_type",
  [],
  function() {
    "use strict";
    var EventType = DS.Model.extend({
      isVisible: DS.attr('boolean', true),
      service: DS.belongsTo('service'),
      events: DS.hasMany('event')
    });


    return EventType;
  });
define("app/models/service",
  [],
  function() {
    "use strict";
    var Service = DS.Model.extend({
      isVisible: DS.attr('boolean', true),
      eventTypes: DS.hasMany('eventType')
    });


    return Service;
  });
define("app/routes/events",
  [],
  function() {
    "use strict";
    var EventsRoute = Ember.Route.extend({
      model: function() {
        return this.store.all('event');
      },

      actions: {
        switchRoutes: function() {
          this.transitionTo('filters');
        }
      }
    });


    return EventsRoute;
  });
define("app/routes/filters",
  [],
  function() {
    "use strict";
    var FiltersRoute = Ember.Route.extend({
      setupController: function() {
        this.controllerFor('services').set('model', this.store.all('service') );
        this.controllerFor('cards').set('model', this.store.all('card') );
      },

      renderTemplate: function() {
        this.render();

        this.render('services', {
          into: 'filters',
          outlet: 'services',
          controller: 'services'
        });

        this.render('cards', {
          into: 'filters',
          outlet: 'cards',
          controller: 'cards'
        });
      },

      actions: {
        switchRoutes: function() {
          this.transitionTo('events');
        }
      }
    });


    return FiltersRoute;
  });
define("app/routes/index",
  [],
  function() {
    "use strict";
    var IndexRoute = Ember.Route.extend({
      redirect: function() {
        this.transitionTo('events');
      }
    });


    return IndexRoute;
  });
define("app/views/event",
  [],
  function() {
    "use strict";
    var EventView = Ember.View.extend({
      templateName: 'event',
      tagName: 'tr',
      classNames: ['event'],

      isVisible: function() {
        return this.get('content.eventType.isVisible') && this.get('content.eventType.service.isVisible') && this.get('content.card.isVisible');
      }.property('content.eventType.isVisible', 'content.eventType.service.isVisible', 'content.card.isVisible'),

      direction: function() {
        return (this.get('content.direction') === "sent" ? "→" : "←");
      }.property('content.direction')
    });


    return EventView;
  });
define("app/views/events",
  ["app/views/event"],
  function(EventView) {
    "use strict";
    /*global $ */

    var EventsView = Ember.CollectionView.extend({
      tagName: 'tbody',
      itemViewClass: EventView,
      autoScroll: true,

      arrayWillChange: function() {
        var $body = $('body'),    //TODO: this should not be here
            atBottom = ($body.scrollTop() === ($body[0].scrollHeight - $body.height()));

        this.set('autoScroll', atBottom);

        this._super.apply(this, arguments);
      },

      arrayDidChange: function() {
        Ember.run.scheduleOnce(
          'afterRender',
          this,
          'resetScroll'
        );

        this._super.apply(this, arguments);
      },

      resetScroll: function (scrollHeight) {
        var $body;    //TODO: this should not be here

        if( this.get('autoScroll') ) {
          $body = $('body');

          $('body').scrollTop( $body[0].scrollHeight );
        }
      }
    });


    return EventsView;
  });
define("templates",
  [],
  function() {
    "use strict";
    Ember.TEMPLATES["application"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
    this.compilerInfo = [4,'>= 1.0.0'];
    helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
      var buffer = '', hashContexts, hashTypes, escapeExpression=this.escapeExpression;


      data.buffer.push("<div class=\"menu\">\n  <a ");
      hashContexts = {'href': depth0};
      hashTypes = {'href': "BOOLEAN"};
      data.buffer.push(escapeExpression(helpers.action.call(depth0, "switchRoutes", {hash:{
        'href': (true)
      },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
      data.buffer.push(">Filters</a>\n</div>\n\n");
      hashTypes = {};
      hashContexts = {};
      data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "outlet", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
      data.buffer.push("\n");
      return buffer;
  
    });

    Ember.TEMPLATES["cards"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
    this.compilerInfo = [4,'>= 1.0.0'];
    helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
      var buffer = '', stack1, hashTypes, hashContexts, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, self=this;

    function program1(depth0,data) {
  
      var buffer = '', stack1, hashContexts, hashTypes, options;
      data.buffer.push("\n    <tr class=\"card\">\n      <td>");
      hashContexts = {'type': depth0,'name': depth0,'checked': depth0};
      hashTypes = {'type': "STRING",'name': "ID",'checked': "ID"};
      options = {hash:{
        'type': ("checkbox"),
        'name': ("card.id"),
        'checked': ("card.isVisible")
      },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
      data.buffer.push(escapeExpression(((stack1 = helpers.input || depth0.input),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "input", options))));
      data.buffer.push("</td>\n      <td>");
      hashTypes = {};
      hashContexts = {};
      data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "card.id", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
      data.buffer.push("</td>\n    </tr>\n  ");
      return buffer;
      }

      data.buffer.push("<table>\n  <thead>\n    <tr>\n      <th colspan=2>Card</th>\n    </tr>\n  </thead>\n  <tbody>\n  ");
      hashTypes = {};
      hashContexts = {};
      stack1 = helpers.each.call(depth0, "card", "in", "controller", {hash:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0,depth0,depth0],types:["ID","ID","ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
      if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
      data.buffer.push("\n  </tbody>\n</table>\n");
      return buffer;
  
    });

    Ember.TEMPLATES["event"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
    this.compilerInfo = [4,'>= 1.0.0'];
    helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
      var buffer = '', hashTypes, hashContexts, escapeExpression=this.escapeExpression;


      data.buffer.push("<td class=\"time\">");
      hashTypes = {};
      hashContexts = {};
      data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "view.content.formattedTime", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
      data.buffer.push("</td>\n<td class=\"service\">");
      hashTypes = {};
      hashContexts = {};
      data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "view.content.eventType.service.id", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
      data.buffer.push("</td>\n<td class=\"direction\">");
      hashTypes = {};
      hashContexts = {};
      data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "view.direction", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
      data.buffer.push("</td>\n<td class=\"event\">");
      hashTypes = {};
      hashContexts = {};
      data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "view.content.eventType.id", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
      data.buffer.push("</td>\n<td class=\"data\">");
      hashTypes = {};
      hashContexts = {};
      data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "view.content.data", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
      data.buffer.push("</td>\n");
      return buffer;
  
    });

    Ember.TEMPLATES["events"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
    this.compilerInfo = [4,'>= 1.0.0'];
    helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
      var buffer = '', stack1, hashContexts, hashTypes, options, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;


      data.buffer.push("<div id=\"events\">\n  <table>\n    <thead>\n      <tr>\n        <th class=\"time\">Time</th>\n        <th class=\"service\">Service</th>\n        <th class=\"direction\"></th>\n        <th class=\"event\">Event</th>\n        <th class=\"data\">Data</th>\n      </tr>\n    </thead>\n    ");
      hashContexts = {'contentBinding': depth0};
      hashTypes = {'contentBinding': "STRING"};
      options = {hash:{
        'contentBinding': ("controller")
      },contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
      data.buffer.push(escapeExpression(((stack1 = helpers.collection || depth0.collection),stack1 ? stack1.call(depth0, "App.EventsIndexView", options) : helperMissing.call(depth0, "collection", "App.EventsIndexView", options))));
      data.buffer.push("\n  </table>\n</div>\n");
      return buffer;
  
    });

    Ember.TEMPLATES["filters"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
    this.compilerInfo = [4,'>= 1.0.0'];
    helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
      var buffer = '', stack1, hashTypes, hashContexts, options, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;


      data.buffer.push("<div class=\"filters\">\n  <div class=\"filter\">\n  ");
      hashTypes = {};
      hashContexts = {};
      options = {hash:{},contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
      data.buffer.push(escapeExpression(((stack1 = helpers.outlet || depth0.outlet),stack1 ? stack1.call(depth0, "services", options) : helperMissing.call(depth0, "outlet", "services", options))));
      data.buffer.push("\n  </div>\n\n  <div class=\"filter\">\n  ");
      hashTypes = {};
      hashContexts = {};
      options = {hash:{},contexts:[depth0],types:["STRING"],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
      data.buffer.push(escapeExpression(((stack1 = helpers.outlet || depth0.outlet),stack1 ? stack1.call(depth0, "cards", options) : helperMissing.call(depth0, "outlet", "cards", options))));
      data.buffer.push("\n  </div>\n</div>\n");
      return buffer;
  
    });

    Ember.TEMPLATES["services"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data) {
    this.compilerInfo = [4,'>= 1.0.0'];
    helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
      var buffer = '', stack1, hashTypes, hashContexts, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, self=this;

    function program1(depth0,data) {
  
      var buffer = '', stack1, stack2, hashContexts, hashTypes, options;
      data.buffer.push("\n    <tr>\n      <td class=\"service\">");
      hashContexts = {'type': depth0,'name': depth0,'checked': depth0};
      hashTypes = {'type': "STRING",'name': "ID",'checked': "ID"};
      options = {hash:{
        'type': ("checkbox"),
        'name': ("service.id"),
        'checked': ("service.isVisible")
      },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
      data.buffer.push(escapeExpression(((stack1 = helpers.input || depth0.input),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "input", options))));
      data.buffer.push("</td>\n      <td class=\"service\">");
      hashTypes = {};
      hashContexts = {};
      data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "service.id", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
      data.buffer.push("</td>\n      <td>\n        <table>\n          ");
      hashTypes = {};
      hashContexts = {};
      stack2 = helpers.each.call(depth0, "eventType", "in", "service.eventTypes", {hash:{},inverse:self.noop,fn:self.program(2, program2, data),contexts:[depth0,depth0,depth0],types:["ID","ID","ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
      if(stack2 || stack2 === 0) { data.buffer.push(stack2); }
      data.buffer.push("\n        </table>\n      </td>\n    </tr>\n  ");
      return buffer;
      }
    function program2(depth0,data) {
  
      var buffer = '', stack1, hashContexts, hashTypes, options;
      data.buffer.push("\n          <tr>\n            <td>");
      hashContexts = {'type': depth0,'name': depth0,'checked': depth0};
      hashTypes = {'type': "STRING",'name': "ID",'checked': "ID"};
      options = {hash:{
        'type': ("checkbox"),
        'name': ("eventType.id"),
        'checked': ("eventType.isVisible")
      },contexts:[],types:[],hashContexts:hashContexts,hashTypes:hashTypes,data:data};
      data.buffer.push(escapeExpression(((stack1 = helpers.input || depth0.input),stack1 ? stack1.call(depth0, options) : helperMissing.call(depth0, "input", options))));
      data.buffer.push("</td>\n            <td class=\"event\">");
      hashTypes = {};
      hashContexts = {};
      data.buffer.push(escapeExpression(helpers._triageMustache.call(depth0, "eventType.id", {hash:{},contexts:[depth0],types:["ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data})));
      data.buffer.push("</td>\n          </tr>\n          ");
      return buffer;
      }

      data.buffer.push("<table>\n  <thead>\n    <tr>\n      <th class=\"service\" colspan=2>Service</th>\n      <th class=\"event\"> Event Type</th>\n    </tr>\n  </thead>\n  <tbody>\n  ");
      hashTypes = {};
      hashContexts = {};
      stack1 = helpers.each.call(depth0, "service", "in", "controller", {hash:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0,depth0,depth0],types:["ID","ID","ID"],hashContexts:hashContexts,hashTypes:hashTypes,data:data});
      if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
      data.buffer.push("\n  </tbody>\n</table>\n");
      return buffer;
  
    });
  });
/*global Conductor, $, oasis */

Conductor.require('loader.js');
Conductor.require('jquery.js');
Conductor.require('handlebars.js');
Conductor.require('ember.js');
Conductor.require('ember-data.js');
Conductor.requireCSS('conductor-analytics.css');

var DomConsumer = Conductor.Oasis.Consumer.extend({
  _wait: function(card) {
    var promise, obj = {}, helperName;

    return new Conductor.Oasis.RSVP.Promise(function(resolve) {
      var watcher = setInterval(function() {
        var routerIsLoading = card.App.__container__.lookup('router:main').router.isLoading;
        if (routerIsLoading) { return; }
        if (Ember.run.hasScheduledTimers() || Ember.run.currentRunLoop) { return; }
        clearInterval(watcher);
        Ember.run(function() {
          resolve();
        });
      }, 10);
    });
  },

  requests: {
    text:  function(selector) {
      var card = this.card,
          consumer = this;

      return Conductor.Oasis.RSVP.Promise(function(resolve, reject){
        consumer._wait( this.card ) .then( function() {
          resolve( $(selector).text() );
        });
      });
    },

    length: function(selector) {
      var card = this.card,
          consumer = this;

      return Conductor.Oasis.RSVP.Promise(function(resolve, reject){
        card.waitForActivation().then( function() {
          consumer._wait( card ).then( function() {
            resolve( $(selector).length );
          });
        });
      });
    }
  }
});

Conductor.card( {
  App: null,

  initializeDOM: function () {
    var analyticsDiv = document.createElement('div');
    analyticsDiv.setAttribute('id', 'analytics');
    document.body.appendChild( analyticsDiv );
    this.App.advanceReadiness();
  },

  activate: function() {
    this.consumers.height.autoUpdate = false;
    oasis.configure('eventCallback', Ember.run);
    this.App = requireModule('app/application');
  },

  consumers: {
    dom: DomConsumer,
    analytics: Conductor.Oasis.Consumer.extend({
      events: {
        printWiretapEvent: function(data) {
          var card = this.card,
              service = data.service,
              event = data.event,
              cardId = data.card,
              time = data.time;

          card.waitForActivation().then( function() {
            card.App.readyPromise.promise.then( function() {
              card.App.createEvent(time, service, event, cardId);
            });
          });
        }
      }
    })
  }
} );

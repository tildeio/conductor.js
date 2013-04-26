/*global Handlebars*/

Conductor.require('/vendor/jquery.js');
Conductor.require('/example/libs/handlebars-1.0.0-rc.3.js');

var template = '<div>{{message}}</div>';

Conductor.card({

  activate: function( data ) {
    this.compileTemplates();
  },

  compileTemplates: function() {
    template = Handlebars.compile(template);
  },

  render: function () {
    $('body').html(template({ message: "Hello again, world!" }));
  }
});

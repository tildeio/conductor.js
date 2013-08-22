Conductor.MetadataConsumer = Conductor.Oasis.Consumer.extend({
  requests: {
    metadataFor: function(name) {
      if (name === '*') {
        var values = [], names = [];

        for (var metadataName in this.card.options.metadata) {
          values.push(this.card.metadata[metadataName].call(this.card));
          names.push(metadataName);
        }

        return Conductor.Oasis.RSVP.all(values).then(function(sources) {
          var metadata = {};

          for (var i = 0; i < sources.length; i++) {
            var name = names[i];
            for (var key in sources[i]) {
              metadata[name+':'+key] = sources[i][key];
            }
          }

          return metadata;
        });

      } else {
        return this.card.metadata[name].call(this.card);
      }
    }
  }
});

Conductor.card({
  activate: function( data ) {
    this.message = "<div>hello world</div>";
  },

  render: function () {
    document.body.innerHTML = this.message;
  }
});

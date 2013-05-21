Conductor.card({
  activate: function () {
    var bigNode = document.createTextNode("Do you see something?");

    document.body.style.padding = "1px";
    document.body.style.margin = "2px";
    document.body.style.border = "solid transparent 4px";
    document.body.appendChild(bigNode);
    this.consumers.height.update();
  }
});

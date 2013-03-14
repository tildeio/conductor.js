var canvas;

function createCanvas(width, height) {
  if (!canvas) {
    canvas = document.createElement('canvas');
    document.body.appendChild(canvas);
  }

  canvas.width = width;
  canvas.height = height;

  var ctx = canvas.getContext('2d');
  ctx.fillStyle = "rgb(200,0,0)";
  ctx.fillRect(10, 10, 55, 50);

  ctx.fillStyle = "rgba(0, 0, 200, 0.5)";
  ctx.fillRect(30, 30, 55, 50);

  ctx.strokeStyle = "red";
  ctx.strokeRect(0, 0, width, height);

  ctx.font = "12px Courier";
  ctx.fillStyle = "red";

  var dimensionString = width + "x" + height;
  var textWidth = ctx.measureText(dimensionString).width;

  ctx.fillText(dimensionString, width-textWidth-5, height-5);
}

Conductor.card({
  render: function(intent, dimensions) {
    createCanvas(dimensions.width, dimensions.height);
  }
});


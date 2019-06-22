var config = require("../config.js")
var geomap = require("../geomap.js");
var tracklog = require("../tracklog.js");
var sharp = require("sharp");
var Canvas = require("canvas");
var GadgetBase = require("./GadgetBase.js");

class ActualPositionMap extends GadgetBase {
    constructor(gadgetConfig) {
        super(gadgetConfig);
        tracklog.get((tl) => {
            this.tracklog = tl;
        });

    }
    draw(canvas, ctx, frameInfo, events, callback) {
        
        if (this.gadgetConfig.visible == false)
            return;
        var trackLogItemIndex = this.tracklog.getPointIndexForFrame(frameInfo.frameno);
        var trackLogItem = this.tracklog.Points[trackLogItemIndex];
        var box = this.gadgetConfig.box;
        if (trackLogItem == null || trackLogItem.lng == 0)
            return;

        var heading = geomap.get().getHeading(trackLogItemIndex);
        var rot = Math.round(10 * heading * Math.PI / 180)/10;
      
        var currentPixelPosition = geomap.get().getCurrentPixelPosition(frameInfo.frameno);

        var img = config.config.mapImage;


        var rad = config.config.Radius;

        if (rad == null)
            rad = 150;
        var tlx = currentPixelPosition.x - rad;
        var tly = currentPixelPosition.y - rad;


        ctx.save();
        ctx.translate(box.left + box.width / 2, box.top + box.height / 2);
        console.log("ROT:" + rot);



       // ctx.rotate(rot);

        // Save the state, so we can undo the clipping
        ctx.save();

        // Create a circle
        ctx.beginPath();
        ctx.arc(0, 0, rad, 0, Math.PI * 2, false);

        // // Clip to the current path
        ctx.clip();

        ctx.drawImage(img, tlx, tly, 2 * rad, 2 * rad, -rad , -rad ,2*rad, 2*rad);



      
        ctx.fillStyle = "red";

        ctx.beginPath();
        ctx.arc(0, 0, 5, 0, Math.PI * 2, false);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(0, 0);
        for (let i = frameInfo.frameno; i > frameInfo.frameno - 20 && i >= 0; i--) {
            var pixelPosition = geomap.get().getCurrentPixelPosition(i);
            ctx.lineTo(pixelPosition.x - currentPixelPosition.x, pixelPosition.y - currentPixelPosition.y);
        }
        ctx.strokeStyle = "red";
        ctx.linWidth = 2;
        ctx.stroke();

        // Undo the clipping
        ctx.restore();
        ctx.restore();
        callback();

    }
}

module.exports.create = function (gadgetConfig) {
    return new ActualPositionMap(gadgetConfig);
}
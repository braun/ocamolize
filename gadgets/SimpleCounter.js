var config = require("../config.js")
var tracklog = require("../tracklog.js")
var GadgetBase = require("./GadgetBase.js");

class SimpleCounter extends GadgetBase {
    constructor(gadgetConfig) {
        super(gadgetConfig);       

        tracklog.get((tl)=>
        {
            this.tracklog = tl;
        });
    }
    draw(canvas,ctx,frameInfo,events,callback)
    {
       
        var trackLogItemIndex = this.tracklog.getPointIndexForFrame(frameInfo.frameno);
        var trackLogItem = this.tracklog.Points[trackLogItemIndex];
        var box = this.gadgetConfig.box;
        ctx.font = '30px Arial';
        ctx.fillStyle = "red";
       // ctx.rotate(0.1);
       var value = trackLogItem != null ? trackLogItem.getCounterValue(this.gadgetConfig.counter): "";
       var msg = this.gadgetConfig.label+" "+value;
        ctx.fillText(msg, this.box.left, this.box.top+30);
        callback();
    }
}

module.exports.create = function(gadgetConfig)
{
    return new SimpleCounter(gadgetConfig);
}
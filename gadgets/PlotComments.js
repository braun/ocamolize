var config = require("../config.js")
var GadgetBase = require("./GadgetBase.js");

class PlotComments extends GadgetBase {
    constructor(gadgetConfig) {
        super(gadgetConfig);      

    }
    draw(canvas,ctx,frameInfo,events,callback)
    {
        var box = this.gadgetConfig.box;
        var line = 0;
        ctx.font = '30pt Arial';
        ctx.fillStyle = "white";
        events.forEach(event=>
            {
                if(this.gadgetConfig.listenEvents.indexOf(event.plotItem.event) == -1)
                    return;
                var msg = event.plotItem.comment;
                var eventConfigList = this.gadgetConfig.eventConfig;
                var eventConfig = eventConfigList == null ? {} : eventConfigList[event.plotItem.event];
                if(eventConfig == null)
                    eventConfig = { padding:10};

                ctx.save();                   
                var padding = eventConfig.padding;
                var font = ctx.font;
              
                if(eventConfig.contextConfig != null && eventConfig.contextConfig.font != null)
                {
                    font = eventConfig.contextConfig.font;
                    ctx.font = font;
                }
                              
                var width = ctx.measureText(msg).width;
    
                var height = parseInt(font.match(/\d+/), 10); 
             
                if(eventConfig.box != null)
                {
                    if(eventConfig.box.contextConfig != null)
                    for(var key in eventConfig.box.contextConfig)
                        ctx[key] = eventConfig.box.contextConfig[key];

                      
                        ctx.fillRect(box.left, box.top+(height+2*padding)*line,2*padding+width,2*padding+height);
                }
             
                ctx.save();
                if(eventConfig.contextConfig != null)
                    for(var key in eventConfig.contextConfig)
                        ctx[key] = eventConfig.contextConfig[key];

                ctx.fillText(msg, box.left+padding, box.top+(height+2*padding)*line+height+padding);
                ctx.restore();
                ctx.restore();
                line++;
            });
      callback();
    }
}

module.exports.create = function(gadgetConfig)
{
    return new PlotComments(gadgetConfig);
}
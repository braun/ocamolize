var config = require("../config.js");


class GadgetBase
{
    constructor(gadgetConfig)
    {
        this.gadgetConfig = gadgetConfig;
        this.configStack = [];
    }

    drawFrame(canvas, ctx, frameInfo, events, callback)
    {
        events.forEach(event=>
        {
            if(event.plotItem.event == "configChange" &&
              ((this.gadgetConfig.instanceName == null &&  event.plotItem.gadget == this.gadgetConfig.type)
              || event.plotItem.gadget == this.gadgetConfig.instanceName 
              || event.plotItem.gadget === "all"))
                {
                    if(event.plotItem.reset == true && this.configStack.length > 0)
                        {
                            this.gadgetConfig = this.configStack[0];
                            this.configStack = [];
                        }
                    else if(event.plotItem.pop == true && this.configStack.length > 0)                    
                            this.gadgetConfig = this.configStack.pop();
                    else if(event.plotItem.config != null)
                    {
                        this.configStack.push(this.gadgetConfig);
                        this.gadgetConfig = Object.create(this.gadgetConfig);
                        Object.assign(this.gadgetConfig,event.plotItem.config);
                    }

                }
        });
        if (this.gadgetConfig.visible == false)
        {
            callback();
            return; 
        }
        this.draw(canvas, ctx, frameInfo, events, callback);
        
    }

    draw(canvas, ctx, frameInfo, events, callback)
    {}
}

module.exports = GadgetBase;
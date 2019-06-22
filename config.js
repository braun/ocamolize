var fs = require('fs');
var Canvas =  require('canvas');


class Config
{
    static load(basePath,callback,opts)
    {
        var rv = new Config(basePath,opts);
        module.exports.config = rv;
        rv.loadImage(callback);
    }

    constructor(basePath,opts)
    {
        if(opts == null)
         opts = {
             config: "config.json"
         }
        var configs = fs.readFileSync(basePath+"/"+opts.config,{ encoding:"UTF-8"});
        var rv = JSON.parse(configs);
        
        this.basePath = basePath;

        Object.assign(this,rv);
         this.createOrderedPlot();
     
    }

    video2Frameno(videoTime)
    {
        return Math.trunc((videoTime[0]*60+videoTime[1])/this.template.framerate);
    }
    
    video2Secs(videoTime)
    {
        return Math.trunc((videoTime[0]*60+videoTime[1]));
    }
    get MapImageFile()
    {
        return this.basePath + "/"+this.map.file;
    }

    get MaxFrameNo()
    {
        if(this._maxFrameNo == null)
          this._maxFrameNo =  this.video2Frameno(this.plotLength);
        return this._maxFrameNo;
    }

    get Gadgets()
    {
        if(this.gadgetInstances == null)
        {
            this.gadgetInstances = [];
            this.template.gadgets.forEach(gadgetConfig=>
                {
                    var gadgetModule = require("./gadgets/"+gadgetConfig.type+".js");
                    var gadget = gadgetModule.create(gadgetConfig);
                    this.gadgetInstances.push(gadget);
                });
        }
        return this.gadgetInstances;
    }
    loadImage(callback)
    {
        var sharp = require("sharp");
    sharp(this.MapImageFile)
        .rotate()
       // .resize()
        .toBuffer((err,data,info) => { 
            var img  = new Canvas.Image; // Create a new Image
            img.src = data;
                  
            this.imageData = data;
            this.mapImage = img;
            this.imageInfo = info;
            if(callback)
                callback(this);
         })
       
    }

    createOrderedPlot()
    {
        fs.writeFileSync(this.basePath+"/metadata.txt",";FFMETADATA1a\ntitle="+this.title+"\nauthor=Stanislav Kunt\n\n");
// create ordered plot if not creted yet
        if(this.orderedPlot == null)
        {
            this.orderedPlot = [];
            var eventMap = {};
            for(let i =0; i < this.plot.length;i++)
            {
                var plotItem = this.plot[i]
                var newitem = {
                    frameno: this.video2Frameno(plotItem.videoTime),
                
                    plotItem:plotItem
                }
            
                this.orderedPlot.push(newitem);
                if(plotItem.videoTimeEnd != null)                
                    newitem.framenoEnd =this.video2Frameno(plotItem.videoTimeEnd);                      
            }
            // order the plot!
            this.orderedPlot.sort((a,b)=>
            {
                return a.frameno - b. frameno;
            })

            // mark end of events for start only events
            var eventMap = {};
            for(let i =0; i < this.orderedPlot.length;i++)
            {
                var orderedPlotItem = this.orderedPlot[i];
                if(orderedPlotItem.framenoEnd != null)
                    continue;

                var eventType = orderedPlotItem.plotItem.event;
                var previousPlotItem = eventMap[eventType];            
                if(previousPlotItem != null)               
                {
                    previousPlotItem.next = orderedPlotItem;
                    orderedPlotItem.prev = previousPlotItem;     
                    previousPlotItem.framenoEnd = orderedPlotItem.frameno-1;
                }   
                eventMap[eventType] =orderedPlotItem;   
                
                if(orderedPlotItem.plotItem.chapter != null)
                {
                    var offset = orderedPlotItem.plotItem.chapterOffset;
                    if(offset == null)
                       offset = this.chapterOffset;
                    if(offset == null)
                        offset = 10;

                    fs.appendFileSync(this.basePath+"/metadata.txt","[CHAPTER]\nTIMEBASE=1/1000\nSTART="
                        +((this.video2Secs(orderedPlotItem.plotItem.videoTime)-offset)*1000)
                        +"\nEND="+((this.video2Secs(orderedPlotItem.plotItem.videoTime)-offset+20)*1000)
                        +"\ntitle="+orderedPlotItem.plotItem.chapter+"\n\n");
                        
                }
            }
        }
    }
/**
 * Gets list of plot events for current frame
 * @param {FrameInfo} frameinfo 
 */
    fireEventsForFrame(frameinfo)
    {
        

        // create list of plot events active on specified
        var frameno = frameinfo.frameno;

        var events = [];
    
        for(var i = 0; i < this.orderedPlot.length;i++)
        {         
            let plotItem = this.orderedPlot[i];
            if(plotItem.frameno > frameno)                            
                continue;
                
            if(plotItem.frameno <= frameno && plotItem.framenoEnd >= frameno)
                events.push(plotItem);    
        }

        return events;
    }

}

module.exports = 
{
    Config: Config
}
    

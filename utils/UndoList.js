depends('utils.UndoList', [
    'events.EventEmitter',
]);

namespace('utils').UndoList = function(){
    var eventEmitter = new events.EventEmitter();
    var eventList = [];
    var seek = 0;
    this.canUndo = false;
    this.canRedo = false;
    this.on = eventEmitter.on;
    this.off = eventEmitter.off;
    
    this.push = function(event){
        if(event.event == undefined){
            throw "Unknow undo event";
        }
        if(eventList.length == seek){
            eventList.push(event);
            seek ++;
        } else {
            //delete events after seek
            seek ++;
            eventList.splice(seek);
            eventList[seek - 1] = event;
        }
        this.canUndo = true;
    }
    
    this.getUndo = function(){
        if(seek - 1 > 0){
            seek --;
            if(seek == 1){
                this.canUndo = false;
            } else {
                this.canUndo = true;
            }
            return eventList[seek - 1];
        }
        return false;
    }
    
    this.getRedo = function(){
        if(seek + 1 <= eventList.length){
            seek ++;
            if(seek == eventList.length){
                this.canRedo = false;
            } else {
                this.canRedo = true;
            }
            return eventList[seek - 1];
        }
        return false;
    }
    
    this.undo = function(){
        var data = this.getUndo();
        if(data){
            eventEmitter.emit('change.' + data.event, data);
            return true;
        } else {
            return false;
        }
    }
    
    this.redo = function(){
        var data = this.getRedo();
        if(data){
            eventEmitter.emit('change.' + data.event, data);
            return true;
        } else {
            return false;
        }
    }
}
depends('data.Track', [
    'data.Note',
    'events.EventEmitter',
]);

//音轨基类
namespace('data').Track = function(){
    var event = new events.EventEmitter();
    var emit = event.emit;
    
    this.noteList = [];
    this.on = event.on;
    this.off = event.off;
    
    this.tempo = 120;
    this.beatLength = 4;
    this.measureLength = 4;
    this.name = '';
    this.voiceback = null;
    
    this.pos = 0;
    this.dur = 480 * 4 * 50;
    
    this.init = function(){
        
    };
    
    this.addNote = function(note){
        if(typeof note != 'object' || note.pos != undefined) return false;
        //判断note的插入点
        var insertPos = 0;
        for(var i = 0; i < this.noteList.length; i ++){
            if(this.noteList[i].pos > note.pos){
                insertPos = i;
                break;
            }
        }
        this.noteList.push(undefined);
        for(var i = this.noteList.length - 1; i > insertPos; i --){
            this.noteList[i] = this.noteList[i - 1];
        }
        this.noteList[insertPos] = note;
        note.on(true, this.upEvent);
        return true;
    };
    
    //将note的事件转发
    this.upEvent = function(eventName, ...args){
        emit('note.' + eventName, ...args);
    };
};
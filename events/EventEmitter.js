namespace('events').EventEmitter = function(){
    var eventList = {};
    this.on = function(name, callback){
        if(typeof callback == 'function'){
            if(eventList[name] == undefined){
                eventList[name] = [];
            }
            eventList[name].push(callback);
            return true;
        }
    };

    this.off = function(...args){
        if(args.length == 2){
            var name = args[0];
            var callback = args[1];
            if(eventList[name] != undefined){
                var event = eventList[name];
                for(var i in event){
                    if(event[i] == callback){
                        delete eventList[name][i];
                    }
                }
                return true;
            } else {
                return false;
            }
        } else if(args.length == 1){
            var name = args[0];
            if(eventList[name] != undefined){
                delete eventList[name];
                return true;
            } else {
                return false;
            }
        }
    };

    this.emit = function(...args){
        if(args.length == 0){
            throw "Wrong argument length";
        }
        var name = args[0];
        var fArgs;
        if(args.length > 1){
            fArgs = args.slice(1);
        }
        if(eventList[name] != undefined){
            eventList[name].forEach(function(callback){
                if(fArgs == undefined){
                    callback.call(this);
                } else {
                    callback.call(this, ...fArgs);
                }
            });
        }
        if(name !== true){
            if(fArgs == undefined){
                this.emit(true, name);
            } else {
                this.emit(true, name, ...fArgs);
            }
        }
    };
};
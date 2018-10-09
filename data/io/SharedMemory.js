//共享内存系统
//每次访问数据时，从数据所有者转移数据到当前线程
namespace('data.io').SharedMemory = function(...args){
    //! private
    var service = 'SMemory';
    var server = true; //server应只存在于主线程中
    var master; //主控线程
    var arrayBuffer; //arrayBuffer引用
    var dataPos; //当前data的位置，-1代表在主控线程中
    var readyCallback = [];
    var sendTemp;
    
    this.isLocked = false;
    this.name;
    this.workers = [];
    this.isReady = false;
    
    this.get = function(key){
        return eval(key);
    };
    
    this.init = function(){
        if(args.length == 2 && typeof args[0] == 'string' && typeof args[1] == 'number'){
            arrayBuffer = new ArrayBuffer(args[1]);
            this.isReady = true;
            this.name = args[0];
            dataPos = -1;
        } else if(args.length == 1 && typeof args[0] == 'string'){
            server = false;
            master = self;
            this.name = args[0];
            self.addEventListener('message', this.onMessage(-1));
        }
    };
    
    this.addWorker = function(worker){
        //注册worker
        this.workers.push(worker);
        var id = this.workers.length - 1;
        worker.addEventListener('message', this.onMessage(id));
    };
    
    this.getFromWorker = function(id, callback){
        if(typeof this.workers[id] != 'undefined'){
            var worker = this.workers[id];
            worker.postMessage({service: service, name: this.name, action: 'get'});
            if(typeof callback == 'function'){
                readyCallback.push(callback);
            }
        }
    };
    
    this.getFromServer = function(callback){
        postMessage({service: service, name: this.name, action: 'get'});
        if(typeof callback == 'function'){
            readyCallback.push(callback);
        }
    };
    
    this.sendBuffer = function(id, buffer){
        if(server){
            if(typeof this.workers[id] != 'undefined'){
                var worker = this.workers[id];
                worker.postMessage({service: service, name: this.name, action: 'set', buffer: buffer}, [buffer]);
                dataPos = id;
                this.isReady = false;
            }
        } else {
            postMessage({service: service, name: this.name, action: 'set', buffer: buffer}, [buffer]);
            dataPos = id;
            this.isReady = false;
        }
    };
    
    this.getBuffer = function(){
        var _this = this;
        return new Promise((resolve, reject) => {
            if(_this.isReady){
                //直接发送
                resolve(arrayBuffer);
            } else if(server){
                //从worker取回数据
                _this.getFromWorker(dataPos, (buffer) => {
                    resolve(buffer);
                });
            } else if(!server){
                //让server转发数据
                _this.getFromServer((buffer) => {
                    resolve(buffer);
                });
            }
        });
    };
    
    this.onGetReady = function(){
        dataPos = -1;
        this.isReady = true;
        for(var i = 0; i < readyCallback.length; i ++){
            if(typeof readyCallback[i] == 'function'){
                readyCallback[i](arrayBuffer);
                delete readyCallback[i];
            }
        }
        readyCallback.splice(0, readyCallback.length);
    };
    
    this.onLockChange = function(){
        if(this.isLocked == false && sendTemp != undefined){
            _this.sendBuffer(sendTemp, buffer);
            sendTemp = undefined;
        }
    };
    
    this.onMessage = function(workerId){
        var _this = this;
        return function(e){
            if(typeof e.data == 'object' && e.data.service == service){
                var data = e.data;
                if(data.name == _this.name){
                    //console.log(data);
                    switch(data.action){
                        case 'set':
                            arrayBuffer = data.buffer;
                            _this.onGetReady();
                            break;
                        case 'get':
                            if(_this.isLocked){
                                sendTemp = workerId;
                            } else {
                                _this.getBuffer().then((buffer) => {
                                    _this.sendBuffer(workerId, buffer);
                                });
                            }
                            break;
                    }
                    return false;
                }
            }
        };
    }
    
    this.init();
};
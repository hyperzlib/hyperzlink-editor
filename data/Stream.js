namespace('data').Stream = new function(){
    this.wrapperList = {};
    this.registerWrapper = function(name, wrapper){
        this.wrapperList[name] = wrapper;
    };

    this.removeWrapper = function(name){
        if(typeof this.wrapperList[name].__destruct == 'function'){
            this.wrapperList[name].__destruct();
        }
        delete this.wrapperList[name];
    };

    this.parseUrl = function(url){
        var t = url.split('://');
        var ret = {};
        if(t.length == 1){
            ret.protocol = 'web';
            ret.path = t[0];
        } else if(t[0] == 'http' || t[0] == 'https'){
            ret.protocol = 'web';
            ret.path = t[1];
        } else {
            ret.protocol = t[0];
            ret.path = t[1];
        }
        return ret;
    };

    this.getWrapper = function(url){
        var data = this.parseUrl(url);
        return this.wrapperList[data.protocol];
    };

    /** args:
     * url
     * [offset]
     * [length]
     **/
    this.fetch = async function(...args){
        var url = args[0];
        var offset, length;
        if(args.length >= 2){
            offset = args[1];
        } else {
            offset = 0;
        }
        if(args.length >= 3){
            length = args[2];
        } else {
            length = 0;
        }
        return await this.getWrapper(url).fetch(url, offset, length);
    };
};

var webWrapper = {fetch: function(){
    
}};
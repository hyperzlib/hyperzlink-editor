//字典类
namespace('data.Dict').PhonmeList = function(){
    var dictList = {};

    this.clear = function(){
        for(var key in dictList){
            delete dictList[key];
        }
        this.language = undefined;
        this.code = undefined;
        this.scheme = 'default';
        this.consonants = undefined;
        this.vowels = undefined;
        this.stretches = undefined;
    };

    this.loadDict = function(data){
        this.clear();
        var lines = data.split('\r\n');
        var inConf = false;
        for(var i = 0; i < lines.length; i ++){
            if(lines[i] == ''){
                continue;
            }
            if(lines[i] == '[conf]'){
                inConf = true;
            } else if(lines[i] == '[dict]'){
                inConf = false;
            } else {
                if(inConf){
                    var t = lines[i].split('=');
                    switch(t[0]){
                        case 'language': case 'scheme':
                            this[t[0]] = t[1];
                            break;
                        case 'code': case 'consonants': case 'vowels': case 'stretches':
                            this[t[0]] = t[1].split(',');
                            break;
                    }
                } else {
                    var dict = lines[i].split('\t\t');
                    dictList[dict[0]] = [[dict[0]], dict[1].split(' ')];
                }
            }
        }
        if(this.stretches == undefined){
            this.stretches = this.vowels;
        }
    };

    this.detect = function(syllable){
        var ret = dictList[syllable];
        if(typeof ret != 'undefined'){
            return ret;
        }
    };
};
function getBaseDir(){
	return location.href.substr(0, location.href.lastIndexOf('/')) + '/';
}

function getBasename(path){
	var i = path.lastIndexOf('.');
	return path.substr(i + 1, path.length - i);
}

function arrcmp(arr1, arr2){
    if(typeof arr1 == 'number' && arr1 == arr2.length){
        return true;
    } else if(arr1.length == arr2.length){
        for(var i = 0; i < arr1.length; i ++){
            if(arr1[i] && arr1[i] != arr2[i]) return false;
        }
        return true;
    } else {
        return false;
    }
}

function isClassExists(cname){
	var t;
	var subList = cname.split('.');
	for(var key in subList){
		var sub = subList[key];
		if(t == undefined){
			if(eval('typeof ' + sub) == 'undefined'){
				return false;
			} else {
				t = eval(sub);
			}
		} else {
			if(typeof t[sub] == 'undefined'){
				return false;
			} else {
				t = t[sub];
			}
		}
	}
	if(typeof t == 'function' || typeof t == 'object'){
		return true;
	} else {
		return false;
	}
}

function foreach(arr, callback){
    for(var key in arr){
        if(callback(arr[key], key, arr) === false){
            break;
        }
    }
}

var baseDir = getBaseDir();

var dependList = {};
function depends(namespace, list){
	dependList[namespace] = list;
}

var loaderMode = 0;
if(typeof importScripts == 'function'){
    var $ = {
        getScript: function(url){
            importScripts(url);
            return {
                done: fRun,
                fail: function(){},
            }
        }
    };
}

function fRun(callback){
    if(typeof callback == 'function'){
        callback();
    }
}

function loader(useCall, target){
	return new Promise((resolve, reject) => {
		var _this = this;
		var useList = [];
		var loaded = 0;
		if(typeof target == 'undefined'){
			target = this;
		}
		//use函数（先添加进缓存列表）
		//格式：url#class:alias
		function use(str){
			if(str == undefined){
				throw "Wrong function args";
			}
			var useData = {};
			var baseFile = str;
			//设置url
			var t = baseFile.split('#');
			if(t.length == 2){
			    useData.url = t[0];
			    baseFile = t[1];
			}
			//设置类别名
			var t = baseFile.split(':');
			if(t.length == 2){
				useData.name = t[1];
				baseFile = t[0];
			}
			
			if(useData.url == undefined){
			    useData.url = baseDir + baseFile.replace(/\./g, '/') + '.js';
			}
			if(useData.name == undefined){
			    useData.name = getBasename(baseFile);
			}
			useData.class = baseFile;
			useData.loaded = false;
			useList.push(useData);
		}
		//加载完成回调
		function onLoaded(index, name, obj){
			target[name] = obj;
			useList[index].loaded = true;
			loaded ++;
			if(loaded == useList.length){
				resolve.call(target);
			}
		}
		//调用加载区块
		if(typeof useCall == 'function'){
			useCall.call(target, use);
		} else {
			throw "Unknow use type";
		}
		//开始加载
		$.ajaxSetup({
			cache: true,
		});
		useList.forEach((val, key) => {
			if(isClassExists(val.class)){ //判断是否是已加载的类
				var tObj = eval(val.class)
				target[val.name] = tObj;
				useList[key].loaded = true;
				loaded ++;
				onLoaded(key, val.name, tObj);
			} else { //从服务器加载文件
				$.getScript(val.url).done(() => {
				    //检测是否为class文件
					if(isClassExists(val.class)){
						tObj = eval(val.class);
						//开始进行循环依赖初始化
						if(typeof dependList[val.class] != 'undefined'){
							loader((use) => {
								dependList[val.class].forEach((package) => {
									use(package);
								});
							}, tObj).then(() => {
							    console.log(val.name);
								onLoaded(key, val.name, tObj);
							}).catch((e) => {
								reject(e);
							});
						} else {
							onLoaded(key, val.name, tObj);
						}
					} else {
						reject('unable to find class: ' + val.class);
					}
				}).fail((a, b, e) => {
					reject(e);
					return;
				});
			}
		});
	});
}

function namespace(ns){
	var nsList = ns.split('.');
	var obj;
	for(var i in nsList){
		var one = nsList[i];
		if(i == 0){
			if(eval('typeof ' + one) == 'undefined'){
				eval(one + ' = {}');
			}
			obj = eval(one);
		} else {
			if(typeof obj[one] == 'undefined'){
				obj[one] = {};
			}
			obj = obj[one];
		}
	}
	return obj;
}

//类的继承
function extend(father, child){
    var Super = function(){};
    var Template;
    loader((use) => {
        use(father);
    }).then(() => {
        father = eval(father);
        Template = function(){
            father.call(this);
            child.call(this);
            Super.prototype = child.prototype;
            Template.prototype = new Super();
            Super.prototype = father.prototype;
            Template.prototype = new Super();
        };
    });
    return Template;
}

//函数重载
function overload(...funcs){
    for(var i in funcs){
        if(typeof funcs[i] == 'function'){
            var func = funcs[i];
            var f = func.toString();
            var argv = f.substring(f.indexOf('(') + 1, f.indexOf(')')).split(',');
            var baseType = [];
            argv.forEach((val) => {
                val = val.trim();
                if(val.indexOf('_') != -1){
                    switch(val.substring(0, val.indexOf('_'))){
                        case 's': case 'str': case 'string':
                            baseType.push('string');
                            break;
                        case 'i': case 'int': case 'float': case 'double': case 'n': case 'num': case 'number':
                            baseType.push('number');
                            break;
                        case 'a': case 'arr': case 'array': case 'o': case 'obj': case 'object':
                            baseType.push('object');
                            break;
                        case 'b': case 'bool': case 'boolean':
                            baseType.push('boolean');
                            break;
                        case 'f': case 'func': case 'function':
                            baseType.push('function');
                            break;
                    }
                } else {
                    baseType.push(undefined);
                }
            });
            funcs[i] = [baseType, func];
        }
    }
    return function(...args){
        var typeList = [];
        args.forEach((val) => {
            typeList.push(typeof val);
        });
        var finalFunc;
        foreach(funcs, (val) => {
            if(arrcmp(val[0], typeList)){
                finalFunc = val[1];
            }
        });
        if(typeof finalFunc == 'function'){
            return finalFunc(...args);
        } else {
            throw "Cannot detect overloaded function";
        }
    };
}
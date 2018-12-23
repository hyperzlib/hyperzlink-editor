//先定义这个类最基本的方法，后期再进行重载
var data = {};
data.fs = {
	readFile: async function(url, type = 'text'){
		var response = await fetch(url);
		if(Math.floor(response.status / 100) == 2){
			var data;
			switch(type){
				case 'text':
					data = await response.text();
					break;
			}
			return data;
		} 
	}
};

var loadedClasses = [];

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
	if(loadedClasses.indexOf(cname) != -1){
		return true;
	}

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

function DOMEval(code) {
	var doc = document;
	var i, script = doc.createElement( "script" );
	script.text = code;
	doc.head.appendChild( script ).parentNode.removeChild( script );
}

function fRun(callback){
    if(typeof callback == 'function'){
        callback();
    }
}

function strstr(str1, str2, offset = 0){
	if(str2.length < str1.length) return false;
	else return str1.substr(offset, str1.length - offset) == str2.substr(offset, str1.length - offset);
}

function splitArgs(str){
	var ret = [];
	var args = str.split(' ');
	var buffer = [];
	var inString = false;
	var t;
	args.forEach((argv) => {
		if(inString){ //在string内
			if(argv.length > 2){
				t = argv.substr(-2, 2);
				if(t != '\\\'' && t != '\\"' && (t[1] == '\'' || t[1] == '"')){ //结束string
					inString = false;
					buffer.push(argv.substr(0, argv.length - 1));
					ret.push(buffer.join(' '));
					buffer = [];
				} else {
					buffer.push(argv);
				}
			} else {
				buffer.push(argv);
			}
		} else { //string外
			if(argv != ''){
				if(argv[0] != '\'' && argv[0] != '"'){
					ret.push(argv);
				} else { //入string
					t = argv.substr(-2, 2);
					if(t != '\\\'' && t != '\\"' && (t[1] == '\'' || t[1] == '"')){
						ret.push(argv.substr(1, argv.length - 2));
					} else {
						inString = true;
						buffer.push(argv.substr(1));
					}
				}
			}
		}
	});
	return ret;
}

function parseImport(line){
	var args = splitArgs(line.substr(line.indexOf(' ') + 1));
	var ret = {
		className: '',
		refName: '',
		url: '',
	};
	ret.className = args[0];
	ret.refName = ret.className.substr(ret.className.lastIndexOf('.') + 1);
	ret.url = ret.className.replace(/\./g, '/') + '.js';
	for(var i = 1; i + 1 < args.length; i ++){
		switch(args[i]){
			case 'as':
				ret.refName = args[++ i];
				break;
			case 'from':
				ret.url = args[++ i];
		}
	}
	return ret;
}

function parseScript(script, namespace = ''){
	//先解析控制字符
	var lines = script.split('\n');
	var preCodes = []; //起始代码（类快捷赋值等）
	var endCodes = []; //终止代码（namespace赋值）
	var ret = {
		depends: [],
		script: '',
	};
	var nsPath = namespace.split('.');
	var orderNs = namespace.substr(0, namespace.lastIndexOf('.'));
	var className = nsPath[nsPath.length - 1];
	for(var i in lines){
		var line = lines[i].trim();
		if(strstr('//import', line) || strstr('//i', line) || strstr('//use', line)){
			//import指令
			var data = parseImport(line);
			ret.depends.push(data);
			preCodes.push('var ' + data.refName + ' = ' + data.className + ';');
		} else if(strstr('//namespace', line) || strstr('//ns', line)){
			var t = line.split(' ');
			if(t.length > 0){
				var realNs = t[1];
				if(orderNs != realNs){
					throw 'Namespace mismatch, order: ' + orderNs + ', now: ' + realNs;
				}
			}
		}
	}
	if(orderNs != ''){
		endCodes.push('namespace("' + orderNs + '").' + className + ' = ' + className + ';');
		ret.script = '(function(){\n' + preCodes.join('\n') + '\n' + script + '\n' + endCodes.join('\n') + '\n' + '})();';
	} else {
		
	ret.script = preCodes.join('\n') + '\n' + script;
	}
	return ret;
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
		function use(useData){
			if(useData == undefined){
				throw "Wrong function args";
			}
			if(typeof useData == 'string'){
				useData = parseImport(useData);
			}
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
		useList.forEach((val, key) => {
			var tObj;
			if(isClassExists(val.className)){ //判断是否是已加载的类
				tObj = eval(val.className)
				target[val.refName] = tObj;
				useList[key].loaded = true;
				loaded ++;
				onLoaded(key, val.refName, tObj);
			} else { //从服务器加载文件
				data.fs.readFile(val.url).then((content) => {
					if(content === false){ //文件加载失败
						reject('unable to find class: ' + val.className);
						return;
					}
					var scriptData = parseScript(content, val.className);
					//开始进行循环依赖初始化
					if(scriptData.depends.length != 0){
						loadedClasses.push(scriptData.className);
						loader((use) => {
							scriptData.depends.forEach((package) => {
								use(package);
							});
						}).then(() => {
							DOMEval(scriptData.script);
							tObj = eval(val.className);
							onLoaded(key, val.refName, tObj);
						}).catch((e) => {
							reject(e);
						});
					} else {
						DOMEval(scriptData.script);
						tObj = eval(val.className);
						onLoaded(key, val.refName, tObj);
					}
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
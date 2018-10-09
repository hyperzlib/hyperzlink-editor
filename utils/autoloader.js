function getBaseDir(){
	return location.href.substr(0, location.href.lastIndexOf('/')) + '/';
}

function getBasename(path){
	var i = path.lastIndexOf('.');
	return path.substr(i + 1, path.length - i);
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
		useList.forEach(function(val, key){
			if(isClassExists(val.class)){ //判断是否是已加载的类
				var tObj = eval(val.class)
				target[val.name] = tObj;
				useList[key].loaded = true;
				loaded ++;
				onLoaded();
			} else { //从服务器加载文件
				$.getScript(val.url).done(function(){
				    //检测是否为class文件
					if(isClassExists(val.class)){
						tObj = eval(val.class);
						//开始进行循环依赖初始化
						if(typeof dependList[val.class] != 'undefined'){
							loader(function(use){
								dependList[val.class].forEach(function(package){
									use(package);
								});
							}, tObj).then(function(){
								onLoaded(key, val.name, tObj);
							}).catch(function(e){
								reject(e);
							});
						} else {
							onLoaded(key, val.name, tObj);
						}
					} else {
						reject('unable to find class: ' + val.class);
					}
				}).fail(function(a, b, e){
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
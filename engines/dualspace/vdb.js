function vdb(dbname, baseUrl){
    this.db;
    this.baseUrl = baseUrl;
    
    this.getChunkList = function(map, start, length){
        var end = start + length;
        var chunkList = [];
        //计算重叠部分
        for(var i in map){
            var one = map[i];
            var thisEnd = one.start + one.length;
            if(one.start >= start && one.start <= end){
                //起点在内的时候
                if(thisEnd <= end){
                    //终点在内
                    if(thisEnd - one.start != 0){
                        chunkList.push({id: one.id, start: one.start, length: thisEnd - one.start, cached: true, debug: 0});
                    }
                } else if(thisEnd > end){
                    if(end - one.start != 0){
                        //终点在外
                        chunkList.push({id: one.id, start: one.start, length: end - one.start, cached: true, debug: 1});
                    }
                }
            } else if(thisEnd >= start && thisEnd <= end){
                //终点在内的情况（只存在起点在外）
                if(thisEnd - start != 0){
                    chunkList.push({id: one.id, start: start, length: thisEnd - start, cached: true, debug: 2});
                }
            }
        }
        chunkList.sort(function(m, n){
            if(m.start < n.start) return -1;
            else if(m.start > n.start) return 1;
            else return 0;
        });
        //计算缺失部分
        var len = chunkList.length;
        var now;
        if(len != 0){
            //起始&结尾缺失
            now = chunkList[0];
            if(now.start > start){
                chunkList.push({id: -1, start: start, length: now.start - start, cached: false});
            }
            now = chunkList[len - 1];
            if(now.start + now.length < end){
                chunkList.push({id: -1, start: now.start + now.length, length: end - now.start - now.length, cached: false});
            }
        } else {
            chunkList.push({id: -1, start: start, length: end - start, cached: false});
        }
        for(var i = 1; i < len; i ++){
            now = chunkList[i];
            var prev = chunkList[i - 1];
            var prevEnd = prev.start + prev.length;
            if(now.start < prevEnd){
                now.start = prevEnd;
            } else if(now.start > prevEnd){
                //缺失块
                chunkList.push({id: -1, start: prevEnd, length: now.start - prevEnd, cached: false});
            }
        }
        chunkList.sort(function(m, n){
            if(m.start < n.start) return -1;
            else if(m.start > n.start) return 1;
            else return 0;
        });
        return chunkList;
    };
    
    this.getChunk = function(filename, start, length){
        return new Promise((resolve, reject) => {
            //搜寻数据库中的区段
            db.map.get({filename: filename}).then((data) => {
                if(data == undefined){
                    //全部网络加载
                    this.downloadChunk(this.getUrl(filename)).then(() => {
                        
                    });
                }
            });
        });
    }
    
    this.getUrl = function(filename){
        return this.baseUrl + filename;
    }
    
    this.downloadChunk = function(url, start, length){
        return new Promise((resolve, reject) => {
            var req = new Request(url);
            req.headers.append('Range', 'bytes=' + start.toString() + '-' + (start + length - 1).toString());
            fetch(req).then((res) => {
                if(res.status == 206){
                    res.arrayBuffer().then((buffer) => {
                        resolve(buffer);
                    });
                } else {
                    reject(res.status, res);
                }
            });
        });
    }
    
    this.saveChunk = function(filename, start, content){
        return new Promise((resolve) => {
            db.file.put({content: content}).then((id) => {
                db.map.get({filename: filename}).then((data) => {
                    if(data == undefined){
                        db.map.put({filename: filename, chunks: [{
                            id: id,
                            start: start,
                            length: content.byteLength,
                        }]}).then(() => {
                            resolve(true);
                        });
                    } else {
                        var chunkData = data.chunks;
                        chunkData.push({
                            id: id,
                            start: start,
                            length: content.byteLength,
                        });
                        db.map.update(fileid, {chunks: chunkData}).then(() => {
                            resolve(true);
                        });
                    }
                });
            });
        });
    }
    
    this.init = function(name){
        db = new Dexie(name + "_vdb");
        db.version(1).stores({
            map: '++fileid, filename, chunks',
            file: '++chunkid, content',
        });
    };
    
    this.init(dbname);
}
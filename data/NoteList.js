//import data.Note

//namespace data
var baseHandle = {
	get: (obj, name) => {
		if(typeof name == 'string'){
			var member = 'get' + name.substr(0, 1).toUpperCase() + name.substr(1);
			if(obj[member] !== undefined){
				return obj[member]();
			} else {
				return obj[name];
			}
		} else {
			return obj[name];
		}
	},
	set: (obj, name, value) => {
		if(typeof name == 'string'){
			var member = 'set' + name.substr(0, 1).toUpperCase() + name.substr(1);
			if(obj[member] !== undefined){
				obj[member](value);
			} else {
				obj[name] = value;
			}
		} else {
			obj[name] = value;
		}
		return obj[name];
	},
};

class NoteList {
	constructor(hz){
		this.timeList = [];
		this.parent = hz;
		this.length = 0;
	}
	
	add(note){
		var tempNote = new Proxy(new data.Note(this.parent, this), baseHandle);
		if(note !== undefined){
			for(var key in note){
				tempNote[key] = note[key];
			}
		}
		var id = this.push(tempNote);
		tempNote.id = id;
		return id;
	}
	
	push(val){
		this[this.length] = val;
		this.timeList.push(val);
		this.length ++;
		return this.length - 1;
	}
	
	updateList(id){
		if(id == undefined){
			var list = this.timeList;
			//排序列表
			list = list.sort((a, b) => {
				return a.start - b.start;
			});
			list.forEach((data, key) => {
				data.timeId = key;
			});
		} else {
			//部分排序
			var list = this.timeList;
			var t;
			for(var i = 1; i < list.length; i ++){
				if(list[i - 1].start > list[i].start){
					t = list[i - 1];
					list[i - 1] = list[i];
					list[i] = t;
				}
			}
		}
		this.updateConnect(id);
	}
	
	updateConnect(id){
		//计算重叠
		var list = this.timeList;
		for(var i = 1; i < list.length; i ++){
			var prev = list[i - 1];
			var now = list[i];
			if(prev.end > now.start){
				//重叠
				prev.overlay = true;
				now.overlay = true;
			} else {
				//非重叠
				prev.overlay = false;
				now.overlay = false;
			}
			if(prev.end == now.start){
				if(prev.pitchNum == now.pitchNum){
					prev.rightConnect = true;
					now.leftConnect = true;
				} else if(prev.pitchNum < now.pitchNum){
					prev.rightTopConnect = true;
					now.leftBottomConnect = true;
				} else if(prev.pitchNum > now.pitchNum){
					prev.rightBottomConnect = true;
					now.leftTopConnect = true;
				}
			} else {
				prev.rightConnect = false;
				prev.rightTopConnect = false;
				prev.rightBottomConnect = false;
				now.leftConnect = false;
				now.leftTopConnect = false;
				now.leftBottomConnect = false;
			}
		}
		if(this.length > 0){
			list[0].leftConnect = false;
			list[list.length - 1].rightConnect = false;
		}
	}
	
	deleteNote(note){
		if(note.id !== undefined && this[note.id] !== undefined){
			for(var i = note.id; i < this.length - 1; i ++){
			    this[i] = this[i + 1];
			    if(this[i] !== undefined) this[i].id = i;
			}
			delete this[this.length - 1];
			this.length --;
		}
		if(note.timeId !== undefined && this.timeList[note.timeId] !== undefined){
		    var list = this.timeList;
			delete list[note.timeId];
			var t;
			for(var i = note.timeId; i < list.length - 1; i ++){
			    list[i] = list[i + 1];
			}
			list.splice(list.length - 1);
		}
		this.updateConnect();
	}
	
	changeZoom(){
	    this.timeList.forEach((note) => {
	        note.changeZoom();
	    });
	}
};
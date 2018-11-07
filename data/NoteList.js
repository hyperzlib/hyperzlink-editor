depends('ui.PianoRoll', [
	'data.Note'
]);

namespace('data').NoteList = function(pianoRoll){
	var baseHandle = {
		get: (obj, name) => {
			if(typeof name == 'string'){
				var member = 'get' + name.substr(0, 1).toUpperCase() + name.substr(1);
				if(obj[member] != undefined){
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
				if(obj[member] != undefined){
					obj[member](value);
				} else {
					obj[name] = value;
				}
			} else {
				obj[name] = value;
			}
		},
	}
	
	this.timeList = [];
	
	this.length = 0;
	this.add = function(note){
		var tempNote = new Proxy(new data.Note(this), baseHandle);
		if(note != undefined){
			for(var key in note){
				tempNote[key] = note[key];
			}
		}
		var id = this.push(tempNote);
		tempNote.id = id;
		return id;
	};
	
	this.push = function(val){
		this[this.length] = val;
		this.timeList.push(val);
		this.length ++;
		return this.length - 1;
	};
	
	this.updateList = function(id){
		var list = this.timeList;
		//排序列表
		list.sort((a, b) => {
			return a.start - b.start;
		});
		list.forEach((data, key) => {
			data.timeId = key;
		});
		//计算重叠
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
			if(prev.pitchNum == now.pitchNum && prev.end == now.start){
				prev.rightConnect = true;
				now.leftConnect = true;
			} else {
				prev.rightConnect = false;
				now.leftConnect = false;
			}
		}
	};
	
	this.deleteNote = function(note){
		if(note.id != undefined && this[note.id] != undefined){
			delete this[note.id];
		}
		if(note.timeId != undefined && this.timeList[note.timeId] != undefined){
			delete this.timeList[note.timeId];
		}
	};
};
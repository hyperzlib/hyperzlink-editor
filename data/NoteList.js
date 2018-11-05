depends('ui.PianoRoll', [
	'data.Note'
]);

namespace('data').NoteList = function(pianoRoll){
	var baseHandle = {
		get: (obj, name) => {
			var member = 'get' + name.substr(0, 1).toUpperCase() + name.substr(1);
			if(obj[member] != undefined){
				return obj[member]();
			} else {
				return obj[name];
			}
		},
		set: (obj, name, value) => {
			var member = 'set' + name.substr(0, 1).toUpperCase() + name.substr(1);
			if(obj[member] != undefined){
				obj[member](value);
			} else {
				obj[name] = value;
			}
		},
	}
	
	this.length = 0;
	this.add = function(note){
		var tempNote = new Proxy(new data.Note(), baseHandle);
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
		this.length ++;
		return this.length - 1;
	};
};
namespace('data').Note = function(father){
	var piano = father.pianoRoll;

	this.id = 0;
	this.start = 0;
	this.setStart = function(val){
		this.start = val;
		if(this.dom != null){
			this.dom.css({left: piano.getTicketPos(val)});
		}
	};

	this.pitchNum = 0;
	this.setPitchNum = function(val){
		this.pitchNum = val;
		if(this.dom != null){
			this.dom.css({top: piano.getNoteNumPos(val)});
		}
	};

	this.length = 0;
	this.setLength = function(val){
		this.length = val;
		if(this.dom != null){
			this.dom.css({width: piano.getTicketPos(val)});
		}
	};

	this.getEnd = function(){
		return this.start + this.length;
	};

	this.dom = null;
}
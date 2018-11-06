namespace('data').Note = function(father){
	var piano = father.pianoRoll;

	this.prev = null;
	this.next = null;
	this.id = 0;
	this.start = 0;
	this.setStart = function(val){
		this.start = val;
		if(this.dom != null){
			this.dom.css({left: pianoRoll.getTicketPos(val)});
		}
	};

	this.pitchNum = 0;
	this.setPitchNum = function(val){
		this.pitchNum = val;
		if(this.dom != null){
			this.dom.css({top: pianoRoll.getNoteNumPos(val)});
		}
	};

	this.length = 0;
	this.setLength = function(val){
		this.length = val;
		if(this.dom != null){
			this.dom.css({width: pianoRoll.getTicketPos(val)});
		}
	};

	this.getEnd = function(){
		return this.start + this.length;
	};
	
	this.overlay = false;
	this.setOverlay = function(val){
		if(val && !this.overlay){
			this.overlay = true;
			if(this.dom != null) this.dom.addClass('overlay');
		} else if(!val && this.overlay) {
			this.overlay = false;
			if(this.dom != null) this.dom.removeClass('overlay');
		}
	};
	
	this.finished = false;
	this.setFinished = function(val){
		if(val && !this.finished){
			this.finished = true;
			if(this.dom != null){
				this.dom.append('<button class="note-tail"></button>');
				this.dom.addClass('finished');
				this.dom.attr('data-id', this.id);
			}
		}
	};

	this.dom = null;
}
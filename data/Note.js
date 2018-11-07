namespace('data').Note = function(father){
	var piano = father.pianoRoll;

	this.id = 0;
	this.timeId = 0;
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
	
	this.lyric = '';
	this.setLyric = function(val){
		this.dom.find('.note-lyric').text(val);
	};
	
	this.phonm = '';
	this.setPhonm = function(val){
		this.dom.find('.note-phonm-data').text(val);
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
	
	this.delete = function(){
		this.dom.remove();
		father.deleteNote(this);
	};
}
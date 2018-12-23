//namespace data

function Note(hz, father){
	var pianoRoll = hz.pianoRoll;

	this.id = 0;
	this.setId = function(val){
	    this.id = val;
	    if(this.dom != null){
	        this.dom.attr('data-id', val);
	    }
	};
	
	this.timeId = 0;
	this.start = 0;
	this.setStart = function(val){
		val = Math.max(1, val);
		this.start = val;
		if(this.dom != null){
			this.dom.css({left: pianoRoll.getTicketPos(val)});
			this.dom.css({width: pianoRoll.getTicketPos(this.getEnd()) - pianoRoll.getTicketPos(this.start)});
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
			this.dom.css({width: pianoRoll.getTicketPos(this.getEnd()) - pianoRoll.getTicketPos(this.start)});
		}
	};

	this.getEnd = function(){
		return this.start + this.length;
	};
	
	this.lyric = '';
	this.setLyric = function(val){
		this.lyric = val;
		if(this.dom != null) this.dom.find('.note-lyric').text(val);
	};
	
	this.phonm = '';
	this.setPhonm = function(val){
		this.phonm = val;
		if(this.dom != null) this.dom.find('.note-phonm-data').text(val);
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

	this.leftConnect = false;
	this.setLeftConnect = function(val){
		if(val && !this.leftConnect){
			this.leftConnect = true;
			if(this.dom != null) this.dom.addClass('left-connect');
		} else if(!val && this.leftConnect){
			this.leftConnect = false;
			if(this.dom != null) this.dom.removeClass('left-connect');
		}
	};
	
	this.leftTopConnect = false;
	this.setLeftTopConnect = function(val){
		if(val && !this.leftTopConnect){
			this.leftTopConnect = true;
			if(this.dom != null) this.dom.addClass('left-top-connect');
		} else if(!val && this.leftTopConnect){
			this.leftTopConnect = false;
			if(this.dom != null) this.dom.removeClass('left-top-connect');
		}
	};
	
	this.leftBottomConnect = false;
	this.setLeftBottomConnect = function(val){
		if(val && !this.leftBottomConnect){
			this.leftBottomConnect = true;
			if(this.dom != null) this.dom.addClass('left-bottom-connect');
		} else if(!val && this.leftBottomConnect){
			this.leftBottomConnect = false;
			if(this.dom != null) this.dom.removeClass('left-bottom-connect');
		}
	};

	this.rightConnect = false;
	this.setRightConnect = function(val){
		if(val && !this.rightConnect){
			this.rightConnect = true;
			if(this.dom != null) this.dom.addClass('right-connect');
		} else if(!val && this.rightConnect){
			this.rightConnect = false;
			if(this.dom != null) this.dom.removeClass('right-connect');
		}
	};
	
	this.rightTopConnect = false;
	this.setRightTopConnect = function(val){
		if(val && !this.rightTopConnect){
			this.rightTopConnect = true;
			if(this.dom != null) this.dom.addClass('right-top-connect');
		} else if(!val && this.rightTopConnect){
			this.rightTopConnect = false;
			if(this.dom != null) this.dom.removeClass('right-top-connect');
		}
	};
	
	this.rightBottomConnect = false;
	this.setRightBottomConnect = function(val){
		if(val && !this.rightBottomConnect){
			this.rightBottomConnect = true;
			if(this.dom != null) this.dom.addClass('right-bottom-connect');
		} else if(!val && this.rightBottomConnect){
			this.rightBottomConnect = false;
			if(this.dom != null) this.dom.removeClass('right-bottom-connect');
		}
	};

	this.dom = null;
	this.createDom = function(){
	    this.dom = pianoRoll.noteListDom.append('<div class="note-container note-now">\
			<div class="note-body"><span class="note-lyric"></span><span class="note-phonm">[<span class="note-phonm-data"></span>]</span></div>\
		</div>').find('.note-now');
		this.dom.removeClass('note-now');
		this.dom.find('.note-lyric').text(this.lyric);
		this.dom.find('.note-phonm-data').text(this.phonm);
		this.zoomChange();
		if(this.finished){
		    this.dom.append('<button class="note-tail"></button>');
			this.dom.addClass('finished');
			this.dom.attr('data-id', this.id);
		}
	};
	
	this.deleteDom = function(){
	    if(this.dom != null){
	        this.dom.remove();
	        this.dom = null;
	    }
	};
	
	this.zoomChange = function(){
	    if(this.dom != null) this.dom.css({width: pianoRoll.getTicketPos(this.length), height: pianoRoll.oneHeight, top: pianoRoll.getNoteNumPos(this.pitchNum), left: pianoRoll.getTicketPos(this.start)});
	};
	
	this.delete = function(){
		if(this.dom != null) this.dom.remove();
		father.deleteNote(this);
	};
}
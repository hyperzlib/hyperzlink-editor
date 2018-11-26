'use strict';

depends('ui.PianoRoll', [
	'data.Note',
	'data.NoteList',
	'ui.Utils',
	'events.EventEmitter'
]);

namespace('ui').PianoRoll = function(hz, dom, width, height){
    var eventEmitter = new events.EventEmitter();
    
	var noteList;
	var pianoKeys;
	var headerPanel;
	var keyPopup;
	var tempCanvas;
	var noteListContainer;
	var timeLineHeader;
	var timeLine;
	var posLine;
	var singerThumb;
	var singerThumbImg;
	var noteListScroll;
	var timeLinePoint;

	var lastPopupLabel = '';
	var lastNotePos = 0;
	/*var lastMouseY = 0;
	var lastScroll = 0;*/
	
	var showPosLine = false;
	var posFollowMouse = true;
	
	this.subNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
	
	this.currentTool = 0;
	this.toolsId = {
		point: 0,
	    cursor: 0,
	    pencil: 1,
	    eraser: 2,
	};
	
	this.on = eventEmitter.on;
	this.off = eventEmitter.off;
	this.root = $(dom);
	this.width = width;
	this.height = height;
	this.beatWidth = 60;

	this.cursors = {
		cursor: 'default',
		pencil: 'url("res/pencil.png") 2 18, crosshair',
		resize: 'ew-resize',
		grabbing: 'pointer',
	};
	
	this.noteListDom = null;
	
	this.scales = 5;
	this.beatLength = 4;
	this.measureLength = 4;
	this.oneHeight = 20;
	this.timeLineOneHeight = 15;
	this.pianoNoteWidth = 95;
	this.resolution = 480;
	this.zoom = 100;
	this.quantize = 16;
	this.quantizeLen = 16;
	this.color = {
		whiteKey: '#fbfbfb',
		blackKey: '#7d7b7c',
		infoText: '#939393',
		divLine: '#dcdcdc',
		beatLine: '#c8c8c8',
		measureLine: '#a9a9a9',
		whiteLine: '#fbfbfb',
		blackLine: '#e3e3e3',
		popup: '#007fff',
		timeLineBg: '#fbfbfb',
		timeLine: '#007fff',
		timeLineText: '#939393',
		bgAlpha: 0.65,
		noteListBg: '#ffffff',
		timeLinePoint: '#009933',
		posLine: '#666666',
	};
	this.position = 0;
	this.noteList = new data.NoteList(hz);
	this.selectedNote = null;
	this.nextNote = {lyric: 'a', phonm: 'a'};
	
	this.editMode = {
		ads: true,
		rip: false,
	};
	
	this.setHeight = function(height){
		this.height = height;
		this.root.height(height);
		pianoKeys.height(height - (this.timeLineOneHeight * 4));
		noteListContainer.height(height - (this.timeLineOneHeight * 4));
		//滚动到中间
		noteListContainer.scrollTop(noteList.height() / 2 - noteListContainer.height() / 2);
	};
	
	this.setWidth = function(width){
		this.width = width;
		this.root.width(width);
		timeLine.attr('width', width - this.pianoNoteWidth);
		this.updateTimeLine();
		noteListContainer.width(width - this.pianoNoteWidth);
	};
	
	this.setZoom = function(zoom){
		this.zoom = zoom;
		this.drawNoteBg();
		this.drawTimeLine();
		this.updateTimeLinePtr();
		this.noteList.changeZoom();
	};
	
	this.setBeat = function(beat, measure){
		this.beatLength = beat;
		this.measureLength = measure;
		this.drawNoteBg();
		this.drawTimeLine();
	};
	
	this.setQuantize = function(quantize){
		this.quantize = quantize;
		eventEmitter.emit('quantize', this.quantize, this.quantizeLen);
	};
	
	this.setQuantizeLen = function(quantize){
		this.quantizeLen = quantize;
		eventEmitter.emit('quantize', this.quantize, this.quantizeLen);
	};

	this.setThumb = function(url){
		if(url === false){
			singerThumbImg.hide();
		} else {
			singerThumbImg.prop('src', url);
			singerThumbImg.show();
		}
	};
	
	this.init = function(){
		this.root.css({top: "0px", left: "0px", width: this.width, height: this.height, overflow: 'hidden'});
		headerPanel = this.root.append('<div class="div-piano-header"><canvas class="canvas-piano-timeline-header"></canvas><div class="div-piano-note"></div></div>').find(".div-piano-header:first");
		timeLineHeader = headerPanel.find(".canvas-piano-timeline-header:first");
		pianoKeys = headerPanel.find(".div-piano-note:first");
		timeLine = this.root.append('<canvas class="canvas-piano-timeline"></canvas>').find('.canvas-piano-timeline:first');
		tempCanvas = this.root.append('<canvas class="canvas-piano-temp" style="display: none"></canvas>').find(".canvas-piano-temp:first");
		noteListContainer = this.root.append('<div class="container-piano-notelist"><div class="div-piano-singer-thumb"></div><div class="div-piano-notelist"></div></div>').find(".container-piano-notelist:first");
		keyPopup = this.root.append('<div class="div-piano-key-popup"><div class="div-piano-notelist"></div></div>').find(".div-piano-key-popup:first");
		noteList = noteListContainer.find('.div-piano-notelist:first');
		this.noteListDom = noteList;
		singerThumb = noteListContainer.find('.div-piano-singer-thumb:first');
		timeLinePoint = noteList.append('<div class="div-timeline-pointer"></div>').find('.div-timeline-pointer:first');
		posLine = noteList.append('<div class="div-posline"></div>').find('.div-posline:first');
		singerThumb.css({position: 'absolute', zIndex: -1});
		singerThumbImg = singerThumb.append('<img style="display: none"></img>').find('img:first');
		headerPanel.css({display: 'inline-block', float: 'left'});
		pianoKeys.css({float: 'left', position: 'relative', zIndex: 100});
		noteListContainer.css({float: 'left'});
		noteList.css({zIndex: 10, position: 'relative'});
		timeLineHeader.css({float: 'left', zIndex: 200, position: 'relative'});
		timeLine.css({display: 'inline-block', float: 'left'});
		timeLinePoint.css({position: 'absolute', display: 'inline-block', zIndex: 50, width: 2, backgroundColor: this.color.timeLinePoint, left: -1, overflow: 'hidden'});
		posLine.css({position: 'absolute', display: 'none', zIndex: 51, width: 2, backgroundColor: this.color.posLine, left: -1, overflow: 'hidden', pointerEvents: 'none'});
		keyPopup.css({zIndex: 101});
		this.bindEvents();
		this.update();
	};
	
	this.bindEvents = function(){
		var _this = this;
		noteListContainer.mousemove((e) => {
		    this.onMouseMove(e);
		});

		var lastXPos = 0;
		var lastYPos = 0;
		this.root[0].onselectstart = function(){ return false };
		noteListContainer.css({display: 'inline-block', overflow: 'scroll', width: this.width - this.pianoNoteWidth, height: this.height - (this.timeLineOneHeight * 4)});
		noteListContainer.scroll(function(){
			var xPos = $(this).scrollLeft();
			var yPos = $(this).scrollTop();
			if(xPos != lastXPos){
				_this.updateTimeLine();
				lastXPos = xPos;
			}
			if(yPos != lastYPos){
				pianoKeys.css('background-position-y', (- yPos) + 'px');
				/*_this.updatePopup(pos - lastScroll + lastMouseY);
				lastScroll = pos;*/
				keyPopup.hide();
				lastYPos = yPos;
			}
		});
		
		var isDrag = false;
		timeLine.mousedown((e) => {
			var y = e.offsetY;
			if(y < this.timeLineOneHeight * 2){
				this.setPos(this.getMouseTicket(this.getLeft() + e.offsetX));
				isDrag = true;
			}
		}).dblclick((e) => {
			var y = e.offsetY;
			if(y < this.timeLineOneHeight * 2){
				//pass
			} else if(y < this.timeLineOneHeight * 3){
				console.log('change tempo');
			} else if(y < this.timeLineOneHeight * 4){
				console.log('change beat');
			}
		});
		
		$('body').mousemove((e) => {
			if(isDrag){
				this.setPos(this.getMouseTicket(this.getLeft() + Math.max(0, e.pageX - this.pianoNoteWidth)));
			}
		}).mouseup((e) => {
			if(isDrag){
				this.setPos(this.getMouseTicket(this.getLeft() + Math.max(0, e.pageX - this.pianoNoteWidth)));
				isDrag = false;
			}
		});
		
		timeLineHeader.click((e) => {
			var y = e.offsetY;
			if(y < this.timeLineOneHeight * 2){
				this.setPos(this.getMouseTicket(this.getLeft()));
			}
		}).dblclick((e) => {
			var y = e.offsetY;
			if(y < this.timeLineOneHeight * 2){
				//pass
			} else if(y < this.timeLineOneHeight * 3){
				console.log('change global tempo');
			} else if(y < this.timeLineOneHeight * 4){
				console.log('change global beat');
			}
		});

		//画音符的处理
		var tempNote = null;
		var tempNoteDom = null;
		var editId = null;
		var moveMode = false;
		var editOffset = 0;
		noteList.mousedown((e) => {
			if(e.target.className == 'div-piano-notelist'){
				var offset = this.getNoteOffset(e);
				if(this.currentTool == this.toolsId.pencil){
					tempNote = {pitchNum: this.getMouseNoteNum(offset.y), start: this.doQuantize(this.getMouseTicket(offset.x), this.quantize), length: 0};
				}
				posFollowMouse = false;
				posLine.css('left', this.getTicketPos(tempNote.start) - 1);
				//取消当前选中
				if(this.selectedNote != null){
					this.selectedNote.dom.removeClass('selected');
					this.selectedNote = null;
				}
			}
		}).mousemove((e) => {
			if(tempNote !== null){
				var offset = this.getNoteOffset(e);
				if(moveMode){
					tempNote.start = Math.max(0, this.doQuantize(this.getMouseTicket(offset.x - editOffset), this.quantize));
					tempNote.pitchNum = this.getMouseNoteNum(offset.y);
					posLine.css('left', this.getTicketPos(tempNote.start) - 1);
				} else {
					tempNote.length = Math.max(60, this.doQuantize(this.getMouseTicket(offset.x + editOffset), this.quantizeLen) - tempNote.start);
					if(tempNoteDom == null){
						var id = this.noteList.add(tempNote);
						tempNote = this.noteList[id];
						tempNote.createDom();
						tempNoteDom = tempNote.dom;
						tempNote.lyric = this.nextNote.lyric;
						tempNote.phonm = this.nextNote.phonm;
					}
					posLine.css('left', this.getTicketPos(tempNote.end) - 1);
				}
			}
		}).mouseup((e) => {
			if(tempNote !== null){
				if(tempNoteDom == null){
					tempNote = null;
				} else {
					var offset = this.getNoteOffset(e);
					var tempId = tempNote.id;
					if(moveMode){
						tempNote.start = Math.max(0, this.doQuantize(this.getMouseTicket(offset.x - editOffset), this.quantize));
						tempNote.pitchNum = this.getMouseNoteNum(offset.y);
						//this.noteList[editId] = tempNote;
						editOffset = 0;
						editId = null;
						moveMode = false;
						tempNote = null;
						tempNoteDom = null;
						_this.setCursor(_this.getToolName(_this.currentTool));
					} else {
						tempNote.length = Math.max(60, this.doQuantize(this.getMouseTicket(offset.x + editOffset), this.quantizeLen) - tempNote.start);
						if(editId !== null){
							tempNoteDom.removeClass('resizing');
							editId = null;
							editOffset = 0;
							_this.setCursor(_this.getToolName(_this.currentTool));
						} else {
							tempNote.finished = true;
						}
						tempNote = null;
						tempNoteDom = null;
					}
					this.noteList.updateList(tempId);
				}
				posFollowMouse = true;
				if(!showPosLine){
					posLine.css('display', 'none');
				}
			}
		});

		//调节音符长度处理
		noteList.on('mousedown', '.note-tail', function(e){
			var dom = $(this);
			var id = parseInt(dom.parent('.note-container').attr('data-id'));
			if(_this.noteList[id] !== undefined){
				tempNote = _this.noteList[id];
				tempNoteDom = tempNote.dom;
				editId = id;
				editOffset = dom.width() - e.offsetX;
				_this.setCursor('resize');
				tempNoteDom.addClass('resizing');
				posFollowMouse = false;
    			if(!showPosLine){
					posLine.css('display', 'inline-block');
				}
			}
		});
		
		//移动或删除音符处理
		noteList.on('mousedown', '.note-body', function(e){
			var dom = $(this);
			var id = parseInt(dom.parent('.note-container').attr('data-id'));
			if(_this.currentTool == _this.toolsId.eraser){
			    _this.deleteNote(id);
			} else {
    			editId = id;
    			moveMode = true;
    			editOffset = e.offsetX;
    			_this.setCursor('grabbing');
    			if(_this.selectNote(id)){
    				tempNote = _this.selectedNote;
    				tempNoteDom = tempNote.dom;
    			}
				posFollowMouse = false;
				if(!showPosLine){
					posLine.css('display', 'inline-block');
				}
			}
		});
	};

	this.onMouseMove = function(e){
		var offset = this.getNoteOffset(e);
		//update popup
		this.updatePopup(offset.y);
		if(posFollowMouse){
			//update current position
			var baseWidth = Math.floor(this.beatWidth * this.zoom / 100);
			var mouseX = offset.x;
			var beatPos = Math.floor(mouseX / baseWidth);
			var measurePos = Math.floor(beatPos / this.beatLength);
			var beatPos = beatPos % this.beatLength;
			var grid = this.resolution / this.quantize;
			var ticket = Math.round((mouseX % baseWidth) / (baseWidth - 1) * this.resolution);
			ticket = ticket - ticket % grid;
			eventEmitter.emit('position.cursor', measurePos, beatPos, ticket);
			var ticket = this.getLeft() + Math.max(0, e.pageX - this.pianoNoteWidth);
			posLine.css('left', ticket);
		}
	};
	
	this.update = function(){
		keyPopup.hide();
		keyPopup.css({position: "fixed", height: this.oneHeight - 2,
			left: parseInt(this.pianoNoteWidth / 2 + 5),
			fontSize: this.oneHeight,
			fontFamily: "'Microsoft Yahei'",
			color: this.color.infoText,
		});
		headerPanel.css({width: this.pianoNoteWidth});
		timeLineHeader.css({width: this.pianoNoteWidth, height: this.timeLineOneHeight * 4});
		timeLine.css({width: this.width - this.pianoNoteWidth, height: this.timeLineOneHeight * 4});
		timeLine.attr({width: this.width - this.pianoNoteWidth, height: this.timeLineOneHeight * 4});
		this.drawPianoNotes();
		this.drawTimeLine();
		this.drawNoteBg();
		noteListContainer.css({height: (this.height - (this.timeLineOneHeight * 4)) + 'px'});
		timeLinePoint.css({height: 5 * 12 * this.oneHeight});
		posLine.css({height: 5 * 12 * this.oneHeight});
		noteList.css({width: 10000});
		noteList.height(5 * 12 * this.oneHeight);
	};
	
	this.drawPianoNotes = function(){
		//先画钢琴键
		var oneHeight = this.oneHeight;
		var width = this.pianoNoteWidth;
		var whiteKey = this.color.whiteKey;
		var blackKey = this.color.blackKey;
		var infoText = this.color.infoText;
		var divLine = this.color.divLine;
		//修正canvas大小
		var keyLen = this.scales * 12 + 1;
		tempCanvas.attr({width: width, height: keyLen * oneHeight + 2});
		var ctx = tempCanvas[0].getContext("2d");
		ctx.fillStyle = whiteKey;
		ctx.fillRect(0, 0, width, keyLen * oneHeight + 2);
		var bKeys = [2, 4, 7, 9, 11];
		ctx.fillStyle = divLine;
		ctx.fillRect(width - 2, 0, 2, keyLen * oneHeight);
		for(var i = 0; i < keyLen; i ++){
			var index = i - 1;
			var nowPos = (keyLen - i) * oneHeight - 1;
			ctx.fillStyle = divLine;
			ctx.fillRect(0, nowPos, width, 2);
			if(bKeys.indexOf(index % 12) != -1){
				//画黑键
				ctx.fillStyle = blackKey;
				ctx.fillRect(0, nowPos + 1, width / 2 - 2, oneHeight);
			}
			if((index - 1) % 12 == 0){
				//画音高标识
				ctx.fillStyle = infoText;
				ctx.textBaseline = 'middle';
				ctx.font = oneHeight + "px 'Microsoft Yahei'";
				ctx.fillText(this.getNoteLabel(i - 2, true), width / 2 + 5, nowPos + (oneHeight / 2) + 1);
			}
		}
		pianoKeys.css({width: width, height: (this.height - (oneHeight * 4)) + 'px', backgroundImage: "url('" + tempCanvas[0].toDataURL() + "')"});
	};
	
	this.drawNoteBg = function(){
		var u = ui.Utils;
		var bg = this.color.noteListBg;
		var alpha = this.color.bgAlpha;
		var divLineColor = u.getRgba(u.getTransColor(this.color.divLine, bg, alpha), alpha);
		var beatColor = u.getRgba(u.getTransColor(this.color.beatLine, bg, alpha), alpha);
		var measureColor = u.getRgba(u.getTransColor(this.color.measureLine, bg, alpha), alpha);
		var whiteKey = u.getRgba(u.getTransColor(this.color.whiteLine, bg, alpha), alpha);
		var blackKey = u.getRgba(u.getTransColor(this.color.blackLine, bg, alpha), alpha);
		var keyLen = this.scales * 12;
		var oneHeight = this.oneHeight;
		var beatWidth = this.beatWidth;
		var beatLength = this.beatLength;
		var measureLength = this.measureLength;
		var zoom = this.zoom;
		
		var oneWidth = Math.floor(beatWidth * zoom / 100);
		var width = oneWidth * beatLength;
		var height = keyLen * oneHeight;
		tempCanvas.attr({width: width, height: height});
		var ctx = tempCanvas[0].getContext("2d");
		var bKeys = [2, 4, 7, 9, 11];
		var linePos = [4, 11];
		
		ctx.fillStyle = whiteKey;
		ctx.fillRect(0, 0, width, height);
		for(var i = 1; i < keyLen; i ++){
			var nowPos = (keyLen - i) * oneHeight - 1;
			if(bKeys.indexOf(i % 12) != -1){
				//画黑键
				ctx.fillStyle = blackKey;
				ctx.fillRect(0, nowPos, width, oneHeight + 2);
			}
			if(i != 0 && linePos.indexOf((i - 1) % 12) != -1){
				//画分隔线
				ctx.fillStyle = divLineColor;
				ctx.fillRect(0, nowPos, width, 2);
			}
		}
		
		for(var i = 1; i < beatLength; i ++){
			//画竖分隔线
			ctx.fillStyle = beatColor;
			ctx.fillRect(i * oneWidth - 2, 0, 2, height);
		}
		ctx.fillStyle = measureColor;
		ctx.fillRect(width - 2, 0, 2, height);
		//转为背景图
		noteList.css({backgroundImage: "url('" + tempCanvas[0].toDataURL() + "')", backgroundPositionX: 1});
	};

	this.drawTimeLine = function(){
		//画左侧的提示信息
		var divLineColor = this.color.divLine;
		var mainLineColor = this.color.timeLine;
		var bgColor = this.color.timeLineBg;
		var infoTextColor = this.color.timeLineText;
		var measureLineColor = this.color.measureLine;
		var oneHeight = this.timeLineOneHeight;
		var height = oneHeight * 4;
		var width = this.pianoNoteWidth;
		var pos = 0;
		timeLineHeader.attr({width: width, height: height});
		var ctx = timeLineHeader[0].getContext("2d");
		ctx.fillStyle = bgColor;
		ctx.fillRect(0, 0, width, height);
		ctx.fillStyle = divLineColor;
		ctx.fillRect(0, 0, width, 2);
		//time line
		pos = oneHeight / 2 + 2;
		ctx.fillStyle = mainLineColor;
		ctx.fillRect(0, pos, width, 1);
		pos = oneHeight * 2 - 2;
		ctx.fillStyle = divLineColor;
		ctx.fillRect(0, pos, width, 2);
		//tempo
		pos = oneHeight * 2 + oneHeight / 2 - 2;
		ctx.fillStyle = infoTextColor;
		ctx.textBaseline = 'middle';
		ctx.font = oneHeight - 2 + "px 'Microsoft Yahei'";
		ctx.fillText('TEMPO', 5, pos);
		pos = oneHeight * 3 - 2;
		ctx.fillStyle = divLineColor;
		ctx.fillRect(0, pos, width, 2);
		//beat
		pos = oneHeight * 3 + oneHeight / 2 - 2;
		ctx.fillStyle = infoTextColor;
		ctx.textBaseline = 'middle';
		ctx.font = oneHeight - 2 + "px 'Microsoft Yahei'";
		ctx.fillText('BEAT', 5, pos);
		pos = oneHeight * 4 - 2;
		ctx.fillStyle = divLineColor;
		ctx.fillRect(0, pos, width, 2);
		//右侧线
		ctx.fillStyle = divLineColor;
		ctx.fillRect(width - 2, 0, 2, height);
		//画右侧的节拍信息（1小节）
		var beatWidth = this.beatWidth;
		var beatLength = this.beatLength;
		var measureLength = this.measureLength;
		var zoom = this.zoom;
		var oneWidth = parseInt(beatWidth * zoom / 100);
		var halfHeight = oneHeight / 2;
		width = oneWidth * beatLength;
		tempCanvas.attr({width: width, height: height});
		ctx = tempCanvas[0].getContext('2d');
		ctx.fillStyle = bgColor;
		ctx.fillRect(0, 0, width, height);
		ctx.fillStyle = divLineColor;
		ctx.fillRect(0, 0, width, 2);
		//节拍线
		for(var i = 2; i <= 4; i ++){
			//画横线
			//ctx.fillStyle = divLineColor;
			pos = oneHeight * i - 2;
			ctx.fillRect(0, pos, width, 2);
			//画竖线
			for(var j = 0; j < beatLength; j ++){
				//ctx.fillStyle = divLineColor;
				ctx.fillRect(j * oneWidth, pos - halfHeight, 2, halfHeight);
			}
			//ctx.fillStyle = divLineColor;
			ctx.fillRect(0, 0, 2, height);
		}
		//time line
		pos = oneHeight / 2 + 2;
		ctx.fillStyle = mainLineColor;
		ctx.fillRect(0, pos, width, 1);
		ctx.fillStyle = divLineColor;
		timeLine.css({backgroundImage: "url('" + tempCanvas[0].toDataURL() + "')"});
		this.updateTimeLine();
	};

	this.updateTimeLine = function(){
		if(this.width != undefined){
			//画时间分隔线
			var noteListPos = noteListContainer.scrollLeft();
			var measureWidth = Math.floor(this.beatWidth * this.zoom / 100) * this.beatLength;
			var xPos = noteListPos % measureWidth;
			timeLine.css('background-position-x', - xPos - 1);
			var yPos = this.timeLineOneHeight + this.timeLineOneHeight / 2 + 2;
			var width = this.width - this.pianoNoteWidth;
			var startIndex = Math.max(0, Math.ceil(Math.max(1, noteListPos) / measureWidth) - 1);
			var startPos = startIndex * measureWidth - noteListPos + 3;
			var endIndex = Math.floor(((width - Math.min(0, startPos)) / measureWidth)) + 1;
			var ctx = timeLine[0].getContext('2d');
			ctx.clearRect(0, 0, width, this.timeLineOneHeight * 4);
			ctx.fillStyle = this.color.timeLineText;
			ctx.font = this.timeLineOneHeight + "px 'Microsoft Yahei'";
			for(var i = 0; i < endIndex; i ++){
				ctx.fillText(startIndex + i + 1, startPos + (i * measureWidth) + 1, yPos);
			}
			//画当前时间线
			//计算时间线在屏幕上的位置
			var xPos = this.getTicketPos(this.position) - this.getLeft();
			if(xPos >= 0 && xPos <= width){
				//xPos += 1;
				yPos = this.timeLineOneHeight / 2 + 3;
				ctx.strokeStyle = this.color.timeLinePoint;
				ctx.fillStyle = this.color.timeLinePoint;
				//画圆点
				ctx.beginPath();
				ctx.arc(xPos, yPos, 3, 0, 2 * Math.PI);
				ctx.fill();
				//画时间指针线
				ctx.fillRect(xPos - 1, yPos, 2, this.timeLineOneHeight * 4);
			}
		}
	};
	
	this.selectNote = function(id){
		if(this.selectedNote != null){
			this.selectedNote.dom.removeClass('selected');
			this.selectedNote = null;
		}
		if(this.noteList[id] !== undefined){
			var tempNote = this.noteList[id];
			var tempNoteDom = tempNote.dom;
			this.selectedNote = tempNote;
			tempNoteDom.addClass('selected');
			return true;
		} else {
			return false;
		}
	};
	
	this.deleteNote = function(id){
		if(this.noteList[id] !== undefined){
			this.noteList[id].delete();
			return true;
		} else {
			return false;
		}
	};
	
	//量化
	this.doQuantize = function(val, quantize){
		quantize = Math.round(this.resolution / quantize);
		return Math.round(val / quantize) * quantize;
	};
	
	//获取左侧折叠部分长度
	this.getLeft = function(){
		return noteListContainer.scrollLeft();
	};

	//获取上侧折叠部分长度
	this.getTop = function(){
		return noteListContainer.scrollTop();
	};

	//根据鼠标位置获取音符
	this.getMouseNoteNum = function(height){
		return this.scales * 12 - Math.floor(height / this.oneHeight) - 1;
	};

	//根据音符获取左上角的坐标
	this.getNoteNumPos = function(height){
		return (this.scales * 12 - height - 1) * this.oneHeight;
	};
	
	this.getMouseTicket = function(xPos){
		var tik = Math.round(xPos / Math.floor(this.beatWidth * this.zoom / 100) * this.resolution);
		return tik;
	};
	
	this.getTicketPos = function(tik){
		return Math.floor(tik * Math.floor(this.beatWidth * this.zoom / 100) / this.resolution);
	};

	//根据音的数字获取音符标签
	this.getNoteLabel = function(nIndex, fixLen){
		var scale = Math.floor(nIndex / 12) + 1;
		var sub = nIndex % 12;
		var subName = this.subNames[sub];
		return subName + scale.toString();
	};
	
	this.getTicket = overload((measure, beat, tik) => {
		var ret = measure * this.beatLength * this.resolution;
		ret += beat * this.resolution;
		ret += tik;
		return ret;
	}, (ticket) => {
		var beat = Math.floor(ticket / this.resolution);
		var measure = Math.floor(beat / this.measureLength);
		if(measure != 0) beat = beat % measure;
		ticket = ticket % this.resolution;
		return [measure, beat, ticket];
	});

	this.getNoteOffset = function(e){
		var ret = {x: 0, y: 0};
		var offset = noteListContainer.offset();
		ret.x = e.pageX - offset.left + this.getLeft();
		ret.y = e.pageY - offset.top + this.getTop();
		return ret;
	};
	
	this.addNote = function(note){
		if(note.dom == undefined){
			//新建note图形
		}
	};
	
	this.updatePopup = function(height){
		var nIndex = this.getMouseNoteNum(height);
		var label = this.getNoteLabel(nIndex, true);
		var sPos = (this.scales * 12 - 1 - nIndex) * this.oneHeight - 3;
		var keyPopupPos = noteListContainer.offset().top - noteListContainer.scrollTop() + sPos;
		if(lastNotePos != keyPopupPos || lastPopupLabel != label){
			keyPopup.show();
			if(lastNotePos != keyPopupPos){
				keyPopup.css('top', keyPopupPos + 'px');
				lastNotePos = keyPopupPos;
			}
			if(lastPopupLabel != label){
				keyPopup.text(label);
				lastPopupLabel = label;
			}
		}
	};
	
	this.updateTimeLinePtr = function(){
	    this.updateTimeLine();
		timeLinePoint.css({left: this.getTicketPos(this.position) - 1});
	};

	this.setCursor = function(name){
		if(this.cursors[name] != undefined){
			noteListContainer.css('cursor', this.cursors[name]);
		} else {
			noteListContainer.css('cursor', 'auto');
		}
	};
	
	this.setTool = function(tool){
	    if(typeof tool == 'number'){
	        this.currentTool = tool
	    } else {
	        if(this.toolsId[tool] != undefined){
	            this.currentTool = this.toolsId[tool];
	        }
		}
		switch(this.currentTool){
			case 0:
				this.setCursor('cursor');
				break;
			case 1:
				this.setCursor('pencil');
				break;
		}
		if(this.currentTool == 1){
			posLine.css('display', 'inline-block');
			showPosLine = true;
		} else {
			posLine.css('display', 'none');
			showPosLine = false;
		}
	};
	
	this.getToolName = function(toolId){
		for(var key in this.toolsId){
			if(this.toolsId[key] == toolId){
				return key;
			}
		}
		return 'point';
	}
	
	this.setPos = overload((position) => {
		this.position = position;
		this.updateTimeLinePtr();
		eventEmitter.emit('position.now', ...this.getTicket(position));
	}, (measure, beat, pos) => {
		this.setPos(this.getTicket(measure, beat, pos));
	});
	
	this.init();
};
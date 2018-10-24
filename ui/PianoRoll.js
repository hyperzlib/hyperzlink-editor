depends('ui.PianoRoll', [
	'ui.Utils',
	'events.EventEmitter'
]);

namespace('ui').PianoRoll = function(dom, width, height){
    var eventEmitter = new events.EventEmitter();
    
	var noteList;
	var pianoKeys;
	var headerPanel;
	var keyPopup;
	var tempCanvas;
	var noteListContainer;
	var timeLineHeader;
	var timeLine;
	var singerThumb;
	var singerThumbImg;
	var noteListScroll;

	var lastPopupLabel = '';
	var lastNotePos = 0;
	/*var lastMouseY = 0;
	var lastScroll = 0;*/
	var subNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
	
	this.currentTool = 0;
	this.toolsId = {
	    cursor: 0,
	    pencil: 1,
	    eraser: 2,
	};
	
	this.on = eventEmitter.on;
	this.off = eventEmitter.off;
	this.root = $(dom);
	this.width = width;
	this.height = height;
	this.beatWidth = 55;

	this.cursors = {
		cursor: 'default',
		pencil: 'url("res/pencil.png") 2 18, crosshair'
	};
	
	this.scales = 5;
	this.beatLength = 4;
	this.measureLength = 4;
	this.oneHeight = 15;
	this.pianoNoteWidth = 80;
	this.resolution = 480;
	this.zoom = 100;
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
	};
	
	this.setHeight = function(height){
		this.height = height;
		this.root.height(height);
		pianoKeys.height(height - (this.oneHeight * 4));
		noteListContainer.height(height - (this.oneHeight * 4));
	};
	
	this.setWidth = function(width){
		this.width = width;
		this.root.width(width);
		timeLine.attr('width', width - this.pianoNoteWidth);
		this.updateTimeLine();
		noteListContainer.width(width - this.pianoNoteWidth);
	}
	
	this.setZoom = function(zoom){
		this.zoom = zoom;
		this.drawNoteBg();
		this.drawTimeLine();
	}
	
	this.setBeat = function(beat, measure){
		this.beatLength = beat;
		this.measureLength = measure;
		this.drawNoteBg();
		this.drawTimeLine();
	}

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
		singerThumb = noteListContainer.find('.div-piano-singer-thumb:first');
		noteList.css({zIndex: '10'});
		singerThumb.css({position: 'absolute', zIndex: -1});
		singerThumbImg = singerThumb.append('<img style="display: none"></img>').find('img:first');
		headerPanel.css({display: 'inline-block', float: 'left'});
		timeLine.css({display: 'inline-block'});
		this.bindEvents();
		this.update();
	};
	
	this.bindEvents = function(){
	    var _this = this;
		noteListContainer.mousemove(function(e){
		    _this.onMouseMove(e);
		});
		var lastXPos = 0;
		var lastYPos = 0;
		noteListContainer.css({display: 'inline-block', overflow: 'scroll', width: this.width - this.pianoNoteWidth, height: this.height - (this.oneHeight * 4)});
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
	};

	this.onMouseMove = function(e){
		//update popup
		lastMouseY = e.offsetY;
		this.updatePopup(e.offsetY);
		//update current position
		var baseWidth = this.beatWidth * this.zoom / 100;
		var mouseX = e.offsetX;
		var beatPos = Math.floor(mouseX / baseWidth);
		var measurePos = Math.floor(beatPos / this.beatLength);
		var beatPos = beatPos % this.beatLength;
		var ticket = Math.round((mouseX % baseWidth) / (baseWidth - 1) * this.resolution / 5) * 5;
		eventEmitter.emit('position', measurePos, beatPos, ticket);
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
		timeLineHeader.css({width: this.pianoNoteWidth, height: this.oneHeight * 4});
		timeLine.css({width: this.width - this.pianoNoteWidth, height: this.oneHeight * 4});
		timeLine.attr({width: this.width - this.pianoNoteWidth, height: this.oneHeight * 4});
		this.drawPianoNotes();
		this.drawTimeLine();
		this.drawNoteBg();
		noteListContainer.css({height: (this.height - (this.oneHeight * 4)) + 'px'})
		noteList.css({width: '10000px'});
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
				index = parseInt((index - index % 12) / 12);
				ctx.fillText("C" + (index + 1), width / 2 + 5, nowPos + (oneHeight / 2) + 1);
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
		
		var oneWidth = parseInt(beatWidth * zoom / 100);
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
		noteList.css({backgroundImage: "url('" + tempCanvas[0].toDataURL() + "')"});
	};

	this.drawTimeLine = function(){
		//画左侧的提示信息
		var divLineColor = this.color.divLine;
		var mainLineColor = this.color.timeLine;
		var bgColor = this.color.timeLineBg;
		var infoTextColor = this.color.timeLineText;
		var measureLineColor = this.color.measureLine;
		var oneHeight = this.oneHeight;
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
				ctx.fillRect(j * oneWidth - 1, pos - halfHeight, 2, halfHeight);
			}
			//ctx.fillStyle = divLineColor;
			ctx.fillRect(0, 0, 1, height);
			ctx.fillRect(width - 1, 0, 1, height);
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
			var noteListPos = noteListContainer.scrollLeft();
			var measureWidth = Math.floor(this.beatWidth * this.zoom / 100) * this.beatLength;
			var xPos = noteListPos % measureWidth;
			timeLine.css('background-position-x', - xPos - 1);
			var yPos = this.oneHeight + this.oneHeight / 2 + 2;
			var width = this.width - this.pianoNoteWidth;
			var startIndex = Math.max(0, Math.ceil(Math.max(1, noteListPos) / measureWidth) - 1);
			var startPos = startIndex * measureWidth - noteListPos + 3;
			var endIndex = Math.floor(((width - Math.min(0, startPos)) / measureWidth)) + 1;
			var ctx = timeLine[0].getContext('2d');
			ctx.clearRect(0, 0, width, this.oneHeight * 4);
			ctx.fillStyle = this.color.timeLineText;
			ctx.font = this.oneHeight + "px 'Microsoft Yahei'";
			for(var i = 0; i < endIndex; i ++){
				ctx.fillText(startIndex + i + 1, startPos + (i * measureWidth), yPos);
			}
		}
	};

	//根据鼠标位置获取音符
	this.getNoteNum = function(height){
		return this.scales * 12 - Math.floor(height / this.oneHeight) - 1;
	};

	//根据音的数字获取音符标签
	this.getNoteLabel = function(nIndex){
		var scale = Math.floor(nIndex / 12) + 1;
		var sub = nIndex % 12;
		var subName = subNames[sub];
		return subName + scale.toString();
	}
	
	this.updatePopup = function(height){
		var nIndex = this.getNoteNum(height);
		var label = this.getNoteLabel(nIndex);
		var sPos = (this.scales * 12 - 1 - nIndex) * this.oneHeight - 2;
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

		}
	};
	
	this.init();
};
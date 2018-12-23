//import ui.Panel.Panel
//import events.EventEmitter

//namespace ui.Panel
function EditPanel(){
    var controlDom;
    var editDom;
    var zoomSilder, zoomShow;
    var lastZoomVal = 100;
    var eventEmitter = new events.EventEmitter();
    var timeShow = {};

    this.on = eventEmitter.on;
    this.off = eventEmitter.off;
    this.buttons = {};
    this.dom;

    this.init = function(){
        this.dom = $('#main-container').append('<div class="div-edit-panel"></div>').find('.div-edit-panel:last');
        this.dom.css({
            position: 'fixed',
        });
        this.dom.hide();
        //加载模板
        var _this = this;
        $.get('view/panel/EditPanel.html', function(data){
            _this.dom.append(data);
            _this.bindEvent();
            eventEmitter.emit('height', _this.getHeight());
        });
    };

    this.bindEvent = function(){
        var zoomPlus = this.dom.find('#btn-zoomctrl-plus');
        var zoomMinus = this.dom.find('#btn-zoomctrl-minus');
        zoomShow = $('#editpanel-zoom-control .zoom-show');
        zoomPlus.click(function(){
			var val = parseInt(zoomShow.val());
			val += 10;
            if(val >= 50 && val <= 500){
                eventEmitter.emit('zoomchange', val);
                zoomShow.val(val);
            }
		});
		zoomMinus.click(function(){
			var val = parseInt(zoomShow.val());
			val -= 10;
            if(val >= 50 && val <= 500){
                eventEmitter.emit('zoomchange', val);
                zoomShow.val(val);
            }
		});
        zoomShow.on('change', function(){
            var val = parseInt($(this).val());
            if(val >= 50 && val <= 500){
                eventEmitter.emit('zoomchange', val);
                lastZoomVal = val;
            } else {
                $(this).val(lastZoomVal);
            }
        });
        
        var tools = this.dom.find('#div-edit-tools');
        tools.find('input[type="radio"]').change(function(){
            var name = $(this).attr('id');
            name = name.replace(/^btn-edit-/, '');
            eventEmitter.emit('toolchange', name);
        });
        
        var editmode = this.dom.find('#div-edit-mode');
        editmode.find('input[type="checkbox"]').change(function(){
            var name = $(this).attr('id');
            name = name.replace(/^btn-editmode-/, '');
            var state = $(this).prop('checked');
            if(state){
                eventEmitter.emit('modeon', name);
                eventEmitter.emit('modeon.' + name);
            } else {
                eventEmitter.emit('modeon', name);
                eventEmitter.emit('modeon.' + name);
            }
        });
        
        var editctrl = this.dom.find('#div-edit-control');
        editctrl.find('button').click(function(){
            var name = $(this).attr('id');
            name = name.replace(/^btn-editctrl-/, '');
            eventEmitter.emit('control.' + name);
            eventEmitter.emit('control', name);
        });
        
        var editTime = this.dom.find('#div-edit-time');
        timeShow.nowPos = editTime.find('.time-now-pos .time-digi');
        timeShow.tempo = editTime.find('.time-tempo .time-digi');
        timeShow.beat = editTime.find('.time-beat .time-digi');
        timeShow.cursor = editTime.find('.time-cursor .time-digi');
        timeShow.quantize = editTime.find('.time-quantize .time-digi');
        timeShow.length = editTime.find('.time-length .time-digi');
    };
    
    this.setValue = function(name, val){
        if(timeShow[name] != undefined){
            timeShow[name].text(val);
            return true;
        } else {
            return false;
        }
    };

    this.show = function(x, y, w){
        this.dom.css({left: x, top: y, width: w});
        this.dom.show();
        eventEmitter.emit('height', this.getHeight());
    };
    
    this.getHeight = function(){
        return this.dom.height();
    };
    
    this.setWidth = function(width){
        this.dom.css({width: width});
        eventEmitter.emit('height', this.getHeight());
    };

    this.hide = function(){
        this.dom.hide();
    };
    
    this.setNowPos = function(){
        
    };

    this.init();
};
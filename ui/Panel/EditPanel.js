depends('ui.Panel.EditPanel', [
    'ui.Panel.Panel',
    'events.EventEmitter',
]);

namespace('ui.Panel').EditPanel = function(){
    var controlDom;
    var editDom;
    var zoomSilder, zoomShow;
    var eventEmitter = new events.EventEmitter();

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
        });
    };

    this.bindEvent = function(){
        var zoomSilder = this.dom.find('#pianoroll-zoom-slider');
        zoomShow = zoomSilder.next('.zoom-show');
        zoomSilder.on('slide', function(event, ui){
            zoomShow.text(ui.value);
        });
        zoomSilder.on('slidestop', function(event, ui){
            eventEmitter.emit('zoomchange', ui.value);
        });
    }

    this.show = function(x, y, w, h){
        this.dom.css({left: x, top: y, width: w, height: h});
        this.dom.show();
    };

    this.hide = function(){
        this.dom.hide();
    };

    this.init();
};
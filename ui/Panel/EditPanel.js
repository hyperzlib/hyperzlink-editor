depends('ui.Panel.EditPanel', [
    'ui.Panel.Panel',
]);

namespace('ui.Panel').EditPanel = function(){
    var controlDom;
    var editDom;
    var zoomSilder, zoomShow;
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
            console.log(ui.value);
            zoomShow.text(ui.value);
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
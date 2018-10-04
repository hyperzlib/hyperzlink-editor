depends('ui.Panel.EditPanel', [
    'ui.Panel.Panel',
]);

namespace('ui.Panel').EditPanel = function(){
    var controlDom;
    var editDom;
    this.buttons = {};
    this.dom;

    this.init = function(){
        this.dom = $('body').append('<div class="div-edit-panel"></div>').find('.div-edit-panel:last');
        this.dom.css({
            position: 'fixed',
            display: none,
        });
        controlDom = this.dom.append('<div class="div-edit-control"></div>').find('.div-edit-control:first');
        //播放控制
        this.buttons.play = controlDom.append('<button id="btn-play">Play</button>');
        this.buttons.stop = controlDom.append('<button id="btn-stop">Stop</button>');
    };
};
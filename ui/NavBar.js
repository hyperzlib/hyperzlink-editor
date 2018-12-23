//import events.EventEmitter
//namespace ui

function NavBar(dom){
    //! private
    var emitter = new events.EventEmitter();
    var navList = {};
    var nameList = {};
    var panelList = {};
    var tagDom;
    var styleElement;
    var base;
    var tabNavDom;
    var tabTempPanel;
    var collapse = false;
    var activePanel = null;
    var autoLaunch = null;

    //! public
    this.on = emitter.on;
    this.off = emitter.off
    this.panels = {};
    this.root = $(dom);
    this.height = 200;
    this.width = $(window).width();
    this.navList = {};
    //! public function
    this.init = function(){
        var _this = this;
        styleElement = $('head').append('<style></style>').find('style:last');
        this.root.height(this.getBannerHeight());
        base = this.root.append('<div class="div-nav-container"></div>').find('.div-nav-container:first');
        tagDom = base.append('<ul></ul>').find('ul:last');
        base.tabs({
            collapsible: false
        });
        base.on('tabsactivate', function(event, ui){
            var dom = tagDom.find('.ui-state-active');
            if(dom.length > 0){
                var currentTag = _this.getNameByLabel(dom.text());
                _this.showPanel(currentTag);
            }
        })
        tabNavDom = base.find('.ui-tabs-nav');
        /*tabNavDom.sortable({
            axis: "x",
            stop: function(){
                base.tabs("refresh");
            }
        });*/
        tabTempPanel = base.append(`<div id="div-nav-temp"></div>`).find('#div-nav-temp:first');
        tabTempPanel.css({padding: 0});
        this.update();
    };
    
    this.update = function(updatePanel){
        this.updateTags();
        //styleElement.html(this.getCss());
        tabTempPanel.css({height: this.height - this.getRealBannerHeight() - 8});
        this.root.css({height: this.height});
        if(updatePanel !== false && activePanel != null && typeof panelList[activePanel] != 'undefined'){
            panelList[activePanel].setWidth(this.width);
        }
    };

    this.updateTags = function(){
        base.tabs("refresh");
    };
    
    this.setHeight = function(height){
        this.height = height + 6;
        this.update();
    };
    
    this.setWidth = function(width){
        this.width = width;
        this.root.width(width);
        this.update();
    };

    this.getCss = function(){
        return `${dom} {
            width: 100%;
        }
        
        ${dom} .div-nav-container {
            padding: 0;
            border-radius: unset;
            /*position: fixed;
            z-index: 200;
            top: 0;
            left: 0;*/
            width: ${this.width}px;
        }

        ${dom} .ui-tabs-panel {
            height: ${(this.height - this.getRealBannerHeight() - 2)}px;
        }
        
        ${dom} .ui-tabs-anchor {
            outline: none;
        }
        
        ${dom} .ui-widget-header {
            border-radius: unset;
        }`;
    }

    this.getHeight = function(){
        return this.height;
    };

    this.getBannerHeight = function(){
        if(collapse){
            return this.getRealBannerHeight();
        } else {
            return this.height;
        }
    };

    this.getRealBannerHeight = function(){
        return 43;
    };

    this.getNameByLabel = function(label){
        if(typeof nameList[label] != 'undefined'){
            return nameList[label];
        } else {
            return false;
        }
    };

    this.setCollapse = function(...args){
        if(args.length == 0){
            collapse = !collapse;
        } else {
            collapse = args[0];
        }
    };
    
    this.addTab = function(name, label){
        var navData = {};
        navData.tag = tagDom.append(`<li><a href="#div-nav-temp" data-name="${name}">${label}</a></li>`).find('li:last');
        this.updateTags();
        if(Object.keys(navList).length == 0){
            autoLaunch = navData.tag;
        }
        nameList[label] = name;
        navList[name] = navData;
    };
    
    this.bindPanel = function(name, panel){
        panelList[name] = panel;
        if(autoLaunch !== null){ //默认展开第一项
            autoLaunch.find('a').click();
            autoLaunch = null;
        }
        var _this = this;
        panel.on('height', function(h){
            if(name == activePanel){
                _this.height = h + _this.getRealBannerHeight() + 6;
                _this.update(false);
                emitter.emit('height', h);
            }
        });
    };

    this.unbindPanel = function(name){
        if(typeof panelList[name] != 'undefined'){
            panelList[name].off('height');
            delete panelList[name];
        }
    };

    this.showPanel = function(name){
        if(activePanel != null && typeof panelList[activePanel] != 'undefined'){
            panelList[activePanel].hide();
        }
        if(typeof panelList[name] != 'undefined'){
            panelList[name].show(...this.getPanelPos());
            activePanel = name;
        }
    };

    this.getPanelPos = function(){
        var x, y, w, h;
        var t = tabTempPanel.offset();
        x = t.left;
        y = t.top;
        w = tabTempPanel.width();
        h = tabTempPanel.height();
        return [x, y, w, h];
    };
    
    this.init();
}
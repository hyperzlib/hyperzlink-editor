namespace('ui').NavBar = function(dom){
    //! private
    var navList = {};
    var nameList = {};
    var tagDom;
    var styleElement;
    var base;
    var tabNavDom;
    var tabTempPanel;
    var collapse = false;

    //! public
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
                var currentTag = dom.text();
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
        this.update();
    };
    
    this.update = function(){
        this.updateTags();
        styleElement.html(this.getCss());
    };

    this.updateTags = function(){
        base.tabs("refresh");
    };
    
    this.setHeight = function(height){
        this.height = height;
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
        if(Object.keys(navList).length == 0){ //默认展开第一项
            navData.tag.find('a:first').click();
        }
        nameList[label] = name;
        navList[name] = navData;
    };
    
    this.addPanel = function(name, panel){
        
    };

    this.showPanel = function(name){

    };
    
    this.init();
}
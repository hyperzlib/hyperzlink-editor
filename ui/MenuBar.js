namespace('ui').MenuBar = function(dom){
    var nav;
    var style;
    var navDomList = {};
    
    this.navList = {};
    this.root = $(dom);
    this.height = 23;
    this.backgroundColor = '#f6f6f6';
    this.hoverColor = '#e9e9e9';
    this.activeColor = '#dddddd';
    this.fontColor = '#0c0c0c';
    var css = `${dom} {
        background-color: ${this.backgroundColor};
    }
    ${dom} ul {
        margin: 0;
        padding-left: 0;
    }
    ${dom} li {
        display: inline-block;
    }
    ${dom} button {
        display: inline-block;
        background-color: ${this.backgroundColor};
        border: none;
        color: ${this.fontColor};
        text-align: center;
        text-decoration: none;
        padding: 4px 8px;
        outline: none;
    }
    ${dom} button:hover {
        background-color: ${this.hoverColor};
    }
    ${dom} button.active {
        background-color: ${this.activeColor};
    }
    ${dom} button:active {
        background-color: ${this.activeColor};
    }
    ${dom} .ui-menu {
        width: 150px;
        position: fixed;
        display: none;
        z-index: 200;
    }`;
    
    this.init = function(){
        style = $('head').append('<style></style>').find('style:last');
        style.html(css);
        this.root.height(this.height);
        nav = this.root.append('<ul></ul>').find('ul:first');
        nav.append('<li></li>');
    };
    
    this.setHeight = function(height){
        this.height = height;
        this.root.height(height);
    };
    
    this.addNav = function(name, label, shortcut){
        if(shortcut != undefined){
            label += '(' + shortcut + ')';
        }
        var li = nav.append('<li><button>'+label+'</button></li>').find('li:last');
        navDomList[name] = li;
        this[name] = new menuList(li);
    };
    
    var that = this;
    //menu子类
    function menuList(dom){
        //菜单结构：菜单分类->菜单项目
        var root;
        var menuDomList = {};
        this.menuList = {};
        
        this.init = function(){
            root = dom.append('<ul><li class="ui-menu-item-wrapper">test</li></ul>').find('ul');
            root.menu();
        };
        
        this.addMenuItem = function(type, name, label, icon){
            
        };
        
        this.addSubMenu = function(type, name, label){
            
        };
        
        this.init();
    };
    
    this.init();
};
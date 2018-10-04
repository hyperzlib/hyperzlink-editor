namespace('ui').MenuBar = function(dom){
    var nav;
    var style;
    var navDomList = {};
    var isOpened = false;
    var activeMenu = null;
    
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
        z-index: 200;
    }
    
    ${dom} .ui-menu-item {
        width: 100%;
    }`;
    
    this.init = function(){
        style = $('head').append('<style></style>').find('style:last');
        style.html(css);
        this.root.height(this.height);
        nav = this.root.append('<ul></ul>').find('ul:first');
        var _this= this;
        //单击触发
        nav.on('click', 'button[data-role="menu-list"]', function(){
            if(!isOpened){
                var btn = $(this);
                if(btn.length != 0){
                    nav.find('li>button[data-role="menu-list"]').removeClass('active');
                    btn.addClass('active');
                    isOpened = true;
                    _this.showMenu(btn.attr('id'));
                }
            } else {
                _this.closeAll();
            }
        });
        //开启后鼠标经过菜单按钮触发
        nav.on('mouseover', 'button[data-role="menu-list"]', function(){
            if(isOpened){
                var btn = $(this);
                if(btn.length != 0){
                    nav.find('li>button[data-role="menu-list"]').removeClass('active');
                    btn.addClass('active');
                    _this.showMenu(btn.attr('id'));
                }
            }
        });
        //点击其他区域触发
        $(document).bind("click", function(e){
            if(isOpened){
                if($(e.target).closest(dom).length == 0){
                    _this.closeAll();
                }
            }
        });
    };

    this.closeAll = function(){
        nav.find('li>button').removeClass('active');
        isOpened = false;
        this[activeMenu].close();
        activeMenu = null;
    };
    
    this.setHeight = function(height){
        this.height = height;
        this.root.height(height);
    };

    this.showMenu = function(menuId){
        menuId = menuId.replace(/^btn-menu-/, '');
        if(activeMenu != null){
            this[activeMenu].close();
        }
        if(typeof this[menuId] != 'undefined'){
            activeMenu = menuId;
            this[menuId].open();
        }
    };

    this.addNav = function(name, label, shortcut){
        if(shortcut != undefined){
            label += '(' + shortcut + ')';
        }
        var li = nav.append('<li><button id="btn-menu-'+name+'" data-role="menu-list">'+label+'</button></li>').find('li:last');
        navDomList[name] = li;
        var _this = this;
        this[name] = new menuList(li, function(){
            _this.closeAll();
        });
    };
    
    var that = this;
    //menu子类
    function menuList(dom, onClose){
        //菜单结构：菜单分类->菜单项目
        var root;
        menuDomList = {};
        this.menuList = {};
        
        this.init = function(){
            root = dom.append('<ul></ul>').find('ul');
            root.menu();
            root.hide();
        };
        
        this.addMenuItem = function(name, label, callback){
            var _this = this;
            var dom = root.append(`<li class="list-menu-item-${name}"><div>${label}</div></li>`).find('li:last');
            menuDomList[name] = dom;
            if(typeof callback != 'undefined'){
                dom.click(callback);
            }
            dom.click(onClose);
            root.menu('refresh');
        };

        this.removeMenuItem = function(name){
            if(typeof menuDomList[name] != 'undefined'){
                menuDomList[name].remove();
                return true;
            } else {
                return false;
            }
        };

        this.click = function(name, callback){
            if(typeof menuDomList[name] != 'undefined'){
                menuDomList[name].click(callback);
                return true;
            } else {
                return false;
            }
        }

        this.unbind = function(name, callback){
            if(typeof menuDomList[name] != 'undefined'){
                if(typeof callback == 'undefined'){
                    menuDomList[name].unbind('click');
                } else {
                    menuDomList[name].unbind('click', callback);
                }
                return true;
            } else {
                return false;
            }
        }
        
        this.addSubMenu = function(type, name, label){
            
        };

        this.open = function(){
            root.show();
        };

        this.close = function(){
            root.hide();
        };
        
        this.init();
    };
    
    this.init();
};
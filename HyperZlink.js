var HyperZlink = function(){
    this.resize = function(){
        var width = $(window).width();
        var height = $(window).height();
        this.navBar.setWidth(width);
        height -= this.menuBar.height;
        height -= this.navBar.getHeight();
        this.pianoRoll.setWidth(width);
    }
    
    this.changeHeight = function(){
        var height = $(window).height();
        height -= this.menuBar.height;
        height -= this.navBar.getHeight();
        this.pianoRoll.setHeight(height);
    }
    
	this.init = function(){
	    loader((use) => {
            use('ui.MenuBar');
            use('ui.NavBar');
            use('ui.PianoRoll');
            use('ui.Panel.EditPanel');
        }).then(() => {
            var heightMenuBar = 23;
            this.menuBar = new ui.MenuBar('#divMenuBar');
            this.menuBar.setHeight(heightMenuBar);
            this.navBar = new ui.NavBar('#divNavBar');
            this.pianoRoll = new ui.PianoRoll(this, '#divPianoRoll');
            this.editPanel = new ui.Panel.EditPanel();
            //pianoRoll.setThumb('res/thumb.png');
            $(window).resize(() => {
                this.resize();
            });
            this.navBar.on('height', (h) => {
                this.changeHeight();
            });
            this.resize();
            
            //测试用
            this.navBar.addTab('edit', 'Edit');
            this.navBar.bindPanel('edit', this.editPanel);
            this.navBar.addTab('track', 'Track');
        
            this.menuBar.addNav('file', 'File', 'F');
            this.menuBar.file.addMenuItem('open', 'Open', function(){console.log('opened')});
        
            this.menuBar.addNav('edit', 'Edit', 'E');
            this.menuBar.addNav('voice', 'Voice', 'V');
            this.menuBar.addNav('synthetize', 'Synthetize', 'T');
            this.menuBar.addNav('setting', 'Setting', 'S');
            this.menuBar.addNav('help', 'Help', 'H');
            
            this.editPanel.on(true, (...args) => {console.log(args)});
        
            function fillZero(number, length){
                var str = number.toString();
                var repeatLen = length - str.length;
                return '0'.repeat(repeatLen) + str;
            }
        	
        	this.pianoRoll.on('position.cursor', (measurePos, beatPos, ticket) => {
                this.editPanel.setValue('cursor', fillZero(measurePos + 1, 3) + ':' + (beatPos + 1) + ':' + fillZero(ticket, 3))
            });
        
            this.pianoRoll.on('position.now', (measurePos, beatPos, ticket) => {
                this.editPanel.setValue('nowPos', fillZero(measurePos + 1, 3) + ':' + (beatPos + 1) + ':' + fillZero(ticket, 3))
            });
        	
        	this.editPanel.on('zoomchange', (zoom) => {
        		this.pianoRoll.setZoom(zoom);
        	});
        	
        	this.editPanel.on('toolchange', (tool) => {
        		this.pianoRoll.setTool(tool);
        	});
        }).catch((e) => {
            console.log(e);
        });
	}
};
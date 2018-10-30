loader((use) => {
    use('ui.MenuBar');
    use('ui.NavBar');
    use('ui.PianoRoll');
    use('ui.Panel.EditPanel');
}).then(() => {
    var heightMenuBar = 23;
    menuBar = new this.MenuBar('#divMenuBar');
    menuBar.setHeight(heightMenuBar);
    navBar = new this.NavBar('#divNavBar');
    pianoRoll = new this.PianoRoll('#divPianoRoll');
    editPanel = new this.EditPanel();
    //pianoRoll.setThumb('res/thumb.png');
    $(window).resize(function(){
        var width = $(window).width();
        var height = $(window).height();
        navBar.setWidth(width);
        height -= heightMenuBar;
        height -= navBar.getHeight();
        pianoRoll.setWidth(width);
    });
    navBar.on('height', function(h){
        var height = $(window).height();
        height -= heightMenuBar;
        height -= navBar.getHeight();
        pianoRoll.setHeight(height);
    });
    $(window).resize();
    
    //测试用

    navBar.addTab('edit', 'Edit');
    navBar.bindPanel('edit', editPanel);
    navBar.addTab('track', 'Track');

    menuBar.addNav('file', 'File', 'F');
    menuBar.file.addMenuItem('open', 'Open', function(){console.log('opened')});

    menuBar.addNav('edit', 'Edit', 'E');
    menuBar.addNav('voice', 'Voice', 'V');
    menuBar.addNav('synthetize', 'Synthetize', 'R');
    menuBar.addNav('setting', 'Setting', 'S');
    menuBar.addNav('help', 'Help', 'H');
    
    editPanel.on(true, (...args) => {console.log(args)});

    function fillZero(number, length){
        var str = number.toString();
        var repeatLen = length - str.length;
        return '0'.repeat(repeatLen) + str;
    }
	
	pianoRoll.on('position.cursor', function(measurePos, beatPos, ticket){
        editPanel.setValue('cursor', (measurePos + 1) + ':' + (beatPos + 1) + ':' + fillZero(ticket, 3))
    });

    pianoRoll.on('position.now', function(measurePos, beatPos, ticket){
        editPanel.setValue('nowPos', (measurePos + 1) + ':' + (beatPos + 1) + ':' + fillZero(ticket, 3))
    });
	
	editPanel.on('zoomchange', (zoom) => {
		pianoRoll.setZoom(zoom);
	});
	
	editPanel.on('toolchange', (tool) => {
		pianoRoll.setTool(tool);
	});
}).catch((e) => {
    console.log(e);
});
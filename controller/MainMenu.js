depends('controller.MainMenu', [
    'events.EventEmitter',
]);
 
namespace('controller').MainMenu = function(menuBar){
    var eventEmitter = new events.EventEmitter();
    this.constructor = function(menuBar){
        this.menuBar = menuBar;
        this.initMenus();
        this.on = eventEmitter.on;
        this.off = eventEmitter.off;
    }

    this.initMenus = function(){
        //File
        this.menuBar.addNav('file', 'File', 'F');
        this.menuBar.file.addMenuItem('new', 'New', buildCallback('file.new'), 'N');
        this.menuBar.file.addMenuItem('open', 'Open', buildCallback('file.open'), 'O');
        this.menuBar.file.addMenuItem('save', 'Save', buildCallback('file.save'), 'S');
        this.menuBar.file.addMenuItem('saveas', 'Save as', buildCallback('file.save'), 'A');
        this.menuBar.file.addMenuItem('-');
        this.menuBar.file.addMenuItem('import', 'Import', buildCallback('file.import'), 'I');
        this.menuBar.file.addMenuItem('export', 'Export', buildCallback('file.export'), 'E');
        
        //Edit
        this.menuBar.addNav('edit', 'Edit', 'E');
        this.menuBar.edit.addMenuItem('undo', 'Undo', buildCallback('edit.undo'), 'U', 'Ctrl+Z');
        this.menuBar.edit.addMenuItem('redo', 'Redo', buildCallback('edit.undo'), 'R', 'Ctrl+Y');

        this.menuBar.addNav('voice', 'Voice', 'V');
        this.menuBar.addNav('synthetize', 'Synthetize', 'T');
        this.menuBar.addNav('setting', 'Setting', 'S');
        this.menuBar.addNav('help', 'Help', 'H');
    }

    function buildCallback(name){
        return () => {
            eventEmitter.emit('menu.' + name);
            eventEmitter.emit('menu', name);
        }
    }

    this.constructor(menuBar);
}
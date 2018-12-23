//import events.EventEmitter

//namespace controller
class MainMenu {
    constructor(menuBar){
        this.menuBar = menuBar;
        this.initMenus();
        this.event = new EventEmitter();
        this.on = eventEmitter.on;
        this.off = eventEmitter.off;
    }

    initMenus(){
        //File
        this.menuBar.addNav('file', 'File', 'F');
        this.menuBar.file.addMenuItem('new', 'New', this.buildCallback('file.new'), 'N');
        this.menuBar.file.addMenuItem('open', 'Open', this.buildCallback('file.open'), 'O');
        this.menuBar.file.addMenuItem('save', 'Save', this.buildCallback('file.save'), 'S');
        this.menuBar.file.addMenuItem('saveas', 'Save as', this.buildCallback('file.save'), 'A');
        this.menuBar.file.addMenuItem('-');
        this.menuBar.file.addMenuItem('import', 'Import', this.buildCallback('file.import'), 'I');
        this.menuBar.file.addMenuItem('export', 'Export', this.buildCallback('file.export'), 'E');
        
        //Edit
        this.menuBar.addNav('edit', 'Edit', 'E');
        this.menuBar.edit.addMenuItem('undo', 'Undo', this.buildCallback('edit.undo'), 'U', 'Ctrl+Z');
        this.menuBar.edit.addMenuItem('redo', 'Redo', this.buildCallback('edit.undo'), 'R', 'Ctrl+Y');

        this.menuBar.addNav('voice', 'Voice', 'V');
        this.menuBar.addNav('synthetize', 'Synthetize', 'T');
        this.menuBar.addNav('setting', 'Setting', 'S');
        this.menuBar.addNav('help', 'Help', 'H');
    }

    buildCallback(name){
        return () => {
            this.event.emit('menu.' + name);
            this.event.emit('menu', name);
        }
    }
}
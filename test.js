//main
loader((use) => {use('data.io.SharedMemory')});
var arr = new data.io.SharedMemory('test', 1024);
var w = new Worker('worker.js');
arr.addWorker(w);
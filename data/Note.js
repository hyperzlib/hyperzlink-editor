namespace('data').Note = function(list){
	this.id = 0;
	this.start = 0;
	this.length = 0;
	this.getEnd = function(){
		return this.start + this.length;
	}
	this.dom = null;
}
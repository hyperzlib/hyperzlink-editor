namespace('ui').Utils = {
	getTransColor: function(fg, bg, alpha){
		//最终颜色 = 背景 * (1 - alpha) + 前景 * alpha
		var bg = this.hexToRgb(bg);
		var fg = this.hexToRgb(fg);
		var ret = [];
		for(var i = 0; i < 3; i ++){
			var abg = bg[i] * (1 - alpha); //背景变化后的颜色
			var mg = fg[i] - abg;
			mg = Math.min(255, Math.max(0, Math.round(mg / alpha)));
			ret.push(mg);
		}
		return ret;
	},
	getFinalColor: function(fg, bg, alpha){

	},
	getRgba: function(data, alpha){
		return 'rgba(' + data.join(',') + ',' + alpha + ')';
	},
	hexToRgb: function(hex){
		if(hex[0] == '#'){
			hex = hex.substr(1, 6);
		}
		var ret = [];
		for(var i = 0; i < 6; i += 2){
			ret.push(parseInt(hex.substr(i, 2), 16));
		}
		return ret;
	},
};
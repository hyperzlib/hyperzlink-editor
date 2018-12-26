//namespace ui
class Utils {
	static getTransColor(fg, bg, alpha){
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
	}

	static getRgba(data, alpha){
		return 'rgba(' + data.join(',') + ',' + alpha + ')';
	}

	static hexToRgb(hex){
		if(hex[0] == '#'){
			hex = hex.substr(1, 6);
		}
		var ret = [];
		for(var i = 0; i < 6; i += 2){
			ret.push(parseInt(hex.substr(i, 2), 16));
		}
		return ret;
	}

	static sCurve(x1, y1, x2, y2){
	    var reverse = false;
	    if(y1 < y2){
	        reverse = true;
	    }
	    var xLen = Math.max(x1, x2) - Math.min(x1, x2);
	    var yLen = Math.max(y1, y2) - Math.min(y1, y2);
	    var fix = Math.min(y1, y2);
	    var A = yLen / 2;
	    var w = Math.PI / xLen;
	    var sai = reverse ? Math.PI : 0;
	    var ret = new Int32Array(xLen);
	    for(var i = 0; i < xLen; i ++){
	        ret[i] = A * Math.cos(w * i + sai) + A + fix;
	    }
	    return ret;
	}

	static rCurve(x1, y1, x2, y2){
	    var reverse = false;
	    var fix = Math.min(y1, y2);
	    var xLen = Math.max(x1, x2) - Math.min(x1, x2);
	    var yLen = Math.max(y1, y2) - Math.min(y1, y2);
	    if(y1 > y2){
	        reverse = true;
	    } else {
	        fix -= yLen;
	    }
	    var A = yLen / 2;
	    var w = Math.PI / xLen / 2;
	    var sai = reverse ? Math.PI : 0;
	    var ret = new Int32Array(xLen);
	    for(var i = 0; i < xLen; i ++){
	        ret[i] = yLen * Math.sin(w * i + sai) + yLen + fix;
	    }
	    return ret;
	}

	static jCurve(x1, y1, x2, y2){
	    var reverse = false;
	    var fix = Math.min(y1, y2);
	    var xLen = Math.max(x1, x2) - Math.min(x1, x2);
	    var yLen = Math.max(y1, y2) - Math.min(y1, y2);
	    if(y1 < y2){
	        reverse = true;
	    } else {
	        fix -= yLen;
	    }
	    var A = yLen / 2;
	    var w = Math.PI / xLen / 2;
	    var sai = reverse ? Math.PI : 0;
	    var ret = new Int32Array(xLen);
	    for(var i = 0; i < xLen; i ++){
	        ret[i] = yLen * Math.cos(w * i + sai) + yLen + fix;
	    }
	    return ret;
	}
};
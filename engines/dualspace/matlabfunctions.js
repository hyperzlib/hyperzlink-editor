function histc(x, xLen, y, yLen){
	var count = 1;
	var index = new Int32Array(yLen);

	for(var i = 0; i < yLen; i++){
		index[i] = 1;
		if(y[i] >= x[0]) break;
	}
	for(;i < yLen;i++){
		if(y[i] < x[count]){
			index[i] = count;
		} else {
			index[i] = count ++;
			i --;
		}
		if(count == xLen) break;
	}
	count --;
	for(i++; i < yLen; i++) index[i] = count;
	return index;
}

function interp1(t, y, iLen, oLen){
	var i;
	var iLen = t.length;
	var oLen = tl.length;
	var h = new Float64Array(iLen - 1);
	var p = new Float64Array(oLen);
	var s = new Float64Array(oLen);
	var k = new Int32Array(oLen);
	
	var tl = new Float64Array(oLen);
	var yl = new Float64Array(oLen);
	
	//初始化
	for(i = 0; i < iLen - 1; i++) h[i] = t[i+1] - t[i];
	for(i = 0; i < oLen; i ++){
		p[i] = i;
		k[i] = 0;
	}

	k = histc(t, t1);

	for(i = 0; i < oLen; i ++) s[i] = (t1[i] - t[k[i]-1]) / h[k[i]-1];

	for(i = 0; i < oLen; i ++)
		y1[i] = y[k[i]-1] + s[i]*(y[k[i]] - y[k[i]-1]);
	return [tl, yl];
}

function diff(x){
	ans = [];
	for(var i = 0; i < x.length - 1; i ++)
	{
		ans[i] = x[i + 1] - x[i];
	}
	return ans;
}

function sign(x){
	for(var i = 0; i < x.length; i ++){
		if(x[i] > 0){
			x[i] = 1;
		} else if(x[i] == 0){
			x[i] = 0;
		} else if(x[i] < 0){
			x[i] = -1;
		}
	}
	return x;
}

function std(x){
	var i;
	var average = 0.0, s;
	for(i = 0; i < x.length; i++)
		average += x[i];
	average /= x.length;

	s = 0.0;
	for(i = 0;i < x.length;i++)
		s += Math.pow(x[i] - average, 2.0);
	s /= xLen - 1;

	return Math.sqrt(s);
}
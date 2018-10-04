function mixModel(m1, m2, s1, s2, p1, p2, length){
	var ret = {};
	var list1X = ['f0'];
	var list2X = ['spectral', 'aperiodicity'];
	var fft_size = Math.min(m1.fft_size, m2.fft_size);
	ret.fft_size = fft_size;
	var specl = Math.floor(fft_size / 2) + 1
	list1X.forEach((val, key) => {
		ret[val] = avgFrame(m1[val], m2[val], s1, s2, p1, p2, length);
	});
	
	list2X.forEach((val, key) => {
		ret[val] = [];
		for(var i = 0; i < length; i ++){
			ret[val].push(avgFrame(m1[val][i + s1], m2[val][i + s2], 0, 0, p1, p2));
		}
	});
	ret.frame_period = m1.frame_period;
	ret.time_axis = generateTimeAxis(ret.frame_period, length);
	ret.frame_length = length;
	ret.fs = m1.fs;
	ret.nbit = m1.nbit;
	return ret;
}

function generateTimeAxis(frame_period, frame_length){
	var timeStep = frame_period;
	var time_axis = [];
	var lastVal = 0;
	for(var i = 0; i < frame_length; i ++){
		time_axis.push(lastVal / 1000);
		lastVal += timeStep;
	}
	return time_axis;
}

function avgFrame(a1, a2, s1, s2, p1, p2, length){
	if(s1 == undefined) s1 = 0;
	if(s2 == undefined) s2 = 0;
	if(p1 == undefined) p1 = 50;
	if(p2 == undefined) p2 = 50
	if(length == undefined) length = Math.min(a1.length - s1, a2.length - s2);
	var deno = p1 + p2;
	var ret = [];
	for(var i = 0; i < length; i ++){
		ret.push((a1[s1 + i] * p1) / deno + (a2[s2 + i] * p2 / deno));
	}
	return ret;
}

function name2freq(tname, trim){
	var c;
	var n, m, oct, num;
	//01234567890A
	//C D EF G A B
	c = tname.charCodeAt(0);
	if (c >= 'A'.charCodeAt(0) && c <= 'G'.charCodeAt(0)){
		if(c <= 'B'.charCodeAt(0)){
			n = 9 + (c -'A'.charCodeAt(0)) * 2;
		} else if (c <= 'E'.charCodeAt(0)){
			n = (c - 'C'.charCodeAt(0)) * 2;
		} else {
			n = 5 + (c - 'F'.charCodeAt(0)) * 2;
		}
		c = tname[1];
		
		m = 2;
		if(c == '#'){
			 n++;
		} else if (c == 'b'){
			n--;
		} else {
			m = 1;
		}
			
		if(tname.length < m){
			return 0;
		}
		
		oct = parseInt(tname[m]);
		num  = (n + oct * 12 - 21) * 10 + trim;
		//return num;
		//0 で 55Hz
		return 55.0 * Math.pow(2, num / 120.0);
	}
	return 0;
}

function stretchFrames(data, start, length, outputLength){
	var times = outputLength / (length - 1);
	var ntimes = (length - 1) / outputLength;
	var iNow, iNowPos, iNext, iNextPos, percent;
	var output = [];
	for(var i = 0; i < outputLength; i ++){
		iNow = Math.floor(i * ntimes);
		if(iNow < length - 1){
			iNext = iNow + 1, length - 1;
			iNowPos = iNow * times;
			iNextPos = iNext * times;
			percent = (i - iNowPos) * 100 / (iNextPos - iNowPos);
			console.log(percent);
			output.push(avgFrame(data[start + iNow], data[start + iNext], 0, 0, 100 - percent, percent));
		} else {
			output.push(data[start + iNow]);
		}
	}
	return output;
}

function stretch1X(data, start, length, outputLength){
	var times = outputLength / (length - 1);
	var ntimes = (length - 1) / outputLength;
	var iNow, iNowPos, iNext, iNextPos, percent;
	var output = [];
	for(var i = 0; i < outputLength; i ++){
		iNow = Math.floor(i * ntimes);
		if(iNow < length - 1){
			iNext = iNow + 1, length - 1;
			iNowPos = iNow * times;
			iNextPos = iNext * times;
			percent = (i - iNowPos) * 100 / (iNextPos - iNowPos);
			console.log(percent);
			output.push(data[start + iNow] * (100 - percent) / 100 + data[start + iNext] * percent / 100);
		} else {
			output.push(data[start + iNow]);
		}
	}
	return output;
}

//随机自然化f0
function randomF0(f0, randFix){
	if(randFix == undefined) randFix = 1;
	for(var i = 0; i < f0.length; i ++){
		f0[i] = f0[i] + (f0[i] * Math.random() * randFix / 100);
	}
	return f0;
}

//g参数
function gFormater(model, gParam){
	var gRatio = Math.pow(10, -gParam / 200);
	var specl = model.fft_size / 2 + 1;
	var newLength = Math.max(0, Math.min(model.fft_size - 1, specl / gRatio + 0.5));
	for(var i = 0; i < model.frame_length; i ++){
		if (gRatio > 1){
			//女性化
			for(var j = 0; j < newLength; j++){
				var position = Math.min(specl - 1, j * gRatio);
				var now = parseInt(position);
				var next = now + 1;
				model.spectral[i][j] = model.spectral[i][now] + (model.spectral[i][next] - model.spectral[i][now]) * (position - now);
			}
		} else {
			//男性化
			for(var j = parseInt(newLength) - 1; j >= 0; j--){
				var position = Math.min(specl - 1, j * gRatio);
				var now = parseInt(position);
				var next = now + 1;
				model.spectral[i][j] = model.spectral[i][now] + (model.spectral[i][next] - model.spectral[i][now]) * (position - now);
			}
		}
	}
	model.fft_size = Math.floor(newLength - 1) * 2;
}

function downloadLink(url, filename){
	var vLink = document.createElement('a');
	vLink.href = url;
	vLink.download = filename;
	vLink.click();
	vLink = null;
}

function getFile(filename, mime){
	if(mime == undefined) mime = 'application/octet-stream';
	var pathData = filename.split('/');
	var basename = pathData[pathData.length - 1];
	var data = FS.readFile(filename, {encoding: 'binary'});
	var blob = new Blob([data], {type: mime});
	var url = URL.createObjectURL(blob);
	downloadLink(url, basename);
	URL.revokeObjectURL(url);
}

//获取平均周波数
function getAvgFreq(model){
	var value;
	var sumVal = 0, sumNum = 0;
	for(var i = 0; i < model.frame_length; i++){
		value = model.f0[i];
		//是否在范围内
		if(value <= 1000.0 && value > 55.0){
			sumVal += value;
			sumNum ++;
		}
	}
	return sumVal / sumNum;
}

function getFormant(model){
	
}
if(typeof binlyric != 'object') {
	binlyric = {};
}
binlyric = {
	edition: "1.1",
	obj: "",
	lyricCSS: new Object(),
	txt: "",
	index: 0,
	time: new Array(),
	lyric: new Array(),
	data: [],
	sort: function() { // 冒泡排序（从小到大）
		var third;
		for(var j = 0; j < this.index - 1; j++) {
			for(var i = 0; i < this.index - 1; i++) {
				if(this.time[i] > this.time[i + 1]) {
					third = this.time[i];
					this.time[i] = this.time[i + 1];
					this.time[i + 1] = third;
					third = this.lyric[i];
					this.lyric[i] = this.lyric[i + 1];
					this.lyric[i + 1] = third;
				}
			}
		}

		var arr = this.time[this.time.length - 1].split(':');
		var vrmintue = parseInt(arr[0]);
		if((vrmintue + 1) < 10) {
			vrmintue = "0" + (vrmintue + 1);
		}
		this.time.push(vrmintue + ":" + arr[1]);
		for(var k = 0; k < this.index; k++) {
			var txtobj = this.createTxtobj(this.lyric[k])
			this.data.push(txtobj);
		}
	},
	createPanel: function() { // 创建歌词面板
		var i = 0;
		$(this.obj).html("");
		for(var i = 0, len = this.data.length - 1; i <= len; i++) { //每段开头加空格			
			if((i + 1) > len) {
				break;
			} else if(this.data[i].pIndex != this.data[i + 1].pIndex) {
				var arr = this.data[i + 1].txt.split("");
				arr.unshift("&nbsp;&nbsp;");
				this.data[i + 1].txt = arr.join("");
			}
		}
		for(var i = 0, len = this.data.length - 1; i <= len; i++) { //段落布局
			if(this.time[i]) {
				id = this.time[i].replace(":", "f").replace(".", "p");
				if($("#p" + this.data[i].pIndex).length > 0) {
					$("#p" + this.data[i].pIndex).append("<ii id=" + id + ">" + this.data[i].txt + "</ii>");
				} else {
					$(this.obj).append("<p id=p" + this.data[i].pIndex + ">" + "</p>");
					$("#p" + this.data[i].pIndex).append("<ii id=" + id + ">" + this.data[i].txt + "</ii>");
				}

				if(this.data[i].pIndex == 0) { //标题居中  [0]

					$(this.obj).find("ii:eq(0)").attr("class", "topmid");

				} else {

				}
			}

		}

		for(i in this.lyricCSS) {
			$(this.obj).find("div").css(this.lyricCSS, this.lyricCSS[i]);
		}
	},
	createTxtobj: function(text) {
		var reg = /\[[0-9]*\]/;
		var pId = text.match(reg);
		var pIndex = pId[0].replace("[", "").replace("]", "");
		var txt = text.replace(pId[0], "");
		return {
			txt: txt,
			pIndex: pIndex
		};
	},
	getIndex: function(time) {
		var _index = 0;
		for(var i = 0, len = this.time.length; i < len; i++) {
			if(this.time[i] == time) {
				_index = i;
				break;
			}
		}
		return i;
	},
	findTags: function(index, strArray, number) { // 查找标签（包括任何扩展的标签）
		// 此方法能匹配所有格式的标签
		// 因为此方法是在后面写的，所以时间标签并没有使用此方法
		number = number || this.txt.length;
		number = (number > this.txt.length) ? this.txt.length : number;
		var i, j, complete = 0,
			value;
		var obj = new Object();
		obj.booble = false;
		obj.value = "[";
		for(i = index; i < number; i++) {
			if(this.txt.substr(i, 1) == strArray[complete].s) {
				complete += 1;
				if(complete > 1) {
					if(complete < strArray.length) {
						obj.value += '{value:"' + this.txt.substr(value + 1, i - value - 1) + '"},';
					} else {
						obj.value += '{value:"' + this.txt.substr(value + 1, i - value - 1) + '"}]';
					}
				}
				if(complete == strArray.length) {
					obj.txt = this.txt.substr(index, i - index + 1);
					obj.value = eval('(' + obj.value + ')');
					obj.index = i + 1;
					obj.booble = true;
					break
				}
				value = i;
			} else if(this.txt.substr(i, 1) == "\n") {
				obj.booble = false;
				return obj;
			} else if(this.txt.substr(i, 1) == strArray[0].s && complete > 0) // 遇到2次开始标志就退出
			{
				obj.booble = false;
				return obj;
			}
		}
		return obj;
	},
	findlyric: function(index) { // 查找歌词： 有则返回 歌词、继续查找的位置， 否则只返回继续查找的位置
		var obj = {};
		var str = this.txt;
		var i;
		for(i = index; i < str.length; i++) {
			if(str.charAt(i) == "[") {
				var _obj = this.findTags(i, [{
					s: "["
				}, {
					s: ":"
				}, {
					s: "]"
				}]);
				if(_obj.booble) {
					obj.index = i; //i + _obj.txt.length;
					obj.lyric = str.substr(index, i - index);
					return obj;
				}
			} else if(str.charAt(i) == "\n") {
				obj.index = i + 1;
				obj.lyric = str.substr(index, i - index);
				return obj
			}
		}
		if(i == str.length) // 专处理最后一句歌词（最后一句歌词比较特殊）
		{
			obj.index = i + 1;
			obj.lyric = str.substr(index, i - index);
			return obj;
		}
		obj.index = i;
		return obj;
	},
	findTime: function(index) { // 查找时间 ： 有则返回 时间、继续查找的位置， 否则只返回继续查找的位置
		// 此功能可以用 findTags 方法实现，更简单、更强大、代码更少
		// findTags方法 是在后面写的，所以这里就不改了，具体可参考 findID方法里的使用实例
		var obj = {};
		var thisobj = this;
		var str = this.txt;
		obj.index = index;

		function recursion() {
			var _obj = thisobj.findTime(obj.index);
			if(_obj.time) {
				obj.time += _obj.time;
				obj.index = _obj.index;
			}
		}
		// --------------- 可以在这里 扩展 其它功能 ---------------
		// lrc歌词只能精确到每句歌词，可以通过扩展lrc 精确 到 每个字
		if(/\[\d{1,2}\:\d{1,2}\.\d{1,2}\]/.test(str.substr(index, 10))) // [mm:ss.ff]
		{
			obj.time = str.substr(index + 1, 8) + "|";
			obj.index = index + 9 + 1;
			recursion();
		} else if(/\[\d{1,2}\:\d{1,2}\]/.test(str.substr(index, 7))) // [mm:ss]
		{
			obj.time = str.substr(index + 1, 5) + ".00" + "|";
			obj.index = index + 6 + 1;
			recursion();
		}
		// 以下标签均属于合法标签，但很少被使用，请根据需要进行扩展
		// [mm:ss.f] [mm:s.ff] [mm:s.f] [m:ss.ff] [m:s.ff] [m:s.f]
		// [mm:s] [m:ss] [s:s]
		return obj;
	},
	findID: function(index) { // 查找预定义标识
		//[ar:艺人名]
		//[ti:曲名]
		//[al:专辑名]
		//[by:编者（指编辑LRC歌词的人）]
		//[offset:时间补偿值] 其单位是毫秒，正值表示整体提前，负值相反。这是用于总体调整显示快慢的。（很少被使用）
		// 注：本程序也不支持 offset 功能（但是能取值），如需要 请自行在 sort 方法添加此功能
		// 此处功能 使用 findTags方法 实现
		var obj;
		obj = this.findTags(index, [{
			s: "["
		}, {
			s: ":"
		}, {
			s: "]"
		}]);
		if(obj.booble) {
			if(obj.value[0].value == "ar") {
				this.ar = obj.value[1].value;
			} else if(obj.value[0].value == "ti") {
				this.ti = obj.value[1].value;
			} else if(obj.value[0].value == "al") {
				this.al = obj.value[1].value;
			} else if(obj.value[0].value == "by") {
				this.by = obj.value[1].value;
			} else if(obj.value[0].value == "offset") // 这里是 offset 的值
			{
				this.offset = obj.value[1].value;
			}
		}
	},
	analysis: function() { // 解析
		if(this.txt == "") return false;
		var str = this.txt;
		this.index = 0;
		for(var i = 0; i < str.length; i++) {
			if(str.charAt(i) == "[") {
				var time = this.findTime(i);
				if(time.time) // 时间标签
				{
					var lyric = this.findlyric(time.index);
					if(lyric.lyric != "\n" && lyric.lyric != "") // 去掉无意义歌词
					{
						var timeArray = time.time.split("|");
						for(var j = 0; j < timeArray.length; j++) {
							if(timeArray[j]) {
								this.time[this.index] = timeArray[j];
								this.lyric[this.index] = lyric.lyric;
								this.index += 1;
							}
						}
					}
					i = time.index;
				} else // 预定义标签
				{
					this.findID(i);
				}
			}
		}
		this.sort();
		this.createPanel();
	},
	play: function(position, CSS) { // 定位指定时间的歌词
		function currentTime(time) {
			var minute = time / 60;
			var minutes = parseInt(minute);
			if(minutes < 10) {
				minutes = "0" + minutes;
			}
			//秒
			var second = time % 60;
			seconds = second.toFixed(2);
			if(seconds < 10) {
				seconds = "0" + seconds;
			}
			var allTime = "" + minutes + "" + ":" + "" + seconds + "";
			return allTime;
		}

		var righttime = currentTime(position);
		var id0;
		for(var i = 0, len = this.time.length; i < len; i++) {
			if(righttime < this.time[i]) {

				if(this.time[i - 1]) {
					id0 = this.time[i - 1].replace(":", "f").replace(".", "p");
				}
				break;
			}
		}

		if($("#" + id0).length > 0) {
			$("#" + id0).addClass("isread");
			$(this.obj).scrollTop($("#" + id0).offset().top + $(this.obj).scrollTop() - allheight - 250);
		}
	}
};

var binlyric, handleplayer, audio, duration, isplaying = false,
	isloaded = false;

function secTomin(sec) {
	var secd = sec % 60;
	var min = (sec - secd) / 60;
	if(secd < 10) {
		secd = "0" + parseInt(secd);
	} else {
		secd = parseInt(secd);
	}
	if(min < 10) {
		min = "0" + min;
	}
	return min + ":" + secd;
}

function initplay() {
	$.get("lhs.txt", {

	}, function(data) {
		$("#playercon").show();
		if(handleplayer) {
			clearInterval(handleplayer);
			handleplayer = null;
		}

		$(".lyricPanel").empty();
		binlyric.data = [];
		binlyric.txt = data;
		binlyric.obj = ".lyricPanel";
		binlyric.lyricCSS = {
			"font-size": "16px",
			"height": "30px",
			"line-height": "30px",
			"text-align": "center"
		};
		var htitle = $(".mui-table-view").height();
		var hblank = $(".interval-blank").height();
		var himgcon = $("#imgcon").height();
		var htype = $(".type-title").height();
		window.allheight = htitle + hblank + himgcon + htype;
		$(".lyricPanel").height($(window).height() - htitle - hblank - himgcon - htype - 190);
		binlyric.analysis();
	}, "text")
}

initplay();
function clearReadstatus(){      
	$(".lyricPanel").find("ii").each(function(index){
        $(this).removeClass("isread");
    })  

}
function startPlay(mp3_url) {
	mp3_url = "lhs.mp3";
	if(!audio) {
		clearReadstatus();
		audio = new Audio(mp3_url);
		audio.play();
	}
	if(handleplayer) {
		if(isplaying) {
			isplaying = false;
			audio.pause();
			$(".video-play-icon").removeClass('video-play-stop');
		} else {
			$(".video-play-icon").addClass('video-play-stop');
			isplaying = true;
			audio.play();
		}

		return;
	}
	audio.addEventListener("ended", function() {
		clearInterval(handleplayer);
		$("#currenttime").html(duration);
		$(".video-play-icon").removeClass('video-play-stop');
		isloaded = false;
		audio = null;
		handleplayer = null;
	}, false)
	handleplayer = setInterval(function() {

		if(audio.currentTime > 0 && !isNaN(audio.duration)) {
			if(!isloaded) {
				$("#currenttime").html("00:00");
				$(".video-play-set").width("0%");
				$(".video-play-icon").addClass('video-play-stop');
				isloaded = true;
				isplaying = true;
			}
			var durationhtml = $("#audio-duration").html();
			duration = secTomin(audio.duration);
			var widthline = audio.currentTime / audio.duration * 100;
			if(durationhtml == "00:00") {
				$("#audio-duration").html(secTomin(audio.duration));
			}
			$("#currenttime").html(secTomin(audio.currentTime));
			$(".video-play-set").width(widthline + "%");
			binlyric.play(audio.currentTime, {});
		}

	}, 0)
}
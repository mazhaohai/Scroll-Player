var intervalTime = 5000;
var repeatTime = 5000;
var repeatCount = 2;
var currentRepeat = 0;
var currentTXIndex = 0;
var isShowBS = 0;
var setTime = 0;

$(function () {
    Gifffer();
    $(".select_ul li").click(function () {
        $(this).parent().children().removeClass("current");
        $(this).addClass("current");
    });
    $("#btn_startTX").click(function () {
        intervalTime = $("#select_QHFS li.current").attr("data")*1000;
        repeatCount = $("#select_CFCS li.current").attr("data");
        isShowBS = $("#select_isShowBS li.current").attr("data");
        if (isShowBS==1) {
            $(".bs_Box").show();
            $("#txList li .top_Box span.pinyin").css({"line-height":"5em"});
        } else {
            $(".bs_Box").hide();
            $("#txList li .top_Box span.pinyin").css({"line-height":"10em"});
        }
        $("#defaultBox").slideUp(500, function () {
            $("#tingxieBox").slideDown(500, function () {
                startTX();
            });
        })
    });
    $("#btn_stopTX").click(function () {
        txEnd()
    });
     $(".btn_prev").click(function () {
        if (currentTXIndex > 0) {
            currentRepeat = 0;
            clearTimeout(setTime);
            currentTXIndex--;
            $("#txList li.current").removeClass("current");
            $("#txList li").eq(currentTXIndex).addClass("current");
            langdu();
        } else {
            alert("已经是第一个词语了");
        }
    });
    $(".btn_next").click(function () {
        if (currentTXIndex < ciCount-1) {
            currentRepeat = 0;
            clearTimeout(setTime);
            currentTXIndex++;
            $("#txList li.current").removeClass("current");
            $("#txList li").eq(currentTXIndex).addClass("current");
            langdu();
        } else {
            alert("已经是最后一个词语了");
        }
    });
});

function startTX() {
    setTimeout(function () {
        currentTXIndex = 0;
        langdu();
    }, 1000);
}
function txEnd() {
    $("#tingxieBox").slideUp(500, function () {
        $("#defaultBox").slideDown(500);

        currentTXIndex = 0;
        currentRepeat = 0;
        $("#txList li.current").removeClass("current");
        $("#txList li").eq(0).addClass("current");
        clearTimeout(setTime);
        $("#playAudio").remove();
    })
}

function langdu() {
    currentRepeat++;  //重复次数累计
    //朗读
    $("#playAudio").remove();
    var audio = '<audio id="playAudio" controls="controls" preload="auto" style="position:absolute; visibility:hidden;">' +
                                '<source src="http://www.taozhi.cn/_Upload/Recordings/' + $("#txList li.current span.pinyin").attr("data-mp3") + '"></source>' +
                          '</audio>';
    $(audio).appendTo("body");
    $("#playAudio").get(0).play();
    // alert("currentRepeat：" + currentRepeat+","+"currentTXIndex："+currentTXIndex)
    $("#playAudio").on("ended", function () {
        if (currentRepeat < repeatCount) {
            setTime = setTimeout(langdu, intervalTime == 0 ? repeatTime : intervalTime);
        } else {
            if (currentTXIndex < ciCount - 1) {
                if (intervalTime > 0) {
                    setTimeout(function () {
                        $("#txList li.current").removeClass("current");
                        $("#txList li").eq(currentTXIndex).addClass("current");
                    }, intervalTime);

                    currentRepeat = 0;
                    currentTXIndex++;
                    setTime = setTimeout(langdu, intervalTime);
                }
            } else {
                setTimeout(txEnd, (intervalTime == 0 ? repeatTime : intervalTime) + 1000);
            }
        }
    });
}
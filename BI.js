(function(window){

var Agent={
  ie: /MSIE/i.test(navigator.userAgent),
  ie7: /MSIE 7/i.test(navigator.userAgent),
  opera: /Opera/i.test(navigator.userAgent),
  ff: /Firefox/i.test(navigator.userAgent)
};

var Bi={
  loc: location,
  euc: encodeURIComponent,
  doc: document,
  logUrl:'http://localhost/s.gif?type[ad]',
	uid:'biaduid',
	expTime:86400*365,

  //设置cookie
  setCke: function(n, v, t, h, d){
    var e = new Date();
    e.setTime(e.getTime() + t*1000);
    Bi.doc.cookie = n + "=" + v + (t ? "; expires=" + e.toGMTString() : "") + (d ? "; domain="+d : "") + (h ? "; path="+h : "");
  },

  //获取cookie
  getCke: function (N){
    var m = new RegExp("(^| )" + N + "=([^;]*)(;|\x24)");
    var k = m.exec(Bi.doc.cookie);
    if (k) {
      return k[2] || null
    }
    return null
  },

  //无素级，获取关键词数据，发送log请求
  biLog:function(A) {
    var obj = window.event ? window.event.srcElement : Bi.biLog.caller.arguments[0].target,
    C = Bi.logUrl;
		if(!Bi.getCke(Bi.uid)){
			var uidstr=new Date().getTime();
			Bi.setCke(Bi.uid,uidstr,Bi.expTime);
		}
    U = Bi.getCke(Bi.uid);
		document.createElement("img").src = C + "site["+window.location.hostname+"]c[click]"+ (obj.getAttribute('data-tag') || '') + (A || '') + "&r=" + (Math.random() + "").substring(2, 10);
  },

  mbind:function(A, o, _) {
    if (Agent.ie)
        A.attachEvent("on" + o, _, false);
    else 
        A.addEventListener(o, _, false);
  },
  
  //页面级绑定事件，统计展现
  bindLog:function() {
    var o = $(".BiAdFlag"),C = Bi.logUrl+"site[" + Bi.euc(window.location.hostname || "-")+']';
		if(!Bi.getCke(Bi.uid)){
			var uidstr=new Date().getTime();
			Bi.setCke(Bi.uid,uidstr,Bi.expTime);
		}
		var U = Bi.getCke(Bi.uid);

    function _() {
      var obj = window.event ? window.event.srcElement : arguments.callee.arguments[0].target;
			document.createElement("img").src = C + 'u['+U+']c[click]'+(obj.getAttribute('data-tag') || '') + "&r=" + (Math.random() + "").substring(2, 10);
    }

    for (var B = 0, A = o.length; B < A; B++){
			//展显
	    document.createElement("img").src = C + 'u['+U+']c[show]'+(o[B].getAttribute('data-tag') || '') + "&r=" + (Math.random() + "").substring(2, 10);
			//绑定点击
			Bi.mbind(o[B], "click", _);
		}
  }
};

window.Bi = Bi;
})(window);
// Bi.mbind(window, "load", Bi.bindLog);
/**
*
*	家长帮广告系统js引擎
*
* by Silver 2014.9.29
* 
*/
(function(window){

/**
* 基础类，提供一些基础方法，及浏览器判断等
*
*/
var Base = _ ={
	domReady: function($func){
    if (document.addEventListener)
      document.addEventListener("DOMContentLoaded", $func, false);
    else if(_this.Agent.ie){
      document.attachEvent("onreadystatechange", $func );
    }else{
    	old_onload = window.onload;

      window.onload = function() {
        $func();
        if (old_onload) old_onload();
      };
    }
	},
	bind: function($dom, $event, $handle){
		document.addEventListener($event, function(e){

		});
	},
	ua: navigator.userAgent.toLowerCase(),
	Agent: {
    ie: /MSIE/i.test(navigator.userAgent),
    ie7: /MSIE 7/i.test(navigator.userAgent),
    opera: /Opera/i.test(navigator.userAgent),
    ff: /Firefox/i.test(navigator.userAgent)
	},
	log: function(l){
		console.log(l);
	},
	getById: function(id){
		return document.getElementById(id);
	},
	getSiblings: function(elem){
		var _nodes = []
			,_elem = elem;
		while ((elem = elem.previousSibling)){
			if(elem.nodeType === 1&&elem.nodeName!="STYLE"&&elem.nodeName!="SCRIPT"){
				_nodes.push(elem);
			}
		}

		elem = _elem;
		while ((elem = elem.nextSibling)){
			if(elem.nodeType === 1&&elem.nodeName!="STYLE"&&elem.nodeName!="SCRIPT"){
				_nodes.push(elem);
			}
		}
		return _nodes;
	},
	hide: function(elems){
		if(elems&&elems instanceof Array){
			for (var i = 0; i < elems.length; i++) {
				var _eDisplay = document.defaultView.getComputedStyle(elems[i],null)["display"];
				elems[i].setAttribute("data-display",_eDisplay);
				elems[i].style.display = "none";
			};
		}else{
			var _eDisplay = document.defaultView.getComputedStyle(elems,null)["display"];
			elems.setAttribute("data-display",_eDisplay);
			elems.style.display = "none";
		}
	},
	show: function(elems){
		if(elems&&elems instanceof Array){
			for (var i = 0; i < elems.length; i++) {
				if(elems[i].getAttribute("data-display")) elems[i].style.display = elems[i].getAttribute("data-display");
			};
		}else{
			if(elems.getAttribute("data-display")) elems.style.display = elems.getAttribute("data-display");
		}
	}
}
	
/**
* cookie辅助类，对cookie的相关操作
*
*/
var CookieHelper = {
	set: function(n, v, t, h, d){
    var e = new Date();
    e.setTime(e.getTime() + t*1000);
    document.cookie = n + "=" + v + (t ? "; expires=" + e.toGMTString() : "") + (d ? "; domain="+d : "") + (h ? "; path="+h : "");
  },
  //获取cookie
  get: function (N){
    var m = new RegExp("(^| )" + N + "=([^;]*)(;|\x24)");
    var k = m.exec(document.cookie);
    if (k) {
      return k[2] || null
    }
    return null
  }
}
	
/**
* time辅助类，对时间戳的相关操作
*
*/
var TimeHelper = {
	stod: function($format){
		var $d = new Date($format*1000);
		return $d;
	}
}

/**
*	静态类型
*
*/

//广告显示类型
AD_DISPLAY_TYPE = {
	NORMAL: 0,			//普通
	FULLSCREEN: 1 	//全屏
}

//广告位置标识
AP_IDENTIFY = {
	"top": 0,
	"bottom": 1,
	"left": 2,
	"right": 3
}

//广告位置类型
AP_TYPE = {
	"BYLOC": 0,		//通过位置来定位广告
	"BYID": 1 		//通过页面打点div定位广告
}
	
/**
* 广告生成类，对模板进行渲染
*
*/
var AdGenerator = function(){
}
AdGenerator.prototype.getAd = function(o){
	this.strategy = new AdStrategy();
	this.position = new AdPosition(o.position,o.template);
	this.dataList = o.dataList;
	this.matched = false;
	this.getHtml(this.dataList);
}
AdGenerator.prototype.getHtml = function(){
	var _t = this.position.getTemplete();
	document.children[0].appendChild(_t);

	for (var i = 0; i < this.dataList.length; i++) {
		var _d = this.dataList[i],
				_tList = _d.data;

		//策略判断 若符合策略 则停止输出模板
		if(this.strategy.isMatch(_d)){
			var _rAd = ~~(_tList.length*Math.random());
			_t.innerHTML = _tList[_rAd].html+"<style>"+_tList[_rAd].css+"</style>";
			this.otherNodes = _.getSiblings(_t);

			//事件绑定
			if(_tList[_rAd].func && typeof _tList[_rAd].func === "function"){
				var _this = this;
				_tList[_rAd].func();
			}

			//是否全屏
			if(_tList[_rAd].type == AD_DISPLAY_TYPE.FULLSCREEN){
				this.toFullscreen();
			}
			this.matched = true;
			break;
		}
	};
}
AdGenerator.prototype.toFullscreen = function(){
	// _.hide(document.body);
}
	
/**
* 广告策略类，进行策略判断
*
*/
var AdStrategy = function(){
}
AdStrategy.prototype.isMatch = function(s){
	_.log(s);
	return true;
}

/**
* 广告位置类，对广告最后生成的位置设置
*
*/
var AdPosition = function(p,t){
	this.dataP = p;
	this.dataT = t;
	if(p.type == AP_TYPE.BYLOC){
		this.wrap = document.createElement("div");
	}else if(p.type == AP_TYPE.BYID){
		this.wrap = _.getById(p.loc);
	}else{
		this.wrap = document.createElement("div");
	}
}

AdPosition.prototype.getTemplete = function(){
	this.getWrap();
	return this.wrap;
}
AdPosition.prototype.getWrap = function(){
	if(this.dataP.type == AP_TYPE.BYLOC){
		this.wrap.setAttribute("style","background:none;position:fixed;z-index:999999;");
		this.wrap.style.height = this.dataT.height;
		this.wrap.style.width = this.dataT.width;
		this.setLocation(AP_IDENTIFY[this.dataP.loc]);
	}else if(this.dataP.type == AP_TYPE.BYID){

	}
}
AdPosition.prototype.setLocation = function(loc){
	this.wrap.style.left = 0;
	switch(loc){
		case AP_IDENTIFY.top:
			this.wrap.style.top = 0;
			break;
		case AP_IDENTIFY.bottom:
			this.wrap.style.bottom = 0;
			break;
		case AP_IDENTIFY.left:
			this.wrap.style.left = 0;
			break;
		case AP_IDENTIFY.right:
			this.wrap.style.right = 0;
			break;
		default:
			break;
	}
}
	
/**
* 广告统计类，数据统计相关操作
*
*/
var AdAnalyze = function(){
}

/**
* 主要广告引擎，对外提供接口
*
*/
var AdEngine = (function(){
	function startup(obj){
		var g = new AdGenerator();

		_.domReady(function(){
			g.getAd(obj);
		});
	}

	return {
		startup: startup
	}
})();

window.AdEngine = AdEngine;

})(window);

AdEngine.startup({
	site: {
		name: "webapp" //站点名字
	},
	position: {       //位置信息
     description: "顶部广告",  //位置方向通过文字进行描述
     loc: "top",  
     type: 0       // 0 传位置，1为传ID  
	},
	dataList: [ 
	  {                           		//投放策略
	    outdate: "timestamp",         //过期时间(-1为永不过期)
	    districk: [],                 //地区(999为所有地区)
	    level: [],                    //学段(999为所有学段)
	    clickOutdate: 100,    //点击之后多久不显示 (-1为永久显示)
	    data: [												//物料数据
        {
          html: [
							    '<div class="back" id="adWrap">',
							    '<img src="http://img.eduuu.com/website/public_js/jzb/img/mobile-logo.png" alt="" class="mobile_logo">',
							    '<div class="btns">',
							    '<a id="down_btn" href="javascript:;">下载家长帮</a>',
							    '<a id="float2_close" style="background:#bbc6ca;" href="javascript:;">浏览网页版</a>',
							    '</div></div>'
							  ].join(''),
    			css:  ".back{z-index:99999;background:#d8e9fc no-repeat;background-image:url(http://img.eduuu.com/website/public_js/jzb/img/mobile_landing_back.jpg);background-position:center bottom;position:fixed;height:100%;width:100%;background-size:100%;text-align:center;}.btns_wrap{position:relative;padding-bottom:20px;}.btns{text-align:center;}.btns a{display:block;width:150px;padding:12px 0;color:#fff;cursor:pointer;margin:10px auto;background:#099cd6;border-radius:50px;text-decoration:none;text-shadow:none;}.btns a:active{opacity:0.5;}.jzb_phone{width:100%;}.mobile_logo{width:40%;margin:50px auto 10px auto;}",
			    func: function(){float2_close.onclick = function(){adWrap.style.display = "none";}},
          type: 1
        }
      ]
	  }
	],
	default: [
		{
	   html: ['<div class="layer"></div><div class="ad_wrap_float" id="ad_wrap_float"><div class="ad_wrap_top"><div class="ad_font"><div class="trans_back">e度手机论坛客户端</div><h5 style="font-size:24px;color:#fff;margin-top:15px;">升学重要信息<span style="color:#ffea00;font-size:32px">实时推送</span></h5>        </div>      <img class="back" src="http://img.eduuu.com/website/public_js/jzb/img/back.png" alt="">     <img class="close_btn" src="http://img.eduuu.com/website/public_js/jzb/img/close.png" alt="">   </div>  <div class="ad_wrap_bottom">        <img src="http://img.eduuu.com/website/public_js/jzb/img/down_load.png" alt=""><span style="color:#39ac83;font-size:32px;">立即下载</span><span style="color:#39ac83;font-size:18px;">(3.5M)</span></div></div>'].join(''),
	   css:".ui-body-c, .ui-overlay-c{text-shadow:none;}  .layer{position:fixed;width:100%;height:100%;background:#ccc;z-index:9999;top:0;} .ad_wrap_float{width:100%;margin:0 auto;height: 360px;background:#39ac83;position:fixed;z-index:99999;top:0;}   .ad_wrap_top{float:left;width: 100%;height:90%;text-align: center;position:relative;}   .ad_wrap_bottom{float:left;width: 100%;background:#fff;text-align: center;padding:20px 0;font-size:20px;}   .ad_wrap_bottom img{position:relative;top:4px;left:-5px;}   .back{width:260px;bottom:0;position:absolute;}  .close_btn{position:absolute;right:15px;width:28px;top:10px;}   .ad_font{padding-top:40px;text-align: center;width:100%;}   .trans_back{background:rgba(0,0,0,0.1);width:240px;padding:8px 0;border-radius:10px;font-size:22px;color:#fff;margin:0 auto;}",
	   func:"",
	   weight: 1,
	   type: 0 
	  }
  ],
	template: {   //模板
	 width: "100%",  //模板高度 例：100px-像素 100%-百分比 
	 height: "100%"  //模板宽度 例：100px-像素 100%-百分比 
	}
});


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
	set: function(cookieName, cookieValue, hour, path, domain, secure) {
		var expires = new Date();
		expires.setTime(expires.getTime() + (hour+8)*1000*3600);
		document.cookie = escape(cookieName) + '=' + escape(cookieValue)
		+ (expires ? '; expires=' + expires.toGMTString() : '')
		+ (path ? '; path=' + path : ';path=/')
		+ (domain ? '; domain=' + domain : '')
		+ (secure ? '; secure' : '');
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
var AD_DISPLAY_TYPE = {
	NORMAL: 0,			//普通
	FULLSCREEN: 1 	//全屏
},

//广告位置标识
AP_IDENTIFY = {
	"top": 0,
	"bottom": 1,
	"left": 2,
	"right": 3
},

AP_POSITION = {
	0: "inherit",
	1: "absolute",
	2: "fixed"
},

//广告位置类型
AP_TYPE = {
	"BYLOC": 0,		//通过位置来定位广告
	"BYID": 1 		//通过页面打点div定位广告
},

//广告策略
AD_STRATEGY_COOKIE = {
	CLICK_OUTDATE: "jzb_ad_click_outdate"
},

AD_STRATEGY_LEVEL = { 
	"-2": '未出生' ,
	"-1": '未入园' ,
	"0": '幼儿园' ,
	"1": '一年级' ,
	"2": '二年级' ,
	"3": '三年级' ,
	"4": '四年级' ,
	"5": '五年级' ,
	"6": '六年级' ,
	"7": '初一' ,
	"8": '初二' ,
	"9": '初三' ,
	"10": '高一' ,
	"11": '高二' ,
	"12": '高三' ,
	"13": '大学及以上',
	"999": '全部学段'
},

AD_STRATEGY_DISTRICK = {
  'bj': "北京",
  'tj': "天津",
  'sjz': "石家庄",
  'ty': "太原",

  'sh': "上海",
  'nj': "南京",
  'su': "苏州",
  'cz': "常州",
  'wx': "无锡",
  'hf': "合肥",
  'hz': "杭州",
  'nb': "宁波",
  'fz': "福州",
  'jn': "济南",
  'qd': "青岛",

  'sz': "深圳",
  'gz': "广州",

  'zz': "郑州",
  'wh': "武汉",
  'cs': "长沙",

  'sy': "沈阳",
  'dl': "大连",
  'cc': "长春",

  'cq': "重庆",
  'cd': "成都",

  'xa': "西安",

  'qg': "全国" 
}
;

/**
* 广告生成类，对模板进行渲染
*
*/
var AdGenerator = function(){
}
AdGenerator.prototype.getAd = function(o){
	this.strategy = new AdStrategy();
	this.position = new AdPosition(o.position);
	this.obj = o;
	this.dataList = o.dataList;
	this.matched = false;
	this.getAdEntity(this.dataList);
}
AdGenerator.prototype.getAdEntity = function(){
	this.adTempl = this.position.getTemplete();
	if(this.adTempl){
		if(this.position.isByLoc())
			document.children[0].appendChild(this.adTempl);
		for (var i = 0; i < this.dataList.length; i++) {
			var _d = this.dataList[i],
					_tList = _d.data,
					_rAd = ~~(_tList.length*Math.random()),
					_ad = _tList[_rAd];

			//策略判断 若符合策略 则停止输出模板
			if(_ad&&this.strategy.isMatch(_ad.id,_d.districk,_d.level)){
				this.getHtml(_ad);
				break;
			}
		};

		//显示默认广告
		if(!this.matched){
			var _rAd = ~~(this.obj.default.length*Math.random());
			this.getHtml(this.obj.default[_rAd]);
		}
	}
}
AdGenerator.prototype.getHtml = function($ad){
	//设置模板大小
	this.position.setWrapSize($ad.template.width,$ad.template.height,this.isFullscreen($ad.type));
	this.adTempl.innerHTML = $ad.html+"<style>"+$ad.css+"</style>";
	this.otherNodes = _.getSiblings(this.adTempl);
	
	//事件绑定
	if($ad.func && typeof $ad.func === "function"){
		this.strategy.setClickOutdate($ad.clickOutdate);
		$ad.func(this,$ad.id);
	}

	//是否全屏
	if(this.isFullscreen($ad.type)){
		this.toFullscreen();
	}
	this.matched = true;
}
AdGenerator.prototype.isFullscreen = function(type){
	return  type == AD_DISPLAY_TYPE.FULLSCREEN;
}
AdGenerator.prototype.toFullscreen = function(){
	_.hide(document.body);
}
AdGenerator.prototype.cancelFullscreen = function(){
	_.show(document.body);
}
AdGenerator.prototype.removeAd = function(){
	this.position.removeWrap();
}

/**
* 广告策略类，进行策略判断
*
*/
var AdStrategy = function(){
	this.clickOutDate = "";
}
AdStrategy.prototype.isMatch = function(id,districk,level){
	if(this.isClickOutdate(id) || !this.isMatchArea(districk,level))
		return false;

	return true;
}
AdStrategy.prototype.isLogin = function(){
	//只在bbs站判断是否登录
	if(location.href.match(/m.jzb.c\w{0,}\/bbs\//i)){
		if((typeof userInfo.isLogin!="undefined")&&userInfo.isLogin) return true;
	}else{
		return false;
	}
}
AdStrategy.prototype.isJzbApp = function(){
	if(location.href.indexOf("m.jzb.c") >= 0)
		return true;
	return false;
}
AdStrategy.prototype.setClickOutdate = function(time){
	this.clickOutDate = time;
}
AdStrategy.prototype.isClickOutdate = function(ad_id){
	return CookieHelper.get(AD_STRATEGY_COOKIE.CLICK_OUTDATE) == ad_id;
}
AdStrategy.prototype.setClickCookie = function(ad_id){
	if(this.clickOutDate!=-1)
		CookieHelper.set(AD_STRATEGY_COOKIE.CLICK_OUTDATE,ad_id,this.clickOutDate);
}
AdStrategy.prototype.isMatchArea = function(districk,level){
	//登录用户必须判断
	if(this.isLogin()){
		//只在家长帮web端判断
		if(this.isJzbApp()&&this.districkMatch(userInfo.districk)&&this.levelMatch(userInfo.level)){
			return true;
		}else
			return false;
	}else{
		//只在家长帮web端判断
		if(this.isJzbApp()&&typeof f_tags!="undefined"
				&&this.districkMatch(districk)&&this.levelMatch(level)){
			return true;
		}else
			return false;
	}
	return true;
}
AdStrategy.prototype.areaMap= function(area,type){
	var tmp = area.join(","),
			tmpAreaMaps = (type==0)?AD_STRATEGY_DISTRICK:AD_STRATEGY_LEVEL;
	for(var city in tmpAreaMaps){
		tmp.replace(city,tmpAreaMaps[city]);
	}
	return tmp;
}
AdStrategy.prototype.districkMatch= function(tags){
	if(tags != ""){
		var _districk = this.areaMap(tags,0);
		for(var city in AD_STRATEGY_DISTRICK){
			if(_districk.indexOf(city) >= 0){
				return true;
			}
		}
		return false;
	}
	return true;
}
AdStrategy.prototype.levelMatch= function(tags){
	if(tags != ""){
		var _level = this.areaMap(tags,1);
		for(var city in AD_STRATEGY_LEVEL){
			if(_level.indexOf(city) >= 0){
				return true;
			}
		}
		return false;
	}
	return true;
}

/**
* 广告位置类，对广告最后生成的位置设置
*
*/
var AdPosition = function(p,t){
	this.dataP = p;
	if(this.isByLoc()){
		this.wrap = document.createElement("div");
	}else if(this.isById()){
		this.wrap = _.getById(p.loc);
	}else{
		this.wrap = document.createElement("div");
	}
	this.wrap.setAttribute("jzb_ad","1");
}
AdPosition.prototype.isByLoc = function(){
	return this.dataP.type == AP_TYPE.BYLOC;
}
AdPosition.prototype.isById = function(){
	return this.dataP.type == AP_TYPE.BYID;
}
AdPosition.prototype.removeWrap = function(){
	this.removeWrapSize();
	return document.children[0].removeChild(this.wrap);
}
AdPosition.prototype.getTemplete = function(){
	this.getWrap();
	return this.wrap;
}
AdPosition.prototype.setWrapSize = function(w,h,is_full){
	this.wrap.style.width = w;
	this.wrap.style.height = h;
	if(this.isByLoc()&&!is_full)
		document.body.setAttribute("style",(document.body.getAttribute("style")||"")+"padding-"+this.dataP.loc+":"+h);
}
AdPosition.prototype.removeWrapSize = function(w,h){
	if(this.isByLoc())
		document.body.setAttribute("style",(document.body.getAttribute("style")||"")+"padding-"+this.dataP.loc+":0");
}
AdPosition.prototype.getWrap = function(){
	if(this.isByLoc()){
		this.wrap.setAttribute("style","background:none;position:fixed;z-index:999999;");
		this.setLocation(AP_IDENTIFY[this.dataP.loc]);
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

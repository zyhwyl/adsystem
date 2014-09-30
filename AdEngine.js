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
    var k = m.exec(Bi.doc.cookie);
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
* 广告生成类，对模板进行渲染
*
*/
var AdGenerator = function(){
}
AdGenerator.prototype.getAd = function(o){
	this.strategy = new AdStrategy();
	this.position = new AdPosition(o.position);
	this.dataList = o.dataList;
	this.getHtml(this.dataList);
}
AdGenerator.prototype.getHtml = function(){
	this.position.getTemplete();

	for (var i = 0; i < this.dataList.length; i++) {
		var _d = this.dataList[i],
				_tList = _d.data;

		//策略判断 若符合策略 则停止输出模板
		if(this.strategy.isMatch(_d)){
			for(var i in _tList){
				_.log(_tList[i]);
			}
			break;
		}
	};
}
	
/**
* 广告策略类，进行策略判断
*
*/
var AdStrategy = function(){
}
AdStrategy.prototype.isMatch = function(s){
	return true;
}

/**
* 广告位置类，对广告最后生成的位置设置
*
*/
var AdPosition = function(p){
}
AdPosition.prototype.getTemplete = function(){

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
	    clickOutdate: "timestamp",    //点击之后多久不显示 (-1为永久显示)
	    data: [												//物料数据
        {
          html: "string",
          weight: 1,
          css:"",
          type: 0
        }
      ]
	  }
	],
	default: [
		{
	   html: "string",
	   css:"",
	   weight: 1,
	   type: 0 
	  }
  ],
	template: {   //模板
	 width: "100%",  //模板高度 例：100px-像素 100%-百分比 
	 height: "100%"  //模板宽度 例：100px-像素 100%-百分比 
	}
});


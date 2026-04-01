/*
 * async.js
 * @encoding UTF-8
 * @require http://chrhsmt.com/js/namespace.js
 * @author chihiro hashimoto (mailto: chr@chrhsmt.com)
 * @copyright (C) 2008 chihiro hashimoto All rigths reserved.
 */

/* IE DOM 高速化 */
/*@cc_on
var doc = document;
eval('var document = doc');
@*/


/**
 * 非同期クラス
 */
new Namespaced('com.chrhsmt.Asynchronous', function() {

  /*  */
  this.obj = null,

  /**
   * AJAX処理の基本関数
   *
   * @param {String} リクエスト先URL
   * @param {boolean} async true : 
   *                        false : 
   * @param {String} method 'POST(post)' or 'GET(get)'
   * @param {String} reqSentense 'paramName=paramValue(,･･･)'
   * @param {function} fnc 
   *
   */
  this.send = function(pageURL, async, method, reqSentense, fnc) {

    /**
     * ajaxリクエスト生成
     */
    function createHttpRequest() {
        if(window.ActiveXObject) {
            try {
                return new ActiveXObject("Msxml2.XMLHTTP") ;
            } catch (e) {
                try {
                    return new ActiveXObject("Microsoft.XMLHTTP");
                } catch (e2) {
                    return null ;
                }
            }
        } else if(window.XMLHttpRequest) {
            return new XMLHttpRequest() ;
        } else {
            return null ;
        }
    }

   this.obj = createHttpRequest();

   if (this.obj) {
        this.obj.onreadystatechange = fnc;
        if(method == 'POST' || method == 'post') {
            this.obj.open(method, pageURL, async);
            this.obj.setRequestHeader("content-type", "application/x-www-form-urlencoded;charset=UTF-8");
            this.obj.send(reqSentense);
        } else {
            /* 
             * GETではIEでキャッシュされてしまう
             * 回避方法
             * var date = new Date();
             * var timestamp = date.getTime();
             * xmlHttp.open("GET", "script.php?time=" + timestamp, true);
             * もしくは
             * xmlHttp.setRequestHeader("If-Modified-Since", "Thu, 01 Jun 1970 00:00:00 GMT");
             */
            this.obj.open(method, pageURL + '?' + reqSentense, async);
            this.obj.send(null);
        }
        
        // firefoxでは同期の場合にコールバックされないので強制的に呼び出す。
        if (!async && !document.all) {
            fnc();
        }

    }else{
        alert("'XMLHttpRequest??'");
    }
  }        
});

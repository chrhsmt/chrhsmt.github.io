/*
 * base.js
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

//com.chrhsmtオブジェクト作成
new Namespaced('com.chrhsmt', {});

/* contextPath */
com.chrhsmt.contextPath = "/";

/*
 * 共通クラス
 */
new Namespaced('com.chrhsmt.commons', {

  /** onloadタスク保管配列 */
  onload: new Array()

});

/**
 * Utilsクラス
 */
new Namespaced('com.chrhsmt.Util', {

  /**
   * current style element 取得
   * 返却ObjectはReadOnlyな模様。
   * @param {Object} element DOMエレメント
   */
  getCurrentStyle: function(element) {
      var style = element.currentStyle
                  || document.defaultView.getComputedStyle(element, '');
      return style;
  },

  /**
   * error handler
   * @param {Error} e
   */
  errorHandler: function(e) {
      var message = e.name + "\n" + e.message;
      if (e.lineNumber) message += "\nlineNumber : " + e.lineNumber;
      if (e.stack) message += "\nstack : " + e.stack;
      alert(message);
  },

  /**
   * ポップアップウィンドウ表示
   * @param {string} className クラス名
   * @param {object} parent 親要素
   */
  popupWindow: function(className, parent) {
    var elements = document.getElementsByClass(className, parent);
    for (var i = 0, len = elements.length; i < len; i++) {
        elements[i].onclick = function() {return addPopupEvent(this);};
        elements[i].onkeypress= function() {return addPopupEvent(this);};
    }

    /**
     * ポップアップイベント
     * @param {object} element DOMエレメント
     */
    function addPopupEvent(element) {
      var link = element.getAttribute('href');
      window.open(link);
      this.cancelBubble = true;
      return false;
    }
  }
});

//xhtml-strict用popupWindow対策(Aタグ target attribute対策) 
com.chrhsmt.commons.onload.push(function() {
  com.chrhsmt.Util.popupWindow("popupWindow", document.getElementsByTagName('body')[0]);
});

/**
 * onload task
 */
window.onload = function() {
    var tasks = com.chrhsmt.commons.onload;
    for (var i = 0, l = tasks.length; i < l; i++) {
        var task = tasks[i];
        if (task && typeof(task) == "function") task();
    }
}

/*
 *
 */
document.getElementsByClass = function(className, parent) {
  var i, j, eltClass;
  var doc = (parent != null) ? parent : document;
  var objAll = doc.getElementsByTagName ? doc.getElementsByTagName("*") : document.all;
  var objRes = new Array();
  for (var i = 0, l1 = objAll.length; i < l1; i++) {
      eltClass = objAll[i].className.split(/\s+/);
      for (var j = 0, l2 = eltClass.length; j < l2; j++) {
          if (eltClass[j] == className) {
              objRes.push(objAll[i]);
              break;
          }
      }
  }
  return objRes;
}

/*
 * Stringクラスにtrimメソッドを追加
 */
String.prototype.trim = function() {
  return this.replace(/^\s+|\s+$/g, '');
}

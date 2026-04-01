/*
 * timer.js
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
 * Timer処理クラス
 * @param {Number} span インターバル
 * @param {function} processFunction プロセス関数
 * @prama {function} stopConditionFunction 終了評価関数
 */
new Namespaced('com.chrhsmt.commons.Timer', function(span, processFunction, stopConditionFunction) {

  /* タイマーID */
  var timer = null;

  /* 実プロセス関数 */
  var realProcess = null;
  if (typeof(processFunction) == "string") {
    realProcess = new Function(processFunction);
  } else {
    realProcess = processFunction;
  }

  /* スタート */
  this.start = function() {
    timer = window.setInterval(this.process, span);
  }

  /* プロセス */
  this.process = function() {
    realProcess();
    if (stopConditionFunction()) {
        window.clearInterval(timer);
    }
  }
});
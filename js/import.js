/*
 * import.js
 * @encoding UTF-8
 * @require http://chrhsmt.com/js/namespace.js
 * @require http://chrhsmt.com/js/async.js
 * @author chihiro hashimoto (mailto: chr@chrhsmt.com)
 * @copyright (C) 2008 chihiro hashimoto All rigths reserved.
 */

/* IE DOM 高速化 */
/*@cc_on
var doc = document;
eval('var document = doc');
@*/

/*
 * 共通クラス
 */
new Namespaced('com.chrhsmt.Import', {

  /**
   * 静的インポート
   * scriptタグを追加するだけなので、すぐには使用できない。
   * @param {Object} path　コンテキストパス以降のパス
   */
  staticImportScript: function(path) {
    var script = document.createElement("script");
    script.setAttribute("type", "text/javascript");
    script.setAttribute("src", com.chrhsmt.contextPath + path);
    var head = document.getElementsByTagName("head")[0];
    head.insertBefore(script, head.firstChild);
  },

  /**
   * 動的インポート
   * ファイルをXMLHTTPリクエスト(同期)で取得して、評価するので
   * すぐに使用できる。
   * @param {Object} path　コンテキストパス以降のパス
   */
  dynamicImportScript: function(path) {
    if (!com.chrhsmt.Asynchronous) throw new Error('com.chrhsmt.Asynchronousが未宣言です。'); 
    var obj = new com.chrhsmt.Asynchronous();
    //コンテキストパスが宣言されていれば
    if (com.chrhsmt.contextPath != ""
        && typeof(com.chrhsmt.contextPath) != "undefined") {
        obj.send(com.chrhsmt.contextPath + path,
                 false,
                 "POST",
                 "",
                 /** コールバック関数。 */
                 function() {
                     try {
                         if (obj.obj.readyState == 4 && obj.obj.status == 200) {
                             var text = obj.obj.responseText;
                             /*
                              * evalはその関数のスコープに評価式が登録される。
                              * 何も付けなければその時点での関数のスコープ。
                              * 明示的にスコープをプレフィックスのようにつければ
                              * その明示したスコープに登録される。(firefox)
                              * IEは明示しても現在の関数のスコープのよう。
                              * 呼び出すjsにてvarを付けずに変数を定義すればいけるが...。
                              * IEならwindow.execScriptを使用すれば
                              * グローバルスコープに登録される。
                              */
                             if (window.execScript) {
                                 //IE
                                 window.execScript(text, "javascript");
                             } else {
                                //FIREFOX
                                 window.eval(text);
                             }
                         }
                     } catch (e) {
                         alert(e);
                     }
                 });
    } else {
        var msg = "com.chrhsmt.contextPath : ContextPathが未宣言です。";
        throw new Error(msg);
        alert(msg);
    }
  }
});

/*
 * 動的インポート例
 */
/* trimpath-breakpoint-1.0.24.js */
//com.chrhsmt.commons.dynamicImportScript("web/js/trimpath-breakpoint-1.0.24.js");

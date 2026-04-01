/*
 * actRender.js
 * @encoding UTF-8
 * @require http://chrhsmt.com/js/namespace.js
 * @author chihiro hashimoto (mailto: chr@chrhsmt.com)
 * @copyright (C) 2008 chihiro hashimoto All rigths reserved.
 *
 * TODO:FireFoxでDOM解析が途中で終了する...
 *   ==> 2008.10.18 最終＆最深nodeの到達判断により、script errorを投げるよう改修。
 *      ==>そもそもの問題としてメモリリーク？DOM要素が消滅する。
 *
 * 改修メモ：
 * 2008.10.20 高速化の為、スペース文字等は再現しないよう修正。
 * 2008.10.24 静的クラス使用からインスタンス化可能に修正。
 *            timer高速化:amachang[http://d.hatena.ne.jp/amachang/20060114/1137243389].。
 *            base.jsを必要としないよう修正。
 *            namespace.js修正に伴い、objectの作成方法改修。
 *            class名変更(com.chrhsmt.a001 → com.chrhsmt.ui.ActRender)
 */

/* IE DOM 高速化 */
/*@cc_on 
var doc = document;
eval('var document = doc');
@*/

/* special thanx : amachang[http://d.hatena.ne.jp/amachang/20060114/1137243389]. */
var _SIi=10,_SIM='第一引数が不正です。',_SIl=0,_SIc=0,_SIS ='string',_SIF='function',_SIf=window.setInterval,_SIp=[],_SIn=[];window.setInterval=function(p, d){if(typeof p==_SIS)p=new Function(p);else if(typeof p!=_SIF)throw Error(_SIM);var i;for(i=0;;i++)if(!_SIp[i]) break;_SIn[i]= Math.floor(d/_SIi) || 1;_SIp[i]= p;if(_SIl==i)_SIl++;return ++i;};window.clearInterval=function(i){i--;_SIp[i]=undefined;if(!((--_SIl)==i))_SIl++;};_SIf(function(){_SIc ++;for(var i=0;i<_SIl;i++){var p=_SIp[i];if(!(_SIc%_SIn[i])&&p)p();}},_SIi);
/* special thanx : amachang[http://d.hatena.ne.jp/amachang/20060114/1137243389]. */

/* Stringクラスにtrimメソッドを追加 */
String.prototype.trim == undefined ? String.prototype.trim = function() {return this.replace(/^\s+|\s+$/g, '');} : void(0);

/*
 * リアルタイムドキュメント構築クラス
 * @param {string} _parentCssName 処理対象親要素(cssの記述で ex:div#id, p.class)
 */
new Namespaced('com.chrhsmt.ui.ActRender', function(_parentCssName) {

  this.style = null;                                      //body一時非表示用スタイルobject
  this.INTERVAL = 10;                                     //リアルタイム構築タイマーインターバル定数
  this.parentCssName = _parentCssName;                    //対象親要素

  /*
   * 初期化
   * body要素内を非表示化。
   */
  this.init = function() {
    this.style = document.createElement('style');
    this.style.type = "text/css";
    this.style.value = _parentCssName + "{visibility:hidden;}";
    com.chrhsmt.ui.ActRender.head.appendChild(this.style);
  };

  /*
   * 内部クラス start--------------------------------------------------------->
   * リアルタイムドキュメント構築メインクラス
   */
  this.main = {
    IMG: "IMG",               //定数:空タグ「IMG」
    BR: "BR",                 //定数:空タグ「BR」
    HR: "HR",                 //定数:空タグ「HR」
    BLANK: "",                //定数:「""」
    timer: null,              //タイマー
    childNodes: null,         //body直下のnode
    now: null,                //読み込んだDOMの現在のnode
    bodyNow: null,            //構築中の現在のnode
    textBuffer: null,         //textNodeのバッファ
    originTask: null,         //オリジナルonloadタスク
    arrivalFlg: false,        //最終node到達フラグ
    last: null,               //body要素の最終且つ最深要素
    

    /*
     * 繰り返し処理
     */
    go: function() {
      //対象Nodeを取得
      this.now = (this.now == null) ? this.childNodes[0] : this.now;

      if (this.now.nodeType == 3) {
        //textNode
        if (this.bodyNow.tagName != undefined) {
          this.bodyNow.appendChild(document.createTextNode(this.BLANK));
          this.bodyNow = this.bodyNow.lastChild;
        }

        //text処理
        this.textBuffer == null ? this.textBuffer = this.now.nodeValue: void(0);
        var bodyNodeValue = this.bodyNow.nodeValue;
        //構築中bodyのnodeValueと対象のnodeValueが異なり、且つ、対象nodeValueがスペースのみの場合
        if (bodyNodeValue != this.textBuffer && this.textBuffer.trim() != this.BLANK) {
          //TODO:ボトルネック?
          this.bodyNow.nodeValue += this.textBuffer.charAt(bodyNodeValue.length);
    
        } else {
          //バッファ解放
          this.textBuffer = null;
          //何も無ければ次へ
          var nextNowNode = this.now.nextSibling;
          if (nextNowNode != null) {
            this.now = nextNowNode;
            this.bodyNow = this.bodyNow.parentNode
          } else {
            //兄弟要素が無い場合は親を溯る。
            this.searchUpperNode();

            var parent = this.now.parentNode;
            var bodyParent = this.bodyNow.parentNode;
            this.now = (parent != null) ? parent.nextSibling : null;
            this.bodyNow = (bodyParent != null) ? bodyParent.parentNode : null;
            parent = null;
            bodyParent = null;
          }
        }
      } else {
        //tag時

        //tagのみ追加(コメントは無視)
        if (this.now.nodeType != 8) {
          //node複写(サブツリーは使わないの)
          this.bodyNow.appendChild(this.now.cloneNode(false));
         
           var tagName = this.now.tagName.toUpperCase();
           //空タグ時
           if (tagName == this.IMG || tagName == this.BR || tagName == this.HR) {
             if (this.now.nextSibling == null) {
　             //兄弟要素が無い場合は親を溯る。
              this.searchUpperNode();

               var parent = this.now.parentNode;
               var bodyParent = this.bodyNow.parentNode;
               this.now = (parent != null) ? parent.nextSibling : null;
               this.bodyNow = (bodyParent != null) ? bodyParent : null;
               parent = null;
               bodyParent = null;
             } else {
               this.now = this.now.nextSibling;
             }
           } else {
             //対象を内部文字へ
             this.now = this.now.firstChild;
             //追加した要素へ対象を移す
             this.bodyNow　= this.bodyNow.lastChild;
          }
        } else {
          //コメント時
          this.now = this.now.nextSibling;
        }
      }

      //最終node到達判断
      this.now == this.last ? this.arrivalFlg = true: void(0);

      //DOM解析＆構築終了判断
      if (this.now == null) {
        //タイマー解除
        clearInterval(this.timer);
        //オリジナルonloadタスク起動
        this.originTask != null ? this.originTask() : void(0);
        //未到達時はscript error
        if (!this.arrivalFlg) {
          throw new Error('DOM analyze error. please refresh your browzer.');
        }
      }
    },

    /*
     * 上部の有効なnode検索
     */
    searchUpperNode: function() {
      for (;pNode = this.now.parentNode, pNode != null && pNode.nextSibling == null;) {
          this.now = pNode;
          this.bodyNow = this.bodyNow.parentNode;
      }
    }
  }
  /*
   * 内部クラス end----------------------------------------------------------->
   */

  //taskに自objectを設定
  com.chrhsmt.ui.ActRender.tasks.push(this);
});

/* staticメンバ */
  /* 処理タスク */
  com.chrhsmt.ui.ActRender.tasks = new Array();
  /* headタグエレメント */
  com.chrhsmt.ui.ActRender.head = document.getElementsByTagName('head')[0];   //DOMのheadエレメント
/* staticメンバ */


/* staticメソッド */    
  /* 
   * ロード処理
   * @param {object} originTask オリジナルonloadタスク
   */
  com.chrhsmt.ui.ActRender.load = function(originTask) {
    var SHARP = '#';
    var DOT = '.';
    var BODY = 'body';
    var INTERVAL_PHRASE_1 = 'com.chrhsmt.ui.ActRender.tasks[';
    var INTERVAL_PHRASE_2 = '].main.go()';
    var BLANK = "";
  
    for (var i = 0, len = this.tasks.length; i < len; i++) {
      var task = this.tasks[i];
      var parent = null;
      //id
      if (task.parentCssName.indexOf(SHARP) != -1) {
        var index = task.parentCssName.indexOf(SHARP) + 1;
        parent = document.getElementById(task.parentCssName.substring(index));
      //class
      } else if (task.parentCssName.indexOf(DOT) != -1) {
        var index = task.parentCssName.indexOf(DOT) + 1;
        var body = document.getElementsByTagName(BODY)[0];
        parent = document.getElementsByClass(task.parentCssName.substring(index), body)[0];
      //tag
      } else {
        parent = document.getElementsByTagName(task.parentCssName)[0];
      }

      //cloneしないと後でbody要素をremoveした時に他の要素まで消える。
      var main = task.main;
      main.childNodes = parent.cloneNode(true).childNodes;
      main.bodyNow = parent;
      main.originTask = originTask;

      //要素除去
      parent.innerHTML = BLANK;

      //非表示解除
      this.head.removeChild(task.style);
      //タイマースタート
//      main.timer = window.setInterval(INTERVAL_PHRASE_1 + i + INTERVAL_PHRASE_2, task.INTERVAL);
      main.timer = window.setInterval((function(){
        return new Function(INTERVAL_PHRASE_1 + i + INTERVAL_PHRASE_2);
      })(), task.INTERVAL);
      task.head = null;
      task.style = null;
      this.getLastDeepestNode(main.childNodes, task);
    }
  };
  
  /*
   * 最終且つ最深node取得
   * @param {Array} childNodes　body直下のnode群
   * @param {object} task 処理タスク
   */
  com.chrhsmt.ui.ActRender.getLastDeepestNode = function(childNodes, task) {
    var last = childNodes[childNodes.length - 1];
    for (;;) {
      if (last.nodeType == 3 && last.nodeValue.trim() == "") {
        last = last.previousSibling;
      } else if (last.lastChild != null && last.lastChild != undefined) {
        last = last.lastChild;
      } else {
        task.main.last = last;
        break;
      }
    }
  };
/* staticメソッド */    

//現状onload処理に挿入
var load = window.onload;
window.onload = function() {
  com.chrhsmt.ui.ActRender.load(load);
}

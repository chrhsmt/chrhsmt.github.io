/*
 * rect.js
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

/*
 * @param {Number} multiple 画像の多重度
 * @param {string} targetClassName 対象クラス名
 * @param {object} parent (optional) 対象の親要素
 */
new Namespaced('com.chrhsmt.Rect', function(multiple, targetClassName, parent) {

  this.INTERVAL = 30;
  this.img = null;
  var PIXEL_COMMA = "px,";
  var PIXEL_END = "px)";
  var RECT = 'rect(';
  var BLANK = '';
  var ABSOLUTE = 'absolute';
  this.leftPad = 0;
  this.rightPad = 0;
  this.topPad = 0;
  this.botmPad = 0;

  this.go = function() {
    var img = this.img, height, width;
    for(var i = 0; i < img.length; i++){
        height = img[i].height;
        width = img[i].width;
        img[i].style.clip =
          RECT + Math.random() * (height + this.botmPad) + PIXEL_COMMA
               + Math.random() * (width + this.leftPad) + PIXEL_COMMA
               + Math.random() * (height + this.topPad) + PIXEL_COMMA
               + Math.random() * (width + this.rightPad) + PIXEL_END;
    }
  }

  //元画像要素取得
  this.img = document.getElementsByClass(targetClassName, parent);

	//多重化
	parent == null ? parent = this.img[0].parentNode : void(0);
	this.img[0].style.position = ABSOLUTE;
	for (var i = 1; i < multiple; i++) {
	  var clone = this.img[0].cloneNode(false);
	  parent.insertBefore(clone, this.img[0]);
	  this.img[i] = clone;
	}

  //padding取得
  var style = this.img[0].style;
  this.leftPad = style.paddingLeft.replace(/px/g, BLANK);
  this.rightPad = style.paddingRight.replace(/px/g, BLANK);
  this.topPad = style.paddingTop.replace(/px/g, BLANK);
  this.botmPad = style.paddingBottom.replace(/px/g, BLANK);

	com.chrhsmt.Rect.tasks == null ? com.chrhsmt.Rect.tasks = new Array() : void(0);
	com.chrhsmt.Rect.tasks[targetClassName] = this;

//  window.setInterval('com.chrhsmt.Rect.tasks["' + targetClassName + '"].go()', this.INTERVAL);
  window.setInterval((function(){
    return new Function('com.chrhsmt.Rect.tasks["' + targetClassName + '"].go()');
  })(), this.INTERVAL);

});

/* static */
com.chrhsmt.Rect.tasks = new Array();

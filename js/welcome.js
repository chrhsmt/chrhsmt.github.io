document.write('<script type="text/javascript" src="js/rect.js"></script>')
//注:ここで変数宣言するとIE6ではcom変数が初期化されてしまう。
//var com;

//onload
com.chrhsmt.commons.onload.push(function(){
  new com.chrhsmt.Rect(3, 'meImg', document.getElementById('img'));
});

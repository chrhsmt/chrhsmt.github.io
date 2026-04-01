/**
 * 名前空間用js
 * @encoding UTF-8
 * @author chihiro hashimoto (mailto: chr@chrhsmt.com)
 * @copyright (C) 2008 chihiro hashimoto All rigths reserved.
 *
 * 改修メモ：
 * 2008.10.25 evalの回数を減らす。
 */

/*
 * 名前空間付きobject作成クラス
 * @param {string} packagedObjectName パッケージ+オブジェクト名
 * @param {object} obj オブジェクトorコンストラクタ関数
 * @throws {Error} 名前空間が既存のオブジェクトと被った場合
 *
 * ex:
 * [オブジェクト作成]
 * new Namespaced('com.chrhsmt.obj', {
 *   variable: '',
 *   method: function() {}
 * });
 *
 * [クラス作成]
 * new Namespaced('com.chrhsmt.Class', function(){});
 */
function Namespaced(packagedObjectName, obj){
  var DOT = '.';
  var EXPRESSION_TEMPLATE =
    "if(!tmp){tmp={};}else if(typeof(tmp)!='object'){throw new Error('Namespace error');}";
  var ns = packagedObjectName.split(DOT);
  var here = 'window';
  var expression = '';
  obj == null ? obj = {} : void(0);

  //評価式文構築
  for (var i = 0, l = ns.length; i < l; i++){
    var tmp = here + DOT + ns[i];
    expression += EXPRESSION_TEMPLATE.replace(/tmp/g, tmp);
    here = tmp;
  }

  //オブジェクト代入式
  expression += here + ' = obj;';
  //評価
  eval(expression);
}

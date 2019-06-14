var fs=require('fs');
var path = require('path');

var cache = {}; 
var files = {}; 
var VIEW_FOLDER = '../view'; 
//模板引擎 在 res.render 
function myRender(req,res,next){
    res.render = function (viewname, data) { 
    if (!cache[viewname]) { 
        var text; 
        console.log('path: ',path.join(__dirname,VIEW_FOLDER, viewname));
        try { 
            text = fs.readFileSync(path.join(__dirname,VIEW_FOLDER, viewname), 'utf8'); // 同步读取
        } catch (e) {
            res.writeHead(500, {'Content-Type': 'text/html'}); 
            res.end('模板文件错误'); 
            return; 
        } 
        cache[viewname] = complie(text); // 将编译好的模板保存
    } 
    var complied = cache[viewname]; 
    res.writeHead(200, {'Content-Type': 'text/html'}); 
    var html = complied(data,escape); 
    res.end(html); 
    }; 
    next();
}
// 6 13 一个上午找出来的bug -_- 
function complie(str){
    if (str.match(/<%\s+(include.*)\s+%>/)) {  //如果包含include,则说明有子模板
        var str = preComplie(str);  // 预解析子模板
        var tpl = str.replace(/\r\n/g, '\\n'); // 如果有子模板的话，回车换行\r\n
    }else{
        var tpl = str.replace(/\n/g, '\\n'); // 没有的话，直接\n
    } 
     tpl = tpl.replace(/<%=([\s\S]+?)%>/g, function (match, code){
    // 转义,主要是将数据转义
    return "' + escape(" + code + ") + '"; 
    }).replace(/<%-([\s\S]+?)%>/g, function (match,code) { 
    // 正常输出
    return "' + " + code + "+ '"; 
    }).replace(/<%([\s\S]+?)%>/g, function (match, code) { 
    // 可执行代码，模板逻辑
    return "';\n" + code + "\ntpl += '"; 
    }).replace(/\'\n/g, '\'') 
    .replace(/\n\'/gm, '\''); 

   console.log('tpl= ',tpl);
   tpl = "tpl = '" + tpl + "';"; 
 // 转换空行
 tpl = tpl.replace(/''/g, '\'\\n\''); 
 tpl = 'var tpl = "";\nwith (obj || {}) {\n' + tpl + '\n}\nreturn tpl;'; 

 return new Function('obj', 'escape', tpl);  
}


// 子模板
 function preComplie(str) { 
    //include 后面跟的是子模板文件名
    var replaced = str.replace(/<%\s+(include.*)\s+%>/g, function (match, code) { 
    var partial = code.split(/\s/)[1]; 
    if (!files[partial]) { 
        files[partial] = fs.readFileSync(path.join(__dirname,VIEW_FOLDER, partial), 'utf8'); 
    } 
         return files[partial]; 
    }); 
    //用来处理嵌套模板
    if (str.match(/<%\s+(include.*)\s+%>/)) { 
        return preComplie(replaced); 
    } else { 
        return replaced; 
    } 
}; 

//转义 xss漏洞的产生大多和模板有关，所谓转义就是将能形成HTML标签的字符转换成安全的字符
// & < > 、 "" ''
// 
function escape(html) { 
 return String(html) 
 .replace(/&(?!\w+;)/g, '&amp;') 
 .replace(/</g, '&lt;') 
 .replace(/>/g, '&gt;') 
 .replace(/"/g, '&quot;') 
 .replace(/'/g, '&#039;'); 
}; 

module.exports=myRender;


/*将render 拆分成 complied 和 res.render两个函数*/
/*var render = function (viewPath, obj) { 
  fs.readFile(viewPath,'utf-8',function(err,str){
     if(err){ 
     	throw err; 
     	return; }

     console.log(typeof str);

 var tpl = str.replace(/\n/g, '\\n') 
 .replace(/<%=([\s\S]+?)%>/g, function (match, code){
 // 转义,主要是将数据转义
 return "' + escape(" + code + ") + '"; 
 }).replace(/<%-([\s\S]+?)%>/g, function (match,code) { 
 // 正常输出
 return "' + " + code + "+ '"; 
 }).replace(/<%([ % \s\S]+?)%>/g, function (match, code) { 
 // 可执行代码，模板逻辑
 return "';\n" + code + "\ntpl += '"; 
 }).replace(/\'\n/g, '\'') 
 .replace(/\n\'/gm, '\''); 


 tpl = "tpl = '" + tpl + "';"; 
 // 转换空行
 tpl = tpl.replace(/''/g, '\'\\n\''); 
 tpl = 'var tpl = "";\nwith (obj || {}) {\n' + tpl + '\n}\nreturn tpl;'; 
 var fn= new Function('obj', 'escape', tpl); 

 console.log(fn(obj,escape));

}); 

 
} */


/*
< %if (user) {% > 
 <h2><% = user.name %></h2> 
<% } else { %>  
 <h2>名用户</h2> 
< } > 
加上模板逻辑，结果为：
function (obj, escape) { 
 var tpl = ""; 
 with (obj) { 
 if (user) { 
 tpl += "<h2>" + escape(user.name) + "</h2>"; 
 } else { 
 tpl += "<h2>ై名用户</h2>"; 
 } 
 } 
 return tpl; 
} 
render('about.html', {
    title: '自我介绍',
    img: 'https://ps.ssl.qhimg.com/sdmt/104_132_100/t0171a9f9b9f6db621c.webp',
    name: 'xxx',
    sex: 'female',
    hobby: 'Reading Running'
  });
*/


/*加上模板引擎
ejs.renderFile(filename, data, options, function(err, str){
    // str => Rendered HTML string
});
*/
var path = require('path');
var ejs = require('ejs');
function addRender(req,res,app){
   
   res.render=function(tplPath,data){
   console.log(app.get('view')); //放模板的文件夹 tplPath 具体的模板文件
   var fullPath = path.join(app.get('view'),tplPath);
    
   /*fullPath 模板文件的路径， data 要转换文件的内容 str 转换结果*/
    ejs.renderFile(fullPath, data, {}, function(err, str){
      if(err){
         res.writeHead(503,'System error');
         res.end();
      }else{

         res.setHeader('content-type', 'text/html')
         res.writeHead(200, 'Ok')
         res.write(str)
        res.end() 
      }
     });
   }
  }
  module.exports=addRender;
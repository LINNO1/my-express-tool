var path = require('path');
var url = require('url');
var fs=require('fs');
var readFile = require('./readFile');
var cache = require('./cache');


/*核心： 发布订阅模式 app.use()相当于一个容器，把所有要执行的任务放在里面
通过 next()来执行*/

function express() {
  
  var routes=[];
  var app = function (req, res){
     var routeInx=0;
     /*初始化 req.render req.query req.body */

    /* bodyParse(req); 
     addQuery(req);
     
     Mime(req,res);
     addRender(req,res,app);*/
     next();
    //遍历这个taskArr,执行其中的函数,注意 next()只往下执行一个
     /*function next(){
       var task = taskArr[i++];
       if(!task){ return }
       var pathname = url.parse(req.url,true).pathname;
      //如果是中间间或者是路由匹配上了
         if(task.routePath===null||task.routePath===pathname){ 
              
          task.middleWare(req,res,next);
       }else{
        // 否则下一个
        next()
      }    
    }*/
    //解决： 用正则来完成手工映射 配套的next()
function next() { 
    
    var route=routes[routeInx++];
    console.log(routes);
    console.log('routeInx=',routeInx);
    if(!route){ return; } 

    var pathname = url.parse(req.url).pathname;  
    if(route.routePath===null){
      route.middleWare(req,res,next);
    }else{
      var reg = route.routePath.regexp; 
      var keys = route.routePath.keys; 
      var matched = reg.exec(pathname); 
      console.log('正则匹配路由= ',matched)
      if(matched) { 
        var params = {}; 
        for (var i = 0;i<keys.length; i++) { 
              var value = matched[i + 1]; 
              if (value){ 
               params[keys[i]] = value; 
              } 
         } 
        req.params = params; 
        route.middleWare(req,res,next);               
      }else{
           next(); 
      } 
                     
    }                             
  } 
}

  // es5 的写法 

   app.data = {};
   app.set = function(key,value){
      app.data[key]=value;
    }
   app.get = function(key){
     return app.data[key];
   }

// 这里的use是用手工映射 好处：url十分灵活 缺点：用户数多手工维护不太可能
// 比如 /profile/jacksontian   /profile/hoover /profile/xxx /profile/yyy ...
// 不可能一个个手动添加路由 解决： 用正则来完成手工映射 
 /* app.use = function(routePath,middleWare){
    if(typeof(routePath)==='function'){
        taskArr.push({
          routePath: null,
          middleWare: routePath
        })
    }else{
      taskArr.push({
          routePath: routePath,
          middleWare: middleWare
        })
    }
  };*/
//解决： 用正则来完成手工映射
   app.use = function (routePath,middleWare) { 
   
      if(typeof(routePath)==='function'){
        routes.push({
          routePath: null,
          middleWare: routePath
        })
    }else{
      routes.push({
          routePath: pathRegexp(routePath),
          middleWare: middleWare
      })
    }
   } 

function pathRegexp(path) { 
  var keys=[];
 path = path.replace(/\/\(/g, '(?:/') 
 .replace(/(\/)?(\.)?:(\w+)(?:(\(.*?\)))?(\?)?(\*)?/g, function(_, slash, format, key, capture, 
optional, star){ 
  keys.push(key); 
 slash = slash || ''; 
 return '' 
 + (optional ? '' : slash) 
 + '(?:' 
 + (optional ? slash : '') 
 + (format || '') + (capture || (format && '([^/.]+?)' || '([^/]+?)')) + ')' 
 + (optional || '') 
 + (star ? '(/*)?' : ''); 
 }) 
 .replace(/([\/.])/g, '\\$1') 
 .replace(/\*/g, '(.*)'); 
 //return new RegExp('^' + path + '$'); //返回一个正则   /^\/profile\/(?:([^\/]+?))$/  或 /^\/profile\/(?:([^\/]+?))/?$/
return { 
 keys: keys, 
 regexp: new RegExp('^' + path + '$') 
 }; 
//{ keys: [ 'username' ], regexp: /^\/profile\/(?:([^\/]+?))$/ }
} 



  return app;

}

express.static=function(staticPath){
  return function(req,res,next){
          var pathObj = url.parse(req.url,true);
        
          if(pathObj.pathname==='/'){
              pathObj.pathname+='index.html';
          }   
         
         var filePath = path.join(staticPath,pathObj.pathname); 
         console.log('静态页面: ',filePath); 
        /* fs.readFile(filePath,'binary',function(err,content){
             if(err){
                  console.log('静态页面读取出错')
                  next();
             }else{
                  res.setHeader('Content-Type','text/html');
                  res.writeHeader(200,'ok~');
                  res.write(content,'binary');
                  res.end();
                  console.log('通信关闭了~~~')
             }

         })*/
         //静态文件加上缓存处理
          cache.handleCache(req,res,filePath,next);
          //cache.handleCacheEtag(req,res,filePath,next);
  } 
}
module.exports=express;

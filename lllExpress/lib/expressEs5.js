var url = require('url');
var readFile = require('./readFile');
var path = require('path');
/*模板引擎*/
var addRender = require('./addRender');
var Mime = require('./mime.js');
//自己写的bodyParse.js
var bodyParse = require('./bodyParse.js');
/*核心： 发布订阅模式 app.use()相当于一个容器，把所有要执行的任务放在里面
通过 next()来执行*/

function express() {
  var taskArr=[];
  var app = function (req, res){
  	 var i=0;
  	 /*初始化 req.render req.query req.body */
     addQuery(req);
     bodyParse(req); 
     Mime(req,res);
     addRender(req,res,app);
     next();
  	//遍历这个taskArr,执行其中的函数,注意 next()只往下执行一个
     function next(){
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
    }

   /* function next(){
    	var pathname = url.parse(req.url,true).pathname;
    	taskArr.forEach(function(task){
    	 
  		//如果是中间间或者是路由匹配上了
         if(task.routePath===null||task.routePath===pathname){ 	 	
         	task.middleWare(req,res,next);        	
  		 }
    	})
    }
  		*/
  } // es5 的写法 

   app.data = {};
   app.set = function(key,value){
      app.data[key]=value;
    }
   app.get = function(key){
     return app.data[key];
   }

  app.use = function(routePath,middleWare){
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
  };

  

  return app;
}

express.static=function(staticPath){
	return function(req,res,next){
          var pathObj = url.parse(req.url,true);
        
          if(pathObj.pathname==='/'){
    		 pathObj.pathname+='index.html';
   			}   
   		   console.log(staticPath);
  		   var filePath = path.join(staticPath,pathObj.pathname);  
  		   readFile(filePath,req,res, next);  
           
	}

  
}

function addQuery(req){
	 var pathObj = url.parse(req.url,true);
     req.query=pathObj.query;
     console.log("req.query=");
     console.log(req.query);
}


module.exports=express;

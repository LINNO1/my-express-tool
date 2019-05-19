
var path = require('path');
var url = require('url');
var readFile = require('./lib/readFile.js');
var express = require('./lib/expressEs5.js');
/* npmjs 上的工具*/
//var bodyParser = require('body-parser');
/*模板引擎*/
var addRender = require('./lib/addRender.js');
var Mime = require('./lib/mime.js');
//自己写的bodyParse.js
var bodyParse = require('./lib/bodyParse.js');
//处理cookie
var cServer=require('./lib/cookieServer.js');
//处理session
var sessionSev = require('./lib/session.js');
//bassic 认证
var authorization = require('./lib/authorize.js');


//express 是个函数，执行结果是return出 function(req,res){}
let app = express();


/*var urlencodedParser = bodyParser.urlencoded({ extended: false })
app.use(urlencodedParser);*/


//加上静态路由
//express.static()是个函数，返回的结果也是函数( function(req,res,next){})
app.use(express.static(path.join(__dirname,'public')));

//app.use(pathname, fn )是个静态函数，参数有2个 
app.use(function(req,res,next){
	console.log('middleware 1');
	next();
})




app.use(function(req,res,next){
	console.log('middleware 2');
	next();
})
app.use(addQuery);
app.use(bodyParse);
app.use(Mime);
app.use(function(req,res,next){addRender(req,res,app);next();});
app.use(handleCookie);
app.use(sessionSev.handleSessionCook); //基于cookie的session实现
//app.use(sessionSev.handleSessionURL); //基于url的session实现
//只对访问该路径的用户进行basic认证
app.use('/loadNews.json',authorization);
app.use('/loadNews.json',function(req,res){	
	readFile(path.join(__dirname,'public','src','loadNews.json'),req,res);
})

app.use('/loadMore',function(req,res){	
	var data=[];
    var curIndex =req.query.index? parseInt(req.query.index):parseInt(req.body.index);
    var length =req.query.length? parseInt(req.query.length):parseInt(req.body.length);           
    //模拟消息延迟
    // setTimeout( function(){
    for(var i=0;i<length;i++){
         data.push('内容'+(parseInt(curIndex)+i))
     }
    res.end(JSON.stringify(data));
})


app.use('/zhubao.json',function(req,res){	
	readFile(path.join(__dirname,'public','src','zhubao.json'),req,res);
})


 /* 使用模板引擎*/
/*放模板文件的地址*/
app.set('view', path.join(__dirname, 'view'))
app.use('/about', function(req, res){
  res.render('about.html', {
    title: '自我介绍',
    img: 'https://ps.ssl.qhimg.com/sdmt/104_132_100/t0171a9f9b9f6db621c.webp',
    name: 'LLL',
    sex: 'female',
    hobby: 'Reading Running'
  })
})
 app.use(function(req,res){
	res.end(404,'not found -_-');
})


 function handleCookie(req,res,next){
  //对请求头中的cookie解析，并挂在req上,记录访问次数
    req.cookies=cServer.cookieParse(req.headers.cookie);
  if(!req.cookies||!req.cookies.isVisited){
    res.setHeader('Set-Cookie',cServer.cookieSerilize('isVisited','1'));    
  }else{
    res.setHeader('Set-Cookie',cServer.cookieSerilize('isVisited',parseInt(req.cookies.isVisited)+1));   
  }
  next(); //如果没有写 res.end()请next(),否则报错 Provisional headers are shown，即上一次的请求没有关闭
}
function addQuery(req,res,next){
     var pathObj = url.parse(req.url,true);
     req.query=pathObj.query;
     console.log("req.query= ",req.query);
     next();
    
}
 module.exports=app;
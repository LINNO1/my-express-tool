
var path = require('path');
var url = require('url');
var readFile = require('./lib/readFile');
var express = require('./lib/expressEs5.js');
/* npmjs 上的工具*/
var bodyParser = require('body-parser');
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
 module.exports=app;
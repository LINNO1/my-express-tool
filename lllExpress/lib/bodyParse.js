/*将请求参数挂在 req.query req.body上*/
var url = require('url');
var iconv = require('iconv-lite'); //内置转码模块
function bodyParse(req,res,next){
   if(!hasBody(req)){ 
       next();
   }else if(mime(req)==='multipart/form-data'){
       next();
   }else{
    console.log('bodyParse...')
      var pathObj = url.parse(req.url,true);

      //var data ='';
      var data=[];
      var size=0;


      req.on('data',function(chunk){
         console.log(typeof chunk)
         //data+=chunk;  // 实质 data+=chunk.toString(); chunk是buffer对象,可能会因截断而出现乱码
         data.push(chunk);
         size += chunk.length; 
         console.log("chunk= ",chunk);
       }).on('end',function(){    
         console.log("body= ",data);     
         var buf = Buffer.concat(data, size); 
         var str = iconv.decode(buf, 'utf8'); 
         req.body = parseBody(str); // data='?a=1&b=2' req.body={a:1,b:2}
         console.log("req.body= ",req.body);
         next(); //注意:异步，next()放在这里!!!!
       })
      
        // next();
   } 
} 

function parseBody(data){
	var obj={}
	
	data.split('&').forEach(function(ele){
       obj[ele.split('=')[0]]=ele.split('=')[1];
	})
    return obj;
}

function hasBody(req){
  //根据请求头的'content-length'来判断是否有请求体

  return  req.headers['transfer-encoding']||req.headers['content-length'];
}

var mime = function (req) { 
  var str = req.headers['content-type'] || ''; 
  return str.split(';')[0]; 
};
module.exports=bodyParse;
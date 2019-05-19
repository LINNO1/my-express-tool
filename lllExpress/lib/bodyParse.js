/*将请求参数挂在 req.query req.body上*/
var url = require('url');
var iconv = require('iconv-lite'); //内置转码模块
function bodyParse(req,res,next){
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
    
   })
   next();
} 

function parseBody(data){
	var obj={}
	
	data.split('&').forEach(function(ele){
       obj[ele.split('=')[0]]=ele.split('=')[1];
	})
    return obj;
}

module.exports=bodyParse;
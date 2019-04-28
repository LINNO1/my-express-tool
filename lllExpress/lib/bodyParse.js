/*将请求参数挂在 req.query req.body上*/
var url = require('url');
function bodyParse(req){
   var pathObj = url.parse(req.url,true);
   var data ='';
   req.on('data',function(chunk){
   	  data+=chunk;
   	  console.log("chunk=");
        console.log(chunk);
   }).on('end',function(){
    	
    	console.log("body=");
      console.log(data);
      req.body = parseBody(data); // data='?a=1&b=2' req.body={a:1,b:2}
      console.log("req.body=");
      console.log(req.body);
   })

} 

function parseBody(data){
	var obj={}
	
	data.split('&').forEach(function(ele){
       obj[ele.split('=')[0]]=ele.split('=')[1];
	})
    return obj;
}

module.exports=bodyParse;
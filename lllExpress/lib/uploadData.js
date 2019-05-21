var xml2js = require('xml2js');  //npmjs里的xml转json模块
var formidable = require('formidable');  //npmjs里的基于流逝处理解析报文


//content-type: xx;charset=utf8 取出第一个
var mime = function (req) { 
  var str = req.headers['content-type'] || ''; 
  return str.split(';')[0]; 
}; 

function hasBody(req){
  //根据请求头的'content-length'来判断是否有请求体
  return  req.headers['transfer-encoding']||req.headers['content-length'];
}

function parseJSON(req,res,next){
 
   try { 
 		req.body = JSON.parse(req.body); 
 	  } catch (e) { 
 		res.writeHead(400); 
 		res.end('Invalid JSON'); 
 		return; 
   } 
   next();
}
function parseXML(req,res,next){
	
   xml2js.parseString(req.body, function (err, xml) { 
     if (err) { 
      res.writeHead(400); 
      res.end('Invalid XML'); 
      return; 
     } 
      req.body = xml; 
      next();
    }); 
} 

/*
后台的post 方式 用formidable的流式解析器 
代替 req.on('data',fn1).on('end',fn2)事件
formidable可处理大型文件上传 
上面 bodyParse 已经处理过了

   */
function parseMultipart(req,res,next){
	
	var form = new formidable.IncomingForm();
/*	form.on('progress', function(bytesReceived, bytesExpected) {
   	var percent = Math.floor(bytesReceived/bytesExpected*100);
   	console.log(percent+'%');
   	res.write(percent+'%');
  });*/

    form.parse(req,function(err,fields,file){
    	if(err){
           res.writeHead(400); 
           res.end('Invalid Multipart'); 
            return; 
    	}else{
    		
    		console.log(fields);
    		console.log(file);
    		
    	}
    })
    form.on('end',function(){  	
    	res.end('upload complete')
    })

}
function handleBodyData(req, res, next) { 
	 console.log('处理请求消息体');
	
 	if (hasBody(req)) {  //如果有上传数据
         
       console.log(mime(req))
 		 //判断上传数据的类型
        switch(mime(req)){
 			case 'application/json':
 			       console.log('application/json')
                   parseJSON(req,res,next); 
                   break;
            case 'application/xml':
                   console.log('application/xml')
                   parseXML(req,res,next); 
                   break;          
            case 'multipart/form-data':
                console.log('multipart/form-data')
                  parseMultipart(req,res,next); 
                   break;   
            default:  console.log('next...');
                
                 next();    
        }
}
 		
} 
module.exports=handleBodyData;
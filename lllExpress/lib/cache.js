var fs=require('fs');
var crypto = require('crypto');
const EXPIRE_TIME=10 * 365 * 24 * 60 * 60 * 1000;
/*---------条件请求处理缓存请求，就是在普通的get请求头加上if-modified-since---------------------*/
/*缺点：1 文件的时间戳改动但内容不一定改动 2 更新频繁的内容无法生效*/
var handleCache = function (req,res,filename,next) { 
   fs.stat(filename, function (err, stat) { 
   	  if(err){
   	  	next()
   	  }else{
 		var lastModified = stat.mtime.toUTCString(); //获得文件修改的最后时间
 		if (lastModified === req.headers['if-modified-since']){  //若文件没有更新
 			res.writeHead(304, "Not Modified"); 
 			res.end(); 
 		} else { 
 			fs.readFile(filename, function(error, file) { //重新读文件
 		    var lastModified = stat.mtime.toUTCString(); 
 			res.setHeader("Last-Modified", lastModified); 
 			res.writeHead(200, "Ok"); 
 			res.end(file); 
 		   }); 

   	    }		
   } 
})}
/*---------------用http 1.1 的ETag处理缓存请求-------------*/
var handleCacheEtag = function (req,res,filename,next) { 
 	fs.readFile(filename, function(err, file) { 
        if(err){
        	next();
        }else{
            var hash = getHash(file); //根据文件内容生成散列值
 			var noneMatch = req.headers['if-none-match']; 
 			if (hash === noneMatch) {  //判断与上次的值是否相同
 				res.writeHead(304, "Not Modified"); 
 				res.end(); 
 			} else {  //不同的话返回新的内容
//收到ETag: "83-1359871272000"后，下次请求头会设置 If-None-Match:"83-1359871272000"。
 				res.setHeader("ETag", hash); 
 				res.writeHead(200, "Ok"); 
 				res.end(file); 
 			} 
        }
 		
 }); 
}; 
/*根据 文件内容 生成散列值*/
var getHash = function (str) { 
   var shasum = crypto.createHash('sha1'); 
   return shasum.update(str).digest('base64'); 
}; 

/*---------------用http1.0的Expires 直接告诉浏览器要不要使用本地缓存----------*/
//好处：浏览器不会发送条件请求，节省时间
var handleCacheExpire = function (req, res){ 
 	fs.readFile(filename, function(err, file) { 
 		var expires = new Date(); 
 		expires.setTime(expires.getTime() + EXPIRE_TIME); 
 		res.setHeader("Expires", expires.toUTCString()); 
 		res.writeHead(200, "Ok"); 
 		res.end(file); 
})}
/*-------Cache-Control 能解决服务端和客户端时间的不一致问题，设max-age,且改值UI覆盖Expire的值*/
var handleCacheControl = function (req, res) { 
 fs.readFile(filename, function(err, file) { 
 res.setHeader("Cache-Control", "max-age=" + EXPIRE_TIME); 
 res.writeHead(200, "Ok"); 
 res.end(file); 
 }); 
}; 

 exports.handleCache=handleCache;
 exports.handleCacheEtag=handleCacheEtag;
 exports.handleCacheExpire=handleCacheExpire;
 exports.handleCacheControl=handleCacheControl;
/*

//    获取文件的大小；
    console.log(stats.size);
//    获取文件最后一次访问的时间；
    console.log(stats.atime.toLocaleString());
//    文件创建的时间；
    console.log(stats.birthtime.toLocaleString());
//    文件最后一次修改时间；
    console.log(stats.mtime.toLocaleString());
//    状态发生变化的时间；
    console.log(stats.ctime.toLocaleString())
//判断是否是目录；是返回true；不是返回false；
    console.log(stats.isFile())
//    判断是否是文件；是返回true、不是返回false；
    console.log(stats.isDirectory())
})
*/
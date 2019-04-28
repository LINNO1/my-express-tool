//用来设置 response 的content-type 否则，返回时浏览器解析会出错
  var mime = require('mime-types');
 var url = require('url')
  function Mime(req,res){
    var pathObj = url.parse(req.url,true);
    var mimeType = mime.lookup(pathObj.pathname);
    console.log("pathObj.pathname",pathObj.pathname)
    console.log(mimeType);
    res.setHeader('content-type',mimeType);
  }
module.exports=Mime;
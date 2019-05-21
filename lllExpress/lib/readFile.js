const fs = require('fs');




function readFile(filePath,req,res,next){

       fs.readFile(filePath,'binary',function(err,fileContent){
        
            
            if(err){
                   /*res.writeHead(404,'errer ///');
                   res.write('<h1>出错了</h1>');
                   res.end();*/
                   next();
            }else{
                   if(req.method.toLowerCase() ==='post'){
                        var curIndex =parseInt(req.body.index);
                        var length =parseInt(req.body.length); 
                   }else{
                        // pathObj.query.index length 是字符串，转为数值
                        var curIndex =parseInt(req.query.index);
                        var length =parseInt(req.query.length); 
                     
                   }                            
                      //fileContent 是的字符串，转为数组                  
                        fileContent=JSON.parse(fileContent); 
                        console.log(curIndex)    
                        //截取相应的内容       
                        var beginc = length*(curIndex-1);
                        var  endc =  curIndex*length;
                        var data = fileContent.slice(beginc,endc);  //silce(beg,end-1)的数据
                       /* console.log(curIndex);
                        console.log(length) 
                        console.log(data.length)   */ 
                        // 与前端约定的是JSON格式      
                          var senddata = {
                            status: 0,
                            data: data
                          }    
                                                
                          res.writeHead(200,'ok~');                           
                          res.write(JSON.stringify( senddata ),'binary');
                          console.log('通信关闭了~~~')
                          res.end();
                                                              
                        
                  
                   
            }
       })
      
     
 }

 
 module.exports=readFile;
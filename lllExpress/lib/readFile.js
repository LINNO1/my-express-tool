const fs = require('fs');




function readFile(filePath,req,res,next){

       fs.readFile(filePath,'binary',function(err,fileContent){
        
            
            if(err){
                   /*res.writeHead(404,'errer ///');
                   res.write('<h1>出错了</h1>');
                   res.end();*/
                   next();
            }else{
                   if(req.body.index||req.query.index){

                    // pathObj.query.index length 是字符串，转为数值
                        var curIndex =req.query.index? parseInt(req.query.index):parseInt(req.body.index);
                        var length =req.query.length? parseInt(req.query.length):parseInt(req.body.length); 
                     
                      //fileContent 是JSON格式的字符串，转为数组                  
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
                                                              
                        
                   }else{

                        res.write(fileContent,'binary');
                       res.end();
                       console.log('通信关闭了~~~')
                        
                   }
                   
            }
       })
      
     
 }

 
 module.exports=readFile;
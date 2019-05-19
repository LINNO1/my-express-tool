var authBase=[
{user:'LLL' , pass: '123' },
{user:'lin' , pass: '456' },
{user:'xxx' , pass: '789' }
];



/*basic 认证, 缺点很多，一般用在https的情况中*/
function authorization(req, res ,next) { 
 var auth = req.headers['authorization'] || ''; 
 var parts = auth.split(' '); 
 var method = parts[0] || ''; // Basic 
 var encoded = parts[1] || ''; // dXNlcjpwYXNz  TExMOjEyMw==
 console.log('method= ',method);
 console.log('encoded= ',encoded);
 var decoded = new Buffer(encoded, 'base64').toString('utf-8').split(":"); 
 var user = decoded[0]; // user 
 var pass = decoded[1]; // pass 
 if (!checkUser(user, pass)) { 
 res.setHeader('WWW-Authenticate', 'Basic realm="Secure Area"'); 
 res.writeHead(401); 
 res.end(); 
 } else { 
 console.log('认证成功')
 next(); 
 } 
} 

//简易版的认证, 实际的使用会借助数据库查询
function checkUser(user, pass){

//不能这么写，foreach会遍历完这个数组，最后函数return false
 /* authBase.forEach(function(ele){ 	   
          if(ele.user===user&&ele.pass===pass){
          	return true;
          }
  });*/

  for(var i=0;i<authBase.length;i++){
            if(authBase[i].user===user&&authBase[i].pass===pass){
          	    return true;
  	       }
  	   }
  return false;

}

module.exports=authorization;
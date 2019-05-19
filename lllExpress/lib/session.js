/*处理session: 解决cookie数据敏感问题, 只存在服务器端*/
/* 处理： 要将客户与服务器中的数据一一对应起来*/
var cServer=require('./cookieServer');
var url = require('url');
const SESSION_KEY= 'session_id';
const EXPIRES=20*60*1000;
/*-----------------------------------------------------------------------------*/
/*方法一 基于cookie 将口令放在cookie中*/

//用来保存所有的session
var sessions={};
	
	
 /*创建session  session={ id: xxx , cookie: { expire: xxx}}*/
	function generateSession(){
		var session={};
		session.id=(new Date()).getTime()+parseInt(Math.random()*100); //加上1到100之间的随机数，Math.random()产生小数，作为id,会有精度问题,匹配不上
		session.cookie={
			expire: (new Date()).getTime()+EXPIRES
		};
		sessions[session.id]=session;   
    console.log('sessions: ',sessions);
    console.log('session: ',session);
		return session;
	}
/*注入到cookie中  实际上是把新创建session的id放到cookie中*/
   function addToCookie(req,res){
   	var cookies = res.getHeader('Set-Cookie');
   	var session=cServer.cookieSerilize(SESSION_KEY,req.session.id);
   	cookies = Array.isArray(cookies)?cookies.concat(session):[cookies,session];
   	res.setHeader('Set-Cookie',cookies);  	
   }

/*处理用户的session*/
   function handleSessionCook(req,res,next){
   	 var id=req.cookies[SESSION_KEY]; //拿出cookies,判断是否有id
     console.log('id',id);
     console.log('req.cookies',req.cookies);
   	 if(!id){
   	 	req.session=generateSession();
   	 }else{
   	 	var session=sessions[id]; //根据session的id,从session库sessions查找
   	 	console.log('sessions[id]',sessions[id])
      if(session){
   	 		if(session.cookie.expire>(new Date()).getTime()){ //没有过期
   	 			session.cookie.expire=(new Date()).getTime()+EXPIRES; //更新超时时间
   	 			req.session=session;
   	 		}else{//如果已经过期了
                 delete sessions[id]; //在数组中山删除该项
                 req.session=generateSession();
   	 		} 
   	 	}else{
   	 		req.session=generateSession();
   	 	}
   	 }
     addToCookie(req,res);
   	 next();
   }

   /*function handle(req,res){
   	if(!req.session.isVisit){
   		session.isVisit=true;
   		addToCookie();
   		res.writeHead(200);
		res.end('welcom~~');
   	}else{
   		addToCookie();
		res.writeHead(200);
		res.end('welcom again~~');
	}
   }
*/

/*-----------------------------------------------------------------------------*/
/*放在查询字符串中*/
var url = require('url')

function addToURL(req,key,value){

	var obj=url.parse(req.url,true);
	obj.query[key]=value;
  obj.search=obj.search+'&'+key+'='+value;
  console.log('obj= ',obj);
  console.log('url.format(obj)= ',url.format(obj))
	return url.format(obj);

}

function redirect(res,url){
	res.setHeader('Location',url);
	res.writeHead(302);//重定向
  console.log('重定向~~~')
	res.end();
}

/* 效果
< HTTP/1.1 302 Moved Temporarily 
< Location: /pathname?session_id=12344567
注意：这个只能用在get中，如果用在post方法中，post请求自动变为get


*/
function handleSessionURL(req,res,next){
   	 var id=req.query[SESSION_KEY]; //拿出cookies,判断是否有id
     console.log('session url id= ',id)
   	 if(!id){

   	 	redirect(res,addToURL(req,SESSION_KEY,generateSession().id));
   	 }else{
   	 	var session=sessions[id]; //根据session的id,从session库sessions查找
   	 	if(session){
   	 		if(session.cookie.expire>(new Date()).getTime()){ //没有过期
   	 			session.cookie.expire=(new Date()).getTime()+EXPIRES; //更新超时时间
   	 			req.session=session;
           next(); // 注意，next()写在这里，redirect()里已经res.end(),结束通信了
   	 		}else{//如果已经过期了
                 delete sessions[id]; //在数组中山删除该项
                 var session=generateSession();
                 redirect(res,addToURL(req,SESSION_KEY,session.id));
   	 		} 
   	 	}else{
   	 		var session=generateSession();
             redirect(res,addToURL(req,SESSION_KEY,session.id));
   	 	}
   	 }
    	
   }


exports.handleSessionCook=handleSessionCook;
exports.handleSessionURL=handleSessionURL;
/* cookie 的名字和值必填
          其他的选择性

*/

/*------------------cookie值设置------------------------------*/
var cookieSerilize = function(name, val, options) {
    //若cookie的名字不存在，返回
    if (!name) {
        throw new Error("coolie must have name");
    }
     //cookie的名字和值用URL编码
    var enc = encodeURIComponent; //把字符串作为 URI 组件进行编码
    var parts = [];
    val = (val !== null && val !== undefined) ? val.toString() : "";
    parts.push(enc(name) + "=" + enc(val));

    options = options || {};
    // domain中必须包含两个点号
    if (options.domain) {
        parts.push("domain=" + options.domain);
    }
    if (options.path) {
        parts.push("path=" + options.path);
    }
    // 如果不设置expires和max-age浏览器会在页面关闭时清空cookie
    // 即只对当前的session生效

    if (options.expires) {
        parts.push("expires=" + options.expires.toGMTString());
    }
    if (options.maxAge && typeof options.maxAge === "number") {
        parts.push("max-age=" + options.maxAge);
    }
    //httpOnly和secure不需要指定值,httpOnly设置令浏览器无法用document.cookie获取该cookie
    //secure 当https协议时，浏览器才会附上这段cookie给服务器
    if (options.httpOnly) {
        parts.push("HTTPOnly");
    }
    if (options.secure) {
        parts.push("secure");
    }

    return parts.join(";");
}
//使用
/*cookieSerilize('lll','111',{
    domain: '.xxx.com',
    path: '/',
    expires: new Date().toGMTString(),

})*/

/*------------------cookie值获取------------------------------*/

var cookieParse = function(cstr) {
    if (!cstr) {
        return null;
    }

    var dec = decodeURIComponent;
    var cookies = {};
    var parts = cstr.split(/\s*;\s*/g); //
    parts.forEach(function(p){
        var pos = p.indexOf('=');
        // name 与value存入cookie之前，必须经过编码
        var name = pos > -1 ? dec(p.substr(0, pos)) : p;
        var val = pos > -1 ? dec(p.substr(pos + 1)) : null;
        //只需要拿到最匹配的那个
        if (!cookies.hasOwnProperty(name)) { // hasOwnProperty不会沿着原型链上找
            cookies[name] = val;
        }/* else if (!cookies[name] instanceof Array) {
            cookies[name] = [cookies[name]].push(val);
        } else {
            cookies[name].push(val);
        }*/
    });

    return cookies;
}



exports.cookieSerilize=cookieSerilize;
exports.cookieParse=cookieParse;
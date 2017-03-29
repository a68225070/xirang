//var later = require('later');
var https = require('https');
var moment = require('moment');

//下面部分同test_later文件
var appid = "wxbf2730c40afd4c94";// "wx88f3e6f3f3425db2";

var appsecret = "4ab3aeef54b74334c2806c99e6cf2c33";// "ae09a01a9e54d31dfb0b214b8b7e41d8";
var access_token = "xirang";
/*
later.date.localTime();
//console.log("Now:" + new Date());

var sched = later.parse.recur().every(1).hour();
next = later.schedule(sched).next(10);
//console.log(next);

var timer = later.setInterval(test, sched);
setTimeout(test, 2000);
//到此处是later的实现
*/
test();

function test(){
	console.log(moment().format('YYYY/MM/DD hh:mm:ss'));
	var options = {
		hostname: 'api.weixin.qq.com',//域名
		//请求路径
		path:'/cgi-bin/token?grant_type=client_credential&appid=' + appid +'&secret=' + appsecret

	};
	var req = https.get(options, function(res){//与http.request类似，http.get将请求方式设为get并且结束时自动调用end()函数
		var bodyChunks = '';
		res.on('data', function(chunk){ //当data事件发生时，调用匿名函数，返回相应的请求值
			bodyChunks += chunk;
		});
		res.on('end',function(){//在end事件发生时
			var body = JSON.parse(bodyChunks);//首先将服务器返回的数据转换为json格式
			console.log("收到消息");		
			if (body.access_token){
				access_token = body.access_token;//如果成功返回了access_token 执行判断体内的代码

				//设定menu即微信测试号下的菜单
				
				var menu = {
					"button":[//两个按钮
						{
							"name":"我的",//一级菜单按钮“我的”
							"sub_button":[//二级子按钮
								{
									"type":"click",//动作类型
									"name":"账户",
									"key":"V1001_MY_ACCOUNT"//菜单key值用于消息接口推送
								},
								{
									"type":"click",
									"name":"设置",
									"key":"V1002_SET"
								}
							]
						},
						{
							"name":"好友",//一级菜单
							"sub_button":[
								{
									"type":"click",
									"name":"邀请好友",
									"key":"V1001_GOOD"
								},
								{
									"type":"view",
									"name":"加入我们",
									"url":"http://www.baidu.com/"
								}
							]
						}
					]
				};

				var post_str = new Buffer(JSON.stringify(menu)); //转换menu为json字符串并赋值给post_str作为缓冲数据
				//var post_str = JSON.stringify(menu);
				console.log(post_str.toString());
				console.log(post_str.length);

				var post_options ={
					host: 'api.weixin.qq.com',
					port:'443',
					path:'/cgi-bin/menu/create?access_token=' + access_token,
					method:'POST',
					headers: {
						'Content-Type':'application/x-www-form-urlencoded',
						'Content-Length':post_str.length
					}
				};

				//生成菜单需要access——token，
				var post_req = https.request(post_options, function(response){
					//再次发送请求更新目录
					var responseText = [];
					var size = 0;
					response.setEncoding('utf8');
					response.on('data',function(data){
						responseText.push(data);
						size +=data.length;
					});
					response.on('end', function(){
						console.log(responseText);
					});
				});

				// post the data
				post_req.write(post_str);
				post_req.end();

				//console.log(access_token);
			}else{
				console.dir(body);
			}
		});
	});
	req.on('error',function(e){
		console.log('ERROR:' + e.message);
	});
}

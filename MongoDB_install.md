### replSet of mongoDB

```
1. stop coop mongodb	

pid=$(ps -ef|grep 'mongod --fork --syslog --dbpath /data/db --bind_ip 127.0.0.1'|grep -v grep | awk '{print $2}')
kill -9 $pid

/usr/bin/mongodump -h 127.0.0.1:27017 --db pipeline -o backup_name

4. start mongodb with replSet(Primary)	
nohup mongod --dbpath /data/db --replSet coop --oplogSize 10240&

5. Replica initialize	mongo
rs.initiate()

mkdir -p /data/db
nohup mongod --dbpath=/data/db --replSet=coop   &
7. add Secondary	mongo
rs.add('xxx.xxx.net:27017')
rs.add('yyy.yyy.net:27017')
```



# README
* [1. Installation And Deployment](#link_7 "Installation And Deployment")
* [2. Testing and deployment](#link_8)
* [3. Maintenance](#link_9)
* [4. Learning Resources](#link_10)
* [A.1 How to Build develop environment on Win7 ?](#link_a1 "setup coop develp environment")
* [A.2 How to restart MongoDB ](#link_a9 "restart mongodb")

<a name="link_1" id="link_1"></a>
### 1. Overview Install nodejs on centos
* https://github.com/joyent/node/wiki/Installing-Node.js-via-package-manager
* https://github.com/nodejs/node/wiki
* curl -sL https://rpm.nodesource.com/setup | bash -
* yum -y install nodejs
* /etc/yum.repos.d/epel.repo
* node -v

### Express upgrade on Ubuntu
删除步骤为：

1. 查看安装的express
> dpkg --list |grep express
2. 使用命令移除它
> sudo apt-get remove --purge node-express

安装express

> npm install -g express-generator

> npm install -g express


### MongoDB memory monitor
shell>free -m 
             total       used       free     shared    buffers     cached 
Mem:         32101      29377       2723          0        239      25880 
free memory = echo '2723+239+25880'|  bc -l 

* mongo> db.serverStatus().mem: 
```
{ 
    "resident" : 22346, 
    "virtual" : 1938524, 
    "mapped" : 962283 
} 
```
mongo> db.stats() 
```
{ 
        "dataSize" : 1004862191980, 
        "indexSize" : 1335929664         1.3G  + hotdata == mongoDB need memory
} 
```

* shell> mongostat 
```
mapped  vsize    res faults 
  940g  1893g  21.9g      0 
  940g  1893g  21.9g      0 
  940g  1893g  21.9g      0 
mapped：映射到内存的数据大小 
visze：占用的虚拟内存大小 
res：实际使用的内存大小 
```


#### 1.1 Application architecture

<a name="link_2" id="link_2"></a>
### 2. Files Tree

```
`-- atest
 -- documents
 -- frontend
    |-- css
    |-- html
    |-- img
    |-- js
    |-- lib
    |-- index.html
 -- img
 -- producer
    |-- routes
        |-- api
        |-- index.js
    |-- scripts
    |-- test
    |-- app.js
    |-- eventstore.js
 `-- readme.md
```

<a name="link_7" id="link_7"></a>
### 7. Installation And Deployment

#### 7.1. Required Components (Assuming on Linux hosts)
* Nodejs: *producer* servers as a nodejs app.
* Mongodb: a NoSQL database
* Nginx: provide web server for contents within *frontend*
* [PM2](https://github.com/Unitech/PM2) (optional): for automatic deployment and run-forever (auto restart on crash), but it's not fully configured, now, a Jenkins/Gitlab CI configuration is needed to build a completed CD system.


#### 7.2. Installation
1. Install components:(You can get the more details information from:  [How to build development environment on Win7?](#link_a1 "How to build development environment on Win7"))
  * Nodejs: https://github.com/joyent/node/wiki/Installing-Node.js-via-package-manager
  * Mongodb: http://docs.mongodb.org/manual/tutorial/install-mongodb-on-ubuntu/
  * Nginx: `sudo apt-get install nginx`
  * Arangodb: https://www.arangodb.com/download/ (prefer to install by package manage)
  * redis: `sudo apt-add-repository ppa:chris-lea/redis-server; sudo apt-get update; sudo apt-get install redis-server`
  * PM2 (optional): https://github.com/Unitech/pm2
  
        #install pm2 with 'npm install pm2 -g'  
        #stop and delete all pm2 processes(pm2 delete all)  
        #pm2 start pm2.json
        # or 
        #start falcon using 1 instance(pm2 start ./bin/www --name "falcon" --max-memory-restart 4096M --node-args="--max_old_space_size=4096")  
        #start falconReader using 1 instance(pm2 start reader.js --name "falconReader" --max-memory-restart 4096M --node-args="--max_old_space_size=4096")  
1. Check out the code:

  * in your working folding, 'git clone http://gitlab.com/falcon.git'
  * install node modules: `cd falcon/producer; npm install`

1. Add a site config (based at folder `falcon/frontend`) to `/etc/nginx/sites-available`, and make a soft link in `/etc/nginx/sites-enabled`, then restart nginx. Example:

        # /etc/nginx/sites-available/falcon.conf
        # Falcon

        server {
          listen *:80 default_server;         # e.g., listen 192.168.1.1:80; In most cases *:80 is a good idea
          server_name xxx.xxx.xx;     # e.g., server_name source.example.com;
          server_tokens off;     # don't show the version number, a security best practice
          proxy_redirect off;
          proxy_set_header Host             $host;
          proxy_set_header   X-Real-IP        $remote_addr;
          proxy_set_header   X-Forwarded-For  $proxy_add_x_forwarded_for;
          proxy_connect_timeout 600;
          proxy_read_timeout 600;
          proxy_send_timeout 600;

          # CHANGE it to the folder in which source code located
          root /path/to/falcon/frontend;

          # individual nginx logs for this gitlab vhost
          access_log  /var/log/nginx/falcon_access.log;
          error_log   /var/log/nginx/falcon_error.log;

          # you can add other service under the same port, distiguish by url path
          #location /ci/ {
          #  proxy_pass http://localhost:8081/ci/;
          #}

          location / {
            # serve static files from defined root folder;.
             index index.html;
          }

          # tell IE to use edge document mode, IE is always the most stupid one
          add_header "X-UA-Compatible" "IE=Edge,chrome=1";
        }
1. Under `falcon/producer`, type `npm start` to run the app. Or, if you use PM2, create an app by PM2 with command `pm2 start`, `pm2 reload`, more instructions please refer to its manual.
1. How to upgrade node:
  * npm cache clean -f
  * npm install -g n
  * n stable
  * node -v  
  and then  
  * rm -rf node_modules
  * npm cache clean
  * npm install
1. How to upgrade pm2(http://pm2.keymetrics.io/docs/usage/update-pm2/):
  * pm2 save
  * npm install pm2 -g
  * pm2 update

b<a name="link_8" id="link_8"></a>
### 8. Testing and deployment

#### 1.1 testing:
```
- 1. Unit Testing with `mocha` framework(e.g. run xxx.js with mocha test/__init__.js test/integration/xxx.js)
- 2. Acceptance Testing with `RobotFramework` and `webdriver`
    - We use `selenium2` and `RobotFramework` to do the acceptance testing, you can refer to [Web Testing Based on RobotFramework and Webdriver](https://docs.google.com/presentation/d/17FyeecnUCA2awrrsovrNBDo3WI1sID9zA1t3RsW0kvw/pub?start=false&loop=false&delayms=3000).
```

<a name="link_9" id="link_9"></a>
### 9. Maintenance

- Start arangodb : `root@hztdltev02:/data/arangodb# service arangodb start`
- Start Falcon : `pm2 reload falcon; pm2 reload falconReader`
- Backup Strategy: daily, and keep the latest 10 copies
- Restore from dumped DB (**NOTE**, it will drop your current database): `mongorestore  --drop "/home/mongo_backup/$latest_dump"`


<a name="link_10" id="link_10"></a>
### 10. Learning Resources

* [Learning Git](http://pcottle.github.io/learnGitBranching/)
* [The Best Way to Learn JavaScript](http://code.tutsplus.com/tutorials/the-best-way-to-learn-javascript--net-21954)
* [Web Developer Skills](https://www.codecademy.com/learn)
* [MongoDB](https://docs.mongodb.org "MongoDB")
* UT
    * [Mocha](http://mochajs.org/) 
* [Lodash ~4](https://lodash.com/docs "Lodash 4.16.4")
* [d3js](http://d3js.org/ "d3js") for chart drawing, animating on browser
* [ECharts](http://echarts.baidu.com/echarts2/doc/example.html#gauge "EChart") for chart drawing
* [jquery-multiselect-plugin](http://www.jqueryrain.com/demo/jquery-multiselect-plugin/ "jquery-multiselect-plugin")
* [Calendar View](http://bl.ocks.org/mbostock/4063318 "Calendar View")
* [outdatedbrowser](http://outdatedbrowser.com/en/project, "outdatedbrowser 1.1.0")
* [debug on nodejs](https://github.com/node-inspector/node-inspector#quick-start)


### A - Questions and Anwsers
<a name="link_a1" id="link_a1"></a>
#### A.1 How to build Coop development environment on Win7?
- Step 1. Download Oracle VirtualBox for Windows hosts from https://www.virtualbox.org/wiki/Downloads, and install it
- Step 2. Download Ubuntu 14.04.2 LTS 64-bit ISO from http://www.ubuntu.com/download/desktop, Long Term Support (LTS) version is preferred
- Step 3. Enable VT-x/AMD-V virtualization support in your PC BIOS (Otherwise you can't install 64-bit linux)
- Step 4. Start VirtualBox Manager (reference: http://www.crifan.com/crifan_recommend_virtual_machine_soft_virtualbox/)
	* Click New - >select linux -> Ubuntu 64 bit -> Next
	* Input virtual Momory size (I assign 3096)
	* Create virtual disk. At least 20G. (I create 30G size disk)
	* Config your Virtual computer:
		* a.Add Ubuntu 14.04.2 ISO into CDROM.
		* b.Enable copy/paste.
		* c.Set Graph memory size.
		* d.Set CPU count
		* e.Enable network
	* Start the virtual computer your just created and install Ubuntu.
		Make sure network is workable. If you're doing this in office network, select "Try Ubuntu" on install start page, set proxy in "System Settings", then click Install Ubuntu on desktop.
	* Install VirtualBox Guest Additions on Virtualbox manager menu to enable cliboard/folder sharing and get better screen resolution.
  * Enable root user and set password for root
  ```
    sudo passwd -u root
    sudo passwd root
  ```
	* Switch to root user and add proxy settings in ~/.bashrc:
	```
    export http_proxy=http://10.144.1.10:8080
    export https_proxy=http://10.144.1.10:8080
	```
	* Configure proxy for apt (Advanced Package Tool) with 'root@ubuntu:~# vim /etc/apt/apt.conf':
	```
	Acquire::http::proxy "http://10.144.1.10:8080";
    Acquire::ftp::proxy "ftp://10.144.1.10:8080";
    Acquire::https::proxy "https://10.144.1.10:8080";
	```
	* Restart your Virtual computer to continue

- Step 5. Coop application install
	* a. Install git by command : sudo apt-get install git
	* b. Install Nodejs
```
		1. firstly，install compiling tools
		$ sudo apt-get install g++ curl libssl-dev apache2-utils
		$ sudo apt-get install python
		$ sudo apt-get install build-essential
		$ sudo apt-get install gcc
		$ sudo apt-get install g++
		$ sudo apt-get install libkrb5-dev
		2. download node source files and install Nodejs
		wget https://nodejs.org/dist/v0.10.34/node-v0.10.34.tar.gz
		$ tar -zxf node-v0.10.34.tar.gz
		$ cd node-v0.10.34
		$ ./configure
		$ make
		$ sudo make install
```
	* c. Clone Source code by command:
```
    $ git clone http://gitlab.com/falcon.git ~/falcon

```
	* d. Config proxy for npm, and check conifg:
```
    $ npm config set proxy http://11.11.1.10:8080
    $ npm config set https-proxy http://11.11.1.10:8080
    $ npm config list
```
	* e. Switch to ./falcon/producer folder and run command `npm install`, this will install all dependencies listed in package.json
	* g. Install MongoDB 2.6 (reference url : http://docs.mongodb.org/manual/tutorial/install-mongodb-on-ubuntu/)
		* Issue the following command to import the MongoDB public GPG Key:
			* sudo -E apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 7F0CEB10
		* Create list file for MongoDB:
			* echo 'deb http://downloads-distro.mongodb.org/repo/ubuntu-upstart dist 10gen' | sudo tee /etc/apt/sources.list.d/mongodb.list
		* Issue the following command to reload the local package database:
			* sudo apt-get update
		* Install the latest stable version of MongoDB. Issue the following command:
			* sudo apt-get install mongodb-org
		* Check Mongodb service by Command:
			* sudo service mongod status
		* Start MongoDB by Command:
			* sudo service mongod start
		* Import mongoDB from dump file
			2. unzip dump file by command : tar zxvf dump_2016-03-25-003500.tar.gz
			3. import mongoDB by command: mongorestore  --drop dump_2016-03-25-003500
			4. Connect mongoDB by command: mongo 127.0.0.1/pipeline
      
	* h. Install Redis
		* Get Redis by command :wget http://download.redis.io/releases/redis-3.0.1.tar.gz
		* unzip file by command : tar xvzf redis-3.0.1.tar.gz
		* cd redis-3.0.1
		* make
		* make test
		* sudo make install
		* cd utils and run command : sudo ./install_server.sh
		* check Redis service by command: sudo service redis_6379 status
		* Start Redis service by command: sudo service redis_6379 start

	* i. Install ArangoDB (see https://www.arangodb.com/download/)
		* Add the repository key to apt like this:
```		
			wget https://www.arangodb.com/repositories/arangodb2/xUbuntu_14.04/Release.key
			sudo apt-key add - < Release.key
```			
		* Create the /etc/apt/sources.list.d/arangodb.list list file using the following command:
			* echo 'deb https://www.arangodb.com/repositories/arangodb2/xUbuntu_14.04/ /' | sudo tee /etc/apt/sources.list.d/arangodb.list
            * sudo apt-get install apt-transport-https
            * sudo apt-get update
            * sudo apt-get install arangodb=2.8.7
		* Check ArangoDB service by Command:
			* sudo service arangodb status
		* Start ArangoDB by Command:
			* sudo service arangodb start
		* Import ArangoDB from dump file
			* 2. unzip dump file by command : tar zxvf coop_arangodb_dump.tar.gz
			* 3. create database falcon by command : 
			* $ arangosh
			* $ db._createDatabase('falcon')
			* 4. import arangoDB by command: arangorestore --server.database=falcon --input-directory=arango_2015-06-04-135805
		* Initiation arangoDB issue following command:
			* cd falcon/producer/scripts
			* node setup_graph.js

- Step 6. Start coop develop environment
	* cd /falcon/producer/
	* node reader.js      	-- Start Coop Redis service
	* npm start				-- Start Coop Data API service:  Access http://127.0.0.1:3000/api/trunkbuilds/search/index to verify 3000 port is work able.
	* npm test              -- execute unit test
	* cd /falcon/frontend
	* python -m SimpleHTTPServer 8080  -- Start Coop web service : Access http://127.0.0.1:8080 to verify the web page.

```javascrip
* db.macrotdd_trunkbuild.ensureIndex({timestamp:1})
```

### Restore single collection without dropping example:
mongodump -h 127.0.0.1:27017 --db pipeline --collection pci --out ./
mongorestore --collection pci --db pipeline ./pci.bson

db.events.find({_id:'11'}).explain()

### Query 'type'&'promotedrev' same but 'path' is difference from events_scci
db.events_scci.aggregate([{"$match":{"promotedrev":{$exists:true}}},{"$group":{_id:{type:"$type",promotedrev:"$promotedrev",path:"$promotedrepo"}}},{$group:{_id:{"type":"$_id.type",promotedrev:"$_id.promotedrev"},count:{"$sum":1}}},{$match:{count:{$gte:2}}}]);

### A.9 How to restart MongoDB 
<a name="link_a9" id="link_a9"></a>

* restart mongodb
    - add startmongo and stopmongo in .bashrc
        * alias startmongo='mongod --fork --syslog --dbpath /data/db --bind_ip 127.0.0.1'
        * alias stopmongo='mongod --shutdown'
    - run 'startmongo' to start mongodb
    

* restart mongodb
    - service mongod restart
* stop mongodb
    - service mongod stop


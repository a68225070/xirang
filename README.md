# For person github try 
How to install gerrit on Ubuntu
https://www.digitalocean.com/community/tutorials/how-to-install-gerrit-on-an-ubuntu-cloud-server
```javascript
set fileencodings=utf-8,gb2312,gbk,gb18030
set termencoding=utf-8
set fileformats=unix
set encoding=prc
```

https://github.com/tvrcgo/weixin-pay.git
https://github.com/node-webot/weixin-robot.git

https://github.com/ymgd/weixinopen.git

https://github.com/Ravior/Ordering-System-Weixin.git

https://github.com/sbabybird/WeixinOne.git


deploy

https://github.com/willerce/canku.git



webpage
https://github.com/licheng700/wechatOrder.git

login & order
https://github.com/jalenkjx/wechat_order.git


https://github.com/dinghuihua/ordering_app.git


#UT start
```
#!/bin/bash
cd /home/cpd/falcon/producer
git checkout -f ../frontend/js/version.js
git pull --rebase
git status
npm install
npm test || exit 1
echo ${WORKSPACE}
echo 'rsync -avz /home/cpd/falcon/producer/coverage /home/cpd/ci_slave/workspace/cci_falcon/producer/'
rsync -avz /home/cpd/falcon/producer/coverage ${WORKSPACE}/producer/
```

#deploy script
```
#!/bin/bash

echo "deploying to product env ..."

cd /data/falcon

git checkout frontend/js/version.js
git pull --rebase && git reset --hard $PROMOTED_GIT_COMMIT || exit -1
echo "Version.prototype.build_num = ${PROMOTED_NUMBER};" >> frontend/js/version.js
echo "Version.prototype.build_id = '${PROMOTED_ID}';" >> frontend/js/version.js

cd producer
npm install || exit -1
pm2 restart falcon || exit -1
pm2 restart falconReader || exit -1
/etc/init.d/nginx restart
```



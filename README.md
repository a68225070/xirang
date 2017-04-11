
# chrome install
* wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
* sudo dpkg -i google-chrome-stable_current_amd64.deb 


# Angular2 install


* node -v  node 4.x.x
* npm -v   npm 3.x.x
* sudo npm install -g @angular/cli@latest

* npm install -g cnpm --registry=https://registry.npm.taobao.org
* cnpm install node-sass

# Image Crop Resize
* https://github.com/yahoohung/ng-image-uploader

* https://github.com/andyshora/angular-image-crop

* https://github.com/AllanBishop/angular-img-cropper   

* https://github.com/cstefanache/angular2-img-cropper



# QR code for Nodejs
https://github.com/soldair/node-qrcode

# Image processor for Nodejs
https://github.com/lovell/sharp

# Cloud mount disk
```bash
sudo fdisk -l
sudo mkfs.ext3 /dev/vdb
cd /
mkdir data
sudo mount /dev/vdb /data
echo '/dev/vdb /data ext3 defaults 0  0' >> /etc/fstab
```
df -lh 查看第2块磁盘是否有正常挂载

# Nodejs Export VS Modul Export 
https://darrenderidder.github.io/talks/ModulePatterns/#/9


# Fix node-sass install fail:
* Download node from web
* set SASS_BINARY_PATH=D:/WorkCode/win32-x64-46_binding.node //PATH=后面是的下载的.node所在的路径
* export SASS_BINARY_PATH=~/download/linux-x64-46_binding.node
* npm rebuild node-sass
1


# For person github try 
How to install gerrit on Ubuntu
https://www.digitalocean.com/community/tutorials/how-to-install-gerrit-on-an-ubuntu-cloud-server

# Upgrade npm 
sudo npm install -g npm
# upgrade nodejs
```
# Using Ubuntu
curl -sL https://deb.nodesource.com/setup_4.x | sudo -E bash -
sudo apt-get install -y nodejs
```
# Install vim plug-in
## Install pathogen 
* mkdir -p ~/.vim/autoload ~/.vim/bundle
* curl -LSso ~/.vim/autoload/pathogen.vim https://tpo.pe/pathogen.vim
* vim ~/.vimrc add below script:
```python
"自动缩进
set autoindent
"语法高亮
syntax on
"自动检测文件类型并加载相应的设置
filetype plugin indent on
"不自动换行
set nowrap
"智能对齐方式
set smartindent
"一个tab是4个字符
set tabstop=4
"按一次tab前进4个字符
set softtabstop=4
"显示行号
set number
"缺省不产生备份文件
set nobackup

execute pathogen#infect()

"execute pathogen#infect('stuff/{}')
"execute pathogen#infect('bundle/{}', '~/src/vim/bundle/{}')
```
## Install plugins
* cd ~/.vim/bundle
```
  set tabstop=4
  set softtabstop=4
  set shiftwidth=4
  set expandtab
```
### Install sensible.vim
* git clone https://github.com/tpope/vim-sensible.git
### Install Nerdtree
* git clone https://github.com/scrooloose/nerdtree.git
* ctrl+w : switch from tree and window
* gt or gT : switch from tab
* o : open file in one window
* t : open file in new tab

### Install jshint
* sudo npm install -g jshint
* cd ~/.vim/bundle
* git clone https://github.com/wookiehangover/jshint.vim

### Install YCM (  in Vim: :echo has('python') || has('python3'). The output should be 1)
* sudo apt-get install build-essential cmake
* sudo apt-get install python-dev python3-dev
* cd ~/.vim/bundle
* git clone https://github.com/Valloric/YouCompleteMe.git
* git submodule update --init --recursive

* npm install -g typescript     (nodejs)
* cd ~/.vim/bundle/YouCompleteMe
* ./install.py --tern-completer

* vi ./vimrc
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

进入微站
自助服务
   -- 查找附近店铺
   -- 预约服务
   -- 外卖服务
   -- 优惠券
   -- 在线客服

# For person github try 
How to install gerrit on Ubuntu
https://www.digitalocean.com/community/tutorials/how-to-install-gerrit-on-an-ubuntu-cloud-server
```javascript
set fileencodings=utf-8,gb2312,gbk,gb18030
set termencoding=utf-8
set fileformats=unix
set encoding=prc
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



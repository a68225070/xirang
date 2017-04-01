if [ $# -eq 0 ];then
exit
else
export TZ=Asia/Shanghai && ./node_modules/.bin/_mocha ./test/__init__.js ./test/integration/$1 -t 10000
fi

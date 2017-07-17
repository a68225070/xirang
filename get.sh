#!/bin/sh
fn="myapp"
if [ $# -eq 1 ]; then  
        fn=$1
fi 
echo "get dir:$fn"
echo "rsync -avz -e ssh ubuntu@www.naja.club:~/$fn ./"
exec rsync -avz --exclude-from='./exclude.list' -e ssh ubuntu@115.159.161.35:~/$fn ./aaa
aaa

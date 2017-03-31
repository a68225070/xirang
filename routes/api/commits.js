'use strict';

var router = require('express').Router();
var logger = require('../../logging').getLogger('api/commits');
var _ = require('lodash-node');
var es = require('../../eventstore')();
var async = require('async');
var db = require('../../settings').DB;
var moment = require('moment');
var mongoskin = require('mongoskin');
var utils = require('../../utils');


router.post('/:scName', function(req, res, next) {
    var sc = req.params.scName.toLowerCase();

    function isValidCommit(c) {
        if (c.hasOwnProperty('date')){
            c['updated_commit_time'] = c['date'];
        }
        return c.revision && c.parents;
    }
    if (!req.body.commits || !_.every(req.body.commits, isValidCommit)) {
        logger.error('missing fields: %j', req.body);
        return res.status(400).send('missing fields');
    }

    es.append('commits/' + sc, _.max(req.body.commits, 'date').date, req.body.commits, function(e) {
        if (e) return next(e);

        res.status(201).end();
    });
});

router.post('/config/repo_post',function(req,res,next){
    var repo_conf = db.collection('repo_conf'); 
    res.header('Access-Control-Allow-Origin','*');
    res.header('Content-Type','application/json');
    var indata = req.body.data;
    var action = req.body.action||'';
    var ret=[];
    function doapiupsert(row,cb){
        if(row["url"]){
            row["updatetime"] = moment().unix();
            row["username"] = row["username"]||"API";
            row["contact"] = row["contact"]||"API";
            row["actived"] = (row["actived"]||"1") +"";
            row["removed"] = row["removed"]||'0';
            row["repo_type"] = row["repo_type"]||'svn';
            var filterExpr = {url:row["url"]};
            if (row["_id"]){
                filterExpr= {_id:mongoskin.helper.toObjectID(row["_id"])};  
                delete row["_id"];
            }
            repo_conf.find(filterExpr, {}).toArray(function(err, results) {
                if (row["repo_name"] && row["sc"]){
                    row["sc"] = row["sc"].toUpperCase();
                    var tmpret = results||[];
                    if(tmpret.length>1||(tmpret.length==1 && ( row["sc"]!=tmpret[0]['sc'].toUpperCase()) )){
                        //filterExpr['repo_name']=row["repo_name"];
                        filterExpr['sc'] = row['sc'];
                    }
                }
                repo_conf.update(filterExpr, 
                                   {$set:row}, 
                                   {upsert: true}, function(err, result){
                    if (result != 1){
                        row['api_result'] = 'failed:' + err;
                        ret.push(row);
                    }else{
                        row['api_result'] = 'successed';
                        ret.push(row);
                    }
                    cb(null);
                 });
            });
        }
    }
    if (action.toLowerCase() == 'api'){
        async.eachSeries(indata,doapiupsert,function(err){
            return res.send({result:ret});
        })
    }
    else if (action == 'robot'){
        for (var key in indata){
            if(indata[key]["rowid"]){
                var setval = {$set:{scantime:indata[key]["scantime"]||(moment().unix())}};
                if (indata[key]["last_revision"]){
                    setval['$set']['last_revision'] = indata[key]["last_revision"];
                }
                if (indata[key]["actived"]){
                    setval['$set']['actived'] = indata[key]["actived"];
                }
                if (indata[key]["username"]){
                    setval['$set']['username'] = indata[key]["username"];
                }
                repo_conf.update({_id:mongoskin.helper.toObjectID(indata[key]["rowid"])},setval,
                                   {upsert: false}, function(err, result){
                    if (result != 1){
                        logger.error("%s Commit last revision update failed:%s",err,indata[key]);
                    };
                 });
            }
        }
        return res.status(200).end();
    }else if (action == 'edit' || action == 'delete'){
        indata['updatetime'] = moment().unix();
        var id = indata["_id"];
        if(id){
            if (indata["sc"]){
                indata["sc"]=indata["sc"].toUpperCase();
            }
            delete indata["_id"];
            if (indata['removed']=='1'){
                indata['actived']='0';
            }
            repo_conf.update({_id:mongoskin.helper.toObjectID(id)}, {$set:indata}, {upsert: false}, function(err, result){
                if (result == 1){
                    indata['DT_RowId']=id;
                    indata['_id']=id;
                    var ret = {draw:1,data:[]};
                    ret.data.push(indata);
                    return res.send(ret);
                };
                logger.error(err + " update count:" + result);
             });
        }
    }else if(action == 'create' && indata){
        indata['updatetime'] = moment().unix();
        indata['removed'] = '0';
        if (indata["sc"]){
            indata["sc"]=indata["sc"].toUpperCase();
        }
        repo_conf.insert(indata, function(err, result){
            if (result[0]){
                result[0]['DT_RowId'] = result[0]._id;
                var ret = {draw:1,data:[]};
                ret.data.push(result[0])
                return res.send(ret);
            };
            logger.error(err);
         });
    }else{
        return res.send({data:req.body.data});
    }
})


router.get('/search/sccivisualization_test',function(req, res, next){
	var events_scci = db.collection('events_scci');
    var path = req.query.repository 
	var queryExpr = {
                     path: path
                    };
	events_scci.find(queryExpr, {sort: [['date', -1 ], ['_id', -1 ]]}).toArray(function(err, results) {
    	var commits = _(results).map(function(d){
    				 return {revision: d.revision,
    					 	 loc: d.loc,
    					 	 author: d.author,
    					 	 date: d.date,
    					 	 message: d.message};
    	           }).uniq('revision').valueOf();
	return res.send({revisions: commits});
	});			   
});

module.exports = router;

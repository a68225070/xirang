'use strict';

var superagent = require('superagent');
var expect = require('expect.js');
var mongoskin = require('mongoskin');
var moment = require('moment');
var _ = require('lodash-node');
var async = require('async');

describe('/pci', function() {
    var db,posturl,hierurl,caseurl,conf_url;
    before(function(done) {
        posturl = process.env.FALCON_TEST_URL + '/pci/data';
        hierurl = process.env.FALCON_TEST_URL + '/pci/config/hier';
        caseurl = process.env.FALCON_TEST_URL + '/pci/config/testcase';
        conf_url = process.env.FALCON_TEST_URL + '/pci/config';
        db = mongoskin.db(process.env.FALCON_DB_URL);
        db.collection('pci').ensureIndex('buildid', function(err) {
            expect(err).to.not.be.ok();
            db.collection('pci_hierarchy').drop(function(e1) {
                expect(''+e1).to.match(/null|ns not found/);
                done();
            });
        });
    });

    afterEach(function(done) {
        async.parallel(['pci', 'pci_list','pci_testcase','pci_hierarchy'].map(function(sc) {
            return function(callback) {
                db.collection(sc).drop(function(err) {
                    expect(''+err).to.match(/null|ns not found/);
                    callback(null);
                });
            }
        }), function(err) {
            done();
        });
    });
/*
    it('Post pci and pci list collect check waitting...2s', function(done) {
    	var data = [{
                        'buildid':'xxx',
                        'bl':'td-lte',
                        'product':'macrotdd',
                        'branch':'trunk',
                        'test_hierarchy':'qt;qt1;fsmr3',
                        'type':'product',
                        
    				},{
                        'buildid':'yyy',
                        'bl':'td-lte',
                        'product':'macrotdd',
                        'branch':'trunk',
                        'test_hierarchy':'qt;qt1;fsmr3',
                        'type':'product',
                        'cases':[
                                    {
                                        'name':'swdl_sem',
                                        'start':1436965447,
                                        'end':1436966447,
                                        'result':'FAIL',
                                        'url':'xxxx'
                                    }
                                ]
    				}];
        db.collection('pci_list').insert(data, function(err, res) {
            expect(err).to.eql(null);            
        	var pdata = [{
                        'buildid':'xxx',
                        'bl':'td-lte',
                        'product':'macrotdd',
                        'branch':'trunk',
                        'test_hierarchy':'qt;qt1;fsmr3',
                        'type':'product',
                        'cases':[
                                    {
                                        'name':'swdl_SEM',
                                        'start':1436965447,
                                        'end':1436966447,
                                        'result':'PASS',
                                        'url':'xxxx'
                                    }
                                ]
    				    },{
                            'buildid':'yyy',
                            'bl':'TD-LTE',
                            'product':'macrotdd',
                            'branch':'trunk',
                            'test_hierarchy':'qt;qt1;FSmr3',
                            'total_count':500,
                            'cases':[
                                    {
                                        'name':'swdl_SEM',
                                        'start':1436965447,
                                        'end':1436966447,
                                        'result':'PASS',
                                        'url':'xxxx'
                                    },
                                    {
                                        'name':'udp_DOWNload',
                                        'start':1436965447,
                                        'end':1436966447,
                                        'result':'PASS',
                                        'url':'xxxx'
                                    }
                                ]
        				},{ 'buildid':'zzz',
                            'product':'macrotdd',
                            'branch':'trunk',
                            'test_hierarchy':'QT;QT1;fsmr4;',
                            'total_count':555,
        				}];
            superagent.post(posturl).send(pdata).end(function(e,res){
                expect(e).to.eql(null);
                expect(res.status).to.eql(201);
                setTimeout(function(){
                    db.collection('pci_list').find({}).sort({buildid:1}).toArray(function(err,result){
                        expect(result.length).to.eql(3);
                        expect(result[0]['buildid']).to.eql('xxx');
                        expect(result[0]['cases']).to.eql([
                                    {
                                        'name':'swdl_sem',
                                        'start':1436965447,
                                        'end':1436966447,
                                        'result':'PASS',
                                        'url':'xxxx'
                                    }
                                ]);

                        expect(result[1]['cases']).to.eql([
                                    {
                                        'name':'swdl_sem',
                                        'start':1436965447,
                                        'end':1436966447,
                                        'result':'PASS',
                                        'url':'xxxx'
                                    },
                                    {
                                        'name':'udp_download',
                                        'start':1436965447,
                                        'end':1436966447,
                                        'result':'PASS',
                                        'url':'xxxx'
                                    }
                                ]);
                        expect(result[2]['buildid']).to.eql('zzz');
                        done();
                    })
                },2000)     
            });        
        })
    });
*/


    it('Post pci and pci hierarchy collect check waitting...2s', function(done) {
    	var data = {
                        'bl':'td-lte',
                        'product':'macrotdd',
                        'branch':'trunk',
                        'test_hierarchy':'qt;qt1;fsmr3',
                        'type':'product',
                        'active' : 1
    				};
        db.collection('pci_hierarchy').insert(data, function(err, res) {
            expect(err).to.eql(null);            
        	var pdata = [{
                            'bl':'TD-LTE',
                            'product':'macrotdd',
                            'branch':'trunk',
            				'buildid':'xxx',
                            'test_hierarchy':'qt;qt1;FSmr3',
                            'total_count':500,
                            'cases':[
                                    {
                                        'name':'swdl_SEM',
                                        'start':1436965447,
                                        'end':1436966447,
                                        'result':'FAIL',
                                        'url':'xxxx'
                                    },
                                    {
                                        'name':'udp_DOWNload',
                                        'start':1436965447,
                                        'end':1436966447,
                                        'result':'PASS',
                                        'url':'xxxx'
                                    }
                                ]
        				},{
                            'bl':'TD-LTE',
                            'product':'macrotdd',
                            'branch':'trunk',
            				'buildid':'xxx',
                            'test_hierarchy':'QT;QT1;fsmr4;',
                            'total_count':555,
        				}];
            superagent.post(posturl).send(pdata).end(function(e,res){
                expect(e).to.eql(null);
                expect(res.status).to.eql(201);
                setTimeout(function(){
                    db.collection('pci_hierarchy').find({}).sort({name:1}).toArray(function(err,result){
                        expect(result.length).to.eql(2);
                        expect(result[0]['test_hierarchy']).to.eql('qt;qt1;fsmr3');
                        expect(result[1]['test_hierarchy']).to.eql('qt;qt1;fsmr4');
                        done();
                    })
                },2000)     
            });        
        })
    });



    it('Post pci and case collect check waitting...2s', function(done) {
    	var data = {
                        'bl':'td-lte',
                        'product':'macrotdd',
                        'branch':'trunk',
                        'test_hierarchy':'qt;qt1,fsmr3',
                        'name':'swdl',
                        'featureid' : ['111','222'],
                        'createtime' :1436966447,
                        'updatetime' :1436966447,
                        'weight' : 100,
                        'active' : 1
    				};
        db.collection('pci_testcase').insert(data, function(err, res) {
            expect(err).to.eql(null);            
        	var pdata = [{
                            'bl':'TD-LTE',
                            'product':'macrotdd',
                            'branch':'trunk',
            				'buildid':'xxx',
                            'test_hierarchy':'qt;qt1,FSmr3',
                            'total_count':500,
                            'cases':[
                                    {
                                        'name':'swdl_SEM',
                                        'start':1436965447,
                                        'end':1436966447,
                                        'result':'FAIL',
                                        'url':'xxxx'
                                    },
                                    {
                                        'name':'udp_DOWNload',
                                        'start':1436965447,
                                        'end':1436966447,
                                        'result':'PASS',
                                        'url':'xxxx'
                                    }
                                ]
        				},{
                            'bl':'TD-LTE',
                            'product':'macrotdd',
                            'branch':'trunk',
            				'buildid':'xxx',
                            'test_hierarchy':'QT;QT1;FSMR3;',
                            'total_count':555,
        				}];
            superagent.post(posturl).send(pdata).end(function(e,res){
                expect(e).to.eql(null);
                expect(res.status).to.eql(201);
                setTimeout(function(){
                    db.collection('pci_testcase').find({}).sort({name:1}).toArray(function(err,result){
                        expect(result.length).to.eql(3);
                        expect(result[0]['name']).to.eql('swdl');
                        expect(result[1]['name']).to.eql('swdl_sem');
                        expect(result[1]['bl']).to.eql('td-lte');
                        expect(result[2]['name']).to.eql('udp_download');
                        done();
                    })
                },3000)     
            });        
        })
    });


    it('Post incorrect data without array to pci', function(done) {
        superagent.post(posturl).send({buildid: 'xxx', start: 1402437811000,end:1402437822000, qt1: {score: 2}}).end(function(e,res){
           expect(res.text).to.match(/in Array format/i);
            done();
        });
    });

    it('Post incorrect data without array to pci hierarchy', function(done) {
        superagent.post(hierurl).send({buildid: 'xxx', start: 1402437811000,end:1402437822000, qt1: {score: 2}}).end(function(e,res){
           expect(res.text).to.match(/in Array format/i);
            done();
        });
    });

    it('Post incorrect data without array to pci case', function(done) {
        superagent.post(caseurl).send({buildid: 'xxx', start: 1402437811000,end:1402437822000, qt1: {score: 2}}).end(function(e,res){
           expect(res.text).to.match(/in Array format/i);
            done();
        });
    });

    it('Post data to pci with out buildid or product', function(done) {
    	var pdata = [{
                        //'provider_email':'yang.1.chen@nsn.com',
                        'bl':'TD-LTE',
                        'product':'macrotdd',
                        'branch':'trunk',
                        'test_hierarchy':'QT;QT1;FSIH_CPRI',
                        'total_count':500,
    				}];
        superagent.post(posturl).send(pdata).end(function(e,res){
           expect(res.text).to.match(/is mandatory/i);
            done();
        });        
    });

    it('Post data to pci hierarchy with out product', function(done) {
    	var pdata = [{
                        //'provider_email':'yang.1.chen@nsn.com',
                        'bl':'TD-LTE',
                        'branch':'trunk',
                        'test_hierarchy':'QT;QT1;FSIH_CPRI',
                        'total_count':500,
    				}];
        superagent.post(hierurl).send(pdata).end(function(e,res){
           expect(res.text).to.match(/is mandatory/i);
            done();
        });        
    });


    it('Post data to pci case with out product', function(done) {
    	var pdata = [{
                        //'provider_email':'yang.1.chen@nsn.com',
                        'bl':'TD-LTE',
                        'branch':'trunk',
                        'test_hierarchy':'QT;QT1;FSIH_CPRI',
                        'total_count':500,
                        //'provider_email':'yang.1.chen@nokia.com'
    				}];
        superagent.post(caseurl).send(pdata).end(function(e,res){
           expect(res.text).to.match(/is mandatory/i);
            done();
        });        
    });



    it('Post data to pci build not exist', function(done) {
    	var pdata = [{
                        'bl':'TD-LTE',
                        'product':'macrotdd',
                        'branch':'trunk',
        				'buildid':'xxx',
                        'test_hierarchy':'QT;QT1;FSIH_CPRI;',
                        'total_count':500,
                        'cases':[
                            {
                                'name':'SWDL_SEM',
                                'start':1436965447,
                                'end':1436966447,
                                'result':'PASS',
                                'url':'xxxx'
                            },
                            {
                                'name':'TCP_DOWNLOAD',
                                'start':1436965447,
                                'end':1436966447,
                                'result':'PASS',
                                'url':'xxxx'
                            }
                            
                        ]
    				},{
                        'bl':'TD-LTE',
                        'product':'macrotdd',
                        'branch':'trunk',
        				'buildid':'xxx',
                        'test_hierarchy':'CRT;CRT1;FSMR3;',
                        'total_count':555,
    				},{
                        'bl':'TD-LTE',
                        'product':'macrotdd',
                        'branch':'trunk',
        				'buildid':'yyy',
                        'test_hierarchy':'CRT;CRT2;FSIH_CPRI',
                        'total_count':500,
    				},{
                        'bl':'TD-LTE',
                        'product':'macrotdd',
                        'branch':'trunk',
        				'buildid':'xxx',
                        'test_hierarchy':'QT;QT1;FSMR3',
                        'total_count':500,
    				}];
        superagent.post(posturl).send(pdata).end(function(e,res){
            expect(res.status).to.eql(201);
            db.collection('pci').find({}).sort({buildid:1}).toArray( function(err,builds){
                expect(err).to.eql(null);
                expect(builds.length).to.eql(2);
                expect(builds[0].buildid).to.eql('xxx');
                expect(builds[1].buildid).to.eql('yyy');
                expect(builds[0].pci[0]).to.have.property('name');
                expect(builds[0].pci[0]['name']).to.eql('qt');
                expect(builds[0].pci[1]['name']).to.eql('crt');
                expect(builds[0].pci[0]).to.have.property('children');
                expect(builds[0].pci[0]['children'][0]['name']).to.eql('qt1');
                expect(builds[0].pci[0]['children'][0]['children'][0]['name']).to.eql('fsih_cpri');
                expect(builds[0].pci[0]['children'][0]['children'][0]['pass_count']).to.eql(2);
                expect(builds[0].pci[0]['children'][0]['children'][1]['name']).to.eql('fsmr3');
                done();
            });
        });        
    });

    it('Post correct data to pci merge new test', function(done) {
    	var data = {
                    'bl':'td-lte',
    				'buildid':'xxx',
                    'product':'macrotdd',
                    'branch':'trunk',
    				changes:[1,3,5],
    				pci: [{
                                name:'crt',
        						buildid:'xxx',
        						start:1402437811,
        						end:null,
        						score: 2.5
    					   },
                           {
                                name:'qt',
                                children:[{
                                    name:'qt1',
                                    children:[{
                                        name:'fsih_cpri',
                                        start:1404444444,
                                        pass_count:1,
                                        total_count:10,
                                    }]
                                }]
                           }
                         ]
    				};
        db.collection('pci').insert(data, function(err, res) {
            expect(err).to.eql(null);            
        	var pdata = [{
                            'bl':'td-lte',
                            'product':'macrotdd',
                            'branch':'trunk',
            				'buildid':'xxx',
                            'test_hierarchy':'QT;QT1;FSIH_CPRI;',
                            'start':1111111111,
                            'total_count':500,
                            'cases':[
                                {
                                    'name':'SWDL_SEM',
                                    'start':1436965447,
                                    'end':1436966447,
                                    'result':'PASS',
                                    'url':'xxxx'
                                },
                                {
                                    'name':'SWDL_SEM1',
                                    'start':1436965447,
                                    'end':1436966447,
                                    'result':'FAIL',
                                    'url':'xxxx'
                                },
                                {
                                    'name':'SWDL_SEM3',
                                    'start':1436965447,
                                    'end':1436966447,
                                    'result':'FAIL',
                                    'weight':0,
                                    'url':'xxxx'
                                },
                                {
                                    'name':'TCP_DOWNLOAD',
                                    'start':1436965447,
                                    'end':1436966447,
                                    'result':'PASS',
                                    'url':'xxxx'
                                }],
        				},{
                            'bl':'td-lte',
                            'product':'macrotdd',
                            'branch':'trunk',
            				'buildid':'xxx',
                            'test_hierarchy':'QT;QT1;FSMR3;',
                            'total_count':555,
        				}];
            superagent.post(posturl).send(pdata).end(function(e,res){
                expect(e).to.eql(null);
                expect(res.status).to.eql(201);
                db.collection('pci').find({}).toArray( function(err,builds){
                    expect(err).to.eql(null);
                    expect(builds.length).to.eql(1);
                    expect(builds[0].buildid).to.eql('xxx');
                    expect(builds[0].pci[0]).to.have.property('name');
                    expect(builds[0].pci[0]['name']).to.eql('crt');
                    expect(builds[0]['changes']).to.eql([1,3,5]);
                    expect(builds[0].pci[1]['name']).to.eql('qt');
                    expect(builds[0].pci[1]).to.have.property('children');
                    expect(builds[0].pci[1]['children'][0]['name']).to.eql('qt1');
                    expect(builds[0].pci[1]['children'][0]['children'][0]['name']).to.eql('fsih_cpri');
                    expect(builds[0].pci[1]['children'][0]['children'][0]['total_count']).to.eql(500);
                    expect(builds[0].pci[1]['children'][0]['children'][0]['pass_count']).to.eql(3);
                    expect(builds[0].pci[1]['children'][0]['children'][0]['start']).to.eql(1404444444);
                    expect(builds[0].pci[1]['children'][0]['children'][1]['name']).to.eql('fsmr3');
                    done();
                });
            });        
        })
    });

    it('Post correct data to pci merge new test case', function(done) {
    	var data = {
                    'bl':'td-lte',
    				'buildid':'xxx',
                    'product':'macrotdd',
                    'branch':'trunk',
    				changes:[1,3,5],
    				pci: [{
                                name:'crt',
        						buildid:'xxx',
        						start:1402437811,
        						end:null,
        						score: 2.5
    					   },
                           {
                                name:'qt',
                                children:[{
                                    name:'qt1',
                                    children:[{
                                        name:'fsih_cpri',
                                        total_count:10,
                                        'cases':[
                                            {
                                                'name':'swdl_sem',
                                                'start':1436965447,
                                                'end':1436966447,
                                                'result':'PASS',
                                                'url':'xxxx'
                                            },
                                            {
                                                'name':'tcp_download',
                                                'start':1436965447,
                                                'end':1436966447,
                                                'result':'PASS',
                                                'url':'xxxx'
                                            }
                                        ]
                                    }]
                                }]
                           }
                         ]
    				};

        db.collection('pci').insert(data, function(err, res) {
            expect(err).to.eql(null);            
        	var pdata = [{
                            'bl':'td-lte',
                            'product':'macrotdd',
                            'branch':'trunk',
            				'buildid':'xxx',
                            'test_hierarchy':'qt;qt1;fsih_cpri',
                            'cases':[
                                    {
                                        'name':'swdl_sem',
                                        'start':1036965447,
                                        'end':1436966447,
                                        'result':'PASS',
                                        'url':'xxxx'
                                    },
                                    {
                                        'name':'udp_download',
                                        'start':1436965447,
                                        'end':1436966447,
                                        'result':'PASS',
                                        'url':'xxxx'
                                    }
                                ]
        				},{
                            'bl':'td-lte',
                            'product':'macrotdd',
                            'branch':'trunk',
            				'buildid':'xxx',
                            'test_hierarchy':'QT;QT1;FSMR3;',
                            'total_count':555,
        				}];
            superagent.post(posturl).send(pdata).end(function(e,res){
                expect(e).to.eql(null);
                expect(res.status).to.eql(201);
                db.collection('pci').find({}).toArray( function(err,builds){
                    expect(err).to.eql(null);
                    expect(builds.length).to.eql(1);
                    expect(builds[0].buildid).to.eql('xxx');
                    expect(builds[0].pci[0]).to.have.property('name');
                    expect(builds[0].pci[0]['name']).to.eql('crt');
                    expect(builds[0].pci[1]['name']).to.eql('qt');
                    expect(builds[0].pci[1]).to.have.property('children');
                    expect(builds[0].pci[1]['children'][0]['name']).to.eql('qt1');
                    expect(builds[0].pci[1]['children'][0]['children'][0]['name']).to.eql('fsih_cpri');
                    expect(builds[0].pci[1]['children'][0]['children'][0]['total_count']).to.eql(10);
                    expect(builds[0].pci[1]['children'][0]['children'][0]['cases'].length).to.eql(3);
                    expect(builds[0].pci[1]['children'][0]['children'][0]['cases'][0]['start']).to.eql(1436965447);
                    expect(builds[0].pci[1]['children'][0]['children'][1]['name']).to.eql('fsmr3');
                    done();
                });
            });        
        })
    });


    it('Post hierarchy data', function(done) {
    	var data = [{
    				'bl':'td-lte',
                    'product':'macrotdd',
                    'branch':'trunk',
                    'type':'scbuild',
                    'test_hierarchy':'crt;crt1;cpri',
                    'createtime':1460517488,
                    'endtime':9999999999,
                    'active':1,
                    'order':3,
    				},{
    				'bl':'td-lte',
                    'product':'macrotdd',
                    'branch':'trunk',
                    'type':'product',
                    'test_hierarchy':'qt;qt1;cpri',
                    'createtime':1460517488,
                    'active':0,
                    'order':99,
    				}];
        db.collection('pci_hierarchy').insert(data, function(err, res) {
            expect(err).to.eql(null);            
        	var pdata = [{
                            'provider_email':'yang.1.chen@nsn.com',
                            'bl':'td-lte',
                            'product':'macrotdd',
                            'branch':'trunk',
                            'type':'scbuild',
                            'test_hierarchy':'crt;crt1;cpri',
                            'order':1,
                            'active':0,
        				},{
                            'bl':'td-lte',
                            'product':'macrotdd',
                            'branch':'trunk',
                            'test_hierarchy':'QT;QT1;cpri',
                            'order':4
        				},{
                            'bl':'td-lte',
                            'product':'macrotdd',
                            'branch':'trunk',
                            'test_hierarchy':'QT;QT1;FSMR3;',
                            'order':78
        				}];
            setTimeout(function(){
                superagent.post(hierurl).send(pdata).end(function(e,res){
                    expect(e).to.eql(null);
                    expect(res.status).to.eql(201);
                    db.collection('pci_hierarchy').find({}).sort({order:1}).toArray( function(err,items){
                        expect(err).to.eql(null);
                        expect(items.length).to.eql(4);
                        expect(items[0].test_hierarchy).to.eql('crt;crt1;cpri');
                        expect(items[0].type).to.eql('scbuild');
                        expect(items[0].order).to.eql(1);
                        expect(items[0].active).to.eql(0);
                        expect(items[1].test_hierarchy).to.eql('qt;qt1;cpri');
                        expect(items[1].order).to.eql(4);
                        expect(items[1].active).to.eql(1);
                        expect(items[2].test_hierarchy).to.eql('qt;qt1;fsmr3');
                        expect(items[2].order).to.eql(78);
                        expect(items[2].type).to.eql('product');
                        expect(items[2].active).to.eql(1);
                        expect(items[3].test_hierarchy).to.eql('qt;qt1;cpri');
                        expect(items[3].order).to.eql(99);
                        expect(items[3].active).to.eql(0);
                        done();
                    });
                }); 
            },1000);       
        })
    });

    it('Post test case data', function(done) {
    	var data = [{
    				'bl':'td-lte',
                    'product':'macrotdd',
                    'branch':'trunk',
                    'test_hierarchy':'crt;crt1;cpri',
                    'name':'swdl',
                    'active':0,
                    'order':1,
                    'type':'product',
    				},{
    				'bl':'td-lte',
                    'product':'macrotdd',
                    'branch':'trunk',
                    'test_hierarchy':'crt;crt1;cpri',
                    'name':'xxx',
                    'active':1,
                    'order':2,
                    'type':'product',
    				}];
        db.collection('pci_testcase').insert(data, function(err, res) {
            expect(err).to.eql(null);            
        	var pdata = [{
                            'provider_email':'yang.1.chen@nsn.com',
            				'bl':'td-lte',
                            'product':'macrotdd',
                            'branch':'trunk',
                            'test_hierarchy':'crt;crt1;cpri',
                            'name':'swdl',
                            'active':1,
                            'order':10
        				},{
            				'bl':'td-lte',
                            'product':'macrotdd',
                            'branch':'trunk',
                            'test_hierarchy':'crt;crt1;cpri',
                            'name':'xxx',
                            'weight':100,
                            'active':0
        				},{
                            'provider_email':'yang.1.chen@nsn.com',
            				'bl':'td-lte',
                            'product':'macrotdd',
                            'branch':'trunk',
                            'test_hierarchy':'QT;QT1;cpri;',
                            'name':'yyy',
                            'active':1,
                            'order':20,
        				}];
            setTimeout(function(){
                superagent.post(caseurl).send(pdata).end(function(e,res){
                    expect(e).to.eql(null);
                    expect(res.status).to.eql(201);
                    db.collection('pci_testcase').find({}).sort({order:1}).toArray( function(err,items){
                        expect(err).to.eql(null);
                        expect(items.length).to.eql(4);
                        expect(items[0].active).to.eql(0);
                        expect(items[1].active).to.eql(0);
                        expect(items[1].weight).to.eql(100);
                        expect(items[2].active).to.eql(1);
                        expect(items[3].active).to.eql(1);
                        done();
                    });
                }); 
            },1000);       
        })
    });


    it('Get branch data from pci hierarchy', function(done) {
    	var data = [{
    				'bl':'td-lte',
                    'product':'macrotdd',
                    'branch':'trunk',
                    'type':'product',
                    'test_hierarchy':'crt;crt1;cpri',
                    'createtime':1460517488,
                    'order':3,
                    'active':1,
                    'lastbuild_posttime':moment().unix()
    				},{
    				'bl':'td-lte',
                    'product':'macrotdd',
                    'branch':'trunk',
                    'type':'product',
                    'test_hierarchy':'qt;qt1;cpri',
                    'createtime':1460517488,
                    'active':1,
                    'lastbuild_posttime':moment().unix()
    				},{
    				'bl':'td-lte',
                    'product':'macrotdd',
                    'branch':'tl15a',
                    'type':'product',
                    'test_hierarchy':'crt;crt1;cpri',
                    'createtime':1460517488,
                    'order':3,
                    'active':1,
                    'lastbuild_posttime':moment().unix()
    				},{
    				'bl':'td-lte',
                    'product':'macrotdd',
                    'branch':'tl16',
                    'type':'product',
                    'test_hierarchy':'crt;crt1;cpri',
                    'createtime':1460517488,
                    'order':3,
                    'active':0,
                    'lastbuild_posttime':moment().unix()
    				}];
        db.collection('pci_hierarchy').insert(data, function(err, res) {
            expect(err).to.eql(null);            
            superagent.get(conf_url+ '/branch_get').end(function(err, res) {
                expect(err).to.eql(null);
                expect(res).to.have.property('status', 200);
                expect(res).to.have.property('ok', true);
                expect(res.body['results'].length).to.eql(2);
                expect(res.body['results'][0].bl).to.eql('td-lte');
                expect(res.body['results'][1].branch).to.eql('tl15a');
                done();
              });
        })
    });

    it('Get branch data from pci hierarchy', function(done) {
    	var data = [{
    				'bl':'td-lte',
                    'product':'macrotdd',
                    'branch':'trunk',
                    'type':'product',
                    'test_hierarchy':'crt;crt1;cpri',
                    'createtime':1460517488,
                    'order':3,
                    'lastbuild_posttime':moment().unix(),
                    'active':1
    				},{
    				'bl':'td-lte',
                    'product':'macrotdd',
                    'branch':'trunk',
                    'type':'product',
                    'test_hierarchy':'qt;qt1;cpri',
                    'createtime':1460517488,
                    'lastbuild_posttime':moment().unix(),
                    'active':1
    				},{
    				'bl':'td-lte',
                    'product':'macrotdd',
                    'branch':'tl15a',
                    'type':'product',
                    'test_hierarchy':'crt;crt1;cpri',
                    'createtime':1460517488,
                    'order':3,
                    'lastbuild_posttime':moment().unix(),
                    'active':1
    				},{
    				'bl':'td-lte',
                    'product':'macrotdd',
                    'branch':'tl15a',
                    'type':'product',
                    'test_hierarchy':'crt;crt2;cpri',
                    'createtime':1460517488,
                    'order':3,
                    'lastbuild_posttime':moment().unix(),
                    'active':1
    				},{
    				'bl':'td-lte',
                    'product':'macrotdd',
                    'branch':'tl15a',
                    'type':'product',
                    'test_hierarchy':'crt;crt3;cpri',
                    'createtime':1460517488,
                    'order':3,
                    'lastbuild_posttime':moment().unix(),
                    'active':1
    				},{
    				'bl':'td-lte',
                    'product':'macrotdd',
                    'branch':'tlf15a',
                    'type':'product',
                    'createtime':1460517488,
                    'order':3,
                    'lastbuild_posttime':moment().unix(),
                    'active':1
    				}];
        db.collection('pci_hierarchy').insert(data, function(err, res) {
            expect(err).to.eql(null);            
            superagent.get(conf_url+ '/tophier_get').end(function(err, res) {
                expect(err).to.eql(null);
                expect(res).to.have.property('status', 200);
                expect(res).to.have.property('ok', true);
                expect(res.body['results'].length).to.eql(3);
                expect(res.body['results'][0].bl).to.eql('td-lte');
                expect(res.body['results'][1].branch).to.eql('trunk');
                expect(res.body['results'][2].branch).to.eql('tl15a');
                expect(res.body['results'][2].test_hierarchy).to.eql('crt;crt1;cpri');
                done();
              });
        })
    });

    it('Get pci by builid', function(done) {
    	var data = [{
                    '_id':'111',
    				'bl':'td-lte',
                    'product':'macrotdd',
                    'branch':'xxx1',
                    'buildid':'xxx',
                    'test_hierarchy':'crt;crt1;cpri',
                    'buildend':1460520000,
                    'createtime':1460517488,
                    'order':3,
                    'active':1
    				},{
                    '_id':'222',
    				'bl':'td-lte',
                    'product':'macrotdd',
                    'branch':'xxx1',
                    'buildid':'xxx1',
                    'test_hierarchy':'crt;crt1;cpri',
                    'buildend':1460520000,
                    'createtime':1460517488,
                    'order':3,
                    'active':1
    				},{
    				'bl':'td-lte',
                    'product':'macrotdd',
                    'branch':'trunk',
                    'buildid':'yyy',
                    'test_hierarchy':'crt;crt1;cpri',
                    'createtime':1460517488,
                    'order':3,
                    'active':1
    				},{
    				'bl':'td-lte',
                    'product':'macrotdd',
                    'branch':'trunk',
                    'buildid':'zzz',
                    'test_hierarchy':'crt;crt1;cpri',
                    'createtime':1460517488,
                    'order':3,
                    'active':1
    				}];
        db.collection('pci').insert(data, function(err, res) {
            expect(err).to.eql(null);
            var hier_data = [
                {
                    'product':'macrotdd',
                    'branch':'xxx1',
                    'buildid':'xxx',
                    'test_hierarchy':'crt;crt1;cpri',
                    'createtime':1460517488,
                    'order':3,
                    'active':1,
                    'abc':123
                },
                {
                    'product':'macrotdd',
                    'branch':'xxx1',
                    'buildid':'xxx',
                    'test_hierarchy':'crt;crt1;cpri2',
                    'createtime':1460517488,
                    'endtime':1460520000,
                    'order':3,
                    'active':1
                },
                {
                    'product':'macrotdd',
                    'branch':'xxx1',
                    'buildid':'xxx',
                    'test_hierarchy':'crt;crt1;cpri3',
                    'createtime':1460000000,
                    'endtime':1460500000,
                    'order':3,
                    'active':1
                },
            ]
            db.collection('pci_hierarchy').insert(hier_data, function(err, res) {
                expect(err).to.eql(null);   
                superagent.get(posturl+ '/getbuild_by_id_merge_hier?buildid=xxx;xxx1').end(function(err, res) {
                    expect(err).to.eql(null);
                    expect(res).to.have.property('status', 200);
                    expect(res).to.have.property('ok', true);
                    expect(res.body).to.eql([{"_id":"111",
                                             "bl":"td-lte",
                                             "product":"macrotdd",
                                             "branch":"xxx1",
                                             "buildid":"xxx",
                                             "test_hierarchy":"crt;crt1;cpri",
                                             "buildend":1460520000,
                                             "createtime":1460517488,
                                             "order":3,
                                             "active":1,
                                             "pci":[{"name":"crt",
                                                     "children":[{"name":"crt1",
                                                                "children":[{"name":"cpri",
                                                                        "product":"macrotdd",
                                                                        "branch":"xxx1",
                                                        				'bl':'td-lte',
                                                                        "buildid":"xxx",
                                                                        "test_hierarchy":"crt;crt1;cpri",
                                                                        "createtime":1460517488,
                                                                        "order":3,
                                                                        "active":1,"abc":123},
                                                                        {"name":"cpri2",
                                                                        "product":"macrotdd",
                                                                        "branch":"xxx1",
                                                        				'bl':'td-lte',
                                                                        "buildid":"xxx",
                                                                        "test_hierarchy":"crt;crt1;cpri2",
                                                                        "createtime":1460517488,
                                                                        "endtime":1460520000,
                                                                        "order":3,
                                                                        "active":1}]
                                                                }]
                                                    }]
                                            },{"_id":"222",
                                             "bl":"td-lte",
                                             "product":"macrotdd",
                                             "branch":"xxx1",
                                             "buildid":"xxx1",
                                             "test_hierarchy":"crt;crt1;cpri",
                                             "buildend":1460520000,
                                             "createtime":1460517488,
                                             "order":3,
                                             "active":1,
                                             "pci":[{"name":"crt",
                                                     "children":[{"name":"crt1",
                                                                "children":[{"name":"cpri",
                                                                        "product":"macrotdd",
                                                                        "branch":"xxx1",
                                                        				'bl':'td-lte',
                                                                        "buildid":"xxx",
                                                                        "test_hierarchy":"crt;crt1;cpri",
                                                                        "createtime":1460517488,
                                                                        "order":3,
                                                                        "active":1,"abc":123},
                                                                        {"name":"cpri2",
                                                                        "product":"macrotdd",
                                                                        "branch":"xxx1",
                                                        				'bl':'td-lte',
                                                                        "buildid":"xxx",
                                                                        "test_hierarchy":"crt;crt1;cpri2",
                                                                        "createtime":1460517488,
                                                                        "endtime":1460520000,
                                                                        "order":3,
                                                                        "active":1}]
                                                                }]
                                                    }]
                                            }])
                    done();
                  });
            })
        })
    });

    it('Get pci by builid data not exist', function(done) {
        superagent.get(posturl+ '/getbuild_by_id_merge_hier?buildid=xxx').end(function(err, res) {
            expect(err).to.eql(null);
            expect(res).to.have.property('status', 200);
            expect(res).to.have.property('ok', true);
            expect(res.body).to.eql([{
                'buildid':'xxx'
				}])
            done();
          });
    });

    it('Get pci hierarchy list by bl&product&branch', function(done) {
    	var data = [{
    				'bl':'td-lte',
                    'product':'macrotdd',
                    'branch':'trunk',
                    'type':'scbuild',
                    'test_hierarchy':'crt;crt1;cpri',
                    'createtime':1460517488,
                    'order':3,
                    'active':1
    				},{
    				'bl':'td-lte',
                    'product':'macrotdd',
                    'branch':'trunk',
                    'type':'product',
                    'test_hierarchy':'qt;qt1;cpri',
                    'createtime':1460517488,
                    'active':1
    				},{
    				'bl':'td-lte',
                    'product':'macrotdd',
                    'branch':'tl15a',
                    'type':'product',
                    'test_hierarchy':'crt;crt1;cpri',
                    'createtime':1460517488,
                    'order':3,
                    'active':1
    				},{
    				'bl':'td-lte',
                    'product':'macrotdd1',
                    'branch':'tl15a',
                    'type':'product',
                    'test_hierarchy':'crt;crt2;cpri',
                    'createtime':1460517488,
                    'order':3,
                    'active':1
    				},{
    				'bl':'td-lte',
                    'product':'macrotdd',
                    'branch':'tl16a',
                    'type':'product',
                    'test_hierarchy':'crt;crt3;cpri',
                    'createtime':1460517488,
                    'order':3,
                    'active':1
    				},{
    				'bl':'td-lte',
                    'product':'macrotdd',
                    'branch':'tlf15a',
                    'type':'product',
                    'createtime':1460517488,
                    'order':3,
                    'active':0
    				}];
        db.collection('pci_hierarchy').insert(data, function(err, res) {
            expect(err).to.eql(null);            
            superagent.get(conf_url+ '/hier_get_by_branch?bl=td-lte&product=macrotdd&branch=trunk').end(function(err, res) {
                expect(err).to.eql(null);
                expect(res).to.have.property('status', 200);
                expect(res).to.have.property('ok', true);
                expect(res.body['data'].length).to.eql(1);
                done();
              });
        })
    });
});

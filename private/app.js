module.exports = function (app, client) {
    // Defining modules
    var async = require('async');
    var redis = require('redis');

    // Enabling Strong Etag
    app.set('etag', 'strong');

    // Data Validation
    var Validator = require('jsonschema').Validator;
    var v = new Validator();

    // JSON Schema
    var schema = {
        "$schema": "http://json-schema.org/draft-04/schema#",
        "title": "JSON Schema",
        "description": "JSON Schema for the Use Case",
        "type": "object",
        "properties": {
            "planCostShares": {
                "type": "object",
                "properties": {
                    "deductible": {
                        "type": "number"
                    },
                    "_org": {
                        "type": "string"
                    },
                    "copay": {
                        "type": "number"
                    },
                    "objectId": {
                        "type": "string"
                    },
                    "objectType": {
                        "type": "string"
                    }
                }
            },
            "linkedPlanServices": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "linkedService": {
                            "type": "object",
                            "properties": {
                                "_org": {
                                    "type": "string"
                                },
                                "objectId": {
                                    "type": "string"
                                },
                                "objectType": {
                                    "type": "string"
                                },
                                "name": {
                                    "type": "string"
                                }
                            }
                        },
                        "planserviceCostShares": {
                            "type": "object",
                            "properties": {
                                "deductible": {
                                    "type": "number"
                                },
                                "_org": {
                                    "type": "string"
                                },
                                "copay": {
                                    "type": "number"
                                },
                                "objectId": {
                                    "type": "string"
                                },
                                "objectType": {
                                    "type": "string"
                                }
                            }
                        },
                        "_org": {
                            "type": "string"
                        },
                        "objectId": {
                            "type": "string"
                        },
                        "objectType": {
                            "type": "string"
                        }
                    }
                }
            },
            "_org": {
                "type": "string"
            },
            "objectId": {
                "type": "string"
            },
            "objectType": {
                "type": "string"
            },
            "planType": {
                "type": "string"
            },
            "creationDate": {
                "type": "string"
            }
        },
        "additionalProperties": false        
    };

    // Hardcoded data used initially for testing
    // var data = {
    //     "planCostShares": {
    //         "deductible": 20,
    //         "_org": "example.com",
    //         "copay": 10,
    //         "objectId": "1234vxc2324sdf",
    //         "objectType": "membercostshare"
    //     },
    //     "linkedPlanServices": [{
    //         "linkedService": {
    //             "_org": "example.com",
    //             "objectId": "1234520xvc30asdf",
    //             "objectType": "service",
    //             "name": "Yearly physical"
    //         },
    //         "planserviceCostShares": {
    //             "deductible": 10,
    //             "_org": "example.com",
    //             "copay": 175,
    //             "objectId": "1234512xvc1314asdfs",
    //             "objectType": "membercostshare"
    //         },
    //         "_org": "example.com",
    //         "objectId": "27283xvx9asdff",
    //         "objectType": "planservice"
    //     }, {
    //         "linkedService": {
    //             "_org": "example.com",
    //             "objectId": "1234520xvc30sfs",
    //             "objectType": "service",
    //             "name": "well baby"
    //         },
    //         "planserviceCostShares": {
    //             "deductible": 10,
    //             "_org": "example.com",
    //             "copay": 175,
    //             "objectId": "1234512xvc1314sdfsd",
    //             "objectType": "membercostshare"
    //         },

    //         "_org": "example.com",

    //         "objectId": "27283xvx9sdf",
    //         "objectType": "planservice"
    //     }],
    //     "_org": "example.com",
    //     "objectId": "12xvxc345ssdsds",
    //     "objectType": "plan",
    //     "planType": "inNetwork",
    //     "creationDate": "12-12-3000"
    // };

    // Rest API's
    app.get('/', function(req, res, next) {
        res.send('Hello from nodejs');
    });

    // Add a new plan
    app.post('/plan', function(req, res, next) {
        const uuidv1 = require('uuid/v1');
        let _id = uuidv1();

        let addPlan = req.body;

        let errors = v.validate(addPlan, schema).errors;
        if (errors.length < 1) {

            for (let key in addPlan) {
                // check also if property is not inherited from prototype
                if (addPlan.hasOwnProperty(key)) {
                    let value = addPlan[key];
                    if(typeof(value) == 'object') {
                        if(value instanceof Array) {
                            for(let i=0; i<value.length; i++) {
                                let eachValue = value[i];
                                // console.log(eachValue);
                                for (let innerkey in eachValue) {
                                    if (eachValue.hasOwnProperty(innerkey)) {
                                        let innerValue = eachValue[innerkey];
                                        if(typeof(innerValue) == 'object') {
                                            client.hmset(_id + "-" + eachValue["objectType"]+"-"+eachValue["objectId"]+"-"+innerkey, innerValue, function(err, result) {
                                                if(err) {
                                                    console.log(err);
                                                }
                                            });
                                            // client.sadd(_id + "-" + eachValue["objectType"]+"-"+eachValue["objectId"]+"-"+innerkey, _id + "-" + innerValue["objectType"]+"-"+innerValue["objectId"]);                                            
                                        } else {
                                            client.hset(_id + "-" + eachValue["objectType"]+"-"+eachValue["objectId"], innerkey, innerValue, function(err, result) {
                                                if(err) {
                                                    console.log(err);
                                                }
                                            });

                                            // MAKE SURE YOU UNCOMMENT THIS.
                                            client.sadd(_id + "-" + addPlan["objectType"]+"-"+addPlan["objectId"]+"-"+key, _id + "-" + eachValue["objectType"]+"-"+eachValue["objectId"]);                                            
                                        }
                                    }
                                }
                            }
                        } else {
                            for (let innerkey in value) {
                                let innerValue = value[innerkey];
                                client.hmset(_id + "-" + addPlan["objectType"]+"-"+addPlan["objectId"]+"-"+key, value, function(err, result) {
                                    if(err) {
                                        console.log(err);
                                    }
                                });
                                // client.sadd(_id + "-" + addPlan["objectType"]+"-"+addPlan["objectId"]+"-"+key, _id + "-" + value["objectType"]+"-"+value["objectId"]);
                            }                            
                        }
                    } else {
                        client.hset(_id + "-" + addPlan["objectType"]+"-"+addPlan["objectId"], key, value, function(err, result) {
                            if(err) {
                                console.log(err);
                            }
                        });
                    }
                }
            }
            res.status(201).send("The key of the newly created plan is: " + _id);
        } else {
            var errorArray = [];
            for (let i = 0; i < errors.length; i++) {
                errorArray.push(errors[i].stack);
            }
            res.status(400).send(errorArray);
        }
    });

    // Retrieve plan details using plan id
    app.get('/plan/:planId', function(req, res, next) {
        let planId = req.params.planId;
        // console.log(planId);
        
        var plan = {};
        plan["linkedPlanServices"] = [];                    
        var linkedPlanServices = {
        };

        client.keys(planId+'*', function (err, plans) {
            var keys = Object.keys(plans.sort());
            var i = 0;
            var l = 0;
            keys.forEach(function (k) {
                client.hgetall(plans[k], function(err, result) {
                    i++;
                    if(plans[k].indexOf("planCostShares") > -1 && typeof(result) != "undefined") {
                        plan["planCostShares"] = result;
                    }

                    if(plans[k].startsWith(planId+"-planservice-") && plans[k].indexOf("linkedService") > -1 && typeof(result) != "undefined") {                            
                        // plan["linkedPlanServices"][l] = {};
                        linkedPlanServices["linkedService"] = result;
                        // plan["linkedPlanServices"][l] = {"linkedService":result};
                        // l++;    
                        if(linkedPlanServices["linkedService"] != undefined && linkedPlanServices["planserviceCostShares"] != undefined) {
                            plan["linkedPlanServices"][l] = linkedPlanServices;
                            l++;
                            linkedPlanServices = {};
                        }                    
                    }
                    
                    if(plans[k].startsWith(planId+"-planservice-") && plans[k].indexOf("planserviceCostShares") > -1 && typeof(result) != "undefined") {                            
                        // plan["linkedPlanServices"][l] = {};
                        linkedPlanServices["planserviceCostShares"] = result;
                        // plan["linkedPlanServices"][l] = {"planserviceCostShares":result};
                        // console.log(linkedPlanServices);
                        
                        // plan["linkedPlanServices"][l] = linkedPlanServices;
                        // l++;        
                        // linkedPlanServices = {};   
                        if(linkedPlanServices["linkedService"] != undefined && linkedPlanServices["planserviceCostShares"] != undefined) {
                            plan["linkedPlanServices"][l] = linkedPlanServices;
                            l++;
                            linkedPlanServices = {};
                        }            
                    }                  
                    
                    

                    if(plans[k].startsWith(planId+"-plan-") && plans[k].indexOf("planCostShares") < 0 && typeof(result) != "undefined") {
                        var resultKeys = Object.keys(result);
                        var resultValues = Object.values(result);
                        for(var j=0; j<resultKeys.length; j++) {
                            plan[resultKeys[j]] = resultValues[j];
                        }
                    }

                    if(i == keys.length) {
                        res.json(plan);
                    }                                    
                });
                
                // if(plans[k].indexOf("linkedPlanServices") > -1) {
                //     client.smembers(plans[k], function(err, result) {
                //         var setresult = Object.keys(result);
                //         var j=0;
                //         var arrayObject = [];
                //         setresult.forEach(function(index) {
                //             client.hgetall(result[index], function(error, hashresult) {
                //                 j++;
                //                 if(error) {
                //                     console.log(error);
                //                 } else {
                //                     arrayObject.push(hashresult);
                //                     plan.push({'linkedPlanServices': arrayObject});
                //                 }
                //                 if (j == setresult.length) {
                //                     res.json(plan[0]);
                //                 }
                //             });                            
                //         });
                //     });
                // } else if(plans[k].startsWith(planId+"-planservice")) {
                //     client.hgetall(plans[k], function(err, result) {
                //         console.log(result);
                //     });                  
                // }
                // client.hgetall(log_list[l], function(e, o) {
                //     i++;
                //     if (e) {
                //         // console.log(e);
                //         var arrayplans = [];
                //         client.smembers(log_list[l], function(err, result) {
                //             if(err) {
                //                 console.log(error);
                //             } else {
                //                 var setkeys = Object.keys(result);
                //                 var j=0;

                //                 setkeys.forEach(function(k) {
                //                     client.hgetall(result[k], function(error, output) {
                //                         j++;
                //                         if(error) {
                //                             console.log(error);
                //                         } else {
                //                             temp_data = output;
                //                             arrayplans.push(temp_data);
                //                             plans.push(arrayplans);
                //                         }

                //                         // if (j == setkeys.length) {
                //                         //     // console.log(plans);
                //                         //     res.json(plans);
                //                         // }
                //                     });
                //                 });
                //             }
                //         });
                //     } else {
                //         temp_data = {'key':log_list[l], 'modified_at':o};
                //         plans.push(temp_data);
                //     }
    
                //     if (i == keys.length) {
                //         // console.log(plans);
                //         res.json(plans);
                //     }
    
                // });
            });
        });        
        
        // function MHGETALL(keys, cb) {
        //     client.multi({pipeline: false});
        
        //     keys.forEach(function(key, index){
        //         client.hgetall(key);
        //     });
        
        //     client.exec(function(err, result){
        //         cb(err, result);
        //     });
        // }

        // client.multi()
        //     .keys(planId+'*', function (err, replies) {
        //         // NOTE: code in this callback is NOT atomic
        //         // this only happens after the the .exec call finishes.
        //         console.log(replies);
        //         client.hgetall(replies, redis.print);
        //     })
        //     .exec(function (err, replies) {
        //         console.log("MULTI got " + replies.length + " replies");
        //         replies.forEach(function (reply, index) {
        //             console.log("Reply " + index + ": " + reply);
        //         });
        //     });

        // client.keys(planId+'*', function (err, keys) {
        //     if(err) {
        //         console.log(err);
        //     }
        //     if(keys) {
        //         async.map(keys, function(key, cb) {
        //             // console.log(keys);
        //             client.hgetall(key, function (error, value) {
        //                 if (error) {
        //                     return cb(error);
        //                 }
        //                 // var plan = {};
        //                 // console.log(key);
        //                 // console.log(value);
        //                 plans.push(value);
        //                 // job['jobId']=key;
        //                 // job['data']=value;
        //                 cb(null, plans);
        //             });
        //         }, function (error, results) {
        //             if (error) {
        //                 return console.log(error);
        //             }
        //             console.log(results);
        //             res.json(results);
        //         });
        //     }
        // });

        // client.get(planId, function(err, result) {
        //     if(err) {
        //         console.log(err);
        //     }
        //     if(result) {
        //         res.json(JSON.parse(result));
        //     } else {
        //         res.sendStatus(404);
        //     }
        // });

        // client.hgetall(planId, function(err, result) {
        //     if(err) {
        //         console.log(err);
        //     }
        //     if(result) {
        //         res.json(result);
        //     } else {
        //         res.sendStatus(404);
        //     }
        // });
    });


    // Delete plan using plan id
    app.delete('/plan/:planId', function(req, res, next) {
        let planId = req.params.planId;

        client.keys(planId+"*", function(err, result) {
            if(err) {
                console.log(err);
            }
            if(result.length > 0) {
                client.del(result, function(err, deleted) {
                    if(err) {
                        console.log(err);
                    }
                    if(deleted) {
                        res.status(200).send("All the keys with Plan Id " + planId + " are deleted");
                    } else {
                        res.status(404).send("Plan Id " + planId + " does not exists");
                    }
                });
            } else {
                res.status(404).send("Plan Id " + planId + " does not exists");
            }
        });
        
    });

    // Another way to validate Data with JSON Schema
    // var validate = require('jsonschema').validate;
    // console.log(validate(p, schema));

    // Temporarily commented out (Validating with hardcoded data)
    // console.log(v.validate(data, schema));

};
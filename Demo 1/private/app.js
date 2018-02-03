module.exports = function (app) {
    var Validator = require('jsonschema').Validator;
    var v = new Validator();

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
        }        
    };

    var data = {
        "planCostShares": {
            "deductible": 20,
            "_org": "example.com",
            "copay": 10,
            "objectId": "1234vxc2324sdf",
            "objectType": "membercostshare"
        },
        "linkedPlanServices": [{
            "linkedService": {
                "_org": "example.com",
                "objectId": "1234520xvc30asdf",
                "objectType": "service",
                "name": "Yearly physical"
            },
            "planserviceCostShares": {
                "deductible": 10,
                "_org": "example.com",
                "copay": 175,
                "objectId": "1234512xvc1314asdfs",
                "objectType": "membercostshare"
            },
            "_org": "example.com",
            "objectId": "27283xvx9asdff",
            "objectType": "planservice"
        }, {
            "linkedService": {
                "_org": "example.com",
                "objectId": "1234520xvc30sfs",
                "objectType": "service",
                "name": "well baby"
            },
            "planserviceCostShares": {
                "deductible": 10,
                "_org": "example.com",
                "copay": 175,
                "objectId": "1234512xvc1314sdfsd",
                "objectType": "membercostshare"
            },

            "_org": "example.com",

            "objectId": "27283xvx9sdf",
            "objectType": "planservice"
        }],
        "_org": "example.com",
        "objectId": "12xvxc345ssdsds",
        "objectType": "plan",
        "planType": "inNetwork",
        "creationDate": "12-12-3000"
    };

    // var validate = require('jsonschema').validate;

    console.log(v.validate(data, schema));

    // console.log(validate(p, schema));
};
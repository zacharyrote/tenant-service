'use strict';
const ApiBinding = require('discovery-proxy').ApiBinding;
const assert = require('assert');

const tenantServiceFactory = require('./resources/serviceFactory').tenantServiceFactory;

const mongoose = require('mongoose');

/**
 * Start Tenant Service
 */
const startTenantService = () => {
    let p = new Promise((resolve, reject) => {
        tenantServiceFactory('TenantService', (err, server) => {
            resolve(server);
        });
    });
    return p;        
}


describe('post-tenant', (done) => {
    let tenantService = null;
    let tenantUrl = 'mongodb://localhost:27017/cdspTenant';

    let tenantEntry = {
        "status" : "Active",
        "timestamp" : Date.now(),
	    "name" : "Testerson",
	    "services" : [{
			"name" : "DiscoveryService",
			"_id" : mongoose.Types.ObjectId("58a98bad624702214a6e2ba9")
		}]
    };

    let clearTenantDB  = require('mocha-mongoose')(tenantUrl, {noClear: true})

    before((done) => {
        startTenantService().then((server) => {
            tenantService = server;
        }).then(() => {
            done();
        }).catch((err) => {
            done(err);
        });
    });

    it('Post Tenant with Success', (done) => {
        let service = {
            endpoint: 'http://localhost:8616',
            schemaRoute: '/swagger.json'
        };

        let apiBinding = new ApiBinding(service);
        

        apiBinding.bind().then((service) => {
            if(service) {
                service.api.tenants.saveTenant({'x-fast-pass': true, tenant: tenantEntry}, (tenant) => {
                    if(tenant.obj) {
                        done();
                    }
                }, (err) => {
                    done(err);
                });
            } else {
                done(new Error('Tenant Service Not Found'));
            }
        });
    });


    after((done) => {
        clearTenantDB((err) => {
            if(err) done(err);
            else done();
        })
    });
})
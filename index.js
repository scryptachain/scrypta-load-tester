const ScryptaCore = require('@scrypta/core')
var crypto = require('crypto');

// runs in each instance
var cluster = require('cluster');
var numCPUs = require('os').cpus().length;

async function init(){
    if (cluster.isMaster) {
        for(var i = 0; i < numCPUs; i++) cluster.fork();
    } else {
        console.log('STARTING WORKER')
        const scrypta = new ScryptaCore
        scrypta.staticnodes = true
        scrypta.testnet = true
        scrypta.MAX_OPRETURN = 45000
        let finish = false
        let i = 1
        let limit = 10000
        let password = crypto.randomBytes(16).toString('hex')
        console.log('CREATING ADDRESS')
        let address = await scrypta.createAddress(password, false)
        console.log('FUNDING ADDRESS')
        let init = await scrypta.post('/init',{ address: address.pub})
        if(init.data.airdrop_tx !== false){
            console.log('INITIALIZATION OF ' + address.pub + ' WAS SUCCESSFUL.')
            while(!finish){
                let random = crypto.randomBytes(20000).toString('hex')
                try{
                    console.log('WRITING DATA #' + i)
                    let written = await scrypta.write(address.walletstore, password, random)
                    console.log(written.txs)
                }catch(e){
                    console.log('ERROR ON IDANODE')
                }
                i++
                if(i >= limit){
                    finish = true
                    console.log('FINISHED!')
                }
            }
        }
    }
}

init()
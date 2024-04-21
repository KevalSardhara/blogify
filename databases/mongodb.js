const mongoose = require('mongoose');

async function connectionMongoodb(mongodb_url){
    await mongoose.connect(mongodb_url);
} 

module.exports = {
    connectionMongoodb,
}

const AWS = require('aws-sdk');

// Set the region to Asia Mumbai (ap-south-1)
AWS.config.update({ region: 'ap-south-1' });

// Create an S3 instance
const s3 = new AWS.S3();

// Example: Download an object from an S3 bucket
const params = {
    Bucket: 'github',
    Key: 'KevalSardhara/blogify.git'
};

s3.getObject(params, (err, data) => {
    if (err) {
        console.error('Error downloading object:', err);
    } else {
        console.log('Successfully downloaded object:', data);
    }
});
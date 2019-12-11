const aws = require('aws-sdk');
const uuid = require('uuid/v4');

aws.config.update({
    accessKeyId: process.env.accessKeyId,
    secretAccessKey: process.env.secretAccessKey
})

const S3_BUCKET = process.env.bucketName;
const region = 's3-ap-southeast-1.amazonaws';

exports.getSignedUrl = (req, res) => {
    const s3 = new aws.S3();

    const fileName = `${req.body.fileName}/${uuid()}`;
    const fileType = req.body.fileType;

    const s3Params = {
        Bucket: S3_BUCKET,
        Key: `${fileName}.${fileType}`,
        Expires: 100,
        ContentType: fileType,
        ACL: 'public-read'
    };

    s3.getSignedUrl('putObject', s3Params, (err, url) => {
        if (err) {
            res.status(400).json({
                success: false,
                error: err
            })
        }

        const returnUrl = {
            signedUrl: url,
            imageUrl: `https://${S3_BUCKET}.${region}.com/${fileName}.${fileType}`
        };

        res.status(200).json({
            success: true,
            data: {
                returnUrl
            }
        });
    });
}

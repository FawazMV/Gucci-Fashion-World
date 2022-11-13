const { S3 } = require('aws-sdk')
const path = require('path')


exports.s3Uploadv2 = async (file) => {
    const s3 = new S3()

    const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `Category_images/${Date.now()}-category${path.extname(file.originalname)}`,
        Body: file.buffer
    }
    return await s3.upload(params).promise();
}


exports.s3Uploadv3 = async (files) => {
    const s3 = new S3()
    let count = 0
    const paramss = files.map(file => {
        return {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: `Products_images/${count++}_${Date.now()}-product ${path.extname(file.originalname)} `,
            Body: file.buffer
        }
    })
    console.log(paramss)
    return await Promise.all(paramss.map(params => s3.upload(params).promise()))

}


exports.s3delte2 = async (name) => {
    const s3 = new S3()
    s3.deleteObject({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: name.Key
    }).promise()
}


exports.s3delte3 = async (name) => {
    const s3 = new S3()
    s3.deleteObject({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: name.Key
    }).promise()
}

exports.s3delte3 = async (files) => {
    const s3 = new S3()

    const params = files.map(file => {
        return {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: file.Key
        }
    })
    Promise.all(params.map(param => s3.deleteObject(param).promise()))
}
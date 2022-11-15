const accoutnSID = process.env.accoutnSID
const serviceSID = process.env.serviceSID
const authToken = process.env.authToken
const client = require("twilio")(accoutnSID, authToken);
exports.otpcallin = (number) => {

    client.verify.services(serviceSID).verifications.create({
        to: `+91${number}`,
        channel: "sms",
    })
}

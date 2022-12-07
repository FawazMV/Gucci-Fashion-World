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
exports.otpVeryfication = (otp, userNumber) => {
    return new Promise((resolve, reject) => {
        client.verify.v2.services(serviceSID)
            .verificationChecks
            .create({ to: `+91${userNumber}`, code: otp })
            .then(response => {
                if (response.valid) resolve(true)
                else resolve(false)
            })
    })
}



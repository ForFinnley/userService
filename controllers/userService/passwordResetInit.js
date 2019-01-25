const cryptoUtil = require("../utils/crypto.js");
const nodemailer = require("../utils/nodemailer.js");
const httpUtil = require('../utils/httpUtil.js');


function validate(body, res) {
  if (!body.email) {
    res.status(400).send(httpUtil.createResponse(400, "ERROR : Missing email."));
    return false;
  }
  return true;
}

module.exports.handler = function (req, res) {
  console.log("Starting function passwordResetInit...");
  console.log(req.body);

  if (req.body === null || !validate(req.body, res)) {
    return;
  }
  let email = req.body.email;

  let passwordResetHash = cryptoUtil.hashEncrypt(email);

  nodemailer.passwordReset(email, passwordResetHash);
  return res.status(200).send(httpUtil.createResponse(200, "SUCCESS : Password reset email sent."));
}

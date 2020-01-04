const { encrypt, decrypt } = require('./utils/crypto');
const { sendChangeEmail, sendEmailVerification } = require('./utils/sendGrid');
const { auth } = require('./utils/jwt');
const { queryUserByEmail, updateEmail } = require('./utils/database');

const {
  ValidationError,
  InvalidCredentialsError,
  ResourceExistsError,
  resolveErrorSendResponse
} = require('./utils/errors');

const getRequestMode = body => {
  let requestMode;
  if (body.email && body.changeEmailHash) {
    requestMode = 'CHANGE_EMAIL_CONFIRM';
    return requestMode;
  } else if (
    (body.email && !body.changeEmailHash) ||
    (body.changeEmailHash && !body.email)
  ) {
    throw new ValidationError('MISSING_REQUIRED_PARAMETERS');
  }
  return;
};

module.exports.handler = async (req, res) => {
  try {
    if (getRequestMode(req.body) === 'CHANGE_EMAIL_CONFIRM') {
      const email = req.body.email.trim().toLowerCase();
      const userId = decrypt(req.body.changeEmailHash);
      const user = await queryUserByEmail(email);
      if (user) throw new ResourceExistsError('email already in use');

      await updateEmail(userId, email);
      const emailHash = hashEncrypt(email);
      const mailerResult = await sendEmailVerification(email, emailHash);
      if (!mailerResult) console.log('ERROR:: Email Not Sent.');
      return res.status(200).send({ message: 'Change email complete!' });
    }
    //Change Email Init
    req.user = await auth(req.headers.authorization);
    if (!req.user) throw new InvalidCredentialsError('unauthorized');
    const newEmailHash = encrypt(req.user.userId);
    const mailerResult = await sendChangeEmail(req.user.email, newEmailHash);
    if (!mailerResult) throw new ValidationError('change email not sent');
    return res.status(200).send({ message: 'Change email sent!' });
  } catch (e) {
    resolveErrorSendResponse(e, res);
  }
};
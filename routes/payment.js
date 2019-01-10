const express = require("express");
const router = express.Router();
const expressJwt = require("express-jwt");
const secret = require("../controllers/utils/keys/privateKey");
const authenticate = expressJwt({ secret: secret.key });
const addFullUser = require("../controllers/utils/addFullUser");

const adminUtil = require("../controllers/utils/adminUtil.js");
const setBillingCard = require("../controllers/payment/setBillingCard");
const deleteBillingCard = require("../controllers/payment/deleteBillingCard");


/**
 * payment/setBillingCard
 * Headers: authorization: Bearer <Token>
 * Body: token, line1, city, country, line2, postalCode, state
 * Takes in source token created on frontend from stripe and shipping address of cardholder.
 * Creates a card in stripe and creates a new customer or assigns it to customer if they already exist, writes info to DB (userModel)
 */
router.post("/setBillingCard", authenticate, addFullUser, setBillingCard.handler);

/**
 * payment/deleteBillingCard
 * Headers: authorization: Bearer <Token>
 * Deletes a customer's card in stripe and DB (userModel)
 */
router.get("/deleteBillingCard", authenticate, addFullUser, deleteBillingCard.handler);

module.exports = router;

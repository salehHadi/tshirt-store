const BigPromiss = require("../middlewares/bigPromiss");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

exports.sendStripeKey = BigPromiss(async (req, res, next) => {
  res.status(200).json({
    stripeKey: process.env.STRIPE_API_KEY,
  });
});

exports.captureStripePayment = BigPromiss(async (req, res, next) => {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: req.body.amount,
    currency: "aed",
    // optinal
    metadata: { integration_check: "accept_a_payment" },
  });

  res.status(200).json({
    success: true,
    paymentIntent,
  });
});

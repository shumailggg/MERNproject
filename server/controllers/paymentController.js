const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const processPayment = async (req, res, next) => {
  try {
    const myPayment = await stripe.paymentIntents.create({
      amount: req.body.amount,
      currency: "inr",
      metadata: {
        company: "Shumail Store",
      },
    });

    res
      .status(200)
      .json({ success: true, client_secret: myPayment.client_secret });
  } catch (error) {
    next(error);
  }
};

//Sending Key
const sendStripeApiKey = async (req, res, next) => {
  try {
    res.status(200).json({ StripeApiKey: process.env.STRIPE_API_KEY });
  } catch (error) {
    next(error);
  }
};

module.exports = { processPayment, sendStripeApiKey };

import Payment from "../models/payment.js";
import User from "../models/users.js";
import { backend_url, frontend_url } from "../utils/constant.js";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

// Define a function to retry requests with exponential backoff
async function retryRequest(requestPromise, retryCount = 0) {
  const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff delay
  return requestPromise.catch((error) => {
    if (error.code === "EAI_AGAIN" && retryCount < 3) {
      console.log(
        `DNS lookup failed for ${error.config.url}. Retrying attempt ${
          retryCount + 1
        } after ${delay}ms`
      );
      return new Promise((resolve) =>
        setTimeout(
          () => resolve(retryRequest(requestPromise, retryCount + 1)),
          delay
        )
      );
    } else {
      throw error;
    }
  });
}

//TODO
const CHAPA_AUTH_KEY = process.env.CHAPA_AUTH_KEY; //Put Your Chapa Secret Key
const acceptPayment = async (req, res) => {
  const userId = req.user; // Retrieve user data from request
  // console.log("User Data:", userId); // Log user data

  const { amount, currency, email, first_name, last_name, phone_number } =
    req.body; // Destructure required fields from request body
  // console.log("Payment Data:", req.body); // Log payment data

  const TEXT_REF = `${first_name}${Date.now()}`; // Generate a unique transaction reference
  const CALLBACK_URL = `${backend_url}/api/v1/payment/verify-payment/${TEXT_REF}/${userId}`; // Define callback URL

  try {
    const config = {
      headers: {
        Authorization: `Bearer ${CHAPA_AUTH_KEY}`,
        "Content-Type": "application/json",
      },
    };

    const body = {
      amount,
      currency,
      email,
      first_name,
      last_name,
      phone_number,
      tx_ref: TEXT_REF,
      return_url: `${frontend_url}/menteedashboard/settings/get-paid`,
      callback_url: CALLBACK_URL,
    };
    const response = await retryRequest(
      axios.post("https://api.chapa.co/v1/transaction/initialize", body, config)
    );
    res.status(200).json(response.data);
  } catch (error) {
    if (error.response) {
      if (error.response.status === 400) {
        return res.status(400).json({
          error: "Bad Request",
          message: "The request was invalid. Please check your input data.",
        });
      } else if (error.response.status === 401) {
        return res.status(401).json({
          error: "Unauthorized",
          message: "Authentication failed. Please check your credentials.",
        });
      } else {
        return res.status(500).json({
          error: "Internal Server Error",
          message:
            "Something went wrong on the server. Please try again later.",
        });
      }
    } else if (error.request) {
      // Handle case where no response was received
      return res.status(500).json({
        error: "No Response",
        message: "The server did not respond. Please try again later.",
      });
    } else {
      // Handle other errors
      return res.status(500).json({
        error: "Request Error",
        message: "Failed to make the request. Please try again later.",
      });
    }
  }
};

const verifyPayment = async (req, res) => {
  const tx_ref = req.params.id;
  const user_id = req.params.userId;

  // Request header with Chapa secret key
  const config = {
    headers: {
      Authorization: `Bearer ${CHAPA_AUTH_KEY}`,
    },
  };

  // Verify the transaction
  try {
    const responseFromChapa = await retryRequest(
      axios.get(`https://api.chapa.co/v1/transaction/verify/${tx_ref}`, config)
    );

    console.log("something is happening");
    // Extract necessary data from the Chapa response
    const chapaData = responseFromChapa.data.data;
    console.log("chapa verify data", chapaData);
    if (!chapaData.currency) {
      chapaData.currency = "ETB"; // default currency
    }

    // Construct payment object with required fields
    const payment = new Payment({
      tx_ref: chapaData.tx_ref,
      email: chapaData.email,
      phoneNumber: chapaData.phoneNumber,
      fullName: chapaData.first_name + " " + chapaData.last_name,
      amount: chapaData.amount,
      currency: chapaData.currency,
      reference: chapaData.reference,
      status: chapaData.status,
      user: user_id,
      verified_at: new Date(), // Add verified_at field with current date/time
    });

    // Save the transaction
    const savedPayment = await payment.save();

    // Find the user by email
    const user = await User.findById(user_id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    // Update the user's remaining balance
    user.remainingBalance += chapaData.amount;
    await user.save();

    res.json({ payment: savedPayment, user });
  } catch (error) {
    console.log("error from catch", error);
    res.status(500).json({ error: "Failed to verify and save payment" });
  }
};
const transferPayment = async (req, res) => {
  const userId = req.params.userId; // Extract userId from request parameters
  console.log(req.body);
  const {
    account_name,
    account_number,
    amount,
    currency,
    reference,
    bank_code,
  } = req.body;

  // Calculate the service fee (2% for example of the transfer amount)
  const serviceFee = amount * 0.02;
  const netAmount = amount * 0.98; // Amount to be transferred to the user

  try {
    // Retrieve the user's remaining balance directly from your database
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const userBalance = user.remainingBalance;

    // Check if the user has sufficient funds
    if (userBalance < amount) {
      return res.status(400).json({
        error: "Insufficient funds",
        message:
          "The user does not have enough funds to complete this transfer.",
      });
    }

    const transferData = {
      account_name,
      account_number,
      amount: netAmount, // Amount after deducting the service fee
      currency,
      reference,
      bank_code,
    };

    const response = await axios.post(
      "https://api.chapa.co/v1/transfers",
      transferData,
      {
        headers: {
          Authorization: `Bearer ${process.env.CHAPA_AUTH_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Transfer initiated successfully:", response.data);
    res.status(200).json({
      message: "Transfer initiated successfully",
      serviceFee: serviceFee.toFixed(2), // Return the service fee as well
      netAmount: netAmount.toFixed(2), // Return the net amount sent to the user
      data: response.data,
    });
  } catch (error) {
    console.error(
      "Failed to initiate transfer:",
      error.response ? error.response.data : error.message
    );
    res.status(500).json({
      error: "Failed to initiate transfer",
      message: error.response ? error.response.data : error.message,
    });
  }
};

// Get all transfers
const getAllTransfers = async (req, res) => {
  try {
    const response = await axios.get("https://api.chapa.co/v1/transfers", {
      headers: {
        Authorization: `Bearer ${CHAPA_AUTH_KEY}`,
        "Content-Type": "application/json",
      },
    });

    console.log("Transfers fetched successfully:", response.data);
    res.status(200).json({
      message: "Transfers fetched successfully",
      data: response.data,
    });
  } catch (error) {
    console.error("Failed to fetch transfers:", error);
    res.status(500).json({
      error: "Failed to fetch transfers",
      message: error.response ? error.response.data : error.message,
    });
  }
};

// Get specific transfer by reference
const getTransferByReference = async (req, res) => {
  const { reference } = req.params;

  try {
    const response = await axios.get(
      `https://api.chapa.co/v1/transfers/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${CHAPA_AUTH_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Transfer fetched successfully:", response.data);
    res.status(200).json({
      message: "Transfer fetched successfully",
      data: response.data,
    });
  } catch (error) {
    console.error("Failed to fetch transfer:", error);
    res.status(500).json({
      error: "Failed to fetch transfer",
      message: error.response ? error.response.data : error.message,
    });
  }
};

// const verifyPayment = async (req, res) => {
//   console.log("am inside verify payment");
//   const tx_ref = req.params.id;
//   const group_id = req.params.groupId;
//   const user_id = req.params.userId;
//   const round = req.params.round;
//   // console.log("params", req.params);
//   // req header with chapa secret key
//   const config = {
//     headers: {
//       Authorization: `Bearer ${CHAPA_AUTH_KEY}`,
//     },
//   };
//   //verify the transaction
//   try {
//     const responseFromChapa = await retryRequest(
//       axios.get(`https://api.chapa.co/v1/transaction/verify/${tx_ref}`)
//     );
//     // console.log(responseFromChapa);
//     console.log("something is happen");
//     // Extract necessary data from the Chapa response
//     const chapaData = responseFromChapa.data.data;
//     console.log("chapa verify data", chapaData);
//     // Construct payment object with required fields
//     const payment = new Payment({
//       tx_ref: chapaData.tx_ref,
//       email: chapaData.email,
//       phoneNumber: chapaData.phoneNumber,
//       fullName: chapaData.fullName,
//       amount: chapaData.amount,
//       currency: chapaData.currency,
//       reference: chapaData.reference,
//       status: chapaData.status,
//       verified_at: new Date(), // Add verified_at field with current date/time

//     });

//     // Save the transaction
//     const savedPayment = await payment.save();
//     // console.log("saved transaction", savedPayment);
//     res.json(savedPayment);
//   } catch (error) {
//     console.log("error from catch", error);
//     res.status(500).json({ error: "Failed to verify and save payment" });
//   }
// };
// //List banks
// const response = axios.get("https://api.chapa.co/v1/banks", {
//   headers: {
//     Authorization: `Bearer ${CHAPA_AUTH_KEY}`,
//     "Content-Type": "application/json",
//   },
// });
// const banks = response.data;
// console.log(banks);
// //trnsfer payment to the winner
// const transferPayment = async (req, res) => {
//   const response = await axios.post("https://api.chapa.co/v1/transfers");
// };
// Get all payments
const getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find();
    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve payments" });
  }
};

// Get all payments for a specific user
const getAllPaymentsByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const payments = await Payment.find({ user: userId });
    // .populate("user")
    // .populate("equbGroup");
    res.json(payments);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to retrieve payments for the user" });
  }
};

export {
  acceptPayment,
  verifyPayment,
  getAllPayments,
  getAllPaymentsByUserId,
  transferPayment,
  getAllTransfers,
  getTransferByReference,
};

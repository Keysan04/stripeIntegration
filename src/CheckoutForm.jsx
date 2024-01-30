import React, { useState } from "react";
import axios from "axios";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";

const cart = {
  amount: 25,
  productName: "pen",
};

export const CheckoutForm = () => {
  const strip = useStripe();
  const element = useElements();

  const [form, setForm] = useState({});

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: value,
    });
  };

  const handleOnSubmit = async (e) => {
    e.preventDefault();

    //check if strip is loaded properly
    if (!strip || !element) {
      return alert("not ready to process the payment");
    }

    //get client_secret from our server
    const apiEP = "http://localhost:8080/create-payment-intent";
    const { data } = await axios.post(apiEP, {
      amount: cart.amount,
      currency: "aud",
      paymentMethodType: "card",
    });

    console.log(data);
    //data.clientSecret

    //use strip sdk to actually process the apyment
    const { paymentIntent } = await strip.confirmCardPayment(
      data.clientSecret,
      {
        payment_method: {
          card: element.getElement(CardElement),
          billing_details: {
            name: form.name,
            email: form.email,
          },
        },
      }
    );

    console.log(paymentIntent);

    // if payment is success, send the order details to api to store in new order data
    if (paymentIntent.status === "succeeded") {
      // call order api and send cart, user, payment details to store in your order table
      return alert("Your order has been placed successfully");
    }

    // If unsuccessful Payment, show error
    alert("Unable to process the order try again later");
  };

  return (
    <div>
      <form onSubmit={handleOnSubmit}>
        <div>
          First Name:{" "}
          <input
            onChange={handleOnChange}
            type="text"
            name="name"
            placeholder="Your name"
          />
        </div>

        <div>
          Email:{" "}
          <input
            onChange={handleOnChange}
            type="email"
            name="email"
            placeholder="Your @email.com"
          />
        </div>

        {/* credit card input form */}
        <CardElement options={{ hidePostalCode: true }} />

        <button type="submit">submit</button>
      </form>
    </div>
  );
};

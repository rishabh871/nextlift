import React from 'react';
import {STRIPE} from '@constants/Common';
import {loadStripe} from '@stripe/stripe-js';
import {Elements} from "@stripe/react-stripe-js";
const stripePromise = loadStripe(STRIPE.PUBLIC_KEY);
import Main from './CheckoutForm';

const Checkout = (props) => (
    <Elements stripe={stripePromise}>
        <Main {...props}/>
    </Elements>
);
export default Checkout
const express = require('express');
const ejs= require('ejs');
const paypal = require('paypal-rest-sdk');
const res = require('express/lib/response');
const req = require('express/lib/request');


paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': 'AbMeAfnpckG5RJpXcT0SCsmI5uM7141rwPOlXlzD658HKBGpFBZf3SptYqcA_G1jNCfE1tUniDqXJXzh',
    'client_secret': 'EM9-HjysmGH3oWC8aLfFZK4OrJSrk1FZbg3m30hCsyINm6iOrB1jY-ID5cM4Ls-P2bafMYn_Q-qmDKSo'
  });

const app = express();

app.set('view engine', 'ejs');

app.get('/', (req, res)=>res.render('index'));

app.post('/pay', (req, res)=>{
    const create_payment_json = {
        "intent": "sale",
        "payer": {
            "payment_method": "paypal"
        },
        "redirect_urls": {
            "return_url": "http://localhost:3001/success",
            "cancel_url": "http://localhost:3001/cancel"
        },
        "transactions": [{
            "item_list": {
                "items": [{
                    "name": "Playstation 5",
                    "sku": "001",
                    "price": "5700.00",
                    "currency": "BRL",
                    "quantity": 1
                }]
            },
            "amount": {
                "currency": "BRL",
                "total": "5700.00"
            },
            "description": "Video Game Paystation 5."
        }]
    };

    paypal.payment.create(create_payment_json, function (error, payment) {
        if (error) {
            throw error;
        } else {
            for(let i=0; i< payment.links.length;i++){
                if(payment.links[i].rel === 'approval_url'){
                 res.redirect(payment.links[i].href)
                }
            }
        }
    });
    
});

app.get('/success', (req , res)=>{
   const payerId = req.query.PayerID;
   const paymentId = req.query.paymentId;
   
   const execute_payment_json = {
    "payer_id": payerId,
    "transactions": [{
        "amount": {
            "currency": "BRL",
            "total": "7500.00"
        }
    }]
  };

  paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
    if (error) {
        console.log(error.response);
        throw error;
    } else {
        console.log(JSON.stringify(payment));
        res.send('Success');
    }
});
});

app.get('/cancel', (req, res) => res.send('Cancelled'));

app.listen(3001, () => console.log('Server Started'));

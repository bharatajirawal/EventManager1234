
import signup  from '../Middlewares/Authvalidation';

import express from 'express';
 export const route=express.Router();
route.post('/login',login,(req,res)=>{
    res.send('login sucess');
})
route.post('/signup',signup,(req,res)=>{
    res.send('signup sucess');
})
export default route;


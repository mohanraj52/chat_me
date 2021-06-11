const express=require('express');
const router=express.Router();

router.get('/',(req,res)=>{
    console.log('Route server is running');
    res.send('Route server is running')

})
module.exports=router;
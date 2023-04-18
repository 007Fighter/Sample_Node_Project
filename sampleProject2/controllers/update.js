const AuthController = require("../controllers/auth");
// const connection = require("../connection");

const express = require('express');
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const router = express.Router();
const bcrypt = require("bcryptjs");

router.post("/update-profile", AuthController.isUserLoggedIn, async(req, res, _next) => {
    try{
        const name = req.query.name;
        
        const updated = await prisma.users.update({
            where: { Sl: req.user.Sl },
            data: { name: name },
        })
        console.log(updated);
        
        return res.status(200).send({
                message: 'Updated Successfully.'
            });
    }catch(err){
        console.log(err);
        return res.status(401).send({
            message: 'Update validation fail.'
        });
    }
});

router.post("/update-password", AuthController.isUserLoggedIn, async (req, res, next) => {
    try{
        const { old_password, new_password } = req.query;
        if(await bcrypt.compare(old_password, req.user.password)) {
            
            let hashedPassword = await bcrypt.hash(new_password, 8);
            console.log(hashedPassword);
            
            const updated = await prisma.users.update({
                where: { Sl: req.user.Sl },
                data: { password: hashedPassword },
            })
            console.log(updated);
            
            return res.status(200).send({
                message: 'Password Updated Successfully.'
            });
            
        } else{
            return res.status(400).send({
                message: 'Invalid User'
            })
        }
    } catch(err) {
        console.log(err);
        return res.status(401).send({
            message: 'Unauthorized Validation'
        });
    }
});

module.exports = router;
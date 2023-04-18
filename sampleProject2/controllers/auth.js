const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { promisify } = require("util");

const express = require('express');
const router = express.Router();

const joi = require("@hapi/joi");
const { authSchema } = require("../controllers/validator");

module.exports ={
    signup: async (req, res, _next)=>{
        try{
            const { email, name, password } = req.query;
            if (!email || !name || !password) {
            // const result = await authSchema.validateAsync(req.query);
            // console.log(result);
            // if(error.isJoi === true){
                return res.status(422).send({
                    message: "email, name and password are required!"
                })
            }
            
            const rows = await prisma.users.findMany({
                where: {
                    email: email
                }
            });

            if (rows.length > 0) {
                console.log(rows);
                return res.status(409).send({
                    message: 'User already exists.'
                });
            } else {
                let hashedPassword = await bcrypt.hash(password, 8);
                console.log(hashedPassword);

                const user = await prisma.users.create({
                    data: {
                        name: name, 
                        email: email, 
                        password: hashedPassword
                    },
                });
                
                return res.status(201).send({
                    message: 'Signup Successfull.'
                });
            }
        }catch(err){
            return res.status(500).send({
                message: 'Fail to signup user.'
            }).json(err);
        }  
    },

    login: async (req, res, next)=>{
        try {
            const { email, password } = req.query;
            if (!email || !password) {
                return res.status(422).send({
                    message: "All Fields required."
                })
            }
            const rows = await prisma.users.findFirst({
                where: {
                    email: email
                }
            });

            // console.log(rows);
            if (!rows){
                return res.status(400).send({
                    message: 'User not found'
                })
            }
            let hashedPassword = await bcrypt.hash(password, 8);
            console.log(hashedPassword);
            console.log(rows.password);
            if(!await bcrypt.compare(password, rows.password)) {
                res.status(401).send({
                    message: 'User validation fail'
                })
            } else {
                const id = rows.Sl;
                const email = rows.email;
                const name = rows.name;
                
                const token = jwt.sign({ id, name, email }, process.env.JWT_SECRET, {
                    expiresIn: process.env.JWT_EXPIRES_IN
                });

                const cookieOptions = {
                    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000),
                    httpOnly: true
                }
                res.cookie('userSave', token, cookieOptions);
                    res.status(200).send({
                        message: 'Logged in successfully'
                    })
            }
        } catch(err) {
            console.log(err);
            return next(err);
        }
    },

    isUserLoggedIn: async (req, res, next) => {
        if(req.cookies.userSave == null | 'logout' ){
            res.status(401).send({
                message: 'Not Logged in'
            });
            // console.log("Not Logged in");
        } else {
            try {
                // 1. Verify the token
                const decoded = await promisify(jwt.verify)(req.cookies.userSave,
                    process.env.JWT_SECRET
                );

                // console.log(decoded.id);         //verified
                // 2. Check if the user still exist
                const row = await prisma.users.findFirst({
                    where: {
                        Sl: decoded.id
                    }
                });

                // console.log("Hii "+ row.Sl);
                
                if (!row) {
                    return res.status(404).send({
                        message: 'User does not exist'
                    });
                    // console.log("User does not exist");
                }
                req.cookie = decoded;
                req.user = row;
                return next();
            } catch (err) {
                console.log(err)
                return res.send({
                    message: err
                });
            }
        }
    },

    profile: async (req, res, next)=>{ 
        if (req.cookies.userSave != null | 'logout' ) {
            try {
                // 1. Verify the token
                const decoded = await promisify(jwt.verify)(req.cookies.userSave,
                    process.env.JWT_SECRET
                );
                
                // console.log(decoded.email);
                // 2. Check if the user still exist
                const rows = await prisma.users.findMany({
                    where: {
                        Sl: decoded.id
                    }
                });
                req.cookies = decoded;
                // req.user = rows;
                console.log(rows);
                return res.status(200).send({
                    message: 'User profile retrieved successfully'
                });
            } catch (err) {
                console.log(err)
                return next();
            }
        }
    },

    logout: (req, res) => {
        if(req.cookies.userSave == null | 'logout' ){
            res.status(401).send({
                message: 'Not logged in'
            });
        }
        
        res.cookie('userSave', 'logout', {
            expires: new Date(Date.now() + 2 * 1000),
            httpOnly: true
        }).status(200).send({
            message: 'Logged out successfully'
        });
    }

}
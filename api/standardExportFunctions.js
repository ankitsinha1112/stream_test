require('dotenv').config()
const pool = require('../db');
const jwt = require('jsonwebtoken');

// Verify JWT Token
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')?.[1];
    if (!!token) {
        jwt.verify(token, process.env.JWT_SECRET_KEY, (err, valid) => {
            if (err) {
                return res.json({ success: false, message: err.message });
            } else {
                next();
            }
        })
    } else {
        return res.json({ success: false, message: 'Unauthorized User' });
    }
}

// Function to Check if User Exist Using ID
const checkEmailExistUsingID = (req, res, next) => {
    const { email } = req.body;
    if (!email) return res.json({ success: false, message: 'No Email ID Found !!!' });

    pool.getConnection((err, conn) => {
        if (err) throw err;

        try {
            const qry = 'SELECT * FROM users WHERE email = ?'

            conn.query(qry, [email], (err, result) => {
                conn.release();
                if (err) throw err;

                if (result?.length <= 0) {
                    next();
                } else {
                    res.json({ success: false, message: 'Email Already Registered !!!' });
                }
            })
        } catch (err) {
            console.error(err.message)
            res.end();
        }
    })
}

// Function to Check if User Exist Using ID
const checkUserExistUsingID = (req, res, next) => {
    const { user_id } = req.body;
    if (!user_id) return res.json({ success: false, message: 'No User ID Found !!!' });

    pool.getConnection((err, conn) => {
        if (err) throw err;

        try {
            const qry = 'SELECT user_id from users WHERE user_id=?'
            conn.query(qry, [user_id], (err, result) => {
                conn.release();
                if (err) throw err;

                if (result?.length > 0) {
                    next();
                } else {
                    res.json({ success: false, message: 'No User Found !!!' });
                }
            })
        } catch (err) {
            console.error(err.message)
            res.end();
        }
    })
}

// Function to Check if User Exist Using EMAIL
const checkUserExistUsingEmail = (req, res, next) => {
    const { email } = req.body;
    if (!email) return res.json({ success: false, message: 'No Email Found !!!' });

    pool.getConnection((err, conn) => {
        if (err) throw err;

        try {
            const qry = 'SELECT user_id from users WHERE email=?'
            conn.query(qry, [email], (err, result) => {
                conn.release();
                if (err) throw err;

                if (result?.length > 0) {
                    next();
                } else {
                    res.json({ success: false, message: 'No Email Found !!!' });
                }
            })
        } catch (err) {
            console.error(err.message)
            res.end();
        }
    })
}

// Get All Truck Data
const getAllUserData = (req, res, next) => {
    const { user_id } = req.body;
    if (!user_id) return res.json({ success: false, message: 'No User ID Found !!!' });

    pool.getConnection((err, conn) => {
        if (err) throw err;

        try {
            const qry = 'SELECT * from users WHERE user_id=?'
            conn.query(qry, [user_id], (err, result) => {
                conn.release();
                if (err) throw err;

                if (result?.length > 0) {
                    req.userData = result[0];
                    next();
                } else {
                    res.json({ success: false, message: 'No User Found !!!' });
                }
            })
        } catch (err) {
            console.error(err.message)
            res.end();
        }
    })
}

module.exports = {
    verifyToken, // JWT Token
    checkEmailExistUsingID, checkUserExistUsingID, getAllUserData, checkUserExistUsingEmail // USER
}
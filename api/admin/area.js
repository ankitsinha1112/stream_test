const pool = require('../../db');
const express = require('express');
const area = express.Router();
// Export Functions
const { verifyToken, checkUserExistUsingID } = require('../standardExportFunctions');
const { checkAreaExistUsingIDAndUserID, checkAreaExistInUserColumnUsingID } = require('../adminExportFunctions');

area.post('/all', verifyToken, checkUserExistUsingID, (req, res) => {
    const { user_id } = req.body;

    pool.getConnection((err, conn) => {
        if (err) throw err;

        try {
            const qry = `SELECT area_id, user_id, area_name from area WHERE user_id=?`

            conn.query(qry, [user_id], (err, result) => {
                conn.release();
                if (err) throw err;

                res.json({ success: true, areas: result });
            })
        } catch (err) {
            console.error(err.message)
            res.end();
        }
    })
})
area.post('/subadmin', verifyToken, checkUserExistUsingID, (req, res) => {
    const { user_id } = req.body;

    pool.getConnection((err, conn) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: 'Database connection error' });
        }

        try {
            const qry = `SELECT area_id FROM users WHERE user_id=?`;

            conn.query(qry, [user_id], (err, result) => {
                if (err) {
                    conn.release();
                    console.error(err);
                    return res.status(500).json({ success: false, message: 'Query execution error' });
                }

                if (result.length === 0) {
                    conn.release();
                    return res.status(404).json({ success: false, message: 'User not found' });
                }

                const area_id = result[0].area_id;
                const qry1 = `SELECT area_id, area_name FROM area WHERE area_id=?`;

                conn.query(qry1, [area_id], (err, result1) => {
                    conn.release();
                    if (err) {
                        console.error(err);
                        return res.status(500).json({ success: false, message: 'Query execution error' });
                    }

                    res.json({ success: true, areas: result1 });
                });
            });
        } catch (err) {
            conn.release();
            console.error(err.message);
            res.status(500).end();
        }
    });
});



area.post('/add', verifyToken, checkUserExistUsingID, (req, res) => {
    const { area_name, user_id } = req.body;
    if (!area_name) return res.json({ success: false, message: 'Area Name Not Found !!!' });

    const capitalizedAreaName = area_name
        .split(" ")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

    pool.getConnection((err, conn) => {
        if (err) throw err;

        try {
            const qry = `INSERT INTO area (user_id, area_name, created_at) VALUES(?, ?, ?);`
            const addedData = [user_id, capitalizedAreaName, new Date()]

            conn.query(qry, addedData, (err, result) => {
                conn.release();
                if (err) throw err;

                res.json({ success: true, area_id: result?.insertId });
            })
        } catch (err) {
            console.error(err.message)
            res.end();
        }
    })
})

area.post('/delete', verifyToken, checkUserExistUsingID, checkAreaExistInUserColumnUsingID, checkAreaExistUsingIDAndUserID, (req, res) => {
    const { area_id } = req.body;

    pool.getConnection((err, conn) => {
        if (err) throw err;

        try {
            const qry = 'DELETE FROM area WHERE area_id=?'
            conn.query(qry, [area_id], (err, result) => {
                conn.release();
                if (err) throw err;

                console.log('Area Deleted Successfully !!!');
                return res.json({ success: true })
            })
        } catch (err) {
            console.error(err.message)
            res.end();
        }
    })
})

area.put('/update', verifyToken, checkUserExistUsingID, checkAreaExistUsingIDAndUserID, (req, res) => {
    const { area_id, area_name } = req.body;
    if (!area_name) return res.json({ success: false, message: 'Please Provide an Area Name !!!' });

    pool.getConnection((err, conn) => {
        if (err) throw err;
        try {
            const qry = `UPDATE area SET area_name=? WHERE area_id=?`

            conn.query(qry, [area_name, area_id], (err, result) => {
                conn.release();
                if (err) throw err;
                console.log('Area Updated Succsessfully');
                res.json({ success: true });
            })

        } catch (err) {
            console.error(err.message)
            res.end();
        }
    })
})




module.exports = area;
const pool = require('../db');

// -----------------------------------------------AREA------------------------------------------------------------------

// Function to Check if Area Name Exist In The Column
// const checkAreaNameExistInColumn = (req, res, next) => {
//     const { area_name } = req.body;
//     if (!area_name) return res.json({ success: false, message: 'No Area Name Found !!!' });

//     pool.getConnection((err, conn) => {
//         if (err) throw err;

//         try {
//             const qry = 'SELECT * FROM area WHERE area_name = ?'

//             conn.query(qry, [area_name], (err, result) => {
//                 conn.release();
//                 if (err) throw err;

//                 if (result?.length <= 0) {
//                     next();
//                 } else {
//                     res.json({ success: false, message: 'Area With This Name Already Registered !!!' });
//                 }
//             })
//         } catch (err) {
//             console.error(err.message)
//             res.end();
//         }
//     })
// }

// Function to Check if Area Exist Using ID
const checkAreaExistUsingIDAndUserID = (req, res, next) => {
    const { area_id, user_id } = req.body;
    if (!area_id) return res.json({ success: false, message: 'No Area ID Found !!!' });

    pool.getConnection((err, conn) => {
        if (err) throw err;

        try {
            const qry = 'SELECT area_id from area WHERE area_id=? AND user_id=?'
            conn.query(qry, [area_id, user_id], (err, result) => {
                conn.release();
                if (err) throw err;

                console.log(result);
                if (result?.length > 0) {
                    next();
                } else {
                    res.json({ success: false, message: 'No Area Found !!!' });
                }
            })
        } catch (err) {
            console.error(err.message)
            res.end();
        }
    })
}

// Function to Check if Area Exist In User Column Using ID
const checkAreaExistInUserColumnUsingID = (req, res, next) => {
    const { area_id } = req.body;

    pool.getConnection((err, conn) => {
        if (err) throw err;

        try {
            const qry = 'SELECT area_id from users WHERE area_id=?'
            conn.query(qry, [area_id], (err, result) => {
                conn.release();
                if (err) throw err;

                if (result?.length > 0) {
                    res.json({ success: false, message: 'Area Already Added To An User !!!' });
                } else {
                    next();
                }
            })
        } catch (err) {
            console.error(err.message)
            res.end();
        }
    })
}

// ---------------------------------------------------------------------------------------------------------------------

module.exports = {
    // checkAreaNameExistInColumn, 
    checkAreaExistUsingIDAndUserID, checkAreaExistInUserColumnUsingID // AREA
}
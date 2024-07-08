require('dotenv').config()
const pool = require('../../db');
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const awsIot = require('aws-iot-device-sdk');
const path = require('path');
const currentPath = __dirname;

const filePath = path.join(currentPath, 'Privatekey.pem.key');
const cartpath = path.join(currentPath, 'Device_certificate.pem.crt');
const capath = path.join(currentPath, 'AmazonRootCA1.pem');


// Get the current script's directory path

// Join the current path with a filename to create an absolute path

const users = express.Router();
// Export Functions
const { checkEmailExistUsingID, checkUserExistUsingID, getAllUserData, checkUserExistUsingEmail, verifyToken } = require('../standardExportFunctions');

users.get('/all-admins', verifyToken, (req, res) => {
    pool.getConnection((err, conn) => {
        if (err) throw err;

        try {
            const qry = `SELECT user_id, area_id, email, role, name FROM users WHERE role='admin'`

            conn.query(qry, (err, result) => {
                conn.release();
                if (err) throw err;

                res.json({ success: true, users: result });
            })
        } catch (err) {
            console.error(err.message)
            res.end();
        }
    })
})

users.post('/all-subAdmins', verifyToken, checkUserExistUsingID, (req, res) => {
    const { user_id } = req.body

    pool.getConnection((err, conn) => {
        if (err) throw err;

        try {
            // const qry = `SELECT user_id, area_id, email, role, name FROM users WHERE role='sub-admin' AND created_by=?`
            const qry = `
                SELECT u.user_id, u.area_id, u.email, u.role, u.name, a.area_name
                FROM users u
                JOIN area a ON u.area_id = a.area_id
                WHERE u.role = 'sub-admin' AND u.created_by = ?;            
            `

            conn.query(qry, [user_id], (err, result) => {
                conn.release();
                if (err) throw err;

                res.json({ success: true, users: result });
            })
        } catch (err) {
            console.error(err.message)
            res.end();
        }
    })
})

users.post('/add', verifyToken, checkEmailExistUsingID, (req, res) => {
    const { email, password, role, name, area_id, created_by } = req.body;
    if (!password, !role, !name) return res.json({ success: false, message: 'Please Fill All The Details !!!' });
    if (role === 'sub-admin' && !area_id && !created_by) return res.json({ success: false, message: 'Please Fill All The Details !!!' });

    bcrypt.hash(password, 10)
        .then(hashPass => {
            pool.getConnection((err, conn) => {
                if (err) throw err;

                try {
                    const qry = `INSERT INTO users (email, password, role, name, area_id, created_by, created_at) VALUES(?, ?, ?, ?, ?, ?, ?);`
                    const addedData = [email, hashPass, role, name, area_id || null, created_by, new Date()]

                    conn.query(qry, addedData, (err, result) => {
                        conn.release();
                        if (err) throw err;

                        res.json({ success: true, admin_id: result?.insertId });
                    })
                } catch (err) {
                    console.error(err.message)
                    res.end();
                }
            })
        })
        .catch(err => {
            console.log(err);
            return res.json({ success: false, message: 'Error @hashing !!!' });
        })

})

users.post('/delete', verifyToken, checkUserExistUsingID, (req, res) => {
    const { user_id } = req.body;

    pool.getConnection((err, conn) => {
        if (err) throw err;

        try {
            const qry = 'DELETE FROM users WHERE user_id=?'
            conn.query(qry, [user_id], (err, result) => {
                conn.release();
                if (err) throw err;

                console.log('User Deleted Successfully !!!');
                return res.json({ success: true })
            })
        } catch (err) {
            console.error(err.message)
            res.end();
        }
    })
})

users.put('/update-admin', verifyToken, checkUserExistUsingID, (req, res) => {
    const { name, user_id } = req.body;
    if (!name) return res.json({ success: false, message: 'Please Provide a Name !!!' });


    pool.getConnection((err, conn) => {
        if (err) throw err;
        try {
            const qry = `UPDATE users SET name=? WHERE user_id=?`

            conn.query(qry, [name, user_id], (err, result) => {
                conn.release();
                if (err) throw err;
                console.log('Admin Updated Succsessfully');
                res.json({ success: true });
            })

        } catch (err) {
            console.error(err.message)
            res.end();
        }
    })
})


users.put('/update-password', verifyToken, checkUserExistUsingID, (req, res) => {
    const { currentpassword,password, user_id } = req.body;
    const datetime = new Date();
    datetime.setMinutes(datetime.getMinutes() + 330);
    bcrypt.hash(currentpassword, 10)
    .then(curPass => {

    bcrypt.hash(password, 10)
    .then(hashPass => {

    pool.getConnection((err, conn) => {
        if (err) throw err;
        try {
            const qry =`SELECT * FROM users where user_id=${user_id}`;
            conn.query(qry, (err, resu) => {
                conn.release();
                
                if (err) throw err;
            if(resu.length>0){
                bcrypt.compare(currentpassword, resu[0].password)
                .then(passResult => {
               //     console.log(passResult);
                    if(passResult){
               const qry = `UPDATE users SET password=? WHERE user_id=? `
          const addedData=[hashPass,user_id];
            conn.query(qry,addedData, (err, result) => {
                
                if (err) throw err;
              //  console.log(result);
                if(result.affectedRows){
                    const data = { ...resu[0] };
                    delete data.password

                    jwt.sign({ user: data }, process.env.JWT_SECRET_KEY, { expiresIn: '7d' }, (err, token) => {
                        if (err) {
                            console.log(err);
                            return res.json({ success: false, message: 'JWT Token Error !!!' });
                        }

                        return res.json({ success: true, message:"password updated successfully", auth: token })
                    })
                } else {
                    return res.json({ success: false, message: 'Invalid Credentials !!!' });
                }
            })
           
//  res.json({ success: true,message:"password updated successfully" });
             //   }
              //  console.log('Admin Updated Succsessfully');
               
           // })
        }else{
            return res.json({ success: false, message:"password not matched" })

        }
        })
        }
        })
        }  catch (err) {
            console.error(err.message)
            res.end();
        }
    })})
    })
})



users.put('/update-subadmin', verifyToken, checkUserExistUsingID, (req, res) => {
    const { name, user_id, area_id } = req.body;
    if (!name || !area_id) return res.json({ success: false, message: 'Please Provide All The Details !!!' });

    pool.getConnection((err, conn) => {
        if (err) throw err;
        try {
            const qry = `UPDATE users SET name=?, area_id=? WHERE user_id=?`

            conn.query(qry, [name, area_id, user_id], (err, result) => {
                conn.release();
                if (err) throw err;
                console.log('Sub Admin Updated Succsessfully');
                res.json({ success: true });
            })

        } catch (err) {
            console.error(err.message)
            res.end();
        }
    })
})

users.post('/dashboard', verifyToken, checkUserExistUsingID,(req, res) => {
    const {user_id} = req.body;
    //if (!name || !area_id) return res.json({ success: false, message: 'Please Provide All The Details !!!' });

    pool.getConnection((err, conn) => {
        if (err) throw err;
        try {
            const qry =`SELECT * FROM users where user_id=${user_id}`;
          
            conn.query(qry, (err, result) => {
                conn.release();
                if (err) throw err;
                if(result.length>0 && result[0].role==="superadmin"){
                    const qry =`SELECT count(*) as admin_count FROM users where role="admin"`;
                    conn.query(qry ,(err, admins) => {
                        if (err) throw err;
                       // console.log(admins);
                        const qry =`SELECT count(*) as ticket_count FROM tickets where status=1 OR status=0;`
                    conn.query(qry ,(err, tickets) => {
                        if (err) throw err;
                        //console.log(tickets);
                        const qry =`SELECT count(*) as device_count FROM device`;
                        conn.query(qry ,(err, devices) => {
                            if (err) throw err;
                          //  console.log(devices);
                            const qry =`SELECT count(*) as all_device_count FROM device where user_id IS NOT null`;
                            conn.query(qry ,(err, device_all) => {
                                if (err) throw err;
                            //    console.log(device_all);
                                const qry =`SELECT count(*) as pending_device_count FROM device where user_id IS NULL`;
                                conn.query(qry ,(err, device_pending) => {
                                    if (err) throw err;
                              //      console.log(device_pending);
                                   const data={
                                    admin_cont:admins[0].admin_count,
                                    ticket_count:tickets[0].ticket_count,
                                    device_count:devices[0].device_count,
                                    alloted_device_count:device_all[0].all_device_count,
                                    pending_device_count:device_pending[0].pending_device_count,
                                   };
                                 //  data.push(device_pending[0]);
                                    res.json({ success: true, data:data });
           
                                })
                                    
                            })


                        })        

                    })  
                    })                 
                }else if(result.length>0 && result[0].role==="admin"){
                       const qry =`SELECT count(*) as admin_count FROM users where role="sub-admin"`;
                        conn.query(qry ,(err, admins) => {
                            if (err) throw err;
                           // console.log(admins);
                            const qry =`SELECT count(*) as ticket_count FROM tickets where user_id=${user_id} AND (status=1 OR status=0)`;
                             conn.query(qry ,(err, tickets) => {
                            if (err) throw err;
                         //   console.log(tickets);
                            const qry =`SELECT count(*) as device_count FROM device where user_id=${user_id}`;
                            conn.query(qry ,(err, devices) => {
                                if (err) throw err;
                           //     console.log(devices);
                                const qry =`SELECT count(*) as all_device_count FROM device where user_id=${user_id}`;
                                conn.query(qry ,(err, device_all) => {
                                    if (err) throw err;
                             //       console.log(device_all);
                                    const qry =`SELECT count(*) as pending_device_count FROM device where user_id =${user_id}`;
                                    conn.query(qry ,(err, device_pending) => {
                                        if (err) throw err;
                               //         console.log(device_pending);
                                       const data={
                                        admin_cont:admins[0].admin_count,
                                        ticket_count:tickets[0].ticket_count,
                                        device_count:devices[0].device_count,
                                        alloted_device_count:device_all[0].all_device_count,
                                        pending_device_count:device_pending[0].pending_device_count,
                                       };
                                     //  data.push(device_pending[0]);
                                        res.json({ success: true, data:data });
               
                                    })
                                        
                                })
    
    
                            })        
    
                        })  
                        }) 
                }else{
                    res.json({ success: false, data:"unauthorized user" });
               
                }
                
            })

        } catch (err) {
            console.error(err.message)
            res.end();
        }
    })
})





// SignIN
users.post('/sign-in', checkUserExistUsingEmail, (req, res) => {
    const { email, password } = req.body;

    pool.getConnection((err, conn) => {
        if (err) throw err;

        try {
            const qry = 'SELECT user_id, area_id, email, password, role, name FROM users WHERE email=?'
            conn.query(qry, [email], (err, result) => {
                conn.release();
                if (err) throw err;

                bcrypt.compare(password, result[0].password)
                    .then(passResult => {
                        if (passResult) {
                            const data = { ...result[0] };
                            delete data.password

                            jwt.sign({ user: data }, process.env.JWT_SECRET_KEY, { expiresIn: '7d' }, (err, token) => {
                                if (err) {
                                    console.log(err);
                                    return res.json({ success: false, message: 'JWT Token Error !!!' });
                                }

                                return res.json({ success: true, data, auth: token })
                            })
                        } else {
                            return res.json({ success: false, message: 'Invalid Credentials !!!' });
                        }
                    })
                    .catch(err => {
                        console.log(err)
                        return res.json({ success: false, message: 'Error @hashing !!!' });
                    })
            })
        } catch (err) {
            console.error(err.message)
            res.end();
        }
    })
})

users.get('/getalldevice',(req,res) =>{
    pool.getConnection((err, conn) => {
        if (err) throw err;

        try {
            const qry = `SELECT * FROM device;`

            conn.query(qry, (err, result) => {
                conn.release();
                if (err) throw err;

                res.json({ success: true, data: result });
            })
        } catch (err) {
            console.error(err.message)
            res.end();
        }
    })
})
users.patch('/updatedevice/:device_id', (req, res) => {
const { device_id } = req.params;
const { area_id } = req.body; // Adjust these fields according to your device table structure

pool.getConnection((err, conn) => {
if (err) throw err;

try {
    const qry = `UPDATE device SET area_id = ? WHERE device_id = ?;`;
    const values = [area_id, device_id];

    conn.query(qry, values, (err, result) => {
        conn.release();
        if (err) throw err;

        if (result.affectedRows > 0) {
            res.json({ success: true, message: 'Device updated successfully' });
        } else {
            res.status(404).json({ success: false, message: 'Device not found' });
        }
    });
} catch (err) {
    console.error(err.message);
    res.status(500).end();
}
});
});
users.post('/create',(req,res) =>{
const { email, password, role, name, area_id, created_by } = req.body;
if (!password, !role, !name) return res.json({ success: false, message: 'Please Fill All The Details !!!' });
bcrypt.hash(password, 10)
.then(hashPass => {
    pool.getConnection((err, conn) => {
        if (err) throw err;

        try {
            const qry = `INSERT INTO users (email, password, role, name, area_id, created_by, created_at) VALUES(?, ?, ?, ?, ?, ?, ?);`
            const addedData = [email, hashPass, role, name, area_id || null, created_by || null, new Date()]

            conn.query(qry, addedData, (err, result) => {
                conn.release();
                if (err) throw err;

                res.json({ success: true, admin_id: result?.insertId });
            })
        } catch (err) {
            console.error(err.message)
            res.end();
        }
    })
})
.catch(err => {
    console.log(err);
    return res.json({ success: false, message: 'Error @hashing !!!' });
})
})

users.post('/senddata',(req, res) => {
   // console.log(path);
    const { cam_id,ledw,ledr,ledy,state,user_id } = req.body;

// console.log(filePath);
// console.log(cartpath);
// console.log(capath);
// console.log("hello");

  const device = awsIot.device({
    keyPath: filePath,
    certPath: cartpath,
    caPath: capath,
    clientId: "ESP32_IoT_Smart_Light",
    host: "a3afseuvzkw6r4-ats.iot.ap-south-1.amazonaws.com",
    //region: "ap-south-1"
   
    
  });

  
    pool.getConnection((err, conn) => {
        if (err) throw err;
       
        try {



            
           //  console.log(device);
           let temperatureData = {
            "Cam_ID": cam_id,
            "LED_W": ledw,
            "LED_R": ledr,
            "LED_Y": ledy,
            "State":state
          };

            // temperatureData.push( { sensor_code: 'Temp_sensor_1', value: '25 C' });
            // temperatureData.push( { sensor_code: 'Temp_sensor_2', value: '23 C' });
         //   if(temperatureData.State==="REQUEST_STATE"){

            // device
            // .on('connect', function() {
            
               console.log('connecting');
            //   device.subscribe('esp32/sub');
            // device.on('connect', () => {
                console.log('Connected to AWS IoT Core');
            
                // Publish a message to a topic
                const topic = 'esp32/pub';
                const message = JSON.stringify(temperatureData);
                device.publish(topic, message);
            // });
            conn.release();
                



            device.subscribe('esp32/sub');
            device.on('message', (topic, payload) => {
              //  console.log("hello");
               // console.log('Received message:', topic, payload.toString());
                const abc=payload.toString();
                const def=JSON.parse(abc);
              //  console.log(def);
                const datetime = new Date();
                datetime.setMinutes(datetime.getMinutes() + 330);

                const qry =`SELECT * FROM subdata where cam_id=${def.Cam_ID}`;
            conn.query(qry, (err, resu) => {
                //conn.release();
                
                if (err) throw err;
            if(resu.length<1){
          
                const qry = `INSERT INTO subdata (cam_id, updated_by,data, updated_at) VALUES(?,?,?,?);`
                    const addedData = [def.Cam_ID,user_id, JSON.stringify(def), datetime]

                    conn.query(qry, addedData, (err, result) => {
                      //  conn.release();
                        if (err) throw err;

                 //       res.json({ success: true, admin_id: result?.insertId });
                    })
                }else{
                   // console.log(resu[0]);
                    const abcd=JSON.parse(resu[0].data);
                    if(def.State=="restarted"){
                        //console.log("1");
                           
                        // const qry =`SELECT * FROM subdata where cam_id=${def.Cam_ID}`;
                        // conn.query(qry, (err, resul) => {
                            const topic = 'esp32/pub';
                            const message = abcd;
                          //  console.log(message);
                            device.publish(topic,JSON.stringify(message));
                            
                     //   })            
                    }else{

                    
                    const bbc=JSON.stringify(def);
                    const qry = `UPDATE subdata SET data=?, updated_at=? WHERE cam_id=${def.Cam_ID}`
                    const addedData = [ JSON.stringify(def), datetime]

                    conn.query(qry,addedData, (err, result) => {
                        //conn.release();
                        if (err) throw err;
                    })  
                }      
                }
            })    
                // You can parse the payload and perform actions based on the received data
            });    


            //});
       // }
//             device
//             .on('close', function() {
//               console.log('disconnecting');
//             });

//             device
//  .on('message', function(topic, payload) {
//    console.log('message', topic, payload.toString());
//  });

            res.json({success:true})
           
        } catch (err) {
            console.error(err.message)
            res.end();
        }
    })
})

users.post('/getsubdata' ,(req, res) => {
    const { ticket_id } = req.body;

    pool.getConnection((err, conn) => {
        if (err) throw err;

        try {
            const qry = `SELECT * FROM subdata
             `

            conn.query(qry, (err, result) => {
                conn.release();
                if (err) throw err;
                if(result.length>0){
                    result.map(bb => {
                        const abc=JSON.parse(bb.data);
                        bb.data=abc;
                       })
    
                res.json({ success: true, data: result });


                }else{
                    res.json({ success: false, data: "no result found" });
                    
                }
            })
        } catch (err) {
            console.error(err.message)
            res.end();
        }
    })
})

// users.post('/getsubdatabyareaid' ,(req, res) => {
//     const { area_id } = req.body;

//     pool.getConnection((err, conn) => {
//         if (err) throw err;

//         try {
//             const qry = `SELECT * FROM device where area_id=${area_id}
//              `

//             conn.query(qry, (err, result) => {
//                 conn.release();
//                 if (err) throw err;
//                 const arr=[];
//                 if(result.length>0){
//                     result.map(bb => {
//                       arr.push(bb.device_id);
//                     })
//                     console.log(arr);
                  
//                     if(arr.length>0){
//                         const qry = `SELECT * FROM subdata where cam_id in (${arr})
//              `

//             conn.query(qry, (err, result) => {
//               //  conn.release();
//                 if (err) throw err;
//                 if(result.length>0){
//                     result.map(bb => {
//                         const abc=JSON.parse(bb.data);
//                      bb.data=abc;
//                        })
    
//                 res.json({ success: true, data: result });


//                 }else{
//                     res.json({ success: false, data: "no result found" });
                    
//                 }
//             })
//                     }
    
//             //    res.json({ success: true, data: arr });


//                 }else{
//                     res.json({ success: false, data: "no result found" });
                    
//                 }
//             })
//         } catch (err) {
//             console.error(err.message)
//             res.end();
//         }
//     })
// })
users.post('/getsubdatabyareaid', (req, res) => {
    const { area_id } = req.body;

    pool.getConnection((err, conn) => {
        if (err) throw err;

        try {
            const qry = `SELECT * FROM device WHERE area_id=${area_id}`;
            conn.query(qry, (err, result) => {
                if (err) {
                    conn.release();
                    throw err;
                }

                const arr = [];
                if (result.length > 0) {
                    result.map(bb => {
                        arr.push(bb.device_id);
                    });
                    console.log(arr);

                    if (arr.length > 0) {
                        const qry2 = `SELECT camera_id FROM device_camera WHERE device_id IN (${arr.join(',')})`;
                        conn.query(qry2, (err, result) => {
                            if (err) {
                                conn.release();
                                throw err;
                            }

                            const newarr = [];
                            if (result.length > 0) {
                                result.map(bb => {
                                    newarr.push(bb.camera_id);
                                });

                                if (newarr.length > 0) {
                                    const qry3 = `SELECT * FROM subdata WHERE cam_id IN (${newarr.join(',')})`;
                                    conn.query(qry3, (err, result) => {
                                        conn.release();
                                        if (err) throw err;

                                        if (result.length > 0) {
                                            result.map(bb => {
                                                const abc = JSON.parse(bb.data);
                                                bb.data = abc;
                                            });

                                            res.json({ success: true, data: result });
                                        } else {
                                            res.json({ success: false, data: "no result found" });
                                        }
                                    });
                                } else {
                                    conn.release();
                                    res.json({ success: false, data: "no camera IDs found" });
                                }
                            } else {
                                conn.release();
                                res.json({ success: false, data: "no camera IDs found" });
                            }
                        });
                    } else {
                        conn.release();
                        res.json({ success: false, data: "no device IDs found" });
                    }
                } else {
                    conn.release();
                    res.json({ success: false, data: "no result found" });
                }
            });
        } catch (err) {
            console.error(err.message);
            res.end();
        }
    });
});


users.post('/getsubdatabycamid' ,(req, res) => {
    const { cam_id } = req.body;

    pool.getConnection((err, conn) => {
        if (err) throw err;

        try {
            const qry = `SELECT * FROM subdata where cam_id=${cam_id}
             `

            conn.query(qry, (err, result) => {
                conn.release();
                if (err) throw err;
                if(result.length>0){
                   // result.map(bb => {
                        const abc=JSON.parse(result[0].data);
                        result[0].data=abc;
                     //  })
    
                res.json({ success: true, data: result[0] });


                }else{
                    res.json({ success: false, data: "no result found" });
                    
                }
            })
        } catch (err) {
            console.error(err.message)
            res.end();
        }
    })
})

users.post('/receivedata', (req, res) => {
   
    const device = awsIot.device({
        keyPath: "Privatekey.pem.key",
        certPath: "Device_certificate.pem.crt",
        caPath: "AmazonRootCA1.pem",
        clientId: "ESP32_IoT_Smart_Light",
        host: "a3afseuvzkw6r4-ats.iot.ap-south-1.amazonaws.com",
        region: "ap-south-1"
       
        
      });
    
      
        pool.getConnection((err, conn) => {
            if (err) throw err;
           
            try {
               //  console.log(device);
               let temperatureData = {
                "Cam_ID": "10",
                "LED_W": "ON",
                "LED_R": "OFF",
                "LED_Y": "OFF",
                "State":"REQUEST_STATE"
              };
                // temperatureData.push( { sensor_code: 'Temp_sensor_1', value: '25 C' });
                // temperatureData.push( { sensor_code: 'Temp_sensor_2', value: '23 C' });
             //   if(temperatureData.State==="REQUEST_STATE"){
    
                // device
                // .on('connect', function() {
                    //const topic = 'esp32/pub';
                
                   console.log('connecting');
                   
                //   device.subscribe('esp32/sub');
                device.subscribe('esp32/sub');
                device.on('message', (topic, payload) => {
                    console.log("hello");
                    console.log('Received message:', topic, payload.toString());
                    const abc=payload.toString();
                    const def=JSON.parse(abc);
                    console.log(def.message);
                    // You can parse the payload and perform actions based on the received data
                });    
    
    
                //});
           // }
    //             device
    //             .on('close', function() {
    //               console.log('disconnecting');
    //             });
    
    //             device
    //  .on('message', function(topic, payload) {
    //    console.log('message', topic, payload.toString());
    //  });
    
                res.json({success:true})
               
            } catch (err) {
                console.error(err.message)
                res.end();
            }
        })
    })
    
module.exports = users;
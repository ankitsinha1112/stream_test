const pool = require('../../db');
const express = require('express');
const multer = require('multer');
const reader = require('xlsx');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const device = express.Router();
// Export Functions
const { verifyToken, checkUserExistUsingID } = require('../standardExportFunctions');
const { checkAreaExistUsingIDAndUserID, checkAreaExistInUserColumnUsingID } = require('../adminExportFunctions');

device.post('/getdata', verifyToken, checkUserExistUsingID ,(req, res) => {
    const { device_id } = req.body;

    pool.getConnection((err, conn) => {
        if (err) throw err;

        try {
            const qry = `SELECT * FROM device join device_camera
            ON device.device_id = device_camera.device_id JOIN device_light
            ON device_camera.device_id=device_light.device_id
             WHERE device_camera.device_id=?;
        `

            conn.query(qry, [device_id], (err, result) => {
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

device.post('/getalldevice', verifyToken, checkUserExistUsingID ,(req, res) => {
    const { user_id } = req.body;
    //const { device_id } = req.body;

    pool.getConnection((err, conn) => {
        if (err) throw err;

        try {
            const qry =`SELECT * FROM users where user_id=${user_id}`;
            conn.query(qry, (err, result) => {
                conn.release();
                if (err) throw err;
                if(result.length>0 && result[0].role==="admin"){
                    const qry = `SELECT * FROM device join device_camera
                    ON device.device_id = device_camera.device_id JOIN device_light
                    ON device_camera.device_id=device_light.device_id where device.user_id IS NOT null
                    ;
                `
        
                    conn.query(qry, (err, result) => {
                    //    conn.release();
                        if (err) throw err;
                        if(result.length>0){
                        res.json({ success: true, areas: result });
                    }else{
                        res.json({ success: false, areas: "no record found" });    
                        
                    }
                    })
               
                }
                else if(result.length>0 && result[0].role==="superadmin"){
                    const qry = `SELECT * FROM device join device_camera
                    ON device.device_id = device_camera.device_id JOIN device_light
                    ON device_camera.device_id=device_light.device_id 
                    ;
                `
        
                    conn.query(qry, (err, result) => {
                    //    conn.release();
                        if (err) throw err;
                        if(result.length>0){
                        res.json({ success: true, areas: result });
                    }else{
                        res.json({ success: false, areas: "no record found" });    
                        
                    }
                    })
               
                }
                else if(result.length>0 && result[0].role==="sub-admin"){
                    const qry = `SELECT * FROM device join device_camera
                    ON device.device_id = device_camera.device_id JOIN device_light
                    ON device_camera.device_id=device_light.device_id where device.user_id=${user_id}
                    ;
                `
        
                    conn.query(qry, (err, result) => {
        //                conn.release();
                        if (err) throw err;
                        if(result.length>0){
                        res.json({ success: true, areas: result });
                    }else{
                        res.json({ success: false, areas: "no record found" });    
                    }
                    })
               

                }else{
                    res.json({ success: false, areas: "no record found" });
                }
            })
        } catch (err) {
            console.error(err.message)
            res.end();
        }
    })
})


device.post('/allocatedevices', verifyToken,(req, res, next) => {
    const { start,end,devices,user_id,area_id } = req.body;

    const datetime = new Date();
    datetime.setMinutes(datetime.getMinutes() + 330);

  
    pool.getConnection((err, conn) => {
        if (err) throw err;

        // const encryptedPassword = password;
        try {
            if(!devices && start<end && user_id && !area_id){
                const qry = `UPDATE device SET user_id=?,updated_at=? 
                WHERE device_id BETWEEN ${start} AND ${end}`
                const addedData = [user_id, datetime]

                conn.query(qry, addedData, (err, result) => {
                    if (err) throw err;
                       
                    res.json({ success: true, areas: "users updated successfully" });
               
                })
             
            
            }else if(start<end && !user_id && area_id){
            
                    const qry = `UPDATE device SET area_id=?,updated_at=? 
                    WHERE device_id BETWEEN ${start} AND ${end}`
                    const addedData = [area_id, datetime]
    
                    conn.query(qry, addedData, (err, result) => {
                        if (err) throw err;
                       
                        res.json({ success: true, areas: "Area updated successfully" });
             
                    })
                  
                   
            }else if(devices && !start && !end && user_id && !area_id){
                    const qry = `UPDATE device SET user_id=?,updated_at=? 
                    WHERE device_id in (${devices})`
                    const addedData = [user_id, datetime]
    
                    conn.query(qry, addedData, (err, result) => {
                        if (err) throw err;
                       
                        res.json({ success: true, areas: "users updated successfully" });
                   
                    })
                 
                   
            }else if(devices && !start && !end && !user_id && area_id){
                    const qry = `UPDATE device SET area_id=?,updated_at=? 
                    WHERE device_id in (${devices})`
                    const addedData = [area_id, datetime]
    
                    conn.query(qry, addedData, (err, result) => {
                        if (err) throw err;
                       
                  // console.log(result);
                  res.json({ success: true, areas: "Area updated successfully" });
              
                    })
                 
                   
            }
  
            }
    

         catch (err) {
            console.error(err.message)
            res.end();
        }
    })
})






device.post('/add', verifyToken, checkUserExistUsingID,(req, res, next) => {
    const { device_id,device_name,device_type,aws_group_id,aws_thing_name,aws_end_point,area_id,user_id,current_status,camera_name } = req.body;
    const datetime = new Date();
    datetime.setMinutes(datetime.getMinutes() + 330);

  
    pool.getConnection((err, conn) => {
        if (err) throw err;

        // const encryptedPassword = password;
        try {

  
                    if(!device_id){
          //              console.log("hello");
                    const qry = `INSERT INTO device (device_name,device_type,aws_group_id,aws_thing_name,aws_end_point,area_id,user_id,created_at,updated_at) 
                VALUES(?,?,?,?,?,?,?,?,?)`
                    const addedData = [device_name,device_type,aws_group_id,aws_thing_name,aws_end_point,area_id,user_id,datetime, datetime]

                    conn.query(qry, addedData, (err, result) => {
                        conn.release();
                        if (err) throw err;
                        if (result.insertId) {
                                const qry = `INSERT INTO device_camera (device_id,camera_name,created_at,updated_at) 
                                VALUES(?,?,?,?)`
                                    const addedData = [result.insertId, camera_name,datetime, datetime]
                                    conn.query(qry, addedData, (err, resu) => {
                                        if(resu.insertId){
                                            const qry = `INSERT INTO device_light (device_id,current_status,created_at,updated_at) 
                                VALUES(?,?,?,?)`
                                    const addedData = [result.insertId,current_status,datetime, datetime]
                                    conn.query(qry, addedData, (err, result) => {

                                        return res.json({ success: true, result: "Device Added succesfully" })
                                    })       
                                        }
                                    })                    
                            
                          
                        } else {
                            return res.json({ success: False, result: "failed" })

                        }


                    })
                }else{
                    const qry = `SELECT * FROM device join device_camera
                    ON device.device_id = device_camera.device_id JOIN device_light
                    ON device_camera.device_id=device_light.device_id
                     WHERE device_camera.device_id=?;
                `
        
                    conn.query(qry, [device_id], (err, result) => {
                        conn.release();
                    if(result.length>0){

                    const qry = `UPDATE device SET device_name=?,device_type=?,aws_group_id=?,aws_thing_name=?,aws_end_point=?,area_id=?,user_id=?,updated_at=? 
                    WHERE device_id=${device_id}`
                    const addedData = [device_name,device_type,aws_group_id,aws_thing_name,aws_end_point,area_id,user_id, datetime]

                    conn.query(qry, addedData, (err, result) => {
                        if (err) throw err;
                                const qry = `UPDATE  device_camera SET camera_name=?,updated_at=?
                                WHERE device_id=${device_id}`
                                    const addedData = [camera_name, datetime]
                                    conn.query(qry, addedData, (err, resu) => {
                                        
                                            const qry = `UPDATE device_light SET current_status=?,updated_at=?
                                            WHERE device_id=${device_id}`
                                    const addedData = [current_status, datetime]
                                    conn.query(qry, addedData, (err, result) => {

                                        return res.json({ success: true, result: "Device Added succesfully" })
                                    })       
                                        
                                    })                    
                            
                          
                        


                    })
                }else{
                    return res.json({ success: false, result: "No record found" })

                }
            })    
                }
                
            }
    

         catch (err) {
            console.error(err.message)
            res.end();
        }
    })
})



device.post('/importdevices',verifyToken, upload.single('file'), async (req, res) => {
    //console.log(req.file);
    const { icard_id } = req.body;
    const datetime = new Date();
                            datetime.setMinutes(datetime.getMinutes() + 330);
                        
    const woorkBook = reader.read(req.file.buffer, { type: 'buffer', cellDates: true });

    const sheets = woorkBook.SheetNames[0];
    var data = [];
    //console.log(sheets);
    for (let i = 0; i < sheets.length; i++) {
        const temp = reader.utils.sheet_to_json(
            woorkBook.Sheets[woorkBook.SheetNames[i]], { defval: "" })
        temp.forEach((res) => {
            data.push(res)
        })
    }
    //console.log(data);
    pool.getConnection((err, conn) => {
      conn.release();
        if (err) throw err;

        // const encryptedPassword = password;
        try {
            const arr=[];
            for(var i=0;i<data.length;i++){
                if(Number.isInteger(data[i].user_id) || data[i].user_id==''){
                    if(data[i].user_id!=''){
                     arr.push(data[i].user_id);   
                    }
                }else{
            //        console.log(data[i].user_id);  
                    return res.json({ success: false, result: `user id must be integer type on ${i+1} row` });
    
                }
            
            }
                    //console.log(arr);
                    const newarr=[];
                        

                    const qry = `SELECT * FROM users WHERE user_id IN (${arr});
                    `
                    conn.query(qry, (err, result) => {
                        //  conn.release();
                          if (err) throw err;
          
                          if(result.length==arr.length){
                           // console.log(result);
            const qry = `SELECT max(device_id) as id  FROM device;
            `
    
                conn.query(qry, (err, result) => {
                  //  conn.release();
                    if (err) throw err;
    
                    if(result.length>0){
                        //console.log("1");
                        data.map(bb => {
                            if(bb.user_id==''){
                                bb.user_id=null;
                            }
                            
                    //     const total=result[0].id+number_of_device;
                    //   //  console.log(result[0].id);
                    //     const start=result[0].id+1;
                        const qry = `INSERT INTO device (device_name,user_id,created_at) 
                    VALUES(?,?,?)`
                        const addedData = [bb.device_name,bb.user_id,datetime]
    
                        conn.query(qry, addedData, (err, result) => {
                            if (err) throw err;
                          //  console.log(result);
                            if (result.insertId) {
                                    const qry = `INSERT INTO device_camera (device_id,camera_name,created_at,updated_at) 
                                    VALUES(?,?,?,?)`
                                        const addedData = [result.insertId,bb.camera_name,datetime, datetime]
                                        conn.query(qry, addedData, (err, resu) => {
    
                                            if(resu.insertId){
                                                const qry = `INSERT INTO device_light (device_id,created_at,updated_at) 
                                    VALUES(?,?,?)`
                                        const addedData = [result.insertId,datetime, datetime]
                                        conn.query(qry, addedData, (err, result) => {
    
                                        })       
                                            }
                                        })                    
                                
                              
                            } else {
                                return res.json({ success: False, result: "failed" })
    
                            }
                        
    
                        })
                    
                }
                        )}
                return res.json({ success: true, result: "Device Added succesfully" })
                 
                    })
            


                          }else{
                            for(var z=0;z<result.length;z++){
                                newarr.push(result[z].user_id);
                            }
                            //console.log(newarr);

                            for(var k=0;k<arr.length;k++){
                                
                                var count=0;
                              //  console.log(count);
                               
                                for(var t=0;t<newarr.length;t++){
                                    if(arr[k]==newarr[t]){
                                        count++;
                                    }
                                }    
                                //console.log(count);
                                if(count!=1){
                                    return res.json({ success: false, result: `user id  ${arr[k]} is invalid` });

                                }
                            }

                         // return res.json({ success: false, result: `user id must be integer type on ${arr} row` });

                          }  
                        })
            
            





        } catch (err) {
            console.error(err.message)
            res.end();
        }
    })

})



device.post('/addmultiple',(req, res, next) => {
    const { number_of_device,device_id,device_name,device_type,aws_group_id,aws_thing_name,aws_end_point,user_id,current_status,camera_name } = req.body;
    const datetime = new Date();
    datetime.setMinutes(datetime.getMinutes() + 330);

  
    pool.getConnection((err, conn) => {
        if (err) throw err;

        // const encryptedPassword = password;
        try {
            const qry = `SELECT max(device_id) as id  FROM device;
        `

            conn.query(qry, (err, result) => {
                conn.release();
                if (err) throw err;

                if(result.length>0){
                    //console.log("1");
                    const total=result[0].id+number_of_device;
                  //  console.log(result[0].id);
                    const start=result[0].id+1;
                    for(i=start;i<=total;i++){
                        console.log(i);
                    const qry = `INSERT INTO device (created_at) 
                VALUES(?)`
                    const addedData = [datetime]

                    conn.query(qry, addedData, (err, result) => {
                        if (err) throw err;
                      //  console.log(result);
                        if (result.insertId) {
                                const qry = `INSERT INTO device_camera (device_id,created_at,updated_at) 
                                VALUES(?,?,?)`
                                    const addedData = [result.insertId,datetime, datetime]
                                    conn.query(qry, addedData, (err, resu) => {

                                        if(resu.insertId){
                                            const qry = `INSERT INTO device_light (device_id,created_at,updated_at) 
                                VALUES(?,?,?)`
                                    const addedData = [result.insertId,datetime, datetime]
                                    conn.query(qry, addedData, (err, result) => {

                                    })       
                                        }
                                    })                    
                            
                          
                        } else {
                            return res.json({ success: False, result: "failed" })

                        }
                    

                    })
                }
            }
            return res.json({ success: true, result: "Device Added succesfully" })
             
                })
                  
            }
    

         catch (err) {
            console.error(err.message)
            res.end();
        }
    })
})










    device.post('/delete', verifyToken, checkUserExistUsingID, (req, res, next) => {

        const { device_id } = req.body;
    
    
        pool.getConnection((err, conn) => {
            if (err) throw err;
    
            try {
             //   const qry = `Delete device_light,device_camera,device from device_light join device_camera ON device_light.device_id = device_camera.device_id join device ON device_camera.device_id = device.device_id where device_light.device_id=${device_id}`
             const qry = `delete from device_camera where device_id=${device_id}`
    
                conn.query(qry, (err, result) => {
                    conn.release();
    
                    if (err) throw err;
                    if (result.affectedRows) {
                        const qry = `delete from device_light where device_id=${device_id}`
                        conn.query(qry, (err, result) => {
                           
                            if (err) throw err;
                            if (result.affectedRows) {
                                const qry = `delete from device where device_id=${device_id}`
                                conn.query(qry, (err, result) => {            
                                    if (err) throw err;
                                    return res.json({ success: true, result: "deleted successfully" });
                                })                 

                            }        
                        })         
                    } else {
                        return res.json({ success: false, result: "Record not found or already deleted" })
                    }
                })
    
            } catch (err) {
                console.error(err.message)
                res.end();
            }
        })
    })
    

// device.put('/update', verifyToken, checkUserExistUsingID, checkAreaExistUsingIDAndUserID, (req, res) => {
//     const { area_id, area_name } = req.body;
//     if (!area_name) return res.json({ success: false, message: 'Please Provide an Area Name !!!' });

//     pool.getConnection((err, conn) => {
//         if (err) throw err;
//         try {
//             const qry = `UPDATE area SET area_name=? WHERE area_id=?`

//             conn.query(qry, [area_name, area_id], (err, result) => {
//                 conn.release();
//                 if (err) throw err;
//                 console.log('Area Updated Succsessfully');
//                 res.json({ success: true });
//             })

//         } catch (err) {
//             console.error(err.message)
//             res.end();
//         }
//     })
// })

module.exports = device;
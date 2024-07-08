const pool = require('../../db');
const express = require('express');
const ticket = express.Router();
// Export Functions
const multer = require('multer');
const storage = multer.memoryStorage();

const { S3Client, PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");

const upload = multer({ storage: storage });
const s3 = new S3Client({
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
    region: process.env.AWS_BUCKET_REGION
})


const { verifyToken, checkUserExistUsingID } = require('../standardExportFunctions');

ticket.post('/getdata', verifyToken, checkUserExistUsingID ,(req, res) => {
    const { ticket_id } = req.body;

    pool.getConnection((err, conn) => {
        if (err) throw err;

        try {
            const qry = `SELECT * FROM tickets where  ticket_id=${ticket_id}
             `

            conn.query(qry, (err, result) => {
                conn.release();
                if (err) throw err;
                const abc=JSON.parse(result[0].chat);
                result[0].chat=abc;
                //console.log( result[0].supporting_doc_url);
                if(result[0].supporting_doc_url!=null){
                result[0].supporting_doc_url="https://" + process.env.AWS_BUCKET_NAME + ".s3." + process.env.AWS_BUCKET_REGION + ".amazonaws.com/" + result[0].supporting_doc_url;
                }
                res.json({ success: true, ticket: result });
            })
        } catch (err) {
            console.error(err.message)
            res.end();
        }
    })
})

ticket.post('/getallticket', verifyToken, checkUserExistUsingID ,(req, res) => {
    const { user_id } = req.body;
    //const { device_id } = req.body;

    pool.getConnection((err, conn) => {
        if (err) throw err;

        try {
            const qry =`SELECT * FROM users where user_id=${user_id}`;
            conn.query(qry, (err, result) => {
                conn.release();
                if (err) throw err;
                if(result.length>0 && result[0].role==="superadmin"){
                    const qry = `SELECT * FROM tickets where is_admin=true
                `
        
                    conn.query(qry, (err, result) => {
                    //    conn.release();
                        if (err) throw err;
                        if(result.length>0){
                            result.map(bb => {
                                const abc=JSON.parse(bb.chat);
                                bb.chat=abc;
                                if(bb.supporting_doc_url!=null){
              
                                bb.supporting_doc_url="https://" + process.env.AWS_BUCKET_NAME + ".s3." + process.env.AWS_BUCKET_REGION + ".amazonaws.com/" + bb.supporting_doc_url;
             
                                }
                            })
            
                        res.json({ success: true, ticket: result });
                    }else{
                        res.json({ success: false, ticket: "no record found" });    
                        
                    }
                    })
               
                }else if(result.length>0 && result[0].role==="sub-admin"){
                    //console.log('1');
                    const qry = `SELECT * FROM tickets  where user_id=${user_id}
                    ;
                `
        
                    conn.query(qry, (err, result) => {
        //                conn.release();
                        if (err) throw err;
                        if(result.length>0){
                            result.map(bb => {
                                const abc=JSON.parse(bb.chat);
                                bb.chat=abc;
                                if(bb.supporting_doc_url!=null){
              
                                bb.supporting_doc_url="https://" + process.env.AWS_BUCKET_NAME + ".s3." + process.env.AWS_BUCKET_REGION + ".amazonaws.com/" + bb.supporting_doc_url;
                                }
                            })
            
                        res.json({ success: true, ticket: result });
                    }else{
                        res.json({ success: false, ticket: "no record found" });    
                    }
                    })
               

                }
                else if(result.length>0 && result[0].role==="admin"){
                    //console.log('2');
                    const qry = `SELECT * FROM area  where user_id=${user_id}
                    ;
                `
        
                    conn.query(qry, (err, result) => {
        //                conn.release();
                        if (err) throw err;
                        if(result.length>0){
                        
                            // result.map(bb => {
                            //     const abc=JSON.parse(bb.chat);
                            //     bb.chat=abc;
                              
                            // })
                            const abc=[];
                            for(i=0;i<result.length;i++){
                                abc.push(result[i].area_id);
                            }
                            
                            const qry = `SELECT * FROM users  where area_id in (${abc})`
                            
                        
                
                            conn.query(qry, (err, result) => {
                //                conn.release();
                                if (err) throw err;
                                if(result.length>0){
                                    const xyz=[user_id];
                                    for(i=0;i<result.length;i++){
                                        xyz.push(result[i].user_id);
                                    }
                                    
                                    const qry = `SELECT * FROM tickets  where user_id in (${xyz})`
                            
                        
                
                                    conn.query(qry, (err, result) => {
                        //                conn.release();
                                        if (err) throw err;
                                        if(result.length>0){
                                            result.map(bb => {
                                                const abc=JSON.parse(bb.chat);
                                                bb.chat=abc;
                                                if(bb.supporting_doc_url!=null){
              
                                                bb.supporting_doc_url="https://" + process.env.AWS_BUCKET_NAME + ".s3." + process.env.AWS_BUCKET_REGION + ".amazonaws.com/" + bb.supporting_doc_url;
                                                }
                                              
                                            })
                            
                                        res.json({ success: true, ticket: result });
                                        }
                            
                                    })
                                }
                            })        

                    }else{
                        res.json({ success: false, ticket: "no record found" });    
                    }
                    })
               

                }
                
                else{
                    res.json({ success: false, ticket: "no record found" });
                }
            })
        } catch (err) {
            console.error(err.message)
            res.end();
        }
    })
})


// ticket.post('/getallticket',(req, res, next) => {
//     const { start,end,devices,user_id,area_id } = req.body;

//     const datetime = new Date();
//     datetime.setMinutes(datetime.getMinutes() + 330);

  
//     pool.getConnection((err, conn) => {
//         if (err) throw err;

//         // const encryptedPassword = password;
//         try {
//             if(!devices && start<end && user_id && !area_id){
//                 const qry = `UPDATE device SET user_id=?,updated_at=? 
//                 WHERE device_id BETWEEN ${start} AND ${end}`
//                 const addedData = [user_id, datetime]

//                 conn.query(qry, addedData, (err, result) => {
//                     if (err) throw err;
                       
//                     res.json({ success: true, areas: "users updated successfully" });
               
//                 })
             
            
//             }else if(start<end && !user_id && area_id){
            
//                     const qry = `UPDATE device SET area_id=?,updated_at=? 
//                     WHERE device_id BETWEEN ${start} AND ${end}`
//                     const addedData = [area_id, datetime]
    
//                     conn.query(qry, addedData, (err, result) => {
//                         if (err) throw err;
                       
//                         res.json({ success: true, areas: "Area updated successfully" });
             
//                     })
                  
                   
//             }else if(devices && !start && !end && user_id && !area_id){
//                     const qry = `UPDATE device SET user_id=?,updated_at=? 
//                     WHERE device_id in (${devices})`
//                     const addedData = [user_id, datetime]
    
//                     conn.query(qry, addedData, (err, result) => {
//                         if (err) throw err;
                       
//                         res.json({ success: true, areas: "users updated successfully" });
                   
//                     })
                 
                   
//             }else if(devices && !start && !end && !user_id && area_id){
//                     const qry = `UPDATE device SET area_id=?,updated_at=? 
//                     WHERE device_id in (${devices})`
//                     const addedData = [area_id, datetime]
    
//                     conn.query(qry, addedData, (err, result) => {
//                         if (err) throw err;
                       
//                   // console.log(result);
//                   res.json({ success: true, areas: "Area updated successfully" });
              
//                     })
                 
                   
//             }
  
//             }
    

//          catch (err) {
//             console.error(err.message)
//             res.end();
//         }
//     })
// })





ticket.post('/add',verifyToken, upload.single('supporting_doc_url'),async(req, res) => {
    const { issue_title,issue_description,status,chat,user_id} = req.body;
    const datetime = new Date();
    //console.log(arr);
    if(!req.file){
        awsImgKey="";
        pool.getConnection((err, conn) => {
            if (err) throw err;
    
            // const encryptedPassword = password;
            try {
    
                const qry = `SELECT * FROM users WHERE user_id=${user_id}`
                conn.query(qry, (err, resu) => {
                    conn.release();
                    if (err) throw err;
                    if(resu.length>0){
                        const arr=[{"message":chat,"created_by":user_id,"created_person_name":resu[0].name,"created_at":datetime}];
      
                        const qry = `INSERT INTO tickets (user_id,issue_title,issue_description,supporting_doc_url,status,chat,is_admin,created_at,updated_at) 
                        VALUES(?,?,?,?,?,?,?,?,?)`
                            const addedData = [user_id,issue_title,issue_description,awsImgKey,status,JSON.stringify(arr),0,datetime, datetime]
                            conn.query(qry, addedData, (err, result) => {
                                if (err) throw err;
                                if(result.insertId){
                                                return res.json({ success: true, result: "Ticket generated succesfully" });
                                            }
                                            })                 
                        
                    }
                })
                    
                }
            
            
    
             catch (err) {
                console.error(err.message)
                res.end();
            }
        })
    
    }else{

    
    datetime.setMinutes(datetime.getMinutes() + 330);
    const newarr = req.file.mimetype.split("/")
   
    const awsImgKey = `ticket_documents/image-${Date.now()}` + "." + newarr[1];
    const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: awsImgKey,
        Body: req.file.buffer,
        ContentType: req.file.mimetype
   }
   
   const command = new PutObjectCommand(params);
   
   await s3.send(command);
         
  
    pool.getConnection((err, conn) => {
        if (err) throw err;

        // const encryptedPassword = password;
        try {

            const qry = `SELECT * FROM users WHERE user_id=${user_id}`
            conn.query(qry, (err, resu) => {
                conn.release();
                if (err) throw err;
                if(resu.length>0){
                    const arr=[{"message":chat,"created_by":user_id,"created_person_name":resu[0].name,"created_at":datetime}];
  
                    const qry = `INSERT INTO tickets (user_id,issue_title,issue_description,supporting_doc_url,status,chat,is_admin,created_at,updated_at) 
                    VALUES(?,?,?,?,?,?,?,?,?)`
                        const addedData = [user_id,issue_title,issue_description,awsImgKey,status,JSON.stringify(arr),0,datetime, datetime]
                        conn.query(qry, addedData, (err, result) => {
                            if (err) throw err;
                            if(result.insertId){
                                            return res.json({ success: true, result: "Ticket generated succesfully" });
                                        }
                                        })                 
                    
                }
            })
                
            }
        
        

         catch (err) {
            console.error(err.message)
            res.end();
        }
    })
    }  
})


    ticket.post('/update', verifyToken, checkUserExistUsingID,(req, res, next) => {
        const { status,ticket_id,is_admin,user_id } = req.body;
        const datetime = new Date();
     //   const arr={"message":chat,"created_by":user_id,"created_at":datetime};
        //console.log(arr);
        datetime.setMinutes(datetime.getMinutes() + 330);
    
      
        pool.getConnection((err, conn) => {
            if (err) throw err;
    
            // const encryptedPassword = password;
            try {
                const qry = `SELECT * FROM tickets where  ticket_id=${ticket_id}
             `

            conn.query(qry, (err, result) => {
                conn.release();
                if (err) throw err;
                if(result.length>0){
                //  const abc=JSON.parse(result[0].chat);
                //     abc.push(arr);
                   // console.log(abc[1]);
                        const qry = `UPDATE  tickets SET status=?,is_admin=?,updated_at=? where ticket_id=${ticket_id}
                    `
                        const addedData = [status,is_admin,datetime]
                        conn.query(qry, addedData, (err, result) => {
                            if (err) throw err;
                            if(result.affectedRows){
                                            return res.json({ success: true, result: "Ticket updated succesfully" });
                                        }
                                        })                 
                                     }
                                })
                }
            
            
    
             catch (err) {
                console.error(err.message)
                res.end();
            }
        })
        })
   
        
        ticket.post('/addchat', verifyToken, checkUserExistUsingID,(req, res, next) => {
            const { chat,ticket_id,user_id } = req.body;
            const datetime = new Date();
         //   const arr={"message":chat,"created_by":user_id,"created_at":datetime};
            //console.log(arr);
            datetime.setMinutes(datetime.getMinutes() + 330);
        
          
            pool.getConnection((err, conn) => {
                if (err) throw err;
        
                // const encryptedPassword = password;
                try {
                    const qry = `SELECT * FROM users WHERE user_id=${user_id}`
                //    console.log("1");
                    conn.query(qry, (err, resu) => {
                        conn.release();
                        if (err) throw err;
                        if(resu.length>0){
                  //          console.log("1");
                            const arr={"message":chat,"created_by":user_id,"created_person_name":resu[0].name,"created_at":datetime};
                      
                            const qry = `SELECT * FROM tickets where  ticket_id=${ticket_id}
                 `
              
                conn.query(qry, (err, result) => {
                    //conn.release();
                    if (err) throw err;
                    if(result.length>0){
                     const abc=JSON.parse(result[0].chat);
                        abc.push(arr);
                        
                       // console.log(abc[1]);
                            const qry = `UPDATE  tickets SET chat=?,updated_at=? where ticket_id=${ticket_id}
                        `
                            const addedData = [JSON.stringify(abc),datetime]
                            conn.query(qry, addedData, (err, result) => {
                                if (err) throw err;
                                if(result.affectedRows){
                                                return res.json({ success: true, result: "Ticket updated succesfully" });
                                            }
                                            })                 
                                         }
                                    })
                                }
                            })
                    }
                    
                
        
                 catch (err) {
                    console.error(err.message)
                    res.end();
                }
            })
            })
       

    

    ticket.post('/delete', verifyToken, checkUserExistUsingID, (req, res, next) => {

        const { ticket_id } = req.body;
    
    
        pool.getConnection((err, conn) => {
            if (err) throw err;
    
            try {
             //   const qry = `Delete device_light,device_camera,device from device_light join device_camera ON device_light.device_id = device_camera.device_id join device ON device_camera.device_id = device.device_id where device_light.device_id=${device_id}`
             const qry = `delete from tickets where ticket_id=${ticket_id}`
    
                conn.query(qry, (err, result) => {
                    conn.release();
    
                    if (err) throw err;
                    if (result.affectedRows) {
                        return res.json({ success: true, result: "deleted successfully" });
                    }else{
                        return res.json({ success: false, result: "Record not found or already deleted" })
                        
                    }
                })
    
            } catch (err) {
                console.error(err.message)
                res.end();
            }
        })
    })
    

module.exports = ticket;
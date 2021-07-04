const express = require("express");
const mysql = require("mysql");
require("dotenv");
const jwt=require("jsonwebtoken");
const port=5000;
const app=express();
//const product_router=require("./routes/product");
//app.use("/product",product_router);

//establishing connection with mysql
const conn=mysql.createConnection({
    host:"localhost",
    user:"root",
    password:"9211",
    database:"project",
    queueLimit : 0, // unlimited queueing     
    connectionLimit : 0, // unlimited connections
    multipleStatements : true
});

const connection=()=>{ 
    const db=conn.connect((error,result)=> {
    if(error)throw error;
    console.log("connection established");
    return db;
});}

//middle ware : function which runs before everything else 
app.use(express.json());
app.listen(port,() => {});


app.get("/",(request,res)=> {
    res.send(`server is running on port ${port}`);
});

//get api for vendors
app.get("/vendor",(req,res)=>{
const sqlquery="select * from vendor";
conn.query(sqlquery,(error,result)=>{
    if(error)throw error;
    res.json(result);})
})

//get api for sales using join
app.get("/sale",(req,res)=>{
const sqlquery=`select s.sale_number,p.product_name,s.customer_name,s.customer_phone,
s.quantity,s.price,s.total_bill,e.emp_name
from sale s join staff e
on e.emp_id = s.emp_id
join product p 
on p.product_id=s.product_id`;
conn.query(sqlquery,(error,result)=>{
    if(error)throw error;
    res.json(result);})
})

//get api for purchase using joins
app.get("/purchase",(req,res)=>{
const sqlquery=`select p.purchase_id,p.product_id,v.vendor_name,v.vendor_id,pr.product_name,p.quantity,
p.purchase_date,p.price,p.bill from purchase p join product pr on p.product_id=pr.product_id
join vendor v on v.vendor_id=p.vendor_id`;
conn.query(sqlquery,(error,result)=>{
    if(error)throw error;
    res.json(result);})
})

//get api for staff
app.get("/staff",(req,res)=>{
const sqlquery="select * from staff";
conn.query(sqlquery,(error,result)=>{
    if(error)throw error;
    res.json(result);})
})

//insert api for staff
app.post("/staff",(req,res)=>{
    const {emp_id,emp_name,emp_email,emp_password,emp_status}=req.body;
    const query="insert into staff(emp_id,emp_name,emp_email,emp_password,emp_status) values(?,?,?,?,?)";
    conn.query(query,[emp_id,emp_name,emp_email,emp_password,emp_status],(error,result)=>{
        if(error)throw error;
        res.json(result);})
    })


    //insert api for vendor
app.post("/vendor",(req,res)=>{
const {id,name}=req.body;
const query="insert into vendor(vendor_id,vendor_name) values(?,?)";
conn.query(query,[id,name],(error,result)=>{
    if(error)throw error;
    res.json(result);})
})

//insert api for proucts
app.post("/product",(req,res)=>{
    const {product_id,product_name,details,quantity,purchase_price,vendor_id,purchase_date}=req.body;
    const query=`insert into product(product_id,product_name,details,
        quantity,purchase_price,vendor_id) values(?,?,?,?,?,?)`;
    conn.query(query,[product_id,product_name,details,quantity,purchase_price,vendor_id],(error,result)=>{
        if(error)throw error;
        res.json(result);})
        console.log(req.body);
    })
    

    //insert api for purchase
app.post("/purchase",(req,res)=>{
    const {product_id,quantity,purchase_price,vendor_id,purchase_date}=req.body;
    const query='insert into purchase(purchase_id,vendor_id,product_id,quantity,purchase_date,price,bill) values(0,?,?,?,?,?,?)';
        conn.query(query,[vendor_id,product_id,quantity,purchase_date,purchase_price,purchase_price],(error,result)=>{
            if(error)throw error;
            res.json(result);})
    })
        
    
//remove api for vendors
    app.delete("/vendor/:id",(req,res)=>{
        const {id}=req.params;
        const query="delete from vendor where vendor_id=?";
        conn.query(query,[id],(error,result)=>{
            if(error)throw error;
            res.json(result);})
        })

//remove api for firing staff
app.delete("/staff/:id",(req,res)=>{
    const {id}=req.params;
    const query="update staff set emp_status = 'fired' where emp_id = ?";
    conn.query(query,[id],(error,result)=>{
        if(error)throw error;
        res.json(result);})
    })


    //authentication api for logging in
    app.post("/stafflogin",(req,res)=>{
        const{email,password}=req.body;
        const sqlquery="select * from staff where emp_email= ? and emp_password = ?";

        conn.query(sqlquery,[email,password],(error,result)=>{
            if(error)throw error;
            res.json(result);})
        })

//get api for product
app.get("/product",(req,res)=>{
    const sqlquery="select * from product where quantity > 0 order by product_id ";
    conn.query(sqlquery,(error,result)=>{
        if(error)throw error;
        res.json(result);})
    })

    //update any product
app.put("/product/update/:id",(req,res)=>{

    const id_=req.params;
    const {product_id,product_name,details,quantity,purchase_price}=req.body;
    const query="update product set product_name = ?, details=?, quantity=?, purchase_price=? where product_id=?";
    conn.query(query,[product_name,details,quantity,purchase_price,product_id],(error,result)=>{
        if(error)throw error.message;
        res.json(result);    
    });

})

//remove a product
app.delete("/product/:id",(req,res)=>{
    const {id}=req.params;
    console.log(req.params);
    const query="update product set quantity=0 where product_id=?";
    conn.query(query,[id],(error,result)=>{
        if(error)throw error;
        res.json(result);})
    })

    //remove a product with respect to sale
app.delete("/product/sale/:id",(req,res)=>{
    const {id}=req.params;
    console.log(req.params);
    const query="update product set quantity=quantity-1 where product_id=? and quantity>0";
    conn.query(query,[id],(error,result)=>{
        if(error)throw error;
        res.json(result);})
    })


//insert sale
app.post("/sale",(req,res)=>{
    const {sale_num,product_id,emp_id,customer_name,customer_phone,quantity,price,total_bill}=req.body;
    const query=`insert into sale(sale_number,product_id,emp_id,customer_name,customer_phone,quantity,price,total_bill)
        values(?,?,?,?,?,?,?,?)`;
    conn.query(query,[sale_num,product_id,emp_id,customer_name,customer_phone,quantity,price,total_bill],(error,result)=>{
        if(error)throw error;
        res.json(result);})
    })

    //login verification and json web token generation
app.post("/login", (req,res)=>{
const{email,password}=req.body;
const query=`select * from staff where emp_email=? and emp_password = ?`;
conn.query(query,[email,password],async (error,result)=>{
    if(error)throw error;
        if(result){
            const token=await jwt.sign({
                email:email
            },"pasasdasdasdq") 
            res.json({status:"ok",token:token})
        }
})

})

//this is the complete rest api written which connects mysql with the flutter mobile android emulator 
//it is written using node js and express 
//node js provides a runtime environment 
//express js is a framework in javascript for writing apis with node js
//all the other files are node js files including dependencies, libraries, sdks etc
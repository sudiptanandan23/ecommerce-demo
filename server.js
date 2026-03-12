const express = require("express")
const cors = require("cors")
const path = require("path")

const app = express()

app.use(cors())
app.use(express.json())

app.use(express.static("public"))

let users = []

let products = [
 {id:1,name:"Laptop",price:900,image:"https://picsum.photos/200?1"},
 {id:2,name:"Phone",price:500,image:"https://picsum.photos/200?2"},
 {id:3,name:"Headphones",price:120,image:"https://picsum.photos/200?3"}
]

let carts = {}

app.post("/register",(req,res)=>{
 users.push(req.body)
 res.json({message:"User registered"})
})

app.post("/login",(req,res)=>{
 const user = users.find(
  u => u.email === req.body.email && u.password === req.body.password
 )

 if(user){
  res.json({success:true,user})
 }else{
  res.json({success:false})
 }
})

app.get("/products",(req,res)=>{
 res.json(products)
})

app.post("/cart/add",(req,res)=>{
 const {email,product} = req.body

 if(!carts[email]) carts[email]=[]

 carts[email].push(product)

 res.json({message:"Added"})
})

app.get("/cart/:email",(req,res)=>{
 res.json(carts[req.params.email] || [])
})

app.listen(3000,()=>{
 console.log("Server running http://localhost:3000")
})

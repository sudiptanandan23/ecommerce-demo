const express = require("express")
const cors = require("cors")

const app = express()

app.use(cors())
app.use(express.json())
app.use(express.static("public"))

let users = []
let carts = {}

const products = [
{
id:1,
name:"Laptop",
price:900,
image:"https://picsum.photos/200?1"
},
{
id:2,
name:"Smartphone",
price:600,
image:"https://picsum.photos/200?2"
},
{
id:3,
name:"Headphones",
price:120,
image:"https://picsum.photos/200?3"
},
{
id:4,
name:"Smart Watch",
price:250,
image:"https://picsum.photos/200?4"
}
]

app.post("/register",(req,res)=>{
users.push(req.body)
res.json({message:"Registered"})
})

app.post("/login",(req,res)=>{

const user = users.find(
u=>u.email===req.body.email && u.password===req.body.password
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

res.json({message:"Added to cart"})
})

app.get("/cart/:email",(req,res)=>{
res.json(carts[req.params.email] || [])
})

app.post("/checkout",(req,res)=>{

const {email} = req.body

const order = carts[email] || []

console.log("Order placed:",order)

carts[email] = []

res.json({message:"Order placed"})

})

app.listen(3000,()=>{
console.log("Server running http://localhost:3000")
})

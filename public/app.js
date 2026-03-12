let user = JSON.parse(localStorage.getItem("user"))

/* ---------------- REGISTER ---------------- */

function register(){

let users = JSON.parse(localStorage.getItem("users")) || []

let newUser = {
name:document.getElementById("name").value,
email:document.getElementById("email").value,
password:document.getElementById("password").value
}

users.push(newUser)

localStorage.setItem("users",JSON.stringify(users))

sendDataCloudEvent("UserRegistered")

alert("Registration successful")

window.location="login.html"

}

/* ---------------- LOGIN ---------------- */

function login(){

let users = JSON.parse(localStorage.getItem("users")) || []

let email=document.getElementById("email").value
let password=document.getElementById("password").value

let found = users.find(u => u.email===email && u.password===password)

if(found){

localStorage.setItem("user",JSON.stringify(found))

sendDataCloudEvent("UserLogin")

window.location="products.html"

}else{

alert("Invalid login")

}

}

/* ---------------- PRODUCTS ---------------- */

function loadProducts(){

const products=[

{
id:1,
name:"Laptop",
price:900,
image:"https://picsum.photos/250?1"
},

{
id:2,
name:"Smartphone",
price:600,
image:"https://picsum.photos/250?2"
},

{
id:3,
name:"Headphones",
price:120,
image:"https://picsum.photos/250?3"
},

{
id:4,
name:"Smart Watch",
price:250,
image:"https://picsum.photos/250?4"
}

]

const container=document.getElementById("products")

products.forEach(p=>{

let div=document.createElement("div")

div.className="card"

div.innerHTML=`

<img src="${p.image}">
<h3>${p.name}</h3>
<p>$${p.price}</p>
<button onclick='addToCart(${JSON.stringify(p)})'>Add to Cart</button>

`

container.appendChild(div)

})

}

/* ---------------- CART ---------------- */

function addToCart(product){

let cart = JSON.parse(localStorage.getItem("cart")) || []

cart.push(product)

localStorage.setItem("cart",JSON.stringify(cart))

sendDataCloudEvent("AddToCart",product)

alert("Added to cart")

}

/* ---------------- LOAD CART ---------------- */

function loadCart(){

let cart = JSON.parse(localStorage.getItem("cart")) || []

const div=document.getElementById("cart")

div.innerHTML=""

cart.forEach(item=>{

let p=document.createElement("p")

p.innerText=item.name + " - $" + item.price

div.appendChild(p)

})

}

/* ---------------- CHECKOUT ---------------- */

function checkout(){

let cart = JSON.parse(localStorage.getItem("cart")) || []

if(cart.length===0){

alert("Cart empty")
return

}

sendDataCloudEvent("Purchase")

localStorage.removeItem("cart")

alert("Order placed!")

window.location="index.html"

}

/* ---------------- DATACLOUD EVENT ---------------- */

function sendDataCloudEvent(eventType,product={}){

const eventPayload={

eventType:eventType,
email:user?.email || "guest",
productName:product.name || "",
price:product.price || "",
timestamp:new Date().toISOString()

}

/* Replace with real Data Cloud ingestion endpoint */

fetch("https://YOUR-DATACLOUD-ENDPOINT/events",{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify(eventPayload)

}).catch(()=>{

console.log("DataCloud endpoint not connected yet")

})

}

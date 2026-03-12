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

{ id:1, name:"Laptop", price:900, image:"https://picsum.photos/250?1"},
{ id:2, name:"Smartphone", price:600, image:"https://picsum.photos/250?2"},
{ id:3, name:"Headphones", price:120, image:"https://picsum.photos/250?3"},
{ id:4, name:"Smart Watch", price:250, image:"https://picsum.photos/250?4"}

]

const container=document.getElementById("products")

container.innerHTML=""

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

updateCartCounter()

}

/* ---------------- CART ADD ---------------- */

function addToCart(product){

let cart = JSON.parse(localStorage.getItem("cart")) || []

let existing = cart.find(item => item.id === product.id)

if(existing){
existing.qty++
}else{
product.qty = 1
cart.push(product)
}

localStorage.setItem("cart",JSON.stringify(cart))

sendDataCloudEvent("AddToCart",product)

updateCartCounter()

alert("Added to cart")

}

/* ---------------- CART COUNTER ---------------- */

function updateCartCounter(){

let cart = JSON.parse(localStorage.getItem("cart")) || []

let count = cart.reduce((sum,item)=> sum + item.qty,0)

let counter=document.getElementById("cartCount")

if(counter){
counter.innerText=count
}

}

/* ---------------- CART PAGE ---------------- */

function loadCartPage(){

let cart = JSON.parse(localStorage.getItem("cart")) || []

const table=document.getElementById("cartTable")

table.innerHTML=""

let total=0

cart.forEach(item=>{

let itemTotal=item.price * item.qty
total += itemTotal

let row=document.createElement("tr")

row.innerHTML=`

<td><img src="${item.image}" width="60"></td>
<td>${item.name}</td>
<td>$${item.price}</td>

<td>
<button onclick="decreaseQty(${item.id})">-</button>
${item.qty}
<button onclick="increaseQty(${item.id})">+</button>
</td>

<td>$${itemTotal}</td>

<td>
<button onclick="removeItem(${item.id})">Remove</button>
</td>

`

table.appendChild(row)

})

document.getElementById("cartTotal").innerText="Total: $" + total

updateCartCounter()

}

/* ---------------- QUANTITY INCREASE ---------------- */

function increaseQty(id){

let cart = JSON.parse(localStorage.getItem("cart")) || []

let item = cart.find(p=>p.id===id)

item.qty++

localStorage.setItem("cart",JSON.stringify(cart))

loadCartPage()

}

/* ---------------- QUANTITY DECREASE ---------------- */

function decreaseQty(id){

let cart = JSON.parse(localStorage.getItem("cart")) || []

let item = cart.find(p=>p.id===id)

if(item.qty>1){
item.qty--
}

localStorage.setItem("cart",JSON.stringify(cart))

loadCartPage()

}

/* ---------------- REMOVE ITEM ---------------- */

function removeItem(id){

let cart = JSON.parse(localStorage.getItem("cart")) || []

cart = cart.filter(item=>item.id!==id)

localStorage.setItem("cart",JSON.stringify(cart))

loadCartPage()

}

/* ---------------- CHECKOUT TABLE ---------------- */

function loadCheckout(){

let cart = JSON.parse(localStorage.getItem("cart")) || []

const body=document.getElementById("checkoutBody")

body.innerHTML=""

let total=0

cart.forEach(item=>{

let row=document.createElement("tr")

let itemTotal=item.price * item.qty

total += itemTotal

row.innerHTML=`

<td><img src="${item.image}" width="60"></td>
<td>${item.name}</td>
<td>$${item.price}</td>
<td>${item.qty}</td>
<td>$${itemTotal}</td>

`

body.appendChild(row)

})

document.getElementById("grandTotal").innerText="Grand Total: $" + total

}

/* ---------------- PAYMENT ---------------- */

function payNow(){

sendDataCloudEvent("Purchase")

localStorage.removeItem("cart")

updateCartCounter()

alert("Payment Successful")

window.location="index.html"

}

/* ---------------- ABANDONED CART ---------------- */

window.addEventListener("beforeunload",function(){

let cart = JSON.parse(localStorage.getItem("cart")) || []

if(cart.length>0){

sendDataCloudEvent("AbandonedCart",{
cartSize:cart.length
})

}

})

/* ---------------- DATACLOUD EVENT ---------------- */

function sendDataCloudEvent(eventType,product={}){

const eventPayload={

eventType:eventType,
email:user?.email || "guest",
productName:product.name || "",
price:product.price || "",
timestamp:new Date().toISOString()

}

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

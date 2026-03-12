/* ---------------- DATA CLOUD DEMO USER ---------------- */

const DATA_CLOUD_EMAIL = "sudipta_nandan+carttest@epam.com"


/* ---------------- USER SESSION ---------------- */

let user = JSON.parse(localStorage.getItem("user")) || null


/* ---------------- AUTO CART COUNTER ---------------- */

document.addEventListener("DOMContentLoaded", function () {
updateCartCounter()
})


/* ---------------- REGISTER ---------------- */

function register(){

let users = JSON.parse(localStorage.getItem("users")) || []

let newUser = {

name: document.getElementById("name").value,
email: document.getElementById("email").value,
password: document.getElementById("password").value

}

if(users.find(u => u.email === newUser.email)){
alert("User already exists")
return
}

users.push(newUser)

localStorage.setItem("users", JSON.stringify(users))

sendDataCloudEvent("UserRegistered")

alert("Registration successful")

window.location = "login.html"

}


/* ---------------- LOGIN ---------------- */

function login(){

let users = JSON.parse(localStorage.getItem("users")) || []

let email = document.getElementById("email").value
let password = document.getElementById("password").value

let found = users.find(u => u.email === email && u.password === password)

if(found){

localStorage.setItem("user", JSON.stringify(found))
user = found

sendDataCloudEvent("UserLogin")

window.location = "products.html"

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

const container = document.getElementById("products")

if(!container) return

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


/* ---------------- ADD TO CART ---------------- */

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

sendDataCloudEvent("AddToCart", product)

updateCartCounter()

alert(product.name + " added to cart")

}


/* ---------------- CART COUNTER ---------------- */

function updateCartCounter(){

let cart = JSON.parse(localStorage.getItem("cart")) || []

let count = cart.reduce((sum,item)=> sum + item.qty,0)

let counter=document.getElementById("cartCount")

if(counter){
counter.innerText = count
}

}


/* ---------------- CART PAGE ---------------- */

function loadCartPage(){

let cart = JSON.parse(localStorage.getItem("cart")) || []

const table=document.getElementById("cartTable")

if(!table) return

table.innerHTML=""

let total=0

cart.forEach(item=>{

let itemTotal = item.price * item.qty
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

let totalDiv=document.getElementById("cartTotal")

if(totalDiv){
totalDiv.innerText="Total: $" + total
}

updateCartCounter()

}


/* ---------------- QUANTITY INCREASE ---------------- */

function increaseQty(id){

let cart = JSON.parse(localStorage.getItem("cart")) || []

let item = cart.find(p=>p.id===id)

if(item){
item.qty++
}

localStorage.setItem("cart", JSON.stringify(cart))

loadCartPage()

}


/* ---------------- QUANTITY DECREASE ---------------- */

function decreaseQty(id){

let cart = JSON.parse(localStorage.getItem("cart")) || []

let item = cart.find(p=>p.id===id)

if(item && item.qty>1){
item.qty--
}

localStorage.setItem("cart", JSON.stringify(cart))

loadCartPage()

}


/* ---------------- REMOVE ITEM ---------------- */

function removeItem(id){

let cart = JSON.parse(localStorage.getItem("cart")) || []

cart = cart.filter(item=>item.id!==id)

localStorage.setItem("cart", JSON.stringify(cart))

loadCartPage()

}


/* ---------------- CHECKOUT TABLE ---------------- */

function loadCheckout(){

let cart = JSON.parse(localStorage.getItem("cart")) || []

const body=document.getElementById("checkoutBody")

if(!body) return

body.innerHTML=""

let total=0

cart.forEach(item=>{

let itemTotal=item.price * item.qty
total += itemTotal

let row=document.createElement("tr")

row.innerHTML=`

<td><img src="${item.image}" width="60"></td>
<td>${item.name}</td>
<td>$${item.price}</td>
<td>${item.qty}</td>
<td>$${itemTotal}</td>

`

body.appendChild(row)

})

let totalDiv=document.getElementById("grandTotal")

if(totalDiv){
totalDiv.innerText="Grand Total: $" + total
}

}


/* ---------------- PAYMENT ---------------- */

function payNow(){

let cart = JSON.parse(localStorage.getItem("cart")) || []

if(cart.length===0){
alert("Cart is empty")
return
}

let name = document.getElementById("name")?.value || user?.name || "Guest"
let email = document.getElementById("email")?.value || user?.email || DATA_CLOUD_EMAIL
let phone = document.getElementById("phone")?.value || ""
let address = document.getElementById("address")?.value || ""

let order = {

orderId: "ORD" + Date.now(),
name: name,
email: email,
phone: phone,
address: address,
items: cart,
date: new Date().toLocaleString()

}

localStorage.setItem("order", JSON.stringify(order))

sendDataCloudEvent("Purchase")

localStorage.removeItem("cart")

updateCartCounter()

alert("Payment Successful")

window.location = "order.html"

}


/* ---------------- LOAD ORDER DETAILS ---------------- */

function loadOrderDetails(){

let order = JSON.parse(localStorage.getItem("order"))

if(!order){

document.querySelector(".order-container").innerHTML =
"<h3>No order found</h3>"

return
}

document.getElementById("orderName").innerText = order.name
document.getElementById("orderEmail").innerText = order.email
document.getElementById("orderPhone").innerText = order.phone
document.getElementById("orderAddress").innerText = order.address

let table=document.getElementById("orderItems")

table.innerHTML=""

let total=0

order.items.forEach(item=>{

let itemTotal=item.price * item.qty
total += itemTotal

let row=document.createElement("tr")

row.innerHTML=`

<td><img src="${item.image}" width="60"></td>
<td>${item.name}</td>
<td>$${item.price}</td>
<td>${item.qty}</td>
<td>$${itemTotal}</td>

`

table.appendChild(row)

})

document.getElementById("orderTotal").innerText="Grand Total: $" + total

}


/* ---------------- ABANDONED CART ---------------- */

window.addEventListener("beforeunload",function(){

let cart = JSON.parse(localStorage.getItem("cart")) || []

if(cart.length>0){

sendDataCloudEvent("AbandonedCart")

}

})


/* ---------------- DATA CLOUD EVENT ---------------- */

function sendDataCloudEvent(eventType,product={}){

if(typeof SalesforceInteractions === "undefined"){
console.log("Salesforce Web SDK not loaded")
return
}

SalesforceInteractions.sendEvent({

interaction:{
name:eventType
},

user:{
identities:{
email: DATA_CLOUD_EMAIL
}
},

catalogObject: product.id ? {

type:"Product",

id:product.id,

attributes:{
name:product.name || "",
price:product.price || "",
imageUrl:product.image || ""
}

} : undefined

})

console.log("Event sent to Data Cloud:", eventType)

}

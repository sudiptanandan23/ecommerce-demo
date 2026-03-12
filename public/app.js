let user = JSON.parse(localStorage.getItem("user"))

function register(){

fetch("/register",{

method:"POST",
headers:{'Content-Type':'application/json'},

body:JSON.stringify({

name:document.getElementById("name").value,
email:document.getElementById("email").value,
password:document.getElementById("password").value

})

})
.then(()=>{

sendDataCloudEvent("UserRegistered")

alert("Registered")

window.location="login.html"

})

}

function login(){

fetch("/login",{

method:"POST",
headers:{'Content-Type':'application/json'},

body:JSON.stringify({

email:document.getElementById("email").value,
password:document.getElementById("password").value

})

})

.then(res=>res.json())

.then(data=>{

if(data.success){

localStorage.setItem("user",JSON.stringify(data.user))

sendDataCloudEvent("UserLogin")

window.location="products.html"

}else{

alert("Invalid login")

}

})

}

function loadProducts(){

fetch("/products")

.then(res=>res.json())

.then(products=>{

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

})

}

function addToCart(product){

fetch("/cart/add",{

method:"POST",

headers:{'Content-Type':'application/json'},

body:JSON.stringify({

email:user.email,
product:product

})

})

sendDataCloudEvent("AddToCart",product)

alert("Added to cart")

}

function loadCart(){

fetch(`/cart/${user.email}`)

.then(res=>res.json())

.then(items=>{

const div=document.getElementById("cart")

items.forEach(i=>{

let p=document.createElement("p")

p.innerText=i.name + " - $" + i.price

div.appendChild(p)

})

})

}

function checkout(){

fetch("/checkout",{

method:"POST",

headers:{'Content-Type':'application/json'},

body:JSON.stringify({

email:user.email

})

})

sendDataCloudEvent("Purchase")

alert("Order placed!")

window.location="index.html"

}

function sendDataCloudEvent(eventType,product={}){

fetch("https://YOUR-DATACLOUD-ENDPOINT/events",{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({

eventType:eventType,

email:user?.email,

productName:product.name,

price:product.price,

timestamp:new Date()

})

})

}

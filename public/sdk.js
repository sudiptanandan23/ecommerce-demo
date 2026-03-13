document.addEventListener("DOMContentLoaded", function () {

if (typeof SalesforceInteractions === "undefined") {
    console.error("[ERROR] SalesforceInteractions SDK not loaded");
    return;
}

SalesforceInteractions.setLoggingLevel("DEBUG");

/* ---------------- IDENTIFIERS ---------------- */

let deviceId = localStorage.getItem("deviceId");
let sessionId = sessionStorage.getItem("sessionId");

if (!deviceId) {
    deviceId = "device-" + crypto.randomUUID();
    localStorage.setItem("deviceId", deviceId);
}

if (!sessionId) {
    sessionId = "session-" + Date.now();
    sessionStorage.setItem("sessionId", sessionId);
}

/* ---------------- INIT SDK ---------------- */

SalesforceInteractions.init({
    cookieDomain: window.location.hostname
}).then(() => {

console.log("[SDK INITIALIZED]");

/* ---------------- GENERIC EVENT SENDER ---------------- */

function sendInteraction(interactionName, interactionType, attributes, catalogObject){

const payload = {

interaction:{
name: interactionName,
type: interactionType
},

category: "Engagement",

deviceId: deviceId,
sessionId: sessionId,

source:{
url: window.location.href,
urlReferrer: document.referrer,
channel: "Web"
},

attributes: attributes || {},

dateTime: new Date().toISOString()

};

if(catalogObject){
payload.catalogObject = catalogObject;
}

console.log("[EVENT PAYLOAD]", payload);

SalesforceInteractions.sendEvent(payload);

}

/* ---------------- PAGE VIEW ---------------- */

sendInteraction(
"Page View",
"webPageView",
{
pageTitle: document.title,
pageUrl: window.location.href
}
);

/* ---------------- PRODUCT VIEW LISTENER ---------------- */

document.querySelectorAll("[data-product-id]").forEach(productCard => {

productCard.addEventListener("click", function(){

const product = {
id: this.dataset.productId,
name: this.dataset.productName,
price: this.dataset.productPrice,
image: this.dataset.productImage
};

sendInteraction(
"Product View",
"catalogObjectView",
{},
{
type:"Product",
id: product.id,
attributes:{
name: product.name,
price: product.price,
imageUrl: product.image
}
}
);

});

});

/* ---------------- ADD TO CART LISTENER ---------------- */

document.querySelectorAll(".add-to-cart").forEach(btn => {

btn.addEventListener("click", function(){

const product = {
id: this.dataset.productId,
name: this.dataset.productName,
price: this.dataset.productPrice,
image: this.dataset.productImage
};

sendInteraction(
"Add To Cart",
"cartAdd",
{
productName: product.name,
price: product.price
},
{
type:"Product",
id: product.id,
attributes:{
name: product.name,
price: product.price,
imageUrl: product.image
}
}
);

});

});

/* ---------------- REMOVE FROM CART ---------------- */

document.querySelectorAll(".remove-from-cart").forEach(btn => {

btn.addEventListener("click", function(){

sendInteraction(
"Remove From Cart",
"cartRemove",
{
productId: this.dataset.productId
}
);

});

});

/* ---------------- VIEW CART ---------------- */

const cartButton = document.querySelector("#view-cart");

if(cartButton){

cartButton.addEventListener("click", function(){

let cart = JSON.parse(localStorage.getItem("cart")) || [];

sendInteraction(
"View Cart",
"cartView",
{
cartSize: cart.length
}
);

});

}

/* ---------------- CHECKOUT ---------------- */

const checkoutButton = document.querySelector("#checkout");

if(checkoutButton){

checkoutButton.addEventListener("click", function(){

let cart = JSON.parse(localStorage.getItem("cart")) || [];

let total = cart.reduce((sum,item)=>sum + item.price * item.qty,0);

sendInteraction(
"Checkout",
"cartCheckout",
{
cartValue: total,
cartSize: cart.length
}
);

});

}

/* ---------------- PURCHASE ---------------- */

document.addEventListener("purchaseComplete", function(e){

const order = e.detail;

sendInteraction(
"Purchase",
"order",
{
orderId: order.orderId,
orderValue: order.total,
itemCount: order.items.length
}
);

});

/* ---------------- ABANDON CART ---------------- */

window.addEventListener("beforeunload", function(){

let cart = JSON.parse(localStorage.getItem("cart")) || [];

if(cart.length > 0){

sendInteraction(
"Cart Abandon",
"cartAbandon",
{
cartSize: cart.length
}
);

}

});

});
});

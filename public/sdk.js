document.addEventListener("DOMContentLoaded", function () {

if (typeof SalesforceInteractions === "undefined") {
console.error("SalesforceInteractions SDK not loaded");
return;
}

SalesforceInteractions.setLoggingLevel("DEBUG");

/* GLOBAL VARIABLES */

const USER_EMAIL = "sudipta_nandan+carttest@epam.com";

let deviceId = localStorage.getItem("deviceId");
let sessionId = sessionStorage.getItem("sessionId");
let pageStartTime = Date.now();

/* GENERATE IDS */

if(!deviceId){
deviceId="device-"+crypto.randomUUID();
localStorage.setItem("deviceId",deviceId);
}

if(!sessionId){
sessionId="session-"+Date.now();
sessionStorage.setItem("sessionId",sessionId);
}

/* GLOBAL EVENT FUNCTION */

window.sendEvent = function(name,type,attributes,catalog){

if(typeof SalesforceInteractions === "undefined"){
console.warn("SDK not ready");
return;
}

let eventPayload = {

interaction:{
name:name,
type:type
},

category:"Engagement",

deviceId:deviceId,
sessionId:sessionId,

user:{
identities:{
email:USER_EMAIL
}
},

attributes: attributes || {},

sourceUrl:window.location.href,
sourceUrlReferrer:document.referrer,

dateTime:new Date().toISOString()

};

/* ADD CATALOG IF PRESENT */

if(catalog){
eventPayload.catalogObject = catalog;
}

SalesforceInteractions.sendEvent(eventPayload);

console.log("Event Sent:",name);

};


/* INIT SDK */

SalesforceInteractions.init({
cookieDomain: window.location.hostname
});

console.log("SDK Initialized");

/* CONSENT */

SalesforceInteractions.updateConsents([{
status: SalesforceInteractions.ConsentStatus.OptIn,
purpose: SalesforceInteractions.ConsentPurpose.Tracking,
provider:"Website"
}]);


/* PAGE VIEW */

sendEvent("Page View","webPageView",{});


/* PRODUCT VIEW */

window.trackProductView=function(product){

sendEvent(
"Product View",
"catalogObjectView",
{},
{
type:"Product",
id:product.id,
attributes:{
name:product.name,
price:product.price,
imageUrl:product.image
}
}
);

};


/* ADD TO CART */

window.trackAddToCart=function(product){

sendEvent(
"Add To Cart",
"cartAdd",
{
productName:product.name,
price:product.price
},
{
type:"Product",
id:product.id,
attributes:{
name:product.name,
price:product.price
}
}
);

};


/* CART VIEW */

window.trackViewCart=function(cart){

sendEvent(
"View Cart",
"cartView",
{
cartSize:cart.length
}
);

};


/* QUANTITY CHANGE */

window.trackQuantityChange=function(product,qty){

sendEvent(
"Cart Quantity Change",
"cartUpdate",
{
productName:product.name,
quantity:qty
}
);

};


/* REMOVE ITEM */

window.trackRemoveItem=function(product){

sendEvent(
"Remove From Cart",
"cartRemove",
{
productName:product.name
}
);

};


/* CHECKOUT */

window.trackCheckout=function(cartTotal){

sendEvent(
"Checkout Start",
"cartCheckout",
{
cartValue:cartTotal
}
);

};


/* PURCHASE */

window.trackPurchase=function(order){

sendEvent(
"Purchase",
"order",
{
orderId:order.orderId,
orderValue:order.total,
itemCount:order.items.length
}
);

};


/* ABANDON CART */

window.addEventListener("beforeunload",function(){

let cart = JSON.parse(localStorage.getItem("cart")) || [];

if(cart.length>0){

sendEvent(
"Abandoned Cart",
"cartAbandon",
{
cartSize:cart.length
}
);

}

});

});

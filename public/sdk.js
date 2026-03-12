document.addEventListener("DOMContentLoaded", function () {

if (typeof SalesforceInteractions === "undefined") {
console.error("SalesforceInteractions SDK not loaded");
return;
}

SalesforceInteractions.setLoggingLevel("DEBUG");

SalesforceInteractions.init({
cookieDomain: window.location.hostname
}).then(()=>{

console.log("SDK Initialized");

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

/* CONSENT */

SalesforceInteractions.updateConsents([{
status: SalesforceInteractions.ConsentStatus.OptIn,
purpose: SalesforceInteractions.ConsentPurpose.Tracking,
provider:"Website"
}]);


/* GLOBAL EVENT FUNCTION */

function sendEvent(name,type,attributes,catalog){

SalesforceInteractions.sendEvent({

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

catalogObject: catalog || null,

attributes: attributes || {},

sourceUrl:window.location.href,
sourceUrlReferrer:document.referrer,

dateTime:new Date().toISOString()

});

console.log("Event Sent:",name);

}


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


/* CHECKOUT START */

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


/* ABANDONED CART */

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
});

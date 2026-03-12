document.addEventListener("DOMContentLoaded", function () {

if (typeof SalesforceInteractions === "undefined") {
console.error("SalesforceInteractions SDK not loaded");
return;
}

SalesforceInteractions.setLoggingLevel("DEBUG");

let deviceId;
let sessionId;
let pageStartTime = Date.now();
let trackingInitialized = false;

/* COOKIE BANNER */

const banner = document.getElementById("cookieBanner");
const acceptBtn = document.getElementById("acceptCookies");
const rejectBtn = document.getElementById("rejectCookies");

/* PROFILE TABLE */

const profileTable = document.getElementById("profileTable");

/* INITIALIZE SDK */

SalesforceInteractions.init({

cookieDomain: window.location.hostname,

consents:[{
status: SalesforceInteractions.ConsentStatus.OptOut,
purpose: SalesforceInteractions.ConsentPurpose.Tracking,
provider:"Website"
}]

}).then(()=>{

console.log("SDK Initialized");

let storedConsent = localStorage.getItem("userConsent");

if(!storedConsent){

if(banner) banner.style.display="flex";

}else{

if(banner) banner.style.display="none";
sendConsent(storedConsent);

}

});


/* ACCEPT COOKIES */

if(acceptBtn){

acceptBtn.addEventListener("click",function(){

localStorage.setItem("userConsent","OptIn");

if(banner) banner.style.display="none";

sendConsent("OptIn");

});

}


/* REJECT COOKIES */

if(rejectBtn){

rejectBtn.addEventListener("click",function(){

localStorage.setItem("userConsent","OptOut");

if(banner) banner.style.display="none";

sendConsent("OptOut");

});

}


/* SEND CONSENT */

function sendConsent(status){

SalesforceInteractions.updateConsents([{
status: SalesforceInteractions.ConsentStatus[status],
purpose: SalesforceInteractions.ConsentPurpose.Tracking,
provider:"Website"
}]);

console.log("Consent Sent:", status);

if(status === "OptIn"){
initializeTracking();
}

}


/* INITIALIZE TRACKING */

function initializeTracking(){

if(trackingInitialized) return;

trackingInitialized = true;

/* DEVICE ID */

deviceId = localStorage.getItem("deviceId");

if(!deviceId){
deviceId = "device-" + crypto.randomUUID();
localStorage.setItem("deviceId", deviceId);
}

/* SESSION ID */

sessionId = sessionStorage.getItem("sessionId");

if(!sessionId){
sessionId = "session-" + Date.now();
sessionStorage.setItem("sessionId", sessionId);
}


/* PAGE VIEW EVENT */

window.sendEvent("Page View","webPageView",{
page: window.location.pathname
});


/* PRODUCT VIEW EVENT */

document.querySelectorAll(".card").forEach(card => {

card.addEventListener("click", function(){

let productName = card.querySelector("h3")?.innerText || "Unknown";

window.sendEvent("Product View","commerce",{
productName: productName
});

});

});


/* ADD TO CART EVENT */

document.querySelectorAll("button").forEach(btn => {

if(btn.innerText.includes("Add to Cart")){

btn.addEventListener("click",function(){

let card = btn.closest(".card");

let productName = card.querySelector("h3").innerText;
let productPrice = card.querySelector("p").innerText;

window.sendEvent("Add To Cart","commerce",{
productName: productName,
price: productPrice
});

});

}

});


/* VIEW CART EVENT */

if(window.location.pathname.includes("cart")){

window.sendEvent("View Cart","commerce",{
page:"cart"
});

}


/* CHECKOUT START */

if(window.location.pathname.includes("checkout")){

window.sendEvent("Checkout Start","commerce",{
step:"checkout"
});

}


/* PURCHASE EVENT */

if(window.location.pathname.includes("order")){

window.sendEvent("Purchase","commerce",{
orderStatus:"completed"
});

}


/* ABANDONED CART */

window.addEventListener("beforeunload",function(){

let cart = JSON.parse(localStorage.getItem("cart")) || [];

if(cart.length > 0){

window.sendEvent("Abandoned Cart","commerce",{
cartItems: cart.length
});

}

});


/* CTA BUTTON EVENTS */

document.querySelectorAll(".btn").forEach(btn => {

btn.addEventListener("click",function(){

const interactionName = btn.innerText;

document.querySelectorAll(".btn").forEach(b=>b.classList.remove("active"));
btn.classList.add("active");

window.sendEvent("CTA Click","webClick",{
buttonName: interactionName
});

if(profileTable){

profileTable.style.display="block";

document.getElementById("deviceId").innerText=deviceId;
document.getElementById("sessionId").innerText=sessionId;
document.getElementById("sourceUrl").innerText=window.location.href;
document.getElementById("referrer").innerText=document.referrer || "Direct";
document.getElementById("interactionName").innerText=interactionName;
document.getElementById("dateTime").innerText=new Date().toISOString();

}

});

});


/* SCROLL DEPTH */

window.addEventListener("scroll",function(){

let scrollPercent =
Math.round((window.scrollY /
(document.body.scrollHeight - window.innerHeight)) * 100);

if(scrollPercent > 50){

window.sendEvent("Scroll Depth","webInteraction",{
scrollDepth: scrollPercent
});

}

});


/* TAB VISIBILITY */

document.addEventListener("visibilitychange",function(){

window.sendEvent("Tab Visibility","webInteraction",{
state: document.visibilityState
});

});


/* PAGE EXIT */

window.addEventListener("beforeunload",function(){

let timeSpent = Math.round((Date.now() - pageStartTime)/1000);

window.sendEvent("Page Exit","webInteraction",{
timeOnPage: timeSpent
});

});

}


/* GLOBAL EVENT FUNCTION */

window.sendEvent = function(name,type,attributes){

if(typeof SalesforceInteractions === "undefined"){
console.warn("SDK not ready");
return;
}

SalesforceInteractions.sendEvent({

interaction:{
name:name,
type:type
},

category:"Engagement",

deviceId:deviceId,
sessionId:sessionId,

attributes:attributes || {},

sourceUrl:window.location.href,
sourceUrlReferrer:document.referrer,

dateTime:new Date().toISOString()

});

console.log("Event Sent:",name);

};

});

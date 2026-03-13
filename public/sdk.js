document.addEventListener("DOMContentLoaded", function () {

if (typeof SalesforceInteractions === "undefined") {
    console.error("[ERROR] SalesforceInteractions SDK not loaded");
    return;
}

SalesforceInteractions.setLoggingLevel("DEBUG");

/* ---------------- GLOBAL VARIABLES ---------------- */

const USER_EMAIL = "sudipta_nandan+carttest@epam.com";

let deviceId = localStorage.getItem("deviceId");
let sessionId = sessionStorage.getItem("sessionId");
let pageStartTime = Date.now();

/* ---------------- GENERATE DEVICE + SESSION ---------------- */

if (!deviceId) {
    deviceId = "device-" + crypto.randomUUID();
    localStorage.setItem("deviceId", deviceId);
    console.log("[DEBUG] New DeviceId Generated:", deviceId);
}

if (!sessionId) {
    sessionId = "session-" + Date.now();
    sessionStorage.setItem("sessionId", sessionId);
    console.log("[DEBUG] New SessionId Generated:", sessionId);
}

/* ---------------- INIT SDK ---------------- */

console.log("[DEBUG] Initializing SalesforceInteractions SDK...");

SalesforceInteractions.init({

    cookieDomain: window.location.hostname,

    consents: [
        {
            status: SalesforceInteractions.ConsentStatus.OptIn,
            purpose: SalesforceInteractions.ConsentPurpose.Tracking,
            provider: "Website"
        }
    ]

}).then(() => {

console.log("[SUCCESS] Salesforce Interactions SDK initialized");

/* ---------------- UPDATE CONSENT ---------------- */

SalesforceInteractions.updateConsents([
    {
        status: SalesforceInteractions.ConsentStatus.OptIn,
        purpose: SalesforceInteractions.ConsentPurpose.Tracking,
        provider: "Website"
    }
]);

console.log("[DEBUG] Consent Updated");

/* ---------------- GLOBAL EVENT FUNCTION ---------------- */

window.sendEvent = function(name, type, attributes, catalog){

console.log("--------------------------------------------------");
console.log("[EVENT TRIGGERED]", name);
console.log("[EVENT TYPE]", type);
console.log("[TIMESTAMP]", new Date().toISOString());

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
            email: JSON.parse(localStorage.getItem("user"))?.email || USER_EMAIL || "guest"
        }
    },

    attributes: attributes || {},

    sourceUrl: window.location.href,
    sourceUrlReferrer: document.referrer,

    dateTime: new Date().toISOString()

};

/* ADD CATALOG OBJECT */

if(catalog){

    console.log("[CATALOG OBJECT]", catalog);

    eventPayload.catalogObject = catalog;
}

console.log("[EVENT PAYLOAD]", eventPayload);

/* SEND EVENT */

try{

SalesforceInteractions.sendEvent(eventPayload);

console.log("[SUCCESS] Event sent to Salesforce:", name);

}catch(error){

console.error("[ERROR] Event failed:", name);
console.error(error);

}

console.log("--------------------------------------------------");

};


/* ---------------- PAGE VIEW EVENT ---------------- */

window.sendPageViewEvent = function(){

console.log("[DEBUG] Triggering Page View Event");

sendEvent(
    "Page View",
    "webPageView",
    {
        pageUrl: window.location.href,
        pageTitle: document.title
    }
);

};

sendPageViewEvent();


/* ---------------- PRODUCT VIEW ---------------- */

window.sendProductViewEvent = function(product){

console.log("[DEBUG] Product View Triggered:", product);

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


/* ---------------- ADD TO CART ---------------- */

window.sendAddToCartEvent = function(product){

console.log("[DEBUG] Add To Cart Triggered:", product);

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
            price:product.price,
            imageUrl:product.image
        }
    }
);

};


/* ---------------- VIEW CART ---------------- */

window.sendViewCartEvent = function(cart){

console.log("[DEBUG] View Cart Triggered:", cart);

sendEvent(
    "View Cart",
    "cartView",
    {
        cartItems: cart.length
    }
);

};


/* ---------------- QUANTITY CHANGE ---------------- */

window.sendQuantityChangeEvent = function(product, qty){

console.log("[DEBUG] Cart Quantity Change:", product, "New Qty:", qty);

sendEvent(
    "Cart Quantity Change",
    "cartUpdate",
    {
        productName:product.name,
        quantity:qty
    }
);

};


/* ---------------- REMOVE ITEM ---------------- */

window.sendRemoveItemEvent = function(product){

console.log("[DEBUG] Remove From Cart:", product);

sendEvent(
    "Remove From Cart",
    "cartRemove",
    {
        productName:product.name
    }
);

};


/* ---------------- CHECKOUT ---------------- */

window.sendCheckoutEvent = function(cartTotal){

console.log("[DEBUG] Checkout Started. Cart Value:", cartTotal);

sendEvent(
    "Checkout Start",
    "cartCheckout",
    {
        cartValue:cartTotal
    }
);

};


/* ---------------- PURCHASE ---------------- */

window.sendPurchaseEvent = function(order){

console.log("[DEBUG] Purchase Triggered:", order);

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


/* ---------------- ABANDONED CART ---------------- */

window.addEventListener("beforeunload", function(){

let cart = JSON.parse(localStorage.getItem("cart")) || [];

console.log("[DEBUG] Page Unload Triggered. Cart:", cart);

if(cart.length > 0){

console.log("[DEBUG] Abandoned Cart Event Triggered");

sendEvent(
    "Abandoned Cart",
    "cartAbandon",
    {
        cartSize: cart.length
    }
);

}

});

});
});

document.addEventListener("DOMContentLoaded", function () {

if (typeof SalesforceInteractions === "undefined") {
    console.error("SalesforceInteractions SDK not loaded");
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
}

if (!sessionId) {
    sessionId = "session-" + Date.now();
    sessionStorage.setItem("sessionId", sessionId);
}

/* ---------------- INIT SDK ---------------- */

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

console.log("Salesforce Interactions Web SDK initialized successfully");

/* ---------------- UPDATE CONSENT ---------------- */

SalesforceInteractions.updateConsents([
    {
        status: SalesforceInteractions.ConsentStatus.OptIn,
        purpose: SalesforceInteractions.ConsentPurpose.Tracking,
        provider: "Website"
    }
]).then(()=>{
    console.log("Consent updated successfully");
});


/* ---------------- GLOBAL EVENT FUNCTION ---------------- */

window.sendEvent = function(name,type,attributes,catalog){

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

        sourceUrl:window.location.href,
        sourceUrlReferrer:document.referrer,

        dateTime:new Date().toISOString()

    };

    if(catalog){
        eventPayload.catalogObject = catalog;
    }

    SalesforceInteractions.sendEvent(eventPayload);

    console.log("Event Sent:",name);
};


/* ---------------- PAGE VIEW ---------------- */

window.sendPageViewEvent = function(){

    sendEvent(
        "Page View",
        "webPageView",
        {
            pageUrl:window.location.href,
            pageTitle:document.title
        }
    );

};

sendPageViewEvent();


/* ---------------- PRODUCT VIEW ---------------- */

window.sendProductViewEvent = function(product){

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

sendEvent(
    "View Cart",
    "cartView",
    {
        cartItems:cart.length
    }
);

};


/* ---------------- QUANTITY CHANGE ---------------- */

window.sendQuantityChangeEvent = function(product,qty){

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

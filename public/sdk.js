SalesforceInteractions.init({
    cookieDomain: "sudiptanandan23.github.io",
    consents: [
        {
            status: SalesforceInteractions.ConsentStatus.OptIn,
            purpose: SalesforceInteractions.ConsentPurpose.Tracking,
            provider: "Test Provider"
        }
    ]
}).then(() => {
    console.log("Salesforce Interactions Web SDK initialized successfully");

    // ---------------- UPDATE CONSENT ----------------
    SalesforceInteractions.updateConsents([
        {
            status: SalesforceInteractions.ConsentStatus.OptIn,
            purpose: SalesforceInteractions.ConsentPurpose.Tracking,
            provider: "Test Provider"
        }
    ]).then(() => {
        console.log("Consent updated successfully");

        // ---------------- AUTO PAGE VIEW ON LOAD ----------------
        window.sendPageViewEvent();
    });

    // ---------------- PAGE VIEW EVENT ----------------
    window.sendPageViewEvent = function () {
        SalesforceInteractions.sendEvent({
            interaction: { name: "PageView" },
            user: { identities: { email: JSON.parse(localStorage.getItem("user"))?.email || "guest" } },
            attributes: { pageUrl: window.location.href, pageTitle: document.title }
        });
        console.log("PageView event sent");
    };

    // ---------------- PRODUCT VIEW EVENT ----------------
    window.sendProductViewEvent = function (product) {
        SalesforceInteractions.sendEvent({
            interaction: { name: "ProductView" },
            user: { identities: { email: JSON.parse(localStorage.getItem("user"))?.email || "guest" } },
            catalogObject: {
                type: "Product",
                id: product.id,
                attributes: { name: product.name, price: product.price, imageUrl: product.image }
            }
        });
        console.log("ProductView event sent", product);
    };

    // ---------------- ADD TO CART EVENT ----------------
    window.sendAddToCartEvent = function (product) {
        SalesforceInteractions.sendEvent({
            interaction: { name: "AddToCart" },
            user: { identities: { email: JSON.parse(localStorage.getItem("user"))?.email || "guest" } },
            catalogObject: {
                type: "Product",
                id: product.id,
                attributes: { name: product.name, price: product.price, imageUrl: product.image }
            }
        });
        console.log("AddToCart event sent", product);
    };

    // ---------------- VIEW CART EVENT ----------------
    window.sendViewCartEvent = function (cartSize) {
        SalesforceInteractions.sendEvent({
            interaction: { name: "ViewCart" },
            user: { identities: { email: JSON.parse(localStorage.getItem("user"))?.email || "guest" } },
            attributes: { cartItems: cartSize }
        });
        console.log("ViewCart event sent");
    };

    // ---------------- CHECKOUT EVENT ----------------
    window.sendCheckoutEvent = function () {
        SalesforceInteractions.sendEvent({
            interaction: { name: "CheckoutStart" },
            user: { identities: { email: JSON.parse(localStorage.getItem("user"))?.email || "guest" } }
        });
        console.log("CheckoutStart event sent");
    };

    // ---------------- PURCHASE EVENT ----------------
    window.sendPurchaseEvent = function (orderTotal) {
        SalesforceInteractions.sendEvent({
            interaction: { name: "Purchase" },
            user: { identities: { email: JSON.parse(localStorage.getItem("user"))?.email || "guest" } },
            attributes: { orderValue: orderTotal }
        });
        console.log("Purchase event sent");
    };

    // ---------------- ABANDONED CART EVENT ----------------
    window.sendAbandonedCartEvent = function (cartSize) {
        SalesforceInteractions.sendEvent({
            interaction: { name: "AbandonedCart" },
            user: { identities: { email: JSON.parse(localStorage.getItem("user"))?.email || "guest" } },
            attributes: { cartItems: cartSize }
        });
        console.log("AbandonedCart event sent");
    };

});

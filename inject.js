
(function () {
    // Save original methods
    const originalOpen = XMLHttpRequest.prototype.open;
    const originalSend = XMLHttpRequest.prototype.send;

    // Hook into the 'open' method
    XMLHttpRequest.prototype.open = function (method, url, async, user, password) {
        // Log the intercepted arguments
        // console.log("XHR Open Method Called");
        // console.log("Method:", method);
        // console.log("URL:", url);
        // console.log("Async:", async);
        // console.log("User:", user);
        // console.log("Password:", password);

        // Save URL for later use
        this._method = method;
        this._url = url;   // //since I wont get the URL here I am capturing it in the open and sending it here 
        this._async = async;
        this._user = user;  
        this._password = password;

        // Call the original open method
        return originalOpen.apply(this, arguments);
    };

    // Hook into the 'send' method
    XMLHttpRequest.prototype.send = function (body) {
        // // Log the intercepted body
        // console.log("XHR Send Method Called");
        // console.log("Body:", body);

        // Save body for later use
        this._body = body;

        this.addEventListener('load', function () {
            // Log the captured response details
            // console.log("XHR Completed:");
            // console.log("URL:", this._url);
            // console.log("Method:", this._method);
            // console.log("Response Status:", this.status);
            // console.log("Response Text:", this.responseText);
            // console.log("Body :", this._body); //same body printed above
            // Dispatch a custom event with the data
            const data = {
                url: this._url,
                // method: this._method,
                status: this.status,
                response: this.responseText,
                // body: this._body,
            };
            window.dispatchEvent(new CustomEvent('xhrDataFetched', { detail: data }));
        });

        // Call the original send method
        return originalSend.apply(this, arguments);
    };
})();

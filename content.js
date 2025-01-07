// Function to inject the CSS into the document
function injectCSS() {
    // Create a link element for the CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = chrome.runtime.getURL('style.css'); // Get the correct path to style.css
    // console.log("Link for css", link);
    // Append the link to the head of the document
    document.head.appendChild(link);
}

// Call the function to inject the CSS
injectCSS();

//This add the inject script in the Header of the maang.in's code so That I can get the access
function injectScript() {
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL('inject.js');
    script.onload = function () {
        this.remove(); // Clean up after injection
    };
    document.head.appendChild(script);
}

// Inject the script - add in the every page because if we are moving from non-Problem page to project page before this inject file geeting added to the Header -> xhr fetch call starts so we cannot intercept and take the data
injectScript();

let problemDataMap = new Map();
window.addEventListener('xhrDataFetched', (event) => {
    const data = event.detail;
    // console.log("Fetched data from xhrDataFetched in content.js", data.url, "-->>" , data.response);

    // Check for problem-related API endpoint
    if (data.url && data.url.match(/https:\/\/api2\.maang\.in\/problems\/user\/\d+/)) {
        const idMatch = data.url.match(/\/(\d+)$/); // Extract problem ID
        if (idMatch) {
            const id = idMatch[1];
            problemDataMap.set(id, data.response); // Store response data by ID
            // console.log(`Stored data for problem ID ${id}:`, data.response);
        }
    }

    // Check for user profile API endpoint -> I am not getting this data because before hooking the user data is getting loaded at start of maang.in then only I am injecting the script or CROS error also I am getting so better to load the whole local storgae and get the code you typed 
    // if (data.url && data.url.match(/https:\/\/api2\.maang\.in\/users\/profile\/private/)) {
    //     console.log(`Getting the Private data of the user?`);
    //     try {
    //         const responseData = JSON.parse(data.response); // Parse JSON response
    //         if (responseData.code === 200 && responseData.data && responseData.data.id) {
    //             const userId = responseData.data.id; // Extract the user ID
    //             console.log(`****************************************************`);
    //             console.log(`Fetched user ID: ${userId}`);
    //             console.log(`****************************************************`);
                
    //             // Save the userId globally or use it in your map
    //             window.userId = userId; // Optionally save it globally
    //         }
    //     } catch (error) {
    //         console.error("Error parsing user profile response:", error);
    //     }
    // }
});



function getCurrentProblemId() {
    const idMatch = window.location.pathname.match(/-(\d+)$/);
    return idMatch ? idMatch[1] : null;
}

 function getProblemDataById(id) {
    if (id && problemDataMap.has(id)) {
        return problemDataMap.get(id);
    }

    console.log(`No data found for problem ID ${id}`);
    return null;
}

async function waitForProblemData(id, retries = 10, delay = 500) {
    for (let i = 0; i < retries; i++) {
        if (problemDataMap.has(id)) {
            return problemDataMap.get(id);
        }
        console.log(`Retry ${i + 1}: Waiting for problem data for ID ${id}`);
        await new Promise((resolve) => setTimeout(resolve, delay)); // Wait for a specified time
    }

    console.error(`Data for problem ID ${id} not found after ${retries} retries.`);
    return null;
}

function logProblemDataMap() {
    console.log('URL -> Response Map:');
    problemDataMap.forEach((value , key) => { //forEach((value, key) works because in JavaScript Map objects use the convention of the first argument being the value and the second argument being the key.
        console.log(`Key : : ${key}`);
        console.log(`Problem Data : ${value}`);
    });
}

function getLocalStorageValueById(id) {
    //For loaded my local code - what I coded
    // Step 1: Load all keys in local storage -> Object.keys will load in the Form of array
    const keys = Object.keys(localStorage);

    // Step 2: Define a pattern to match keys like "course_<userid>_<id>_C++14"
    const pattern = new RegExp(`^course_\\d+_${id}_C\\+\\+14$`);

    // Step 3: Iterate through all keys to find a match
    for (const key of keys) {
        // console.log("Testing what is the key" ,key);
        if (pattern.test(key)) {
            const value = localStorage.getItem(key);

            // console.log(`Value for matched key "${key}":`, value);
            return { key, value }; // Return the matching key and value
        }
    }

    // If no matching key is found
    console.log(`No matching key found in localStorage for id ${id}.`);
    return null;
}




// to Handle SPA we can use setInterval and Mutation Observer (this is the best)... Can try with setInterval also but need to handle many cases like it will take more time to load some pages so if we set a fixed time it won't work i.e., button would have appeared first but the page wouldn't get loaded by that time
// using Mutation Observer
let lastVistedPage = "";
let chathistory =[];
let id;
let observer = new MutationObserver(() => {
    CheckPagechange();
});
observer.observe(document.body, { childList: true, subtree: true }); // it accepts only 2 arguments, so providing the second argument as an object
CheckPagechange(); // for initial load or setting the lastVistedPage value to the website

function CheckPagechange() {
    if (isPageChange()|| isLeftColumnChange()) {
        handlePageChange();
    }
}

function isPageChange() {
    let currentPage = window.location.pathname;
    if (lastVistedPage === currentPage) return false;
    lastVistedPage = currentPage;
    return true;
}
let lastColumnContent = 0; //Handled it with bool flag 
function isLeftColumnChange() {
    let leftColumn = document.getElementsByClassName("py-4 px-3 coding_desc_container__gdB9M")[0]; // Adjust the selector to target the column
    if (!leftColumn) {
        lastColumnContent = 0; // Reset if the column doesn't exist
        cleanUp();
        console.log("It will return False I went to Hint/submission");
        return false;
    }

    if (lastColumnContent === 1){
        console.log("It will return False to I am in the same Problem Description");
        return false; // No change in content
    } 

    lastColumnContent = 1; // Update the stored content
    console.log("It will return true to trigger page change")
    return true;
}

function handlePageChange() {
    if (onTargetPage()) {
        cleanUp();
        // injectScript();- add it in every page so only on first load or from course -> problem you will get the data
        addAIHelpButton();


        id = getCurrentProblemId();
        console.log(`The current problem id is ${id}`);
        //If I want to access this_problem_data or this_problem_local_code then I need async because When this executes it wont be avalaible but On CLicking Send Button I dont need async because pakka...I would have store my the time I am clicking the AI-HElp button because the page wouldhave got loaded
        // (async () => {
        //     //If I put the same function / call waitForProblemData in while sending the data it will be there in the Map at the time of loading so I don't want to use these async and all those circus... For sure it will be there when I do and click the AI help buttton and it will come in handy only at the first message.
        //     const this_problem_data = await waitForProblemData(id);
        //     if (this_problem_data) {
        //         console.log(`Fetched data for problem ID ${id}:`, this_problem_data);
        //     }
        //     //I need to have the logic of this_problem_data only inside this async otherwise this_problem_data will not be avaliable
        //     logProblemDataMap();
        // })();
        
        // // const   this_problem_data =  waitForProblemData(id);
        // // console.log(`The current problem id is ${this_problem_data}`);
        // const this_problem_local_code = getLocalStorageValueById(id);
        // // console.log(`The current problem id is ${this_problem_local_code}`);
    }
}

function onTargetPage() {
    const pathname = window.location.pathname; // this leaves the hostname and gives from /problems/... only
    return pathname.startsWith("/problems/") && pathname.length > "/problems/".length;
}

function cleanUp() {
    const aiHelpButton = document.getElementById('ai-help-button');
    const chatContainer = document.getElementById('chat-container');
    if (aiHelpButton) aiHelpButton.remove();
    if (chatContainer) chatContainer.remove();
}

function addAIHelpButton() {
    const aiHelpButton = document.createElement('button');
    aiHelpButton.id = 'ai-help-button';
    aiHelpButton.textContent = 'AI Help';

    // Apply AI button styles using classList
    aiHelpButton.classList.add('ai-help-button');

    const where_to_add_button = document.getElementsByClassName("py-4 px-3 coding_desc_container__gdB9M")[0];
    where_to_add_button.insertAdjacentElement("beforeend", aiHelpButton);

    aiHelpButton.addEventListener('click', function () {
        const existingChatBox = document.getElementById('chat-container');
        //adding on Click AI-help It need to scroll to the exsiting chatbox and for new chatbox also
        // if (existingChatBox) {
        //     addChatBox();
        // }

        //This is working Good as I expected 
        if (existingChatBox) {
            // because of -> ****deletes the coding_nav_bg__HRkIn p-2 nav nav-pills w-100  on scrolling*****
            // Scroll to the end of the chatbox - Can add `back to bottom button` or can comment out also 
            // const chatHistory = existingChatBox.querySelector('.chat-history');
            // if (chatHistory) {
            //     chatHistory.scrollTop = chatHistory.scrollHeight; // Scroll to the bottom of chat history
            // }
    
            // Smoothly bring the chatbox into view without scrolling the entire page -> deletes the coding_nav_bg__HRkIn p-2 nav nav-pills w-100  on scrolling
            // existingChatBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } else {
            // Create a new chatbox if it doesn't exist
            addChatBox();
    
            // Scroll to the new chatbox after a slight delay to ensure it's rendered so I can comment the whole thing itself 
            // setTimeout(() => {
            //     const newChatBox = document.getElementById('chat-container');
            //     if (newChatBox) {
            //         // newChatBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); ->-> deletes the coding_nav_bg__HRkIn p-2 nav nav-pills w-100  on scrolling
    
            //         const chatHistory = newChatBox.querySelector('.chat-history');
            //         if (chatHistory) {
            //             chatHistory.scrollTop = chatHistory.scrollHeight; // Scroll to the bottom of chat history
            //         }
            //     }
            // }, 100); // Small delay to ensure the chatbox is added
        }
    });
}

function addChatBox() {
    const chatContainer = document.createElement('div');
    chatContainer.id = 'chat-container';
    chatContainer.classList.add('chat-container');

    const chatHistory = document.createElement('div');
    chatHistory.id = 'chat-history';
    chatHistory.classList.add('chat-history');
    chatContainer.appendChild(chatHistory);

    const inputContainer = document.createElement('div');
    inputContainer.classList.add('input-container');
    chatContainer.appendChild(inputContainer);

    const chatInput = document.createElement('textarea');
    chatInput.id = 'chat-input';
    chatInput.placeholder = 'Type a message...';
    chatInput.classList.add('chat-input');
    inputContainer.appendChild(chatInput);

    const sendButton = document.createElement('button');
    sendButton.textContent = 'Send';
    sendButton.classList.add('send-button');
    inputContainer.appendChild(sendButton);

    sendButton.addEventListener('click', sendMessage); //I shouldnot use sendMessage() this calls the function during the setup of the event listener itself so this is like I have define the function below so take it as a reference only on click of this button I will call that time 
    chatInput.addEventListener('keydown', handleKeyDown); //so dont use () in Event Listners
    //I am adding this for good looking and to see the input text properly
    chatInput.addEventListener('input', autoResizeInput);

    const where_to_add_chatContainer = document.getElementsByClassName("py-4 px-3 coding_desc_container__gdB9M")[0];
    where_to_add_chatContainer.insertAdjacentElement("beforeend", chatContainer);
    
    async function sendMessage() {
        const message = chatInput.value.trim();
        if (message) {
            // Add user message to history
            addMessageToHistory(message, 'right');
            chatInput.value = ''; 
            chatInput.style.height = 'auto'; // Reset height after sending the message

           // Get the chatHistory container where the response goes
        const chatHistory = document.getElementById('chat-history');

        // Create the typing indicator element dynamically
        const typingIndicator = document.createElement('div');
        typingIndicator.className = 'typing-indicator'; // Styling class for typing animation
        typingIndicator.textContent = '⏳ Typing...'; // You can use any emoji for the typing animation

        // Append the typing indicator to the chatHistory (left side where responses go)
        chatHistory.appendChild(typingIndicator);

        // Display the typing indicator
        typingIndicator.style.display = 'inline-block';

        
    
            try {
                // Prepare the request payload for LLM API
                let Prompt = buildPrompt(chathistory,message);
                const requestData = {
                    contents: Prompt
                    //This is for old one way text instead of the below array given the Full Chat history array
                    // [{
                    //     parts: [{
                    //         text: `${message}`
                    //     }]
                    // }]
                };

                console.log("what is going as a input to GEMNI = " ,requestData)
                const GEMINI_API_KEY = 'Paste you API key';

                // Make the API request to Gemini
                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(requestData)
                });
    
                // Check for successful response
                if (response.ok) {
                    const data = await response.json();
    
                    // Extract the text from the API response
                    const replyText = data.candidates[0].content.parts[0].text;
                    // Remove the typing indicator and add the model's response to chat history (on the left side)
                    typingIndicator.style.display = 'none'; // Hide typing indicator
                    // Add the model's response to chat history
                    addMessageToHistory(replyText, 'left');
                    chathistory.push(
                        {
                        "role":"Model",
                        "parts":[{
                            "text":replyText}]
                        }
                        );
                } else {
                    console.error('Error in API response:', response.statusText);
                    // Remove the typing indicator and add the model's response to chat history (on the left side)
                    typingIndicator.style.display = 'none'; // Hide typing indicator
                    addMessageToHistory("Sorry, there was an error processing your request.", 'left');
                }
            } catch (error) {
                console.error('Error making the request:', error);
                // Remove the typing indicator and add the model's response to chat history (on the left side)
                typingIndicator.style.display = 'none'; // Hide typing indicator
                addMessageToHistory("Sorry, there was an error processing your request.", 'left');
            }
            finally {
                // Remove the typing indicator after the response
                typingIndicator.style.display = 'none';
            }
        }
    }

    



    function handleKeyDown(event) {
        if (event.key === 'Enter') {
            if (event.shiftKey) {
                // Allow multi-line input on Shift + Enter
                chatInput.style.height = 'auto'; // Reset height
                chatInput.style.height = chatInput.scrollHeight + 'px'; // Grow textarea
            } else {
                event.preventDefault(); // Prevent Enter from adding a newline
                sendMessage(); // Send the message
            }
        }
    }

    function addMessageToHistory(message, side) {
        const messageContainer = document.createElement('div');
        messageContainer.classList.add('message-container', `${side}-message`);

        const messageBubble = document.createElement('div');
        messageBubble.classList.add('message-bubble');
        messageBubble.textContent = message;
        messageContainer.appendChild(messageBubble);

        chatHistory.appendChild(messageContainer);
        chatHistory.scrollTop = chatHistory.scrollHeight;
    }
    // Function to auto resize chat input as the user types
    function autoResizeInput() {
        // Reset height to auto to shrink if needed
        chatInput.style.height = 'auto';

        // If the content exceeds max height, limit the height and allow scrolling
        const maxHeight = 90; // Maximum height for the input
        if (chatInput.scrollHeight > maxHeight) {
            chatInput.style.height = `${maxHeight}px`;
        }  
        else {
            // Otherwise, adjust the height according to the scrollHeight
            chatInput.style.height = `${chatInput.scrollHeight}px`;
        }
    }
    

    // Initial resize in case there's already content in the input
    autoResizeInput();
}



function buildPrompt(chathistory, usermessage){
    // let this_problem_data;
    if (chathistory.length === 0) {
        const   this_problem_data =  getProblemDataById(id);
        const this_problem_local_code = getLocalStorageValueById(id);
        chathistory.push({"role":"user",
            "parts":[{
              "text": JSON.stringify(this_problem_data),
            //   "label": "Problem Description" -> this gives error 
            }]
        });
        chathistory.push({"role":"user",
            "parts":[{
              "text": JSON.stringify(this_problem_local_code),
            //   "label": "My Code - need to debug this " -> this gives error in replying LLM is not understanding
            }]
        });
    }
    chathistory.push({"role":"user",
        "parts":[{
            "text":usermessage}]});

    console.log("This is the input to the model", chathistory );
    return chathistory;
    
    
}

// Function to inject the CSS into the document
function injectCSS() {
    // Create a link element for the CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = chrome.runtime.getURL('style.css'); // Get the correct path to style.css
    console.log("Link for css", link);
    // Append the link to the head of the document
    document.head.appendChild(link);
}

// Call the function to inject the CSS
injectCSS();

// to Handle SPA we can use setInterval and Mutation Observer (this is the best)... Can try with setInterval also but need to handle many cases like it will take more time to load some pages so if we set a fixed time it won't work i.e., button would have appeared first but the page wouldn't get loaded by that time
// using Mutation Observer
let lastVistedPage = "";
let observer = new MutationObserver(() => {
    CheckPagechange();
});
observer.observe(document.body, { childList: true, subtree: true }); // it accepts only 2 arguments, so providing the second argument as an object
CheckPagechange(); // for initial load or setting the lastVistedPage value to the website

function CheckPagechange() {
    if (isPageChange()) {
        handlePageChange();
    }
}

function isPageChange() {
    let currentPage = window.location.pathname;
    if (lastVistedPage === currentPage) return false;
    lastVistedPage = currentPage;
    return true;
}

function handlePageChange() {
    if (onTargetPage()) {
        cleanUp();
        addAIHelpButton();
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
            // Scroll to the end of the chatbox - Can add `back to bottom button` or can comment out also 
            const chatHistory = existingChatBox.querySelector('.chat-history');
            if (chatHistory) {
                chatHistory.scrollTop = chatHistory.scrollHeight; // Scroll to the bottom of chat history
            }
    
            // Smoothly bring the chatbox into view without scrolling the entire page
            existingChatBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } else {
            // Create a new chatbox if it doesn't exist
            addChatBox();
    
            // Scroll to the new chatbox after a slight delay to ensure it's rendered
            setTimeout(() => {
                const newChatBox = document.getElementById('chat-container');
                if (newChatBox) {
                    newChatBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    
                    const chatHistory = newChatBox.querySelector('.chat-history');
                    if (chatHistory) {
                        chatHistory.scrollTop = chatHistory.scrollHeight; // Scroll to the bottom of chat history
                    }
                }
            }, 100); // Small delay to ensure the chatbox is added
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
    where_to_add_chatContainer.insertAdjacentElement("afterend", chatContainer);

    // function sendMessage() {
    //     const message = chatInput.value.trim();
    //     if (message) {
    //         addMessageToHistory(message, 'right');
    //         chatInput.value = ''; 
    //         chatInput.style.height = 'auto'; // Reset height after sending the message

    //         setTimeout(() => {
    //             addMessageToHistory('This is a simulated response.', 'left');
    //         }, 1000);
    //     }
    // }


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
                const requestData = {
                    contents: [{
                        parts: [{
                            text: `${message}`
                        }]
                    }]
                };


                const GEMINI_API_KEY = 'add your api key here';

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

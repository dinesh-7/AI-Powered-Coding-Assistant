//to Handle SPA we can use setInterval and Mutation Observer(thisis the best)... Can try with setInterval also but need to handle manycases like it will more time to load some page so if we set a fixed time it wont work i.e button would have came first but the page wouldn't get loaded by that time 
//using Mutation Observer
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
    // Clean up the AI Help button and chatbox if they exist
    const aiHelpButton = document.getElementById('ai-help-button');
    const chatContainer = document.getElementById('chat-container');
    if (aiHelpButton) aiHelpButton.remove();
    if (chatContainer) chatContainer.remove();
}

function addAIHelpButton() {
    // Create the AI Help button element
    const aiHelpButton = document.createElement('button');
    aiHelpButton.id = 'ai-help-button';
    aiHelpButton.textContent = 'AI Help';
    aiHelpButton.style.backgroundColor = '#1E90FF'; // DodgerBlue
    aiHelpButton.style.color = '#FFFFFF'; // White
    aiHelpButton.style.border = 'none';
    aiHelpButton.style.borderRadius = '5px';
    aiHelpButton.style.padding = '10px 20px';
    aiHelpButton.style.fontSize = '16px';
    aiHelpButton.style.cursor = 'pointer';
    aiHelpButton.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
    aiHelpButton.style.transition = 'background-color 0.3s ease';

    aiHelpButton.onmouseover = function () {
        aiHelpButton.style.backgroundColor = '#1374d4'; // Slightly darker blue
    };
    aiHelpButton.onmouseout = function () {
        aiHelpButton.style.backgroundColor = '#1E90FF'; // Original color
    };

    // Add the AI Help button just before this container ends
    const where_to_add_button = document.getElementsByClassName("py-4 px-3 coding_desc_container__gdB9M")[0];
    where_to_add_button.insertAdjacentElement("beforeend", aiHelpButton);

    aiHelpButton.addEventListener('click', function () {
        alert('AI Help Button Clicked! Future chatbox integration will go here.');
        addChatBox();
    });
}

function addChatBox() {
    // Create the chat container
    const chatContainer = document.createElement('div');
    chatContainer.id = 'chat-container';
    chatContainer.style.width = '100%';
    chatContainer.style.maxWidth = '600px';
    chatContainer.style.margin = '20px auto';
    chatContainer.style.backgroundColor = '#f1f1f1';
    chatContainer.style.borderRadius = '10px';
    chatContainer.style.padding = '10px';
    chatContainer.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
    chatContainer.style.display = 'flex';
    chatContainer.style.flexDirection = 'column';
    chatContainer.style.height = '400px';

    // Create the chat history container
    const chatHistory = document.createElement('div');
    chatHistory.id = 'chat-history';
    chatHistory.style.flex = '1';
    chatHistory.style.overflowY = 'scroll';
    chatHistory.style.padding = '10px';
    chatHistory.style.borderBottom = '2px solid #ddd';
    chatContainer.appendChild(chatHistory);

    // Create the input container
    const inputContainer = document.createElement('div');
    inputContainer.style.display = 'flex';
    inputContainer.style.padding = '10px';
    inputContainer.style.borderTop = '2px solid #ddd';
    chatContainer.appendChild(inputContainer);

    // Create the text input field
    const chatInput = document.createElement('input');
    chatInput.id = 'chat-input';
    chatInput.type = 'text';
    chatInput.placeholder = 'Type a message...';
    chatInput.style.flex = '1';
    chatInput.style.padding = '10px';
    chatInput.style.borderRadius = '5px';
    chatInput.style.border = '1px solid #ddd';
    chatInput.style.fontSize = '14px';
    inputContainer.appendChild(chatInput);

    // Create the send button
    const sendButton = document.createElement('button');
    sendButton.textContent = 'Send';
    sendButton.style.backgroundColor = '#1E90FF'; // Same as AI Help button
    sendButton.style.color = '#FFFFFF';
    sendButton.style.border = 'none';
    sendButton.style.borderRadius = '5px';
    sendButton.style.padding = '10px';
    sendButton.style.fontSize = '14px';
    sendButton.style.marginLeft = '10px';
    sendButton.style.cursor = 'pointer';
    inputContainer.appendChild(sendButton);

    sendButton.addEventListener('click', sendMessage);

    // Append the chat container after the AI Help button
    const where_to_add_button = document.getElementsByClassName("py-4 px-3 coding_desc_container__gdB9M")[0];
    where_to_add_button.insertAdjacentElement("afterend", chatContainer);

    // Function to send the message
    function sendMessage() {
        const message = chatInput.value.trim();
        if (message) {
            addMessageToHistory(message, 'right');
            chatInput.value = ''; // Clear the input field

            // You can send the message to an API here
            // For now, let's simulate the response
            setTimeout(() => {
                addMessageToHistory('This is a simulated response.', 'left');
            }, 1000);
        }
    }

    // Function to add message to the chat history
    function addMessageToHistory(message, side) {
        const messageContainer = document.createElement('div');
        messageContainer.style.display = 'flex';
        messageContainer.style.justifyContent = side === 'right' ? 'flex-end' : 'flex-start';
        messageContainer.style.marginBottom = '10px';

        const messageBubble = document.createElement('div');
        messageBubble.style.backgroundColor = side === 'right' ? '#1E90FF' : '#ddd';
        messageBubble.style.color = side === 'right' ? '#fff' : '#000';
        messageBubble.style.padding = '10px';
        messageBubble.style.borderRadius = '15px';
        messageBubble.style.maxWidth = '70%';
        messageBubble.style.wordWrap = 'break-word';
        messageBubble.textContent = message;
        messageContainer.appendChild(messageBubble);

        chatHistory.appendChild(messageContainer);
        chatHistory.scrollTop = chatHistory.scrollHeight; // Scroll to the bottom
    }
}

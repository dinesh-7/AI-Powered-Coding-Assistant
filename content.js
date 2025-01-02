//to Handle SPA we can use setInterval and Mutation Observer(thisis the best)... Can try with setInterval also but need to handle manycases like it will more time to load some page so if we set a fixed time it wont work i.e button would have came first but the page wouldn't get loaded by that time 
//using Mutation Observer
let lastVistedPage = "";
let observer = new MutationObserver(()=>{
    CheckPagechange();
});
observer.observe(document.body, {childList:true , subtree:true} ); //It accepts only 2 argument so giving 2nd argument as a object
CheckPagechange(); // for intial load or setting the lastVistedPage value to the website

function CheckPagechange(){
    if(isPageChange()){
        handlePageChange();
    }
}
function isPageChange(){
    let currentPage = window.location.pathname;
    if(lastVistedPage === currentPage) return false;
    lastVistedPage = currentPage;
    return true;
}
function handlePageChange(){
    if(onTargetPage()){
        cleanUp();
        addAIHelpButton();
    }  
}

function onTargetPage(){
    const pathname = window.location.pathname; // this leaves the hostname and gives from /problems/... only 
    return pathname.startsWith("/problems/") && pathname.length > "/problems/".length;
}

function cleanUp(){
    //I need to clean up the button and chat and everything otherwise it will go for other page so always load after cleaup 
    const aiHelpButton = document.getElementById('ai-help-button'); //or if there was no AI Help button also I need to detect and cleanup only it is there
    if(aiHelpButton){
        aiHelpButton.remove();
    }
}




function addAIHelpButton(){
    // Create the button element
    const aiHelpButton = document.createElement('button');

    // Add an ID to the button for styling and identification
    aiHelpButton.id = 'ai-help-button';

    // Set the button's text
    aiHelpButton.textContent = 'AI Help';

    // Style the button directly using inline styles (or apply a class instead)
    aiHelpButton.style.backgroundColor = '#1E90FF'; // DodgerBlue
    aiHelpButton.style.color = '#FFFFFF'; // White
    aiHelpButton.style.border = 'none';
    aiHelpButton.style.borderRadius = '5px';
    aiHelpButton.style.padding = '10px 20px';
    aiHelpButton.style.fontSize = '16px';
    aiHelpButton.style.cursor = 'pointer';
    aiHelpButton.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
    aiHelpButton.style.transition = 'background-color 0.3s ease';

    // Add hover effect using JavaScript (optional, can also use CSS for this)
    aiHelpButton.onmouseover = function () {
    aiHelpButton.style.backgroundColor = '#1374d4'; // Slightly darker blue
    };
    aiHelpButton.onmouseout = function () {
    aiHelpButton.style.backgroundColor = '#1E90FF'; // Original color
    };


    // I want to add the button just before this container ends 
    const where_to_add_button = document.getElementsByClassName("py-4 px-3 coding_desc_container__gdB9M")[0]
    // Append the button to the body of the document
    where_to_add_button.insertAdjacentElement("beforeend",aiHelpButton); //this adds the buttton only on page load and it is not supporting for SPA(single Page Application) go for setInterval or Mutation Observer(is the best)

    // Optional: Add a click event listener for future functionality
    aiHelpButton.addEventListener('click', function () {
    alert('AI Help Button Clicked! Future chatbox integration will go here.');
    });
}
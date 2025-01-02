
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

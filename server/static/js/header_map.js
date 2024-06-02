
var header = document.createElement('header');

// Apply styles to header
header.className = 'header';

// Create images container
var imagesContainer = document.createElement('div');
imagesContainer.className = 'images-container';

// Create first image element
var img1 = document.createElement('img');
img1.src = 'static/img/title.png';

// Create second image element
var img2 = document.createElement('img');
img2.src = 'static/img/title2.png';

// Append images to images container
imagesContainer.appendChild(img1);
imagesContainer.appendChild(img2);

// Create buttons container
var buttonsContainer = document.createElement('div');
buttonsContainer.className = 'buttons-container';

// Append images container and buttons container to header
header.appendChild(imagesContainer);
header.appendChild(buttonsContainer);

// Append header to body
document.body.appendChild(header);

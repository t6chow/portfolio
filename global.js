console.log('IT’S ALIVE!');

const baseURL = location.hostname === 't6chow.github.io' ? '/portfolio/' : ''; // Adjust 'yourusername'
// FOR GITHUB

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

// const navLinks = $$('nav a');

// const currentLink = navLinks.find(
//   (a) => a.host === location.host && a.pathname === location.pathname
// );

// if (currentLink) {
//   currentLink.classList.add('current');
// }

const ARE_WE_HOME = document.documentElement.classList.contains('home');

// let pages = [
//   { url: '', title: 'Home' },
//   { url: 'projects/index.html', title: 'Projects' },
//   { url: 'contact/index.html', title: 'Contact' },
//   { url: 'resume.html', title: 'Resume' }
// ];

let pages = [
  { url: `${baseURL}/portfolio/`, title: 'Home' },
  { url: `${baseURL}/portfolio/projects/index.html`, title: 'Projects' },
  { url: `${baseURL}/portfolio/contact/index.html`, title: 'Contact' },
  { url: `${baseURL}/portfolio/resume.html`, title: 'Resume' }
];
// FOR GITHUB

// Create the <nav> element
let nav = document.createElement('nav');

// Add the <nav> element at the beginning of the <body>
document.body.prepend(nav);

for (let p of pages) {
  let url = p.url;      // Get the URL of the current page
  let title = p.title;  // Get the title of the current page
  url = !ARE_WE_HOME && !url.startsWith('http') ? '../' + url : url;

  // Create the link and add it to the nav
  // nav.insertAdjacentHTML('beforeend', `<a href="${url}">${title}</a>`);
  let a = document.createElement('a');
  a.href = url;
  a.textContent = title;
  // Add target="_blank" to external links (e.g., GitHub)
  if (url.startsWith('http')) {
    a.target = '_blank';
  }
  
  // Check if it's the current page and add "current" class
  if (url === location.pathname || (url === '' && location.pathname === '/')) {
    a.classList.add('current');
  }
  nav.append(a);
}

document.body.insertAdjacentHTML(
  'afterbegin',
  `
    <label class="color-scheme">
        Theme:
        <select id="theme-switch">
            <option value="light dark" selected>Automatic</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
        </select>
    </label>
  `
);

const select = document.querySelector('#theme-switch');

// Function to set the color scheme
function setColorScheme(value) {
  document.documentElement.style.setProperty('color-scheme', value); // Update the color scheme
  select.value = value; // Update the dropdown to match the current color scheme
}

// Check if there's a saved preference in localStorage and apply it
if ('colorScheme' in localStorage) {
  setColorScheme(localStorage.colorScheme);
} else {
  setColorScheme('light dark'); // Default to "Automatic"
}

// Add functionality to the theme switch
const themeSwitch = document.getElementById('theme-switch');
themeSwitch.addEventListener('change', (event) => {
  const selectedValue = event.target.value; // Get the selected value (light dark, light, dark)
  document.documentElement.style.colorScheme = selectedValue; // Set the color-scheme property
  localStorage.colorScheme = event.target.value
});

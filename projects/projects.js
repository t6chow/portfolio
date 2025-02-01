
// import { fetchJSON, renderProjects } from '../global.js';

// // Fetch the project data from the JSON file
// async function loadProjects() {
//     try {
//         const projects = await fetchJSON('../lib/projects.json'); // Fetch the data from the projects.json file

//         const projectsContainer = document.querySelector('.projects'); // Select the container where projects will be displayed
//         const titleElement = document.querySelector('.projects-title'); // Select the title element

//         // If there are projects, display them
//         if (projects && projects.length > 0) {
//             // Update the title with the number of projects
//             titleElement.textContent = `Projects (${projects.length})`;

//             // Clear any existing content in the container before rendering new content
//             projectsContainer.innerHTML = '';

//             // Render each project using the renderProjects function
//             projects.forEach(project => {
//                 renderProjects(project, projectsContainer, 'h2'); // Render the project with an h2 heading level
//             });
//         } else {
//             // If there are no projects, display a message
//             projectsContainer.innerHTML = '<p>No projects available.</p>';
//         }
//     } catch (error) {
//         console.error('Error loading the projects:', error);
//     }
// }

// // Call the loadProjects function when the page loads
// loadProjects();

// import { fetchJSON, renderProjects } from '../global.js';
// const projects = await fetchJSON('../lib/projects.json');
// const projectsContainer = document.querySelector('.projects');
// console.log(projectsContainer);
// // Ensure the projects container exists
// projectsTitle.textContent = `Projects 5`;
// renderProjects(projects, projectsContainer, 'h2');

import { fetchJSON, renderProjects } from '../global.js';

// Fetch the project data
const projects = await fetchJSON('../lib/projects.json');

// Select the container where the projects will be displayed
const projectsContainer = document.querySelector('.projects');

// Select the projects title element
const projectsTitle = document.querySelector('.projects-title');

// Ensure the projects container and title element exist
if (projectsContainer && projectsTitle) {
  // Update the title with the project count
  projectsTitle.textContent = `${projects.length} Projects`;

  // Render the projects dynamically into the container
  renderProjects(projects, projectsContainer, 'h2');
} else {
  console.error('Could not find the necessary elements.');
}



// import { fetchJSON, renderProjects } from '../global.js';

// // Wait for the page to load
// window.addEventListener('DOMContentLoaded', async () => {
//     const projects = await fetchJSON('../lib/projects.json');
//     const projectsContainer = document.querySelector('.projects');
    
//     // If no projects, add a placeholder message
//     if (projects && projects.length > 0) {
//         renderProjects(projects, projectsContainer, 'h2');
//     } else {
//         projectsContainer.innerHTML = '<p>No projects found.</p>';
//     }
// });
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";
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
// Compute rolled-up data for pie chart
let rolledData = d3.rollups(
  projects,
  (v) => v.length,
  (d) => d.year
);

// Convert rolled-up data into a format usable for the pie chart
let data = rolledData.map(([year, count]) => {
  return { value: count, label: year };
});

// Define sliceGenerator BEFORE arcData
let sliceGenerator = d3.pie().value((d) => d.value);

// Generate the start and end angles for each slice
let arcData = sliceGenerator(data);

// Define arcGenerator
let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);

// Define color scale
let colors = d3.scaleOrdinal(d3.schemeTableau10);

// Append the paths to the SVG element
let svg = d3.select('svg'); // Ensure your SVG element exists in the DOM

arcData.forEach((d, idx) => {
  svg.append('path')
    .attr('d', arcGenerator(d))
    .attr('fill', colors(idx));
});

// Ensure legend exists before appending
let legend = d3.select('.legend');
legend.selectAll('*').remove(); // Clear previous legend entries

data.forEach((d, idx) => {
  legend.append('li')
        .attr('style', `--color:${colors(idx)}`)
        .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`);
});

let query = '';

let searchInput = document.querySelector('.searchBar');

searchInput.addEventListener('input', (event) => {
  query = event.target.value.toLowerCase();

  let filteredProjects = projects.filter((project) => {
    let values = Object.values(project).join('\n').toLowerCase();
    return values.includes(query);
  });

  renderProjects(filteredProjects, projectsContainer, 'h2');
  renderPieChart(filteredProjects);
});


function renderPieChart(projectsGiven) {
  // Clear previous chart and legend
  let newSVG = d3.select('svg'); 
  newSVG.selectAll('path').remove();
  let legend = d3.select('.legend');
  legend.selectAll('*').remove();

  // Recalculate rolled data
  let newRolledData = d3.rollups(
    projectsGiven,
    (v) => v.length,
    (d) => d.year
  );

  // Recalculate data
  let newData = newRolledData.map(([year, count]) => {
    return { value: count, label: year };
  });

  // Recalculate slice generator and arc data
  let newSliceGenerator = d3.pie().value((d) => d.value);
  let newArcData = newSliceGenerator(newData);
  let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
  let colors = d3.scaleOrdinal(d3.schemeTableau10);

  // // Append the paths to the SVG element
  // newArcData.forEach((d, idx) => {
  //   newSVG.append('path')
  //     .attr('d', arcGenerator(d))
  //     .attr('fill', colors(idx))
  //     .attr('class', 'wedge');
  // });

  newArcData.forEach((d, i) => {
    newSVG.append('path')
      .attr('d', arcGenerator(d))
      .attr('fill', colors(i))
      .attr('class', 'wedge')
      .on('click', () => {
        selectedIndex = selectedIndex === i ? -1 : i;
  
        // Update class for selected wedge
        svg.selectAll('path')
          .attr('class', (_, idx) => (idx === selectedIndex ? 'wedge selected' : 'wedge'));
  
        // Update class for selected legend item
        legend.selectAll('li')
          .attr('class', (_, idx) => (idx === selectedIndex ? 'selected' : ''));
      // Filter projects based on selected year or reset if no wedge is selected
      if (selectedIndex !== -1) {
        // Filter projects by year (using the label from newData)
        let selectedYear = newData[selectedIndex].label;
        let filteredProjects = projectsGiven.filter((project) => project.year === selectedYear);

        // Re-render projects and pie chart for the filtered data
        renderProjects(filteredProjects, projectsContainer, 'h2');
        renderPieChart(filteredProjects); // Re-render chart with filtered data
      } else {
        // If no selection, render all projects and pie chart
        renderProjects(projectsGiven, projectsContainer, 'h2');
        renderPieChart(projectsGiven); // Re-render chart with all data
      }
      
        });
  });

  // Update legend
  newData.forEach((d, idx) => {
    legend.append('li')
      .attr('style', `--color:${colors(idx)}`)
      .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`);
  });
}

// Call function on page load
renderPieChart(projects);

let selectedIndex = -1;

// // Call renderProjects function
// function renderProjects(filteredProjects, container, headerTag) {
//   container.innerHTML = '';  // Clear existing content

//   filteredProjects.forEach(project => {
//     let projectElement = document.createElement(headerTag);
//     projectElement.innerText = project.title;
//     container.appendChild(projectElement);
//   });
// }

import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";
let data = [];
let commits = [];
let xScale, yScale;



  async function loadData() {

    data = await d3.csv('loc.csv', (row) => ({
        ...row,
        line: Number(row.line), // or just +row.line
        depth: Number(row.depth),
        length: Number(row.length),
        date: new Date(row.date + 'T00:00' + row.timezone),
        datetime: new Date(row.datetime),
      }));
    //   console.log(data);
    // processCommits();
    // console.log(commits);
    displayStats();
    }

function displayStats() {
    // Process commits first
    processCommits();
    
    // Create the dl element
    const dl = d3.select('#stats').append('dl').attr('class', 'stats');
    
    // Add total LOC
    dl.append('dt').html('Total <abbr title="Lines of code">LOC</abbr>');
    dl.append('dd').text(data.length);
    
    // Add total commits
    dl.append('dt').text('Total commits');
    dl.append('dd').text(commits.length);

    let uniqueFiles = new Set(data.map(d => d.file)).size;
    dl.append('dt').text("# of files in codebase");
    dl.append('dd').text(uniqueFiles);

    let fileDepths = new Map();
    data.forEach(d => {
        fileDepths.set(d.file, d.depth); // Only the latest depth per file is stored
    });
    // Calculate the average depth
    let totalDepth = Array.from(fileDepths.values()).reduce((sum, depth) => sum + depth, 0);
    let avgDepth = fileDepths.size > 0 ? (totalDepth / fileDepths.size).toFixed(2) : 0; // Avoid division by zero
    dl.append('dt').text("Average file depth");
    dl.append('dd').text(avgDepth);
    
    const timeCategories = {
        morning: 0,
        afternoon: 0,
        evening: 0,
        night: 0
    };
    // Categorize commits based on hour
    commits.forEach(commit => {
        let hour = commit.datetime.getHours(); // Get hour from datetime

        if (hour >= 6 && hour < 12) {
            timeCategories.morning++;
        } else if (hour >= 12 && hour < 18) {
            timeCategories.afternoon++;
        } else if (hour >= 18 && hour < 24) {
            timeCategories.evening++;
        } else {
            timeCategories.night++;
        }
    });

    // Find the time period with the highest count
    let mostActiveTime = Object.entries(timeCategories).reduce((a, b) => (a[1] > b[1] ? a : b))[0];


    dl.append('dt').text("Most productive time of dat");
    dl.append('dd').text(mostActiveTime);
    // Add more stats as needed...
    }

function processCommits() {
    commits = d3
      .groups(data, (d) => d.commit)
      .map(([commit, lines]) => {
        let first = lines[0];
        let { author, date, time, timezone, datetime } = first;
        let ret = {
          id: commit,
          url: 'https://github.com/vis-society/lab-7/commit/' + commit,
          author,
          date,
          time,
          timezone,
          datetime,
          hourFrac: datetime.getHours() + datetime.getMinutes() / 60,
          totalLines: lines.length,
        };
  
        Object.defineProperty(ret, 'lines', {
          value: lines,
          enumerable: false,
          writable: false,
          configurable: false,
        });
  
        return ret;
      });
  }



function createScatterplot() {
      // Sort commits by total lines in descending order
    const sortedCommits = d3.sort(commits, (d) => -d.totalLines);
    const width = 1000;
    const height = 600;

    const svg = d3
    .select('#chart')
    .append('svg')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .style('overflow', 'visible');

    xScale = d3
    .scaleTime()
    .domain(d3.extent(commits, (d) => d.datetime))
    .range([0, width])
    .nice();

    yScale = d3
    .scaleLinear()
    .domain([0, 24])
    .range([height, 0]);

    const dots = svg.append('g').attr('class', 'dots');

    const [minLines, maxLines] = d3.extent(commits, (d) => d.totalLines);
    const rScale = d3
    .scaleSqrt() // Change only this line
    .domain([minLines, maxLines])
    .range([2, 30]);

    dots
    .selectAll('circle')
    .data(sortedCommits)
    .join('circle')
    .attr('cx', (d) => xScale(d.datetime))
    .attr('cy', (d) => yScale(d.hourFrac))
    .attr('r', (d) => rScale(d.totalLines))
    .style('fill-opacity', 0.7) // Add transparency for overlapping dots
    .attr('fill', 'steelblue')
    .on('mouseenter', function (event, d) {
        d3.select(event.currentTarget).style('fill-opacity', 1); // Full opacity on hover
        updateTooltipContent(d);
        updateTooltipVisibility(true);
        updateTooltipPosition(event);
      })
      .on('mouseleave', function () {
        d3.select(event.currentTarget).style('fill-opacity', 0.7); // Restore transparency
        updateTooltipContent({});
        updateTooltipVisibility(false);
    });

    // step 2.2
    const margin = { top: 10, right: 10, bottom: 30, left: 20 };

    const usableArea = {
        top: margin.top,
        right: width - margin.right,
        bottom: height - margin.bottom,
        left: margin.left,
        width: width - margin.left - margin.right,
        height: height - margin.top - margin.bottom,
      };
      
      // Update scales with new ranges
      xScale.range([usableArea.left, usableArea.right]);
      yScale.range([usableArea.bottom, usableArea.top]);

      // Create the axes
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale).tickFormat((d) => String(d % 24).padStart(2, '0') + ':00');

    // Add X axis
    svg
    .append('g')
    .attr('transform', `translate(0, ${usableArea.bottom})`)
    .call(xAxis);

    // Add Y axis
    svg
    .append('g')
    .attr('transform', `translate(${usableArea.left}, 0)`)
    .call(yAxis);
        
    // Add gridlines BEFORE the axes
    const gridlines = svg
    .append('g')
    .attr('class', 'gridlines')
    .attr('transform', `translate(${usableArea.left}, 0)`);

    // Create gridlines as an axis with no labels and full-width ticks
    gridlines.call(d3.axisLeft(yScale).tickFormat('').tickSize(-usableArea.width));
}

function updateTooltipContent(commit) {
    if (Object.keys(commit).length === 0) return;
  
    document.getElementById('commit-link').href = commit.url;
    document.getElementById('commit-link').textContent = commit.id;
    document.getElementById('commit-date').textContent = commit.datetime?.toLocaleDateString('en', {
      dateStyle: 'full',
    });
    document.getElementById('commit-time').textContent = commit.datetime?.toLocaleTimeString('en', {
      timeStyle: 'short',
    });
    document.getElementById('commit-author').textContent = commit.author;
    document.getElementById('commit-lines').textContent = commit.totalLines;
  }  

  function updateTooltipVisibility(isVisible) {
    const tooltip = document.getElementById('commit-tooltip');
    tooltip.hidden = !isVisible;
  }

  function updateTooltipPosition(event) {
    const tooltip = document.getElementById('commit-tooltip');
    tooltip.style.left = `${event.clientX}px`;
    tooltip.style.top = `${event.clientY}px`;
  }
  

  let brushSelection = null;


function brushSelector() {
    const svg = document.querySelector('svg');
    console.log(svg);
    d3.select(svg).call(d3.brush().on('start brush end', brushed));
    d3.select(svg).selectAll('.dots, .overlay ~ *').raise();
  }

  function brushed(event) {
    brushSelection = event.selection;
    console.log(brushSelection);
    updateSelection();
    updateSelectionCount();
    updateLanguageBreakdown();
  }

  function isCommitSelected(commit) {
    if (!brushSelection) return false;

    const min = { x: brushSelection[0][0], y: brushSelection[0][1] };
    const max = { x: brushSelection[1][0], y: brushSelection[1][1] };

    const x = xScale(commit.datetime);
    const y = yScale(commit.hourFrac);

    return x >= min.x && x <= max.x && y >= min.y && y <= max.y;
}

function updateSelection() {
    d3.selectAll('circle')
        .classed('selected', (d) => isCommitSelected(d));
}

function updateSelectionCount() {
    const selectedCommits = brushSelection
      ? commits.filter(isCommitSelected)
      : [];
  
    const countElement = document.getElementById('selection-count');
    countElement.textContent = `${
      selectedCommits.length || 'No'
    } commits selected`;
  
    return selectedCommits;
  }

  function updateLanguageBreakdown() {
    const selectedCommits = brushSelection
      ? commits.filter(isCommitSelected)
      : [];
    const container = document.getElementById('language-breakdown');
  
    if (selectedCommits.length === 0) {
      container.innerHTML = '';
      return;
    }
    const requiredCommits = selectedCommits.length ? selectedCommits : commits;
    const lines = requiredCommits.flatMap((d) => d.lines);
  
    // Use d3.rollup to count lines per language
    const breakdown = d3.rollup(
      lines,
      (v) => v.length,
      (d) => d.type
    );
  
    // Update DOM with breakdown
    container.innerHTML = '';
  
    for (const [language, count] of breakdown) {
      const proportion = count / lines.length;
      const formatted = d3.format('.1~%')(proportion);
  
      container.innerHTML += `
              <dt>${language}</dt>
              <dd>${count} lines (${formatted})</dd>
          `;
    }
  
    return breakdown;
  }

document.addEventListener('DOMContentLoaded', async () => {
    await loadData();
    createScatterplot();
    brushSelector();
  });
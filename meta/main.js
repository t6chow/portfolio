import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";
let data = [];


  async function loadData() {

    data = await d3.csv('loc.csv', (row) => ({
        ...row,
        line: Number(row.line), // or just +row.line
        depth: Number(row.depth),
        length: Number(row.length),
        date: new Date(row.date + 'T00:00' + row.timezone),
        datetime: new Date(row.datetime),
      }));
      console.log(data);
    processCommits();
    console.log(commits);
    }


// function processCommits() {
//     commits = d3
//         .groups(data, (d) => d.commit)
//         .map(([commit, lines]) => {
//         let first = lines[0];
//         let { author, date, time, timezone, datetime } = first;
//         let ret = {
//             id: commit,
//             url: 'https://github.com/vis-society/lab-7/commit/' + commit,
//             author,
//             date,
//             time,
//             timezone,
//             datetime,
//             hourFrac: datetime.getHours() + datetime.getMinutes() / 60,
//             totalLines: lines.length,
//         };
    
//         Object.defineProperty(ret, 'lines', {
//             value: lines,
//             enumerable: false,
//             writable: false,
//             configurable: false,
//             // What other options do we need to set?
//             // Hint: look up configurable, writable, and enumerable
//         });
    
//         return ret;
//         });
//     }

function processCommits() {
    commits = d3
        .groups(data, (d) => d.commit)
        .map(([commit, lines]) => {
            let first = lines[0];

            // Ensure datetime is a valid Date object
            let datetime = new Date(first.datetime);

            let ret = {
                id: commit,
                url: `https://github.com/t6chow/portfolio/commits/${commit}`,
                author: first.author,
                date: first.date,
                time: first.time,
                timezone: first.timezone,
                datetime,
                hourFrac: datetime.getHours() + datetime.getMinutes() / 60,
                totalLines: lines.length,
            };

            // Hide lines array from console
            Object.defineProperty(ret, "lines", {
                value: lines,
                enumerable: false,
                writable: false,
                configurable: false,
            });

            return ret;
        });

    console.log("Processed commits:", commits); // Debugging
}

loadData();
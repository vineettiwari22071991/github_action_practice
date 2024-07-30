import fs from 'fs';
import fetch from 'node-fetch';

const token = process.env.TOKEN_GITHUB;
if (!token) {
  throw new Error('TOKEN_GITHUB is not set');
}

const owner = 'vineettiwari22071991';
const repo = 'github_action_practice';

async function fetchData(url) {
  const response = await fetch(url, {
    headers: {
      'Authorization': `token ${token}`,
      'Accept': 'application/vnd.github.v3+json'
    }
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
  }
  return response.json();
}

async function fetchRepoData() {
  try {
    // Fetch pull requests
    const pullRequests = await fetchData(`https://api.github.com/repos/${owner}/${repo}/pulls?state=all`);
    const openPRs = pullRequests.filter(pr => pr.state === 'open').length;
    const closedPRs = pullRequests.filter(pr => pr.state === 'closed').length;

    // Fetch contributors
    const contributors = await fetchData(`https://api.github.com/repos/${owner}/${repo}/collaborators`);
    const allUsersCount = contributors.length;

    // Fetch collaborators
    const collaborators = await fetchData(`https://api.github.com/repos/${owner}/${repo}/collaborators`);
    const adminUsersCount = collaborators.filter(user => user.permissions.admin).length;

   // Generate HTML
   const htmlContent = `
   <!DOCTYPE html>
   <html>
   <head>
     <title>Repository Data Report</title>
     <style>
       body {
         font-family: Arial, sans-serif;
         margin: 0;
         padding: 20px;
         background-color: #f4f4f4;
       }
       h1 {
         color: #333;
       }
       table {
         width: 100%;
         border-collapse: collapse;
         margin: 20px 0;
         background-color: #fff;
       }
       th, td {
         padding: 12px;
         border: 1px solid #ddd;
         text-align: left;
       }
       th {
         background-color: #f2f2f2;
       }
       tr:nth-child(even) {
         background-color: #f9f9f9;
       }
     </style>
   </head>
   <body>
     <h1>Repository Data Report for ${repo}</h1>
     <a href="https://github.com/vineettiwari22071991/github_action_practice">Link to Repository</a>
     <table>
       <tr>
         <th>Metric</th>
         <th>Count</th>
       </tr>
       <tr>
         <td>Open Pull Requests</td>
         <td>${openPRs}</td>
       </tr>
       <tr>
         <td>Closed Pull Requests</td>
         <td>${closedPRs}</td>
       </tr>
       <tr>
         <td>Total Users</td>
         <td>${allUsersCount}</td>
       </tr>
       <tr>
         <td>Admin Users</td>
         <td>${adminUsersCount}</td>
       </tr>
     </table>
   </body>
   </html>
 `;

    fs.writeFileSync('report.html', htmlContent);
    console.log('Report generated successfully.');
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}

fetchRepoData();

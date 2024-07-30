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
    const contributors = await fetchData(`https://api.github.com/repos/${owner}/${repo}/contributors`);
    const allUsersCount = contributors.length;

    // Fetch collaborators
    const collaborators = await fetchData(`https://api.github.com/repos/${owner}/${repo}/collaborators`);
    const adminUsersCount = collaborators.filter(user => user.permissions.admin).length;

    // Generate HTML
    const htmlContent = `
      <html>
      <head>
        <title>Repository Data Report</title>
      </head>
      <body>
        <h1>Repository Data Report</h1>
        <table border="1">
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

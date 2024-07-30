const fs = require('fs');
const { Octokit } = require("@octokit/rest");

const token = process.env.TOKEN_GITHUB;
if (!token) {
  throw new Error('GITHUB_TOKEN is not set');
}

const octokit = new Octokit({ auth: token });

async function fetchRepoData() {
  const owner = 'vineettiwari22071991';
  const repo = 'github_action_practice';

  try {
    // Fetch pull requests
    const { data: pullRequests } = await octokit.pulls.list({
      owner,
      repo,
      state: 'all',
    });

    const openPRs = pullRequests.filter(pr => pr.state === 'open').length;
    const closedPRs = pullRequests.filter(pr => pr.state === 'closed').length;

    // Fetch contributors
    const { data: contributors } = await octokit.repos.listContributors({
      owner,
      repo,
    });

    const allUsersCount = contributors.length;

    // Fetch collaborators with permission check
    const { data: collaborators } = await octokit.repos.listCollaborators({
      owner,
      repo,
      affiliation: 'all',
    });

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

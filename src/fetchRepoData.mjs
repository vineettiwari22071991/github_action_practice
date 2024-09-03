/*
This script fetches data from a GitHub repository and generates an HTML report with the following information:

- Total number of open pull requests
- Total number of closed pull requests
- Total number of collaborators
- Total number of admin collaborators

The script uses the GitHub API to fetch the data and generates the HTML report using the fetched data. The HTML report is then saved to a file named `repo-data-report.html`.
Note: Make sure to set the `TOKEN_GITHUB` and `REPO_USER_NAME` and `REPO_NAME` environment variables before running the script.
Example usage:
`TOKEN_GITHUB=<your_github_token> REPO_USER_NAME=<repo_owner_name> REPO_NAME=<repo_name> node script.js`
This will generate a `repo-data-report.html` file in the current directory with the report.
Note: This script assumes that the GitHub API returns the expected data structure. If the API response structure changes, the script may need to be updated accordingly.
*/
import fs from 'fs';
import fetch from 'node-fetch';

const token = process.env.TOKEN_GITHUB;

// Check if token are set else throw the Error
if (!token) {
  throw new Error('TOKEN_GITHUB is not set');
}

// Set owner and repo name from the env variable
const owner = process.env.REPO_USER_NAME;
const repo =  process.env.REPO_NAME;

// Check if owner and repo are set else throw the Error
if(!owner || !repo){
  throw new Error('REPO_USER_NAME or REPO_NAME is not set');
}

/*
Fetch data from the GitHub API
@param {string} url - The URL to fetch data from
@returns {Promise<Object>} - The JSON response from the API
*/
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

/*
Generate HTML report
@returns {string} - The HTML report
*/
async function fetchRepoData() {

  try {
    // Fetch all pull requests
    const pullRequests = await fetchData(`https://api.github.com/repos/${owner}/${repo}/pulls?state=all`);
    const openPRs = pullRequests.filter(pr => pr.state === 'open').length;
    const closedPRs = pullRequests.filter(pr => pr.state === 'closed').length;
    
    // Fetch collaborators
    const collaborators = await fetchData(`https://api.github.com/repos/${owner}/${repo}/collaborators`);
    const allUsersCount = collaborators.length;
    const adminUsersCount = collaborators.filter(user => user.permissions.admin).length;

  
    
  /*
    Write the HTML report to a file
    @param {string} fileName - The name of the file to write to
    @param {string} content - The content to write to the file 
    */
   fs.writeFileSync('repo-data-report.html', await genrateHTMLReport(openPRs, closedPRs , allUsersCount , adminUsersCount));
   console.log('Report generated successfully.');
 } catch (error) {
   console.error('Error fetching data:', error);

  }
}

/*
 Returns the HTML content for the report
 @param {number} openPRs - The number of open pull requests
 @param {number} closedPRs - The number of closed pull requests
 @param {number} allUsersCount - The total number of collaborators
 @param {number} adminUsersCount - The number of admin collaborators
 @returns {string} - The HTML content for the report
*/
async function genrateHTMLReport(openPRs, closedPRs, allUsersCount, adminUsersCount) {
  return `
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
 }

// call main function to fetch the data and generate the report
fetchRepoData();

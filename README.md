# JIRA Blocked Alert Site
Little node and express site to list all blocked Jira tickets and alert whenever one is pushed with proper webhook initialization.

## Setup
To get started, install the dependencies via `npm install`. Next, add the required environment variables, listed below:

### Environment Variables
- `PORT` - server port, defaults to 3000
- `AUTH` - Base64 Authentication buffer
- `JIRA_URL` - URL to your jira instance
- `JIRA_JQL` - search JQL to filter tickets

Be sure to have the proper webhooks setup in your Jira project.

### Jira Poject setup

`<PUBLIC_URL>/jira/blocked/:project/:ticket/`

## Start
Run `node app.js` to start the server
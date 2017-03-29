# JIRA Blocked Alert Site
Little node and express site to list all blocked Jira tickets and alert whenever one is pushed with proper webhook initialization.

## Setup
To get started, install the dependencies via `npm install`. Next, add the required environment variables, listed below:

### Environment Variables
- `PORT` - server port, defaults to 3000 - **_optional_**
- `AUTH` - Base64 Authentication buffer - `new Buffer("username:password").toString('base64')`
- `JIRA_URL` - URL to your jira instance - `https://jira.<url>.com`
- `JIRA_JQL` - search JQL to filter tickets

### Front End Variables
Replace `<JIRA_URL HERE>` with actual Jira URL

`const JIRA_URL = "<JIRA_URL HERE>/browse/";`

### Jira Poject setup
Be sure to have the proper webhooks setup in your Jira project and you have the proper permissions to access the API.

`<PUBLIC_URL>/jira/blocked/:project/:ticket/`

## Start
Run `gulp` or `gulp watch` to bundle javascript files.

Run `node app.js` to start the server.
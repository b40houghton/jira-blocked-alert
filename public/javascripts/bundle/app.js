import React from "react";
import { render } from "react-dom";

let ws;

const containerElement = document.getElementById('blocked-container');
const JIRA_URL = "<JIRA_URL HERE>/browse/";

class BlockedIssueApp extends React.Component {
	constructor(props) {
		super(props); //superman?

		// events
		this.handleWebSocketError = this.handleWebSocketError.bind(this);
		this.handleWebSocketOpen = this.handleWebSocketOpen.bind(this);
		this.handleWebSocketClose = this.handleWebSocketClose.bind(this);
		this.handleWebSocketMessage = this.handleWebSocketMessage.bind(this);

		// state
		this.state = {
			status: 'closed',
			meta: {},
			alert: [],
			issues: [],
			log: []
		}
	}
	componentDidMount() {
		if (ws) {
			ws.onerror = ws.onopen = ws.onclose = null;
			ws.close();
		}

		ws = new WebSocket(`ws://${location.host}`);

		ws.onerror 	= this.handleWebSocketError;
		ws.onopen = this.handleWebSocketOpen;
		ws.onclose = this.handleWebSocketClose;
		ws.onmessage = this.handleWebSocketMessage;
	}

	componentWillUnmount() {
		console.log('componentWillUnmount');
	}

	handleWebSocketMessage(event) {
		let data = JSON.parse(event.data);
		let log = this.state.log;

		console.log('message received');

		if (this.state.alert.length) log.push(this.state.alert[0]);

		this.setState(data);
	}

	handleWebSocketError() {

		this.setState({
			status: 'error'
		});
	}

	handleWebSocketOpen() {

		this.setState({
			status: 'active'
		});
	}

	handleWebSocketClose() {

		this.setState({
			status: 'closed'
		});
	}
	render() {

		let alertClassName = (this.state.alert.length) ? 'alert-active' : 'alert-inactive';

		console.log(this.state);

		return (
			<div className={"blocked-wrapper " + alertClassName}>
				<div className="blocked-list__column">
					<BlockedIssueAlert alert={this.state.alert} />
					<BlockedIssueLog log={this.state.log} />
				</div>
				<div className="blocked-list__column">

					<BlockedIssueStatus status={this.state.status} />
					<BlockedIssueList issues={this.state.issues} />
				</div>
			</div>
		);
	}
}

class BlockedIssueAlert extends React.Component {
	render() {

		let hasAlert = this.props.alert.length;
		let alert = (hasAlert) ? '* NEW BLOCKED TICKET *' : 'No Alerts at this time.';

		if (hasAlert) this.audio.play();

		return (
			<div className="alert">
				{alert}
				<audio ref={(audio) => { this.audio = audio }} src="/sounds/fog-horn.mp3">&nbsp;</audio>
			</div>);
	}
}

class BlockedIssueStatus extends React.Component {
	render() {
		let StatusClassName = `status-${this.props.status}`;
		return <div className="blocked-list-status">Websocket Status: <span className={StatusClassName}>{this.props.status}</span></div>;
	}
}

class BlockedIssueList extends React.Component {
	render() {

		let BlockedIssues;
		let BlockedList = <div className="loader">Loading <img src="/images/loader.svg" /></div>;


		if (this.props.issues.length) {
			BlockedIssues = this.props.issues.map((item) => {

				console.log(item);

				return (
					<li className="blocked-list__item" key={item.id}>
						<a href={JIRA_URL + item.key} target="_blank">
							<span className="blocked-list__item__key">{item.key}</span><br />
							<span className="blocked-list__item__assignee">Assignee: {item.fields.assignee.displayName}</span><br />
							<span className="blocked-list__item__creator">Creator: {item.fields.creator.displayName}</span>
						</a>
					</li>);
			});

			BlockedList = <ul className="blocked-list">{BlockedIssues}</ul>
		}

		return (
			<div className="blocked-list-wrapper">
				<h2>Blocked Tickets:</h2>
				<hr />
				{BlockedList}
			</div>);
	}
}

class BlockedIssueLog extends React.Component {

	render() {
		let logList = <pre>Nothing too exciting happening...</pre>;

		if (this.props.log.length > 0) {
			logList = this.props.log.reverse().map((log, index) => {
				return (<pre key={index}>BLOCKED[{index}] - {log.key}: {log.id}</pre>);
			});
		}

		return (
			<div>
				<h2>Log:</h2>
				<hr />
				<div className="blocked-list__log">{logList}</div>
			</div>);
	}
}

// to do
class BlockedIssueUptime extends React.Component {

	render() {

		let days = 0;
		let hours = 0;
		let minutes = 0;
		let seconds = 0;

		return <div>{days + " Days | " + hours + " Hours | " + minutes + " Minutes | " + seconds + " Seconds"}</div>
	}
}

render(<BlockedIssueApp />, containerElement);
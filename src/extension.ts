// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { posix } from 'path';
import { error, log } from 'console';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	output = vscode.window.createOutputChannel("My Debugger");
	output.show();
	output.appendLine("test");
	let d = vscode.commands.registerCommand('try-dev-code.copyToTwin', async function() {
		console.log('twin clickked');
		// vscode.window.showInformationMessage('twin tapped');
		output?.appendLine("twin tap");

		vscode.window.showInputBox({
			prompt: "Enter command",
			placeHolder: "cmd"
		}).then(value => {
			if (value) {
				console.log(`User entered: ${value}`);
				output?.appendLine(`User cmd: ${value}`);
				if (currSession === undefined){
					return;
				}
				
				// threads = {"ref": 12, }
				const arr = value.split("=");
				let args = null;
				if (arr.length > 1) {
					args = JSON.parse(arr[1]);
				}
				output?.appendLine(`sending request: ${arr[0]}=${JSON.stringify(args)}`);
				currSession.customRequest(arr[0], args)
				.then(res => {
					console.log('response', res);
					output?.appendLine(`res: ${JSON.stringify(res)}`);
				}, error => {
					output?.appendLine(`err: ${JSON.stringify(error)}`);
					output?.appendLine(error);
				});
			}
		});
	});
	context.subscriptions.push(d);


	const d2 = vscode.debug.registerDebugAdapterTrackerFactory('*', {
        createDebugAdapterTracker(session: vscode.DebugSession) {
            return new MyDebugAdapterTracker(session);
        }
    });
	context.subscriptions.push(d2);

	vscode.debug.onDidStartDebugSession(session => {
		console.log('dbg start: ', session);
		currSession = session;
		output?.appendLine(`dbg session id = ${session.id}`);
	});
	vscode.debug.onDidTerminateDebugSession(session => {
		console.log('dbg term: ', session);
		currSession = undefined;
	});
}

// This method is called when your extension is deactivated
export function deactivate() {
	output?.dispose();
}

let currSession: vscode.DebugSession | undefined;
let output: vscode.OutputChannel | undefined;

class MyDebugAdapterTracker implements vscode.DebugAdapterTracker {
	constructor(private session: vscode.DebugSession) {
	}
    onWillReceiveMessage(message: any) {
		console.log(`RECV::${message.type}:${message.command}`, message);
    }

    onDidSendMessage(message: any) {
		if (message.event === 'output') {
			return;
		}
		
		console.log(`SEND::${message.type}:${message.command}`, message);
    }
}

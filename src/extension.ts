// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { posix } from 'path';
import { log } from 'console';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	let d = vscode.commands.registerCommand('try-dev-code.copyToTwin', async function() {

		if (!vscode.workspace.workspaceFolders) {
			return vscode.window.showWarningMessage('No folder or workspace opened');
		}
		if (!vscode.window.activeTextEditor) {
			return vscode.window.showWarningMessage('No file opened');
		}

		const conf = vscode.workspace.getConfiguration('tryDevCode');
		if (conf === null || conf.twinFolderPath === null || conf.twinFolderPath === '') {
			return vscode.window.showWarningMessage('twinFolderPath is empty');
		}

		let file = vscode.window.activeTextEditor.document.uri;
		const readData = await vscode.workspace.fs.readFile(file);
		// console.log(Buffer.from(readData).toString('utf8'));

		const folderUri = vscode.workspace.workspaceFolders[0].uri;
		const relPath = posix.relative(folderUri.path, file.path);
		// log('rel', relPath);

		const filePath = posix.join(conf.twinFolderPath, relPath);
		const twinUri = vscode.Uri.file(filePath);
		// log(twinUri);

		
		await vscode.workspace.fs.writeFile(twinUri, readData);
		 
		vscode.window.showInformationMessage('twinned to ' + filePath);
	});
	context.subscriptions.push(d);
}

// This method is called when your extension is deactivated
export function deactivate() {}

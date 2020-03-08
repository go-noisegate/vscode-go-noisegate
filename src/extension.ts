import cp = require('child_process');
import vscode = require('vscode');

const outputChannel = vscode.window.createOutputChannel('Go Hornet');

export function activate(context: vscode.ExtensionContext) {
	outputChannel.show(true);

	context.subscriptions.push(vscode.commands.registerCommand('extension.hornetHint', () => {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			console.log('no active text editor');
			return;
		}

		editor.document.save().then(async () => {
			runHornetHint(editor.document);
		});
	}));

	context.subscriptions.push(vscode.commands.registerCommand('extension.hornetTest', () => {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			console.log('no active text editor');
			return;
		}

		editor.document.save().then(async () => {
			runHornetTest(editor);
		});
	}));

	vscode.workspace.onDidSaveTextDocument((document) => {
		const config = vscode.workspace.getConfiguration('gohornet', document.uri);
		if (!config['hintOnSave']) {
			return;
		}
		if (document.languageId !== 'go') {
			console.log('not go file');
			return;
		}
		runHornetHint(document);
	}, null, context.subscriptions);
}

function runHornetHint(document: vscode.TextDocument) {
	const editor = vscode.window.visibleTextEditors.find((e) => e.document.fileName === document.fileName)
	if (!editor) {
		console.log(document.fileName + ' is not visible');
		return;
	}

	const pos = editor.selection.start;
	const offset = document.offsetAt(pos);
	const query = document.fileName + ':#' + offset;
	cp.spawn('hornet', ['hint', query]); // do not care the result

	console.log('started hornet hint (query: ' + query + ')');
}

let currProc: cp.ChildProcess;

function runHornetTest(editor: vscode.TextEditor) {
	if (currProc) {
		currProc.kill('SIGKILL');
	}
	outputChannel.clear();

	const pos = editor.selection.start;
	const offset = editor.document.offsetAt(pos);
	const query = editor.document.fileName + ':#' + offset;

	const proc = cp.spawn('hornet', ['test', query]);
	proc.stdout.on('data', (chunk) => outputChannel.appendLine(chunk));
	proc.stderr.on('data', (chunk) => outputChannel.appendLine(chunk));
	currProc = proc;

	console.log('started hornet test (query: ' + query + ')');
}

export function deactivate() {}

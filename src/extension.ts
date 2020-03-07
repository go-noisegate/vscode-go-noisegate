import cp = require('child_process');
import vscode = require('vscode');

export function activate(context: vscode.ExtensionContext) {
	let disposable = vscode.commands.registerCommand('extension.hornetHint', () => {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			console.log('no active text editor');
			return;
		}

		editor.document.save().then(async () => {
			runHornetHint(editor.document);
		});
	});
	context.subscriptions.push(disposable);

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

export function deactivate() {}

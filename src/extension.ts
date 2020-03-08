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
			await runHornetTest(editor);
		});
	}));

	vscode.workspace.onDidSaveTextDocument((document) => {
		const config = vscode.workspace.getConfiguration('gohornet', document.uri);
		if (!config['hintOnSave']) {
			return;
		}
		if (document.languageId !== 'go') {
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

async function runHornetTest(editor: vscode.TextEditor): Promise<boolean> {
	return await new Promise<boolean>(async (resolve, reject) => {
		if (currProc) {
			currProc.kill('SIGKILL');
		}
		outputChannel.clear();

		const args: Array<string> = ['test'];
		const config = vscode.workspace.getConfiguration('gohornet', editor.document.uri);

		args.push('--parallel', config['parallel']);
		if (config['buildTags']) {
			args.push('--tags', config['buildTags']);
		}

		const pos = editor.selection.start;
		const offset = editor.document.offsetAt(pos);
		const query = editor.document.fileName + ':#' + offset;
		args.push(query);

		outputChannel.appendLine(`$ hornet ${args.join(' ')}`);

		const proc = cp.spawn('hornet', args);
		proc.stdout.on('data', (chunk) => outputChannel.append(`${chunk}`));
		proc.stderr.on('data', (chunk) => outputChannel.append(`${chunk}`));
		proc.on('close', (code) => resolve(code === 0));
		currProc = proc;
	});
}

export function deactivate() {}

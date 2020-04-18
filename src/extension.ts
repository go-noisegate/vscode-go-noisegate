import cp = require('child_process');
import vscode = require('vscode');
import path = require('path');
import {ChangesInFile, addChange, getChanges, changesToString, resetChanges} from './changes';

const outputChannel = vscode.window.createOutputChannel('Go Noise Gate');

export function activate(context: vscode.ExtensionContext) {
	outputChannel.show(true);

	context.subscriptions.push(vscode.commands.registerCommand('extension.noisegateHint', () => {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			console.log('no active text editor');
			return;
		}

		editor.document.save().then(async () => {
			const changes = getChanges(editor.document.fileName);
			if (changes.length > 0) {
				runNoiseGateHint(editor.document, changes);  // do not wait
				resetChanges(editor.document.fileName);
			}
		});
	}));

	context.subscriptions.push(vscode.commands.registerCommand('extension.noisegateTest', () => {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			console.log('no active text editor');
			return;
		}

		editor.document.save().then(async () => {
			const pos = editor.selection.start;
			const offset = editor.document.offsetAt(pos);
			await runNoiseGateHint(editor.document, [[offset, offset]]);
			await runNoiseGateTest(editor, false);
		});
	}));

	context.subscriptions.push(vscode.commands.registerCommand('extension.noisegateTestAll', () => {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			console.log('no active text editor');
			return;
		}

		editor.document.save().then(async () => {
			await runNoiseGateTest(editor, true);
		});
	}));

	vscode.workspace.onDidSaveTextDocument((document) => {
		const config = vscode.workspace.getConfiguration('gonoisegate', document.uri);
		if (!config['hintOnSave']) {
			return;
		}
		if (document.languageId !== 'go') {
			return;
		}
		const changes = getChanges(document.fileName);
		if (changes.length > 0) {
			runNoiseGateHint(document, changes);  // do not wait
			resetChanges(document.fileName);
		}
	}, null, context.subscriptions);

	vscode.workspace.onDidChangeTextDocument((ev) => {
		if (ev.document.languageId !== 'go') {
			return;
		}
		const fileName = ev.document.fileName;
		ev.contentChanges.forEach(ch => addChange(fileName, ch.rangeOffset, ch.rangeOffset+ch.rangeLength+ch.text.length-1));
	}, null, context.subscriptions);
}

async function runNoiseGateHint(document: vscode.TextDocument, changes: ChangesInFile): Promise<boolean> {
	return await new Promise<boolean>(async (resolve, reject) => {
		const query = document.fileName + ':' + changesToString(changes);
		const proc = cp.spawn('gate', ['hint', query]);
		proc.stdout.on('data', (chunk) => console.log(`${chunk}`));
		proc.stderr.on('data', (chunk) => console.log(`${chunk}`));
		proc.on('close', (code) => resolve(code === 0));

		console.log('started gate hint ' + query);
	});
}

let currProc: cp.ChildProcess;

async function runNoiseGateTest(editor: vscode.TextEditor, all: boolean): Promise<boolean> {
	return await new Promise<boolean>(async (resolve, reject) => {
		if (currProc) {
			currProc.kill('SIGKILL');
		}
		outputChannel.clear();

		const fileName = editor.document.fileName;
		const args: Array<string> = ['test'];
		if (all) {
			args.push('-bypass');
		}
		args.push(path.dirname(fileName));
		const config = vscode.workspace.getConfiguration('gonoisegate', editor.document.uri);
		if (config['goTestOptions']) {
			args.push('--')
			args.push.apply(args, config['goTestOptions'].split(' '));
		}

		outputChannel.appendLine(`$ gate ${args.join(' ')}`);

		const proc = cp.spawn('gate', args);
		proc.stdout.on('data', (chunk) => outputChannel.append(`${chunk}`));
		proc.stderr.on('data', (chunk) => outputChannel.append(`${chunk}`));
		proc.on('close', (code) => resolve(code === 0));
		currProc = proc;
	});
}

export function deactivate() {}

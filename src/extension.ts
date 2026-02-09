import * as vscode from 'vscode';
import { typoMap } from './dictionary';

let diagnosticCollection: vscode.DiagnosticCollection;

export function activate(context: vscode.ExtensionContext) {
    // console.log('DevTypos is now active!');

    diagnosticCollection = vscode.languages.createDiagnosticCollection('devTypos');
    context.subscriptions.push(diagnosticCollection);

    if (vscode.window.activeTextEditor) {
        updateDiagnostics(vscode.window.activeTextEditor.document, diagnosticCollection);
    }
    context.subscriptions.push(
        vscode.workspace.onDidChangeTextDocument(editor => {
            updateDiagnostics(editor.document, diagnosticCollection);
        })
    );

    context.subscriptions.push(
        vscode.languages.registerCodeActionsProvider('*', new TypoFixer(), {
            providedCodeActionKinds: TypoFixer.providedCodeActionKinds
        })
    );
}

function updateDiagnostics(document: vscode.TextDocument, collection: vscode.DiagnosticCollection): void {
    const diagnostics: vscode.Diagnostic[] = [];
    const text = document.getText();

    for (const [wrong, right] of Object.entries(typoMap)) {
        const regex = new RegExp(`\\b${wrong}\\b`, 'g');
        let match;

        while ((match = regex.exec(text)) !== null) {
            const startPos = document.positionAt(match.index);
            const endPos = document.positionAt(match.index + match[0].length);
            const range = new vscode.Range(startPos, endPos);

            const diagnostic = new vscode.Diagnostic(
                range,
                `Typo detected: '${wrong}'. Did you mean '${right}'?`,
                vscode.DiagnosticSeverity.Warning
            );
            diagnostic.code = 'devtypos.fix';
            diagnostics.push(diagnostic);
        }
    }
    collection.set(document.uri, diagnostics);
}

export class TypoFixer implements vscode.CodeActionProvider {

    public static readonly providedCodeActionKinds = [
        vscode.CodeActionKind.QuickFix
    ];

    public provideCodeActions(document: vscode.TextDocument, range: vscode.Range | vscode.Selection, context: vscode.CodeActionContext): vscode.CodeAction[] {
        const diagnostic = context.diagnostics.find(d => d.code === 'devtypos.fix');
        if (!diagnostic) {
            return [];
        }

        const wrongWord = document.getText(diagnostic.range);
        const rightWord = typoMap[wrongWord];
        if (!rightWord) {
            return [];
        }

        const fixAction = new vscode.CodeAction(`Fix to '${rightWord}'`, vscode.CodeActionKind.QuickFix);
        fixAction.edit = new vscode.WorkspaceEdit();
        fixAction.edit.replace(document.uri, diagnostic.range, rightWord);
        fixAction.isPreferred = true;

        return [fixAction];
    }
}

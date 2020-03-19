import * as assert from 'assert';

import * as vscode from 'vscode';
import * as changes from '../../changes';

suite('Changes Test Suite', () => {
	test('addChange', () => {
        changes.addChange('file1', 2, 2);
        assert.deepEqual([[2, 2]], changes.getChanges('file1'));

        changes.addChange('file1', 1, 2);
        assert.deepEqual([[1, 2]], changes.getChanges('file1'));

        changes.addChange('file1', 0, 0);
        assert.deepEqual([[0, 2]], changes.getChanges('file1'));

        changes.addChange('file1', 1, 4);
        assert.deepEqual([[0, 4]], changes.getChanges('file1'));

        changes.addChange('file1', 5, 5);
        assert.deepEqual([[0, 5]], changes.getChanges('file1'));

        changes.addChange('file1', 2, 4);
        assert.deepEqual([[0, 5]], changes.getChanges('file1'));

        changes.addChange('file1', 7, 10);
        assert.deepEqual([[0, 5], [7, 10]], changes.getChanges('file1'));

        changes.addChange('file2', 0, 0);
        assert.deepEqual([[0, 0]], changes.getChanges('file2'));
	});
});

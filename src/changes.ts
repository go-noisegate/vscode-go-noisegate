type ChangesInFile = Array<[number, number]>; // both inclusive

let changes: Record<string, ChangesInFile> = {};

// begin and end are both inclusive
export function addChange(fileName: string, begin: number, end: number) {
    let changesInFile = changes[fileName];
    if (changesInFile === undefined) {
        changes[fileName] = changesInFile = [];
    }

    if (changesInFile.length > 0) {
        const lastChange = changesInFile[changesInFile.length-1];
        if (lastChange[0] <= (end+1) && (begin-1) <= lastChange[1]) {
            // intersect or adjacent. can merge
            lastChange[0] = Math.min(lastChange[0], begin);
            lastChange[1] = Math.max(lastChange[1], end);
            return;
        }
    }
    changesInFile.push([begin, end]);
}

export function getChanges(fileName: string) :ChangesInFile {
    let changesInFile = changes[fileName];
    if (!changesInFile) {
        return [];
    }
    return changesInFile;
}

export function changesToString(changes: ChangesInFile) :string {
    return changes.map(ch => `#${ch[0]}-${ch[1]}`).join(',');
}

export function resetChanges(fileName: string) {
    changes[fileName] = [];
}
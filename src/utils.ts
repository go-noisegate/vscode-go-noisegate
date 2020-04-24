import cp = require('child_process');
import path = require('path');
import fs = require('fs');

const separators = [':', ';'];
const gateCommand = 'gate';

export function findGateCommand(): string {
    const proc = cp.spawnSync('go', ['env', 'GOPATH']);
    if (proc.status !== 0 || proc.error) {
        console.error(`failed to find GOPATH: status: ${proc.status}, error: ${proc.error}, stderr: ${proc.stderr}`);
        return gateCommand;
    }

    let gopath = `${proc.stdout}`.trim();
    const i = gopath.indexOf(path.delimiter);
    if (i !== -1) {
        gopath = gopath.substring(0, i);
    }
    
    let gateInGopath = path.join(gopath, 'bin', gateCommand);
    if (fs.existsSync(gateInGopath)) {
        return gateInGopath;
    }

    return gateCommand;
}
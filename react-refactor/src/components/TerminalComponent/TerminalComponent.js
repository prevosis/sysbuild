import React from 'react';
import $ from 'jquery';
import Jor1k from '../../../jor1k/js/master/master';
import LinuxTerm from '../../../jor1k/js/plugins/terminal-linux';

export default class TerminalComponent extends React.Component {
    constructor(props) {
        super(props);

        let other = document.getElementById('tty0');
        console.log(other instanceof HTMLCanvasElement);

        var termTTY0 = new LinuxTerm('tty0');
        console.log(termTTY0);

        console.log(location.pathname);

        var jor1k = new Jor1k(
            {
                term: termTTY0,
                path: '../jor1k/sys/or1k/',
                worker: new Worker('jor1k-worker-min.js'),
                fs: {
                    basefsURL: 'basefs-compile.json',
                    extendedfsURL: '../fs.json',
                    earlyload: [
                        'usr/bin/gcc',
                        'usr/libexec/gcc/or1k-linux-musl/4.9.0/cc1',
                        'usr/libexec/gcc/or1k-linux-musl/4.9.0/collect2',
                        'usr/lib/libbfd-2.24.51.20140817.so',
                        'usr/lib/gcc/or1k-linux-musl/4.9.0/libgcc.a',
                        'usr/bin/as',
                        'usr/include/stdio.h',
                    ], // list of files which should be loaded immediately after they appear in the filesystem
                },
                system: {
                    kernelURL: 'vmlinux.bin.bz2', // kernel image
                    memorysize: 32, // in MB, must be a power of two
                    cpu: 'asm', // short name for the cpu to use
                    ncores: 1,
                }
            }
        );

        console.log(jor1k);
    }

    render() {
        return (
            <div id="terms">
                <canvas id="TTYContainer1">TerminalComponent placeholder1</canvas>
            </div>
        );
    }
}

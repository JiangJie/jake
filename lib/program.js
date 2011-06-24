var parseargs = require('../lib/parseargs')
  , Program
  , optsReg
  , preempts
  , usage
  , die;

optsReg = [
  { full: 'jakefile'
  , abbr: 'f'
  , preempts: false
  , expectValue: true
  }
, { full: 'directory'
  , abbr: 'C'
  , preempts: false
  , expectValue: true
  }
, { full: 'tasks'
  , abbr: 'T'
  , preempts: true
  }
, { full: 'trace'
  , abbr: 't'
  , preempts: false
  , expectValue: false
  }
, { full: 'help'
  , abbr: 'h'
  , preempts: true
  }
, { full: 'version'
  , abbr: 'V'
  , preempts: true
  }
];

preempts = {
  version: function () {
    die(jake.version);
  }
, help: function () {
    die(usage);
  }
};

usage = ''
    + 'Jake JavaScript build tool\n'
    + '********************************************************************************\n'
    + 'If no flags are given, Jake looks for a Jakefile or Jakefile.js in the current directory.\n'
    + '********************************************************************************\n'
    + '{Usage}: jake [options ...] [env variables ...] target\n'
    + '\n'
    + '{Options}:\n'
    + '  -f, --jakefile FILE            Use FILE as the Jakefile\n'
    + '  -C, --directory DIRECTORY      Change to DIRECTORY before running tasks.\n'
    + '  -T, --tasks                    Display the tasks, with descriptions, then exit.\n'
    + '  -t, --trace                    Enable full backtrace.\n'
    + '  -h, --help                     Outputs help information\n'
    + '  -V, --version                  Outputs Jake version\n'
    + '';

Program = function () {
  this.opts = {};
  this.taskName = null;
  this.taskArgs = null;
  this.envVars = null;
};

Program.prototype = new (function () {
  this.handleErr = function (err) {
    var msg;
    console.error('jake aborted.');
    if (this.opts.trace && err.stack) {
      console.error(err.stack);
    }
    else {
      if (err.stack) {
        msg = err.stack.split('\n').slice(0, 2).join('\n');
        console.error(msg);
        console.error('(See full trace by running task with --trace)');
      }
      else {
        console.error(err.message);
      }
    }
    process.exit(jake.errorCode || 1);
  };

  this.parseArgs = function (args) {
    var parser = new parseargs.Parser(optsReg)
      , arr = ['opts', 'taskName', 'taskArgs', 'envVars']
      , arrItem

    parser.parse(args);
    for (i = 0, ii = arr.length; i < ii; i++) {
      arrItem = arr[i];
      this[arrItem] = parser[arrItem];
    }

  };

  this.preemptiveOption = function () {
    var opts = this.opts;
    for (var p in opts) {
      if (preempts[p]) {
        preempts[p]();
        return true;
      }
    }
    return false;
  };

})();

die = function (msg) {
  console.log(msg);
  process.exit();
};

module.exports.Program = Program;
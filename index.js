const config = require('./config.js');
const express = require('express');

function getTimeString(time) {
  var newDate = new Date();
  newDate.setTime(time);
  return newDate.toLocaleString();
}

const jsBack = `<script>
    history.back()
</script>`;
const jsReload = `
<script>setInterval(() => {
    location.reload();
}, 2000);</script>`;

class ExecutableService {
  constructor(config) {
    this.executables = new Map();
    this.startTime = Date.now();
    config.forEach((e) => {
      this.addExecutable(e);
    });
  }
  addExecutable = (exe) => {
    if (exe && exe.name && exe.path) {
      const id = exe.name.toLowerCase().replace(' ', '').replace('/', '');
      this.executables.set(id, {
        id: id,
        name: exe.name,
        path: exe.path,
        lastExecTime: null,
        lastExecMessage: '',
        success: false,
      });
    }
  };
  updateExecutable = (exe) => {
    if (exe.id && this.executables.has(exe.id)) {
      this.executables.set(exe.id, exe);
      return this.executables.get(exe.id);
    }
    return null;
  };
}

const es = new ExecutableService(config);
let app = express();

app.get('/:id', async function (req, res) {
  console.log(req.params.id);
  if (req.params.id && es.executables.has(req.params.id)) {
    const exe = es.executables.get(req.params.id);
    console.log(exe);
    require('child_process').exec(exe.path, (err, stdout, stderr) => {
      if (err) {
        exe.success = false;
        exe.lastExecMessage = err.message;
        exe.lastExecTime = Date.now();
        es.updateExecutable(exe);
        res.send(`<p>1${err}</p>${jsBack}`);
        return console.log(err);
      }
      if (stderr) {
        exe.success = false;
        exe.lastExecMessage = stderr;
        exe.lastExecTime = Date.now();
        es.updateExecutable(exe);
        res.send(`<p>${stderr}</p>`);
        console.log(stdout);
      }
      //SUCCESS
      console.log(stdout);
      exe.success = true;
      exe.lastExecMessage = stdout;
      exe.lastExecTime = Date.now();
      es.updateExecutable(exe);
      res.send(`<p>${stdout}</p>${jsBack}`);
    });
  } else {
    res.send(`<p>Keine gültige ID</p>`);
  }
});

app.get('/', async function (req, res) {
  let html = '';
  es.executables.forEach((exe) => {
    let success = exe.success ? '✅' : '❌';
    const executing = ``;
    html =
      html +
      `<div><h3>${exe.name}</h3><p><b>Letzte Ausführung:</b>${getTimeString(
        exe.lastExecTime
      )}</br>${success} ${
        exe.lastExecMessage
      }</p><a href="http://localhost:8080/${exe.id}">Ausführen</a></div></br>`;
  });
  res.send(html + jsReload);
});

console.log('hey');

let server = app.listen(8080, function () {
  console.log('Server is listening on port http://localhost:8080');
});

const config = require("./config.js");
const express = require("express");
const render = require("./dashboard");
const fs = require("fs");

function getTimeString(time) {
  if (time) {
    var newDate = new Date();
    newDate.setTime(time);
    return newDate.toLocaleString();
  }
  return "-";
}


const jsBack = `<script>
    history.back()
</script>`;
const jsReload = `
<script>setInterval(() => {
    location.reload();
}, 2000);</script>`;

console.log(render());

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
      const id = exe.name.toLowerCase().replace(" ", "").replace("/", "");
      this.executables.set(id, {
        id: id,
        name: exe.name,
        path: exe.path,
        lastExecTime: null,
        lastExecMessage: "",
        success: false,
		inProgress: false,
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

app.get("/:id", async function (req, res) {
  console.log(req.params.id);
  if (req.params.id && es.executables.has(req.params.id)) {
    const exe = es.executables.get(req.params.id);
    console.log(exe);
	if(!exe.inProgress){
		exe.inProgress = true
	}
    require("child_process").exec("cmd /c  " + exe.path,{cwd:"D:/ContentisAG/SyncWORKSReports/Batch"}, (err, stdout, stderr) => {
      if (err) {
        exe.success = false;
        exe.lastExecMessage = err.message;
        exe.lastExecTime = Date.now();
        es.updateExecutable(exe);
		exe.inProgress = false
        res.send(`<p>1${err}</p>${jsBack}`);
        return console.log(err);
      }
      if (stderr) {
        exe.success = false;
        exe.lastExecMessage = stderr;
        exe.lastExecTime = Date.now();
		exe.inProgress = false
        es.updateExecutable(exe);
        res.send(`<p>${stderr}</p>${jsBack}`);
        console.log(stdout);
      }
      //SUCCESS
      console.log(stdout);
      exe.success = true;
      exe.lastExecMessage = stdout;
      exe.lastExecTime = Date.now();
	  exe.inProgress = false
      es.updateExecutable(exe);
      res.send(`<p>${stdout}</p>${jsBack}`);
    });
  } else {
    res.send(`<p>Keine gültige ID</p>`);
  }
});

app.get("/", async function (req, res) {
  let html = "";
  es.executables.forEach((exe) => {
    let success = exe.success ? "✅" : "❌";
	if(exe.inProgress){
		success = "⏲";
	}
    const executing = ``;
    html =
      html +
      `<div class="card"><div class="card-body"><h3 class="card-title">${
        exe.name
      }</h3><p class="card-text" ><b>Letzte Ausführung:</b> ${getTimeString(
        exe.lastExecTime
      )} ${success}</p>`;
	  if(!exe.inProgress){
	  html =
      html +
      `<a class="btn btn-primary" href="/${
        exe.id
      }">Ausführen</a>`;
	  }
	  html =
      html +
      `</div></div></br>`;
  });
  res.send(render(html + jsReload));
});
app.get("/css/styles.css", async function (req, res) {
  res.writeHead(200, { "Content-type": "text/css" });
  var fileContents = fs.readFileSync("D:/ContentisAG/SyncWORKSReports/Batch/remote-script/css/styles.css", {
    encoding: "utf8",
  });
  res.write(fileContents);
  res.end();
});

console.log("hey");

let server = app.listen(80, function () {
  console.log("Server is listening on port http://localhost:80");
});

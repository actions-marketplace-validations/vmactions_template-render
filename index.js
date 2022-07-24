const core = require('@actions/core');
const exec = require('@actions/exec');
const fs = require("fs");
const path = require("path");
const ini = require('ini');


//Support:
// {{VARIABLE}}
async function renderFile(tpl, outfile, datafile) {
    let config = ini.parse(fs.readFileSync(datafile, "utf-8"));
    let content = fs.readFileSync(tpl, "utf-8");
    var matches = [...content.matchAll(/(?<!\$){{\s*(\w+)\s*}}/g)]
    
    for(let m in matches) {
        console.log(matches[m][0]);
        let match = matches[m][0]
        let name = matches[m][1];
        let value = process.env[name];
        if (name in config) {
            value = config[name];
        }
        if(value.startsWith("@")) {
            value = fs.readFileSync(value.substring(1), "utf-8");
        }
        if(typeof value != undefined) {
            content = content.replace(new RegExp(match, "g"), value)
        }
    }

    fs.writeFileSync(outfile, content, "utf8");

    console.log("end");

    
  
  
}


async function main() {
  let datafile = core.getInput("datafile");
  if(!datafile) {
      core.debug("No data file is specified.")
  }
  let files = core.getMultilineInput("files").filter(x => x !== "");
  core.debug(files);
  
  for (let file of files) {
      core.info("Rendering file: " + file);
      let segs = file.split(":");  //template file : output file: [optional datafile]
      let tpl = segs[0];
      let outfile = segs[1];
      let f = datafile;
      if(segs.length > 2) {
        f = segs[2];
      }
      await renderFile(tpl, outfile, f);
  }
}






main().then();



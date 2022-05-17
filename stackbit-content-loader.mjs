import fs from "fs";
import path from "path";
import { parseFile } from "@stackbit/utils";
import yaml from "js-yaml";

const extensions = [".md", ".yml", ".yaml", ".json"];

async function readContentFiles(dirPath) {
  function filenames(dirPath, files) {
    let entries = fs.readdirSync(dirPath);
    entries.forEach(async (file) => {
      const fullPath = path.join(dirPath, "/", file);
      if (fs.statSync(fullPath).isDirectory()) {
        files = filenames(fullPath, files);
      } else {
        if (extensions.includes(path.extname(file))) {
          files.push(fullPath);
        }
      }
    });
    return files;
  }

  function toUrl(pageFile) {
    if (!pageFile.startsWith(sbConfig.pagesDir)) return null;
    let url = pageFile.slice(sbConfig.pagesDir.length);
    url = url.split(".")[0];
    url = (url === "/index" ? "/" : url.endsWith("/index") ? url.slice(0, -6) : url); 
    return url;
  }

  async function readContent(file) {
    let fileContent = await parseFile(file);
    if (fileContent.frontmatter)
      fileContent = {
        ...fileContent.frontmatter,
        body: fileContent.markdown,
      };
    return { file, url: toUrl(file), content: fileContent };
  }

  const files = filenames(dirPath, []);
  const content = await Promise.all(files.map((file) => readContent(file)));
  return content;
}

let content = null;
let sbConfig = null;

async function init() {
  sbConfig = yaml.load(fs.readFileSync("./stackbit.yaml", "utf8"));
  if (!sbConfig.pagesDir || !sbConfig.dataDir)
    throw new Error("Invalid Stackbit config file");

  content = {
    pages: await readContentFiles(sbConfig.pagesDir),
    data: await readContentFiles(sbConfig.dataDir),
  };
}

export async function getContent() {
  if (!content) await init();
  return content;
}

const res = await getContent();
console.log(JSON.stringify(res, null, 2));

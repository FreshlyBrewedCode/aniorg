#!/usr/bin/env node

const { promisify } = require("util");
const { program } = require("commander");
const { cosmiconfig } = require("cosmiconfig");
const chalk = require("chalk");
const explorer = cosmiconfig("aniorg");
const anilist = require("anilist-node");
const Anilist = new anilist();
const Table = require("cli-table");
const glob = promisify(require("glob"));
const path = require("path");
const mustache = require("mustache");
const inquirer = require("inquirer");
const cp = require("cp-file");
const mv = require("move-file");
const { link, mkdir } = require("fs").promises;
const cliProgress = require("cli-progress");
const {
  tableStyle,
  numberView,
  stringView,
  parseKeyValue,
} = require("./utils");

program
  .version(require("../package.json").version)
  .option("-c, --config <path>", "path to config file", undefined)
  .option("--verbose", "verbose output", false)
  .option("-s, --search <query>", "search for an anime on anilist")
  .option("-i, --info <id>", "get anime info by id")
  .option("--season <season index>", "the season used for the template", 1)
  .option("--silent", "don't ask for confirmation", false)
  .option(
    "-m --mode [copy|move|link]",
    "the mode used to rename the file",
    "move"
  )
  .option(
    "-g, --glob <pattern>",
    "glob pattern used to find episode files"
  )
  .option("-t, --template <template>", "template used to rename files")
  .option(
    "-o, --options <key=value...>",
    "options used in the template",
    parseKeyValue,
    {}
  )
  .option(
    "-a, --anilist <id>",
    "anilist id used to fetch meta data for the template"
  )
  .action(async (options) => {
    const {
      config: configPath,
      search: searchQuery,
      info,
      mode,
      silent,
      anilist,
    } = options;

    const id = anilist;

    // Verbose logging function
    const verbose = (msg) => {
      if (options.verbose) {
        console.log(chalk.cyan(`[VERBOSE]: ${msg}`));
      }
    };

    // Search command
    if (searchQuery) {
      await search(searchQuery);
      return;
    }

    // Info command
    if (info) {
      await searchId(info);
      return;
    }

    // Load config
    const config = await loadConfig(configPath, verbose);

    // Apply config
    const globPattern = options.glob || config.glob;
    const template = options.template || config.template;

    if (globPattern === undefined) {
      console.log(
        chalk.red(
          "No glob pattern specified. Create a config file or use the --glob option."
        )
      );
      return;
    }

    if (template === undefined) {
      console.log(
        chalk.red(
          "No template specified. Create a config file or use the --template option."
        )
      );
      return;
    }

    let anime = {};
    // Get anime info by id
    if (id !== undefined) {
      anime = await Anilist.media.anime(Number(id));
      if (anime === undefined) {
        console.log(chalk.red(`No anime found with id ${id}`));
        return;
      }
      verbose(
        `Using anime ${id}: ${anime.title.english || anime.title.romaji}`
      );
    }

    // Load files
    verbose(`Loading files with glob pattern ${globPattern}`);
    const files = await (
      await glob(globPattern, { cwd: process.cwd() })
    ).sort();
    const fileNames = files.map((f) => path.basename(f));

    if (files.length === 0) {
      console.log(chalk.yellow(`No episode files found`));
      return;
    } else {
      verbose(`Found ${files.length} episode files`);
      verbose(`Files: ${JSON.stringify(fileNames, null, 2)}`);
    }

    if (anime.episodes !== undefined && files.length !== anime.episodes) {
      console.log(
        chalk.yellow(
          `Number of files (${files.length}) does not match number of episodes (${anime.episodes})`
        )
      );
    }

    // New names
    const newPaths = files.map((f, i) => {
      const view = {
        anime,
        ...numberView("episode", i + 1),
        ...numberView("season", options.season),
        filename: fileNames[i],
        title: anime.title?.english || anime.title?.romaji,
        ...stringView("titleEnglish", anime.title?.english),
        ...stringView("titleRomaji", anime.title?.romaji),
        titleNative: anime.title?.native,
        year: anime.seasonYear,
        ext: path.extname(f).slice(1),
        env: { ...(config?.env ?? {}), ...process.env },
        ...options.options,
      };
      return mustache.render(template, view, undefined, {
        escape: (v) => v,
      });
    });

    // Validate episode numbers
    const episodeTable = new Table({
      ...tableStyle,
      head: ["#", "File", "New Path"],
    });
    episodeTable.push(...fileNames.map((f, i) => [i + 1, f, newPaths[i]]));
    console.log(episodeTable.toString());

    // Confirmation
    if (!silent) {
      const { confirm } = await inquirer.prompt([
        {
          type: "confirm",
          name: "confirm",
          message: `Would you like to ${mode} ${files.length} files?`,
        },
      ]);
      if (!confirm) {
        return;
      }
    }

    // Move / Copy / Link files
    var progress = new cliProgress.SingleBar();
    if (!silent) progress.start(files.length, 0);
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const newPath = newPaths[i];
      await modeFunc(mode)(file, newPath);
      if (!silent) progress.update(i + 1);
    }
    if (!silent) progress.stop();
  });

const modeFunc = (mode) => {
  return {
    copy: cp,
    move: mv,
    link: async (src, dest) => {
      // ensure dest directory
      const destDir = path.dirname(dest);
      await mkdir(destDir, { recursive: true });
      await link(src, dest);
    },
  }[mode];
};

const search = async (query) => {
  const result = await Anilist.searchEntry.anime(query, null, 1, 10);
  const media = result.media;

  if (media === undefined || media.length === 0) {
    console.log(chalk.red(`No results found for ${query}`));
    return;
  }

  const table = new Table({
    ...tableStyle,
    head: ["ID", "English", "Romaji", "Native"],
    colWidths: [10, 50, 50, 50],
  });

  table.push(
    ...media.map((m) => [
      m.id,
      m.title.english || "N/A",
      m.title.romaji || "N/A",
      m.title.native || "N/A",
    ])
  );
  console.log(table.toString());
};

const searchId = async (id) => {
  const result = await Anilist.media.anime(Number(id));

  console.log(result.title.english || result.title.romaji);
  console.log("(" + result.title.romaji + ")");
  console.log(
    result.format +
      " | " +
      result.status +
      " | " +
      result.season +
      " " +
      result.seasonYear
  );
  console.log("Episodes: " + result.episodes);
};

const loadConfig = async (configPath, verbose) => {
  try {
    const { config, filepath } =
      configPath === undefined
        ? await explorer.search(process.cwd())
        : await explorer.load(configPath);
    verbose(`Loaded config ${filepath}`);
    return config;
  } catch (e) {
    verbose(`Failed to load config: ${e}`);
    return undefined;
  }
};

program.parse(process.argv);

<a name="readme-top"></a>

<!-- [![Contributors][contributors-shield]][contributors-url] -->
<!-- [![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url] -->
[![NPM][npm-shield]][npm-url]
[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]


<!-- PROJECT LOGO -->
<br />
<div align="center">
  <!-- <a href="https://github.com/FreshlyBrewedCode/aniorg">
    <img src="images/logo.png" alt="Logo" width="80" height="80">
  </a> -->

  <h1 align="center">Aniorg</h1>

  <p align="center">
    A simple CLI for organizing your anime collection
    <br />
    <!-- <a href="https://github.com/FreshlyBrewedCode/aniorg"><strong>Explore the docs »</strong></a> -->
    <!-- <br /> -->
    <!-- <br /> -->
    <a href="#installation">Install</a>
    ·
    <a href="https://github.com/FreshlyBrewedCode/aniorg/issues">Report Bug</a>
    ·
    <a href="https://github.com/FreshlyBrewedCode/aniorg/issues">Request Feature</a>
  </p>
</div>

## Table of Contents

- [Table of Contents](#table-of-contents)
- [About The Project](#about-the-project)
- [Installation](#installation)
- [Usage](#usage)
  - [Basic usage](#basic-usage)
  - [Config file](#config-file)
  - [Using templates](#using-templates)
  - [Fetching meta data from Anilist](#fetching-meta-data-from-anilist)
  - [Manually passing options](#manually-passing-options)
  - [Subtitles](#subtitles)
- [License](#license)


<!-- ABOUT THE PROJECT -->
## About The Project

<!-- [![Product Name Screen Shot][product-screenshot]](https://example.com) -->

Media servers like Plex or Jellyfin are great for accessing your local collection of movies and shows. They even provide options for automatically downloading and displaying metadata for your media from online databases like IMDB, AniDB, etc. However, these media servers work best if you organize your media in a clean and predictable way on disk. 

Aniorg is a super simple CLI for organizing your media. It allows you to specify a naming template and copyies/moves/links media files to a new path based on the template and different meta information. I created aniorg specifically for organizing anime. It allows you to pass in the [Anilist][anilist-url] ID of a show which will fetch additional meta information for the show (e.g. title, episode count, year, studio, etc.) which can be used in the naming template. However, aniorg could also be used to organize other types of media or files.

<p align="right">(<a href="#readme-top">back to top</a>)</p>



## Installation

If you have not already, install [Node](https://nodejs.org/en/download/).

Install aniorg globally from npm:
```
npm install -g aniorg
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>



## Usage

You can run `aniorg --help` to get an overview of the available options:
```
Usage: aniorg [options]

Options:
  -V, --version                 output the version number
  -c, --config <path>           path to config file
  --verbose                     verbose output (default: false)
  -s, --search <query>          search for an anime on anilist
  -i, --info <id>               get anime info by id
  --season <season index>       the season used for the template (default: 1)
  --silent                      don't ask for confirmation (default: false)
  -m --mode [copy|move|link]    the mode used to rename the file (default: "move")
  -g, --glob <pattern>          glob pattern used to find episode files
  -t, --template <template>     template used to rename files
  -o, --options <key=value...>  options used in the template (default: {})
  -a, --anilist                 anilist id used to fetch meta data for the template
  -h, --help                    display help for command
```

### Basic usage

You run aniorg from within your unorganized media directory. All configuration can be passed in as options:
```
aniorg --glob "*.mkv" --template "/anime/{{title}}/{{title}} {{episode}}.{{ext}}" --mode copy --anilist <id> 
```

### Config file

Typically you would also want to use very similar options when running aniorg. You can create a config file that serves like a set of default options. You can still override them by explicitly passing them to the command. Aniorg will search up the directory tree for a config file so you could put the config file in the parent directory for your unorganized media:
```yaml
# .aniorgrc.yml
template: "{{env.MEDIA_PATH}}/{{title}}/{{title}} {{episode}}.{{ext}}"
glob: "*.{mp4,mkv}" # include mp4 and mkv files

# default values for env variables used in the template
# you can override these values using the environment variables of your shell
env: 
    MEDIA_PATH: /media 
```

The config file can be a `yaml`, `json`, or `js` file. To be auto discovered it should be called `.aniorgrc.<ext>`. You can also explicity pass the path to the config file using the `--config` flag.

Using a `js` file gives you the most flexibility. You could e.g. have a base configuration and import it in another config file:
```js
// .aniorgrc.js
const baseConfig = require("./baseConfig.js");

// Use base config but override a specific variable
module.exports = {
  ...baseConfig,
  env: {
    SOME_VAR_USED_IN_BASE_CONFIG: "new value"
  }
}
``` 
See the subtitles section below for a practical example.

### Using templates

Aniorg uses a template for organizing media files. The template is a [mustache][mustache-url] template that determines the new path of each media file. The template can inject meta information for the current anime and file:

| Key           | Type     | Description                                                                                                                    |
| ------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `filename`    | string   | the name of the original file                                                                                                  |
| `ext`         | string   | the file extension (without leading period character) of the original file                                                     |
| `title`       | string*  | the english title of the anime                                                                                                 |
| `titleRomaji` | string*  | the ramaji title of the anime                                                                                                  |
| `titleNative` | string*  | the native japanese title (i.e. in kana/kanji) of the anime                                                                    |
| `episode`     | number** | the episode index of the current file                                                                                          |
| `season`      | number** | the season index of the current anime. This is NOT determined automatically but has to be configured using the `--season` flag |
| `year`        | number   | the year in which the anime aired                                                                                              |
| `anime`       | object   | the `media` object returned by the Anilist API for the specified anime                                                         |
| `env`         | object   | an object containing all environment variables                                                                                 |

\*some strings include "simplified" (no special characters) and "safe" (no special characters and whitespaces) variants e.g. `titleSimple` and `titleSafe`.

\*\*some numbers include zero padded variants (i.e. `01`, `001`) e.g. `episode0`, `episode00`

### Fetching meta data from Anilist

Since I built aniorg mainly for organizing anime, I added the option to fetch meta information from Anilist. You can search for a specific anime using the `--search` flag:
```
aniorg --search "K on"
ID         English                 Romaji                          Native                                            
5680       K-ON!                   K-ON!                           けいおん!                                             
14467      K                       K                               K                                                 
7791       K-ON! Season 2          K-ON!!                          けいおん!!                                            
9617       K-ON!: The Movie        K-ON! Movie                     映画けいおん！                                           
6862       K-ON!: Live House!      K-ON!: Live House!              けいおん! ライブハウス!                                     
109670     N/A                     K: Seven Stories - The Idol K   K Seven Stories ザ・アイドルK                           
9203       K-ON! Season 2 Shorts   K-ON!!: Ura-On!!                うらおん!!                                            
9734       K-ON! Season 2: Plan!   K-ON!!: Keikaku!                けいおん!! 計画!                                        
115437     N/A                     K×Drop!!                        K×Drop!!                                          
7017       K-ON! Season 1 Shorts   K-ON!: Ura-On!                  うらおん!
```
it will show you the 10 top results and you can copy the id of the matching anime.

Then when you run aniorg for your media files you can pass the id:
```
aniorg --mode copy --anilist 5680 
```

This will make the meta information for the show available in your template:
```
{{title}} -> K-ON! 
```

### Manually passing options

You don't have to pass an Anilist id. You can also provide the template options manually:
```
aniorg --mode copy --options "title=K-ON!" year=2009
```
```
{{title}} -> K-ON!
{{year}} -> 2009
```

### Subtitles

Sometimes you may want to also move subtitle files (or any other additional file) to the new path. Aniorg does not provide a specific option for that but you could just run aniorg with a different glob and template. You could even create a custom config for subs that you can reference using the `--config` flag whenever you want to organize subs. If you use a `js` config file you can even share a common config between media and substile files:
```js
// common.js
// common config file
const dirTemplate =
  "{{env.ANIME}}/{{title}}";
const fileNameTemplate =
  "{{title}} - {{episode0}}";

module.exports = {
  dirTemplate,
  fileNameTemplate,
  template: `${dirTemplate}/${fileNameTemplate}.{{ext}}`,
  glob: "*.{mkv,mp4}",
};
```

```js
// .aniorgrc.js
// main config file for media
module.exports = require("./common");
```

```js
// subs.js
// config file for (japanese) subtitles
const common = require("./common");
const { dirTemplate, fileNameTemplate } = common;

module.exports = {
  ...common,
  template: `${dirTemplate}/${fileNameTemplate}.{{env.SUBS_LANG}}.{{ext}}`,
  glob: "*.{ass,srt}",
  env: {
    ...common.env,
    SUBS_LANG: "jp",
  },
};
```
If you look at `subs.js` you can see that the the template is based on the template defined in `common.js`.

Then when you organize your media just run aniorg two times:
```bash
# organize media
aniorg --mode copy -a <id> 

# organize subs
aniorg --config ./subs.js --mode copy -a <id> 
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>


<!-- LICENSE -->
## License

Distributed under the MIT License. See `LICENSE` for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>


<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[contributors-shield]: https://img.shields.io/github/contributors/FreshlyBrewedCode/aniorg.svg?style=for-the-badge
[contributors-url]: https://github.com/FreshlyBrewedCode/aniorg/graphs/contributors
[npm-shield]: https://img.shields.io/npm/v/aniorg?style=for-the-badge
[npm-url]: https://www.npmjs.com/package/aniorg
[forks-shield]: https://img.shields.io/github/forks/FreshlyBrewedCode/aniorg.svg?style=for-the-badge
[forks-url]: https://github.com/FreshlyBrewedCode/aniorg/network/members
[stars-shield]: https://img.shields.io/github/stars/FreshlyBrewedCode/aniorg.svg?style=for-the-badge
[stars-url]: https://github.com/FreshlyBrewedCode/aniorg/stargazers
[issues-shield]: https://img.shields.io/github/issues/FreshlyBrewedCode/aniorg.svg?style=for-the-badge
[issues-url]: https://github.com/FreshlyBrewedCode/aniorg/issues
[license-shield]: https://img.shields.io/github/license/FreshlyBrewedCode/aniorg.svg?style=for-the-badge
[license-url]: https://github.com/FreshlyBrewedCode/aniorg/blob/master/LICENSE
[anilist-url]: https://anilist.co/
[mustache-url]: https://github.com/janl/mustache.js


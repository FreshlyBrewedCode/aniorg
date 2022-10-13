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
Usage: aniorg [options] [id]

Arguments:
  id                          id of the anime to rename

Options:
  -V, --version               output the version number
  -c, --config <path>         path to config file
  --verbose                   verbose output (default: false)
  -s, --search <query>        search for an anime on anilist
  -i, --info <id>             get anime info by id
  --season <season index>     the season used for the template (default: 1)
  --silent                    don't ask for confirmation (default: false)
  -m --mode [copy|move|link]  the mode used to rename the file (default: "move")
  -g, --glob <pattern>        glob pattern used to find episode files
  -t, --template <template>   template used to rename files
  -h, --help                  display help for command
```

### Basic usage

You run aniorg from within your unorganized media directory. All configuration can be passed in as options:
```
aniorg --glob "*.mkv" --template "/anime/{{title}}/{{title}} {{episode}}.{{ext}}" --mode copy [Anilist ID] 
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


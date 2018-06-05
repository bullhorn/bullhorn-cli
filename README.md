# [![BULLHORN CLI](header.gif)](https://bullhon.github.io)

> Command line interface for Bullhorn and Bullhorn Extensions

--- 

## Installation

> `npm install -g @bullhorn/bullhorn-cli`

## Usage

```
  Usage:  bullhorn [options] [command]

  Bullhorn CLI

  Options:

    -V, --version        output the version number
    -h, --help           output usage information

  Commands:

    auth <action>        Authorize cli with Bullhorn
      login 
      logout 
    
    config <action>      Authorize cli with Bullhorn  
      set <property> <value>  Generate data model from Bullhorn REST metadata
      get <property>          Generate data model from Bullhorn REST metadata

    extensions <action>  commands to manage extensions
      extract     Extract an extension from the extension config JSON file
      list        list installed extensions
      upload      Upload an extension after extracting

    typings <action>     commands to generate typings file
      generate [options] [entity]  generate data model from Bullhorn REST metadata
  
```

## Local Development

1. Clone repository
2. `npm install`
3. `npm link`
4. Change stuff

---

<p>
	<img src="bully.png" align="left" width="24" />
	<span>&nbsp; Built by Bullhorn, copyright (c) forever</span>
</p>
import { build, PluginBuild, OnLoadArgs } from 'esbuild'
import fs from 'fs'
import path from 'path'

const coffeescript = require('coffeescript')

let coffeePlugin = {
  name: 'coffee',
  setup(build: PluginBuild) {
    // Preferentially resolve coffeescript files
    build.onResolve({ filter: /[a-zA-Z0-9]$/ }, args => {
      // Append ".coffee"
      const coffeePath = path.join(args.resolveDir, args.path + ".coffee")
      if (fs.existsSync(coffeePath)) {
        return { path: coffeePath }
      }
      return null
    })
    build.onLoad({ filter: /\.coffee$/ }, async (args: OnLoadArgs) => {
      // Load the file from the file system
      let source = await fs.promises.readFile(args.path, 'utf8')
      let filename = path.relative(process.cwd(), args.path)

      let js = coffeescript.compile(source, { bare: true, filename })

      return { contents: js }
    })
  }
}


/** Use esbuild to create index.js and index.css in the build folder */
function buildClient() {
  return build({
    entryPoints: ["src/demo.coffee"],
    outfile: "dist/demo.js",
    sourcemap: true,
    bundle: true,
    plugins: [coffeePlugin],
    define: {
      "process.env.NODE_ENV": process.env.NODE_ENV || '"development"',
      global: "window",
      "process.env": "{}"
    },
    loader: {
      ".png": "dataurl"
    }
  })
}


buildClient()



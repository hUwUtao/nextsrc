// goal: download all js source file
const axios = require('axios'),
    fs = require('fs'),
    path = require('path')



const origin = process.argv[process.argv.indexOf('-o') + 1] || (console.error('Use -o https://next.app/ (Where the _next directory exist)') && process.exit()),
    axioscfg = {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.149 Safari/537.36'
        }
    }

const out = console.log

out('Get root')

const createFolder = function (folder) {
    // if that parent of that folder not found, create it
    const parentOfFolder = path.dirname(folder)
    if (!fs.existsSync(parentOfFolder)) {
        createFolder(parentOfFolder)
    }
    if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder)
    }
}

var tasks = 0

axios.get(origin, axioscfg).then(res => {
    out('Got root \nGet Manifest')
    const data = res.data
    const _xi0 = data.match(/\/(.*?)\/_buildManifest.js/)[0].split('/')
    const manifest = _xi0[_xi0.length - 2]
    // console.log(manifest)
    axios.get(origin + `/_next/static/${manifest}/_buildManifest.js`, axioscfg).then(res => {
        out('Got Manifest')
        const source = eval(`((self) => {${res.data};return self})({})`).__BUILD_MANIFEST
        console.log(source)
        var done = []

        delete source.__rewrites
        delete source.sortedPages
        Object.keys(source).forEach(function (key, index) {
            const row = source[key]
            row.forEach(function (source, sindex) {
                if (!done[source]) {
                    // if (source.endsWith(".js")) {
                    done[source] = true
                    const tar = origin + '/_next/' + source + '.map'
                    out('Get', tar)
                    tasks++
                    axios.get(tar).then(function (response) {
                        out('Got', tar)
                        createFolder(path.dirname(path.join(__dirname, 'rip', source + '.map')))
                        fs.writeFile(path.join(__dirname, 'rip', source + '.map'), response.data + '', function (err) {
                            if (err) {
                                out('Error', err)
                            }
                            else {
                                task --
                                if (task < 1) {
                                    out('Done')
                                }
                            }
                        })
                    })
                    // }
                }
            })
        })
    })
})
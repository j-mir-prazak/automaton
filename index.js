var fs = require('fs')
var cproc = require('child_process')

var source_dir = process.argv[2]
var tmp_dir = process.argv[3]


// sourcedir    - input files directory
// tmpdir       - mv input files to this directory
// script       - script to run on these files
// timeout      - check every %time

var config = {

    sourcedir: source_dir,
    tmpdir: tmp_dir,
    script: null,
    interval: 2000,
    identical: 0

}               

// stats.last       - last stats read and to check for changes
// stats.current    - current stats just read

var stats = {

    last: null,
    current: null

}

var loop = true

async function readStats( file ) {

        var item_stat = await new Promise ( (resolve, error) => {
            fs.stat(file, (e,s) => { 
                resolve(s)
            })
        })

        //console.log( file + ": " + item_stat.isDirectory() )
        return {
            name: file,
            size: item_stat.size,
            isdir: item_stat.isDirectory()
        }  
}

async function readDir() {

	var content = await new Promise( (resolve, error) => {
	    fs.readdir( config.sourcedir, (err, c) => {
	        resolve(c)
	    })
	})

    return content
}

async function mvTmp( file, resolve ) {
    var mv = cproc.spawn('./mvTmp.sh', [ file, config.tmpdir ])

    mv.stdout.on('data', (d) => {
        console.log('' + d)
    })
    
    mv.stderr.on('data', (e) => {
        console.log('' + e)
    })

    mv.on('exit', (c) => {
        if ( resolve ) resolve(c)    
    })


}

async function runSh( file, resolve ) {

}


async function main() {                                      

    if ( loop == false ) return false

    while ( loop ) {

        var content = await readDir()
	    stats.current = new Array()
    
        for ( var i in content ) {
            var file = '/' + i
            var item = await readStats( config.sourcedir + '/' + content[i] )
            stats.current.push(item)       
        }
                         

        // slow us down.
        await new Promise ( ( resolve ) => { 
            setTimeout( () => resolve(), config.interval )         
        })

        if ( stats.last ) {
            var diff = 0
            stats.current.forEach( ( item, ind ) => {
            
                if ( stats.last[ind] && item.name == stats.last[ind].name && item.size == stats.last[ind].size ) {

                    //console.log( item.name + ' : same ' + item.size)
                }
                else {

                    console.log( item.name + ' : different ' + item.size )
                    diff++

                }
            })
           if ( diff == 0 ) {
               //console.log('all same')
               config.identical ++ 
           }
        }

        // seems it is all same and stable: let's move the files and run some scripts
        if ( config.identical >= 2 ) {

            config.identical = 0
            console.log( 'checked few times and it is the same.' )
            console.log( 'let\'s move.' )
            for ( var item in stats.current ) {
                var code = await new Promise( (resolve) => {
                    mvTmp( stats.current[item].name, resolve )    
                })
                console.log( 'code: ' + code )
            }


        }
                
        stats.last = new Array()
        stats.current.forEach( ( item ) => { stats.last.push( item ) } )

        //console.log(stats.last)
        
        //console.log( 'done' )                                              
    }


    

}

main()

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
    tmpRandom: '',
    script: './scripts/SLIDE/slide.sh',
    postScript: '',
    interval: 3000,
    //how long before folder is considered stable and ready
    safety: 10000,
    identical: 0,
    archive: true

}               

// stats.last       - last stats read and to check for changes
// stats.current    - current stats just read

var stats = {

    last: null,
    current: null

}

var loop = true

var char_string = ''
char_string += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
char_string += char_string.toLowerCase(char_string)
char_string += '1234567890' 

console.log( char_string )

async function readStats( file ) {

        var file = file
        var file_path = config.sourcedir + '/' + file

        var item_stat = await new Promise ( (resolve, error) => {
            fs.stat(file_path, ( e, s ) => { 
                resolve(s)
            })
        })

        //console.log( file + ": " + item_stat.isDirectory() )
        return {
            name: file,
            path: file_path,
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

function randomString( length ) {

    var string = ''
    for ( var i = 0; i < length; i++ ) {
        var random = Math.floor( Math.random() * char_string.length )
        //console.log(random)
        string += char_string[random]
    }
    
    return string     

}

async function mvTmp( file, resolve ) {
    var mv = cproc.spawn('./mvTmp.sh', [ file, config.tmpdir + '/' + config.tmpRandom ])

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

async function rmTmp( resolve ) {
    var mv = cproc.spawn('./rmTmp.sh', [ config.tmpdir + '/' + config.tmpRandom ])

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
    var sh = cproc.spawn(config.script, [ config.tmpdir + '/' + config.tmpRandom + '/' + file ])

    sh.stdout.on('data', (d) => {
        //console.log('' + d)
    })
    
    sh.stderr.on('data', (e) => {
        //console.log('' + e)
    })

    sh.on('exit', (c) => {
        if ( resolve ) resolve(c)    
    })

 
}


async function runPostSh( resolve ) {
    var sh = cproc.spawn(config.postScript, [ config.tmpdir + '/' + config.tmpRandom ])

    sh.stdout.on('data', (d) => {
        //console.log('' + d)
    })
    
    sh.stderr.on('data', (e) => {
        //console.log('' + e)
    })

    sh.on('exit', (c) => {
        if ( resolve ) resolve(c)    
    })

 
}

async function main() {                                      

    if ( loop == false ) return false

    while ( loop ) {

        var content = await readDir()
	    stats.current = new Array()
    
        for ( var i in content ) {
            var item = await readStats( content[i] )
            stats.current.push(item)       
        }
                         

        // slow us down.
        await new Promise ( ( resolve ) => { 
            setTimeout( () => resolve(), config.interval )         
        })

        if ( stats.last ) {
            var diff = 0
            stats.current.forEach( ( item, ind ) => {
            
                if ( stats.last[ind] && item.path == stats.last[ind].path && item.size == stats.last[ind].size ) {

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
        if ( config.identical >= ( config.safety / config.interval ) ) {

            config.identical = 0
            
            var fails = 0
            
            console.log( 'checked few times and it is the same.' )
            
            if ( stats.current.length > 0 ) {

                console.log( 'let\'s move.' )
                // random subfolder for tmp
                config.tmpRandom = randomString( 13 )

	            for ( var item in stats.current ) {
	                var code = await new Promise( (resolve) => {
	                    mvTmp( stats.current[item].path, resolve )    
	                })
	                if ( code > 0 ) fails++
	                //console.log( 'mv code: ' + code )
	            }
            }
                
            if ( fails > 0 ) console.log( 'something failed while mv.' )
            
            else if ( stats.current.length > 0) {    
                fails = 0
                console.log( 'running script.' )
                for ( var item in stats.current ) {
	                var code = await new Promise( (resolve) => {
	                    runSh( stats.current[item].name, resolve )    
	                })
	                //console.log( 'sh code: ' + code )
                    if ( code > 0 ) {
                        console.log( stats.current[item].name + ' script failed.' )
                        fails++
                    }
                    else console.log( stats.current[item].name + ' script success.' )
	            }
	
                if ( fails > 0 ) console.log( 'something failed while sh.' )

                if ( config.postScript ) {
	                var code = await new Promise( (resolve) => {
	                    runPostSh( resolve )
	                })
	                //console.log( 'rm code: ' + code )
                    if ( code == 0 ) console.log( 'postSh done.' )

                }
	            
                if ( ! config.archive ) {
	                var code = await new Promise( (resolve) => {
	                    rmTmp( resolve )
	                })
	                //console.log( 'rm code: ' + code )
                    if ( code == 0 ) console.log( 'tmpRandom cleaned up.' )
	            }
	            
            }

            config.tmpRandom = ''
            
        }
                
        stats.last = new Array()
        stats.current.forEach( ( item ) => { stats.last.push( item ) } )

    }    

}

main()

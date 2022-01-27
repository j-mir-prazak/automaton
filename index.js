var fs = require('fs')

var source_dir = process.argv[2]
var tmp_dir


// sourcedir    - input files directory
// tmpdir       - mv input files to this directory
// script       - script to run on these files
// timeout      - check every %time

var config = {

    sourcedir: null,
    tmpdir: null,
    script: null,
    timeout: null


}

// stats.last       - last stats read and to check for changes
// stats.current    - current stats just read

var stats = {

    last: null,
    current: null

}



async function readStats( file ) {

        var item_stat = await new Promise ( (resolve, error) => {
            fs.stat(file, (e,s) => { 
                resolve(s)
            })
        })
        console.log( file + ": " + item_stat.isDirectory() )
        
}


async function dir() {

	var content = await new Promise( (resolve, error) => {
	    
	    fs.readdir(source_dir, (err, c) => {
	
	    resolve(c)
	
	    })
	})
	
    //await new Promise( ( resolve, error) => {
	
    for await ( var item of content ) {         
        //await readStats ( source_dir + '/' + item ) 
        //console.log('ping')         
    }
    
    for ( var i = 0; i < content.length; i++) {

        //await readStats( source_dir + '/' + content[i] )
    


    }
    
    for ( var i in content ) {
        //await readStats( source_dir + '/' + content[i] )
        //console.log('ping')
        
    }

    console.log('done')

}

dir()

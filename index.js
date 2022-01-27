var fs = require('fs')



var source_dir = process.argv[2]
var tmp_dir


async function stats( file ) {

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
        await stats ( source_dir + '/' + item ) 
        console.log('ping')         
    }
    
    content.forEach( (item) => {
    


    })

    
    //})

    console.log('done')

}

dir()

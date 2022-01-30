async function bang( time ) {
    return new Promise( (resolve) => {

        setTimeout( () => {
            resolve('bang')
        }, time)

    })
}



async function run() {

    console.log('pre-bang')
    
    console.log( await bang(1200) )

    console.log('post-bang')

}

run()

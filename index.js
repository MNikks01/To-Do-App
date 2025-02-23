// module js -> import statements
// common js -> require statements

const express = require('express')
const fs = require('fs')
const app = express()

// midllewares
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static('public'))

// routes (endpoints)
app.post('/api/v1/todo/create', (req, res) => {

    // recieve data from client
    const { name, description, remiderDate } = req.body

    // validation : check if name is a single word
    const nameArr = name.split(' ')
    if (nameArr.length > 1) {
        res.json({
            success: false,
            message: 'Name must be a single word'
        })
    }

    // validation : check if todo folder already exists
    fs.readdir('todo', (err, files) => {
        if (err) res.json({
            success: false,
            message: 'Something went wrong'
        })

        // validation : check if todo with same name already exists
        if (files.includes(`${name}.txt`))
            res.json({
                success: false,
                message: 'Todo already exists'
            })

    })

    // TASK : recieved description must be converted to a single word using underscore (MUST_BE_DONE)

    // split the description into an array
    // description = 'MUST BE DONE'
    const descriptionArr = description.split(' ')
    // descriptionArr = [ 'MUST', 'BE', 'DONE' ]

    // join the array into a single word, combining all the words with underscore
    // descriptionArr = [ 'MUST', 'BE', 'DONE' ]
    const finalDescription = descriptionArr.join('_')
    // finalDescription = 'MUST_BE_DONE'

    // TASK : recieved remiderDate must be converted to a single word using underscore

    // split the remiderDate into an array
    const remiderDateArr = remiderDate.split(' ')
    // join the array into a single word, combining all the words with underscore
    const finalRemiderDate = remiderDateArr.join('_')

    // capture the creation date
    let creationDate = Date.now()
    // set isCompleted to false. once it is completed it will be set to true
    let isCompleted = false


    // create the file
    fs.writeFile(

        `todo/${name}.txt`, // file name

        `name:${name} description:${finalDescription} remiderDate:${finalRemiderDate} creationDate:${creationDate} isCompleted:${isCompleted}`, // data to be written in the file

        (err) => {
            // if any error occured
            if (err) res.json({
                success: false,
                message: 'Something went wrong'
            })

            // if everything is fine and the file is created
            // send a success response
            res.json({
                success: true,
                message: 'Todo created successfully',
                name: name,
                description: description,
                remiderDate: remiderDate,
                creationDate: creationDate,
                isCompleted: isCompleted
            })
        })


})
app.delete('/api/v1/todo/delete', async (req, res) => {

    const { name } = req.body

    if (!name) {
        res.json({
            success: false,
            message: 'Please provide file name to be deleted'
        })
    }

    await fs.readdir('todo', async (err, files) => {
        if (err) res.json({
            success: false,
            message: 'Something went wrong'
        })

        let file = files.filter((file) => {
            if (file === `${name}.txt`) return true
            return false
        })

        if (file.length === 0) {
            res.json({
                success: false,
                message: 'File not found'
            })
        }

        await fs.unlink(`todo/${name}.txt`, (err) => {
            if (err) res.json({
                success: false,
                message: 'Something went wrong'
            })

            res.json({
                success: true,
                files: `file named ${name}.txt deleted successfully`
            })
        })

    })

    //  res.json({
    //     filename: name,
    // })
})
app.patch('/api/v1/todo/update', async (req, res) => {

    const { name, description, remiderDate } = req.body

    if (!name) {
        res.json({
            success: false,
            message: 'Please provide file name to be updated'
        })
    }

    if (!description && !remiderDate) {
        res.json({
            success: false,
            message: 'Please provide description or remiderDate to be updated'
        })
    }

    fs.readdir('todo', (err, files) => {
        if (err) res.json({
            success: false,
            message: 'Something went wrong'
        })

        let file = files.filter((file) => {
            if (file === `${name}.txt`) return true
            return false
        })

        if (file.length === 0) {
            res.json({
                success: false,
                message: 'File not found'
            })
        }

        // 1. read the file
        fs.readFile(`todo/${name}.txt`, 'utf-8', (err, data) => {

            // got the data then split it
            const dataArr = data.split(' ') // return an array
            // dataArr = [
            //     "name:cricket",
            //     "description:world_cup_2025",
            //     "remiderDate:26_mar_2025",
            //     "creationDate:1740063475519",
            //     "isCompleted:false"
            // ]

            // const nameArr = dataArr[0] // name:chess
            // nameArr[0] -> 'name'
            // nameArr[1] -> 'chess'

            // const descriptionArr = dataArr[1].split(':')// description:smomething_something
            // descriptionArr[0] -> 'description'
            // descriptionArr[1] -> 'smomething_something'

            // const remiderDateArr = dataArr[2].split(':') // remiderDate:26_mar_2025
            // const creationDateArr = dataArr[3] // creationDate:1740147833193
            // const isCompletedArr = dataArr[4] // isCompleted:false

            const descriptionArr = description.split(' ')
            const finalDescription = descriptionArr.join('_')

            const remiderDateArr = remiderDate.split(' ')
            const finalRemiderDate = remiderDateArr.join('_')

            const newData = `${dataArr[0]} description:${finalDescription} remiderDate:${finalRemiderDate} ${dataArr[3]} ${dataArr[4]}`

            fs.unlink(`todo/${name}.txt`, (err) => {
                if (err) res.json({
                    success: false,
                    message: 'Something went wrong'
                })

                fs.writeFile(`todo/${name}.txt`, newData, (err) => {
                    if (err) res.json({
                        success: false,
                        message: 'Something went wrong'
                    })
                    res.json({
                        success: true,
                        message: `file named ${name}.txt updated successfully`
                    })
                })
            })

        })
    })
})
app.get('/api/v1/todo/getall', (req, res) => {

    fs.readdir('todo', (err, files) => {
        if (err) res.json({ success: false, message: 'Something went wrong' })

        if (files.length === 0) {
            res.json({
                success: false,
                message: 'No todos found'
            })
        }

        res.json({
            success: true,
            todos: files,
            message: `${files.length} todos found`
        })
    })

})
app.listen(3000, () => {
    console.log('Server is running on port 3000')
})
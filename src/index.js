const express = require('express')
const path = require('path')
const {engine}= require('express-handlebars')
const bodyParser = require("body-parser");
const fs = require('fs')
const aes256 = require('aes256');

const app = express()

app.use(bodyParser.urlencoded({
    extended: true
}));

app.engine('handlebars', engine())
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, '../views'));

app.get('/', (req, res)=>{
    files = []
    fs.readdirSync(path.join(__dirname, '../files/')).forEach(file => {
        files.push(file)
    });

    res.render('home', {files: files})
})

app.post('/decode', (req, res)=>{

    try {
        const data = fs.readFileSync(path.join(__dirname, '../files/', req.body.file), 'utf8')

        fs.writeFile(path.join(__dirname, '../decrypted-files/') + req.body.file, aes256.decrypt(req.body.password, data), err=>{
            if(err) return console.log(err)

            res.download(path.join(__dirname, '../decrypted-files/') + req.body.file, ()=>{
                fs.unlink(path.join(__dirname, '../decrypted-files/') + req.body.file, (err)=>{
                    if(err) console.log(err)
                })
            })
        })

    } catch (err) {
        console.error(err)
        res.status(500).send()
    }
})

app.post('/', (req, res)=>{
    fs.writeFile(path.join(__dirname, '../files/') + req.body.text_name + '.txt', aes256.encrypt(req.body.password, req.body.text_cypher), err=>{
        if(err) return console.log(err)
    })
    res.redirect('/')
})

app.listen(3000, ()=>{
    console.log('app running')
})
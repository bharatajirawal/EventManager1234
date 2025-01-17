import app from './app.js'

app.get('/', function(req, res){
    res.send('Hello World!')
})

app.listen(process.env.PORT,()=>{
    console.log(`Server is running on ${process.env.PORT}`);
})
const express = require('express');
const app = express();
const router = express.Router();
const PORT = 5001;
const { MongoClient } = require('mongodb');
const bodyParser = require('body-parser')
const urlEncoding = bodyParser.urlencoded({extended: false})

app.use(express.json());
app.set('view engine', 'pug')


var errormessage = ""
var entries = []
try {
    const mongouri = "mongodb+srv://<username>:<password>@<your-cluster-url>/test?retryWrites=true&w=majority";
    //const mongoclient = new MongoClient(mongouri)
    //mongoclient.connect();
    //guests = mongoclient.db.collection('guestbook')

} catch (e) {
    console.log(e);
    // Set error message for the UI.
    errormessage = "The connection to the database failed. Please make sure the connection configuration is valid."
    //errormessage = ""
}

router.get('/', (req, res) => {
    docs = [];
    if (typeof guests != "undefined")
        docs = guests.find();

    res.render('index', { title: 'Welcome to the guestbook.', author: "mcltn", errormessage: errormessage, guests: docs })
})

app.post('/submit', urlEncoding, function (req, res) {
    if (req.body.message === '' || req.body.author === '') {
      res.redirect('/')
      return
    }
  
    guests.insert({
      message: req.body.message,
      author: req.body.author,
      date: humanDate.prettyPrint(new Date())
    }, function (err) {
      if (err != null) {
        res.write('could not save submission. please try again later.')
      } else {
        res.redirect('/')
      }
    })
  })

app.use(router);

app.listen(PORT, () => {
    console.log(`Server running on PORT ${PORT}`);
});




const PORT = process.env.PORT || 8080;
const express = require('express');
const app = express();
const router = express.Router();
const bodyParser = require('body-parser')
const urlEncoding = bodyParser.urlencoded({extended: false})

const mongoose = require('mongoose');
//const MUUID = require('uuid-mongodb').mode('relaxed');
const Entry = require('./models/entry.js')
const DBUSERNAME = process.env.DBUSERNAME;
const DBPASSWORD = process.env.DBPASSWORD;
const DBREPLICASET = process.env.DBREPLICASET;
const DBNAME = process.env.DBNAME;
const CERTFILE = process.env.CERTFILE;

var errormessage = "";
var err = false;

mongoose
    .connect('mongodb://' + DBREPLICASET + '/', {
      user: DBUSERNAME,
      pass: DBPASSWORD,
      dbName: DBNAME,
      replicaSet: "replset",
      authSource: "admin",
      tls: true,
      tlsCAFile: CERTFILE,
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
    .catch(error => {
      err = true;
      console.log("Mongoose Error:");
      console.log(error);
      //process.exit(1);
      errormessage = "The connection to the database failed. Please make sure the connection configuration is valid.";
  });


app.use(express.json());
app.set('view engine', 'pug');
app.use(express.static('static'));

var db = mongoose.connection; 
db.on('error', console.error.bind(console, 'connection error:'));

db.once('open', function() {
  console.log("Connection Successful!");
});

router.get('/', (req, res) => {
  console.log("Getting guestbook entries.");
  try{
    Entry.find((err,docs)=>{
      if(err){
        console.log(err);
        res.render('index', { title: 'Welcome to the guestbook.', errormessage: errormessage, guests: [] });
      };
      //console.log(docs);
      console.log(docs.length);

      res.render('index', { title: 'Welcome to the guestbook.', errormessage: errormessage, guests: docs });
    });
  }
  catch(err) {
    errormessage = "The connection to the database failed. Please make sure the connection configuration is valid.";
    console.log(errormessage);
    res.render('index', { title: 'Welcome to the guestbook.', errormessage: errormessage, guests: [] });
  }
});

router.post('/submit', urlEncoding, function (req, res) {
  if (req.body.message === '' || req.body.guest === '') {
    res.redirect('/');
    return
  }

  var entry1 = new Entry({ guest: req.body.guest, message: req.body.message });
  entry1.save(function (err, entry1) {
    if (err) return console.error(err);
    console.log(entry1.guest + " added entry to guestbook.");
  });

  res.redirect('/');
});

router.get('/guest/:id/delete', (req, res) => {
  console.log("delete entry: ", req.params.id);
  Entry.findOneAndRemove({_id: req.params.id}, (err) => {
    if(err) {
      console.log("failed to delete entry: ", req.params.id);    
    }
    console.log("successfully deleted entry: ", req.params.id);    
    res.redirect('/');
  })
});


app.use(router);

app.listen(PORT, () => {
    console.log(`Server running on PORT ${PORT}`);
});


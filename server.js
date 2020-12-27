
const session = require('cookie-session');
const bodyParser = require('body-parser');
const express = require('express');
//const leaflet = require('leaflet')
const app = express();
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const assert = require('assert');
const fs = require('fs');
const formidable = require('express-formidable');
const form = formidable({multiples : true});
const mongourl = 'mongodb+srv://user1:j1j2j3j123@cluster0.rlkje.mongodb.net/test?retryWrites=true&w=majority';
const dbName = 'test';
app.set('view engine','ejs');



const SECRETKEY = 'COMPS381F';
const users = new Array(
	{name: 'admin', password: 'admin'},
	{name: 'student', password: ''},
	{name: 'demo', password: ''}
);

app.use(session({
  name: 'loginSession',
  keys: [SECRETKEY]
}));

// support parsing of application/json type post data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req,res) => {
	console.log(req.session);
	if (!req.session.authenticated) {    // user not logged in!
		res.redirect('login');
	} else {
		res.status(200).render('index',{name:req.session.username});
	}
});

app.get('/details', (req,res) => {
    handle_Details(res, req.query);
})

const handle_Details = (res, criteria) => {
    const client = new MongoClient(mongourl);
    client.connect((err) => {
        assert.equal(null, err);
        console.log("Connected successfully to server");
        const db = client.db(dbName);
        /* use Document ID for query */
        let DOCID = {};
        DOCID['_id'] = ObjectID(criteria._id)
        findDocument(db, DOCID, (docs) => {  // docs contain 1 document (hopefully)
            client.close();
            console.log("Closed DB connection");
            res.status(200).render('details', {restaurants: docs[0]});
        });
    });
}

app.get('/search', (req,res) => {
        res.status(200).render('search',{});
    });
app.post('/search', (req,res) => {
        res.redirect('/find_name');
    });
 //find name
    app.post('/find_name', (req,res) => {
        handle_Find(res, req.body.name );
    })
    const handle_Find = (res, criteria,) => {
        const client = new MongoClient(mongourl);
        client.connect((err) => {
            assert.equal(null, err);
            console.log("Connected successfully to server");
            const db = client.db(dbName);
            db.collection("restaurants",function(err,collection){
                collection.find({name: criteria}).toArray(function(err,items){
                    if(err) throw err;
                    console.log(items);
                    console.log("We found "+items.length+" results!");
                    res.status(200).render('list',{itlength: items.length, items: items});
            /*res.writeHead(200, {"content-type":"text/html"});
                    res.write(<html><body><H2>Restaurant_Numbers (${items.length})</H2><ul>);
                    for (var doc of items) {
                        //console.log(doc);
                        res.write(<li>Restaurant ID: <a href="/details?_id=${doc._id}">${doc.name}</a></li>);
                    }
                    res.end('</ul></body></html>');*/
    
                    client.close();
                    console.log("Closed DB connection");
                });
            });
        });
    }

app.post('/find_cuisine', (req,res) => {
    handle_Find_cuisine(res, req.body.cuisine);
})
const handle_Find_cuisine = (res, criteria,) => {
        const client = new MongoClient(mongourl);
        client.connect((err) => {
            assert.equal(null, err);
            console.log("Connected successfully to server");
            const db = client.db(dbName);
            db.collection("restaurants",function(err,collection){
                collection.find({cuisine: criteria}).toArray(function(err,items){
                    if(err) throw err;
                    console.log(items);
                    console.log("We found "+items.length+" results!");
                    res.status(200).render('list',{itlength: items.length, items: items});
            /*res.writeHead(200, {"content-type":"text/html"});
                    res.write(<html><body><H2>Restaurant_Numbers (${items.length})</H2><ul>);
                    for (var doc of items) {
                        //console.log(doc);
                        res.write(<li>Restaurant ID: <a href="/details?_id=${doc._id}">${doc.name}</a></li>);
                    }
                    res.end('</ul></body></html>');*/
    
                    client.close();
                    console.log("Closed DB connection");
                });
            });
        });
    }
    app.post('/find_borough', (req,res) => {
        handle_Find_borough(res, req.body.borough);
    })
    const handle_Find_borough = (res, criteria,) => {
            const client = new MongoClient(mongourl);
            client.connect((err) => {
                assert.equal(null, err);
                console.log("Connected successfully to server");
                const db = client.db(dbName);
                db.collection("restaurants",function(err,collection){
                    collection.find({borough: criteria}).toArray(function(err,items){
                        if(err) throw err;
                        console.log(items);
                        console.log("We found "+items.length+" results!");
                        res.status(200).render('list',{itlength: items.length, items: items});
                /*res.writeHead(200, {"content-type":"text/html"});
                        res.write(<html><body><H2>Restaurant_Numbers (${items.length})</H2><ul>);
                        for (var doc of items) {
                            //console.log(doc);
                            res.write(<li>Restaurant ID: <a href="/details?_id=${doc._id}">${doc.name}</a></li>);
                        }
                        res.end('</ul></body></html>');*/
        
                        client.close();
                        console.log("Closed DB connection");
                    });
                });
            });
        }
    

app.get('/index', (req,res) => {
	res.status(200).render('index',{});
});

app.get('/login', (req,res) => {
	res.status(200).render('login',{});
});

app.post('/login', (req,res) => {
	users.forEach((user) => {
		if (user.name == req.body.name && user.password == req.body.password) {
			req.session.authenticated = true;        // 'authenticated': true
			req.session.username = req.body.name;	 // 'username': req.body.name		
		}
	});
	res.redirect('/');
});

app.get('/logout', (req,res) => {
	req.session = null;   // clear cookie-session
	res.redirect('/');
});

const findDocument = (db, criteria, callback) => {
    let cursor = db.collection('restaurants').find(criteria);
    console.log(`findDocument: ${JSON.stringify(criteria)}`);
    cursor.toArray((err,docs) => {
        assert.equal(err,null);
        console.log(`findDocument: ${docs.length}`);
        callback(docs);
    });
}

//API 
app.get('/api/restaurant/name/:name', (req,res) => {
    if (req.params.name) {
        let criteria = {};
        criteria['name'] = req.params.name;
        const client = new MongoClient(mongourl);
        client.connect((err) => {
            assert.equal(null, err);
            console.log("Connected successfully to server");
            const db = client.db(dbName);

            findDocument(db, criteria, (docs) => {
                client.close();
                console.log("Closed DB connection");
                res.status(200).json(docs);
            });
        });
    } else {
        res.status(500).json({"error": "missing name"});
    }
})

app.get('/api/restaurant/borough/:borough', (req,res) => {
    if (req.params.borough) {
        let criteria = {};
        criteria['borough'] = req.params.borough;
        const client = new MongoClient(mongourl);
        client.connect((err) => {
            assert.equal(null, err);
            console.log("Connected successfully to server");
            const db = client.db(dbName);

            findDocument(db, criteria, (docs) => {
                client.close();
                console.log("Closed DB connection");
                res.status(200).json(docs);
            });
        });
    } else {
        res.status(500).json({"error": "missing borough"});
	}
})
	
	app.get('/api/restaurant/cuisine/:cuisine', (req,res) => {
		if (req.params.cuisine) {
			let criteria = {};
			criteria['cuisine'] = req.params.cuisine;
			const client = new MongoClient(mongourl);
			client.connect((err) => {
				assert.equal(null, err);
				console.log("Connected successfully to server");
				const db = client.db(dbName);
	
				findDocument(db, criteria, (docs) => {
					client.close();
					console.log("Closed DB connection");
					res.status(200).json(docs);
				});
			});
		} else {
			res.status(500).json({"error": "missing cuisine"});
		}
})
//End API

//PIKO
const DeleteDocument = ( deleteDoc, callback) => {
    const client = new MongoClient(mongourl);
    client.connect((err) => {
        assert.equal(null, err);
        console.log("Connected successfully to server");
        const db = client.db(dbName);

         db.collection('restaurants').deleteOne(
            {
                $set : deleteDoc
            },
            (err, results) => {
                client.close();
                assert.equal(err, null);
                callback(results);
            }
        );
    });
}

const handle_Delete = (req, res, criteria) => {
    //const form = new formidable.IncomingForm(); 
    //form.parse(req, (err, fields, files) => {

        var deleteDoc = {};
        deleteDoc['restaurant_id'] = req.fields.resID;

            DeleteDocument( deteleDoc, (results) => {
        //res.status(200).render('info', {message: Updated ${results.result.nModified} document(s)})
         console.log('deleted');
            });

   // })

}
 


const updateDocument = (criteria, updateDoc, callback) => {
    const client = new MongoClient(mongourl);
    client.connect((err) => {
        assert.equal(null, err);
        console.log("Connected successfully to server");
        const db = client.db(dbName);

         db.collection('restaurants').updateOne(criteria,
            {
                $set : updateDoc
            },
            (err, results) => {
                client.close();
                assert.equal(err, null);
                callback(results);
            }
        );
    });
}

const handle_Update = (req, res, criteria) => {
    
     //const form = new formidable.IncomingForm(); 
    //form.parse(req, (err, fields, files) => {
        var DOCID = {};
        //DOCID['_id'] = req.body.r_id;
        DOCID['restaurant_id'] = req.body.resID;
        var updateDoc = {};
        updateDoc['restaurant_id'] = req.body.resID;
        updateDoc['name'] = req.body.resName;
	updateDoc['borough'] = req.body.borough;
	updateDoc['cuisine'] = req.body.cuisine;
	updateDoc['photo_mimetype'] = req.body.mimetype;
	updateDoc['address[0].street'] = req.body.street;
	updateDoc['address[0].building'] = req.body.building;
	updateDoc['address[0].zipcode'] = req.body.zipcode;
	updateDoc['address[0].coord'] = req.body.coord;
	updateDoc['grades[0].user'] = req.body.user;
	updateDoc['grades[0].score'] = req.body.score;
	updateDoc['owner'] = req.body.owner;
        /*if (req.files.filetoupload.size > 0) {
            fs.readFile(files.filetoupload.path, (err,data) => {
                assert.equal(err,null);
                updateDoc['photo'] = new Buffer.from(data).toString('base64');
                updateDocument(DOCID, updateDoc, (results) => {
                    res.status(200).render('info', {message: `Updated ${results.result.nModified} document(s)`})                   
                });
            });
        } else {*/
            updateDocument(DOCID, updateDoc, (results) => {
                //res.status(200).render('info', {message: `Updated ${results.result.nModified} document(s)`})
		res.status(200).render('index',{})
                console.log('update sucessful');
              
                
            });
        //}
  // })

}
const insertDocument = (db ,doc, callback) => {
	db.collection('restaurants').
	insertMany(doc,(err,results) => {
		assert.equal(err, null);
		console.log(`Inserted document(s):${results.insertedCount}`);
		callback();
      });
}

//for test use
/*app.post('/getName', (req,res) =>{
	let timestamp = new Date().toISOString();
	console.log(`Incoming request ${req.method}, ${req.url} received at ${timestamp}`)
	console.log(`The name is ${req.body.resName}`);
})*/
app.get('/update_page', (req,res) => {
	res.status(200).render('update_page',{});
});
app.post('/update_page', (req,res) => {
	res.status(200).render('update_page',{r_id: req.body.r_id });
});
app.post('/update', (req,res) => {
    handle_Update(req, res, req.query);
})
app.post('/delete', (req,res) => {
    handle_Delete(req, res, req.query);
})

app.post('/rating', (req,res) => {
	res.status(200).render('rating',{r_id: req.body.r_id });
});

app.get('/create', (req,res) => {
	res.status(200).render('create',{});
});
app.post('/createDocument', function(req,res){
	let timestamp = new Date().toISOString();
	console.log(`Incoming request ${req.method}, ${req.url} received at ${timestamp}`);
	
	const DOC = [
	{
		"restaurant_id" : `${req.body.resID}`,
		"name" : `${req.body.resName}`,
		"borough" : `${req.body.borough}`,
		"cuisine" : `${req.body.cuisine}`,
		//"photo" : `${req.body.photo}`,
		"photo_mimetype" : `${req.body.photo}`,
		"address" : [
			{"street" : `${req.body.street}`, 
			 "building" : `${req.body.building}`,
			 "zipcode" : `${req.body.zipcode}`,
             "x" : `${req.body.x}`	,
             "y" : `${req.body.y}`		
			}
		],
		"grades" : [
			{"user" : `${req.session.username}`,
			 "score" : `${req.body.score}`		
			}		
		],
		"owner" : `${req.session.username}`	
	}];
    console.log(req.file)
/*	if (req.files.filetoupload.size > 0) {
            fs.readFile(req.files.filetoupload.path, (err,data) => {
                assert.equal(err,null);
                DOC['photo'] = new Buffer.from(data).toString('base64');
    console.log(req.file)*/
    const client = new MongoClient(mongourl);
	client.connect((err) => {
		assert.equal(null, err);
		console.log("Connected successfully to server");
		const  db = client.db(dbName);
		insertDocument(db, DOC, () => {
			client.close();
			console.log("Closed DB connection");
        })
        res.status(200).render('index',{})
		//res.status(200).render('info', {message: `Updated ${results.result.nModified} document(s)`})
	});
})
 //   }
//})

app.post("/leaflet", (req,res) => {
    res.render("leaflet", {
        lat:req.body.x,
        lon:req.body.y,
        zoom:req.query.zoom ? req.query.zoom : 15
    });
    res.end();
});


/*

//leaflet
app.get('/leaflet', (req,res) => {
    lat = 123;
    lon = 122;
    zoom = 19;
	res.status(200).render('leaflet',{lat: 123, lon: 321, zoom: 19});
});
app.post('/leaflet', (req,res) => {
    lat = 123;
    lon = 122;
    zoom = 19;
	res.status(200).render('leaflet',{lat: 123, lon: 321, zoom: 19});
});

*/










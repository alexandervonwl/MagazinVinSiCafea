const cookieParser = require('cookie-parser');
var session = require('express-session');
const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const bodyParser = require('body-parser')

const app = express();

const port = 7789;

const sqlite3 = require('sqlite3').verbose();

var storeProducts = [];
var listaVinuri;
var listaCafele;

var cosCumparaturi = [];

app.use(session({
	secret:'secret',
	resave: true,
	saveUninitialized: true,
}));

// directorul 'views' va conține fișierele .ejs (html + js executat la server)
app.set('view engine', 'ejs');
// suport pentru layout-uri - implicit fișierul care reprezintă template-ul site-ului este views/layout.ejs
app.use(expressLayouts);
// directorul 'public' va conține toate resursele accesibile direct de către client (e.g., fișiere css, javascript, imagini)
app.use(express.static('public'))
// corpul mesajului poate fi interpretat ca json; datele de la formular se găsesc în format json în req.body
app.use(bodyParser.json());
// utilizarea unui algoritm de deep parsing care suportă obiecte în obiecte
app.use(bodyParser.urlencoded({ extended: true }));

// la accesarea din browser adresei http://localhost:6789/ se va returna textul 'Hello World'
// proprietățile obiectului Request - req - https://expressjs.com/en/api.html#req
// proprietățile obiectului Response - res - https://expressjs.com/en/api.html#res
app.get('/', (req, res) => {
	let db = new sqlite3.Database('./store.db', (err) => {
		if (err) {
			console.error(err.message);
		}
		console.log('Conectare reusita la baza de date.');
	});

    let sql = `SELECT * FROM products`;
    req.session.listaProduse=[];

    db.all(sql, [], (err, rows) => {
		if (err) {
			throw err;
		}
		rows.forEach((row) => {
			req.session.listaProduse.push(row);
			req.session.save();
		});
	});
	// close the database connection
	db.close((err) => {
		if (err) {
			return console.error(err.message);
		}
		console.log('Close the database connection.');
    });
	res.render('index', {email: req.session.email, tip: req.session.tip})
});

app.get('/index', (req, res) => {
	let db = new sqlite3.Database('./store.db', (err) => {
		if (err) {
			console.error(err.message);
		}
		console.log('Conectare reusita la baza de date.');
	});

    let sql = `SELECT * FROM products`;
    req.session.listaProduse=[];

    db.all(sql, [], (err, rows) => {
		if (err) {
			throw err;
		}
		rows.forEach((row) => {
			req.session.listaProduse.push(row);
			req.session.save();
		});
	});
	// close the database connection
	db.close((err) => {
		if (err) {
			return console.error(err.message);
		}
		console.log('Close the database connection.');
    });
    res.render('index', {email: req.session.email, tip: req.session.tip})
});

app.get('/store', (req, res) => {
	/*let db = new sqlite3.Database('./store.db', (err) => {
		if (err) {
			console.error(err.message);
		}
		console.log('Conectare reusita la baza de date.');
	});

    let sql = `SELECT * FROM products`;
    req.session.listaProduse=[];

    db.all(sql, [], (err, rows) => {
		if (err) {
			throw err;
		}
		rows.forEach((row) => {
			req.session.listaProduse.push(row);
		});
		//res.render('store', {produse: req.session.listaProduse, email: req.session.email});
	});
    req.session.currentProductDisplay = 'all';
	// close the database connection
	db.close((err) => {
		if (err) {
			return console.error(err.message);
		}
		console.log('Close the database connection.');
    });*/
	console.log(req.session.listaProduse)
	req.session.currentProductDisplay = 'all';
    /*const fs = require('fs')
	fs.readFile('products.json', (err, data) => {
		if (err) throw err;
		let listaProduse = JSON.parse(data);
        storeProducts = listaProduse;
		res.render('store', {produse: listaProduse});
	})
    req.session.currentProductDisplay = 'all';*/
	res.render('store', {produse: req.session.listaProduse, email: req.session.email, tip: req.session.tip});
});

app.get('/cos', (req, res) => {
    var idProduseCos = req.session.cosulUtilizatorului;
	var products = req.session.listaProduse;
	var produseCos = [];
	var cantitate = new Map();
	req.session.total = 0;

	if(typeof idProduseCos != 'undefined'){
		for(var i = 0; i < idProduseCos.length; i++){
			if(cantitate.has(idProduseCos[i])){
				let aux = cantitate.get(idProduseCos[i]);
				cantitate.set(idProduseCos[i], ++aux);
			}
			else{
				cantitate.set(idProduseCos[i], 1);
			}
			for(var j = 0; j < products.length; j++){
				if(idProduseCos[i] == products[j].id && !(produseCos.includes(products[j]))){
					//products[j].cantitate = cantitate.get(String(products[j].id))
					produseCos.push(products[j]);
				}
			}
		}
		for(var i = 0; i < produseCos.length; i++){
			produseCos[i].cantitate = cantitate.get(String(produseCos[i].id));

			pretProdusCos = parseInt(produseCos[i].pret.split(' ')[0]); 
			cantitateProdusCos = parseInt(produseCos[i].cantitate);

			req.session.total = req.session.total + pretProdusCos * cantitateProdusCos;
		}
    }
	req.session.produseCos = produseCos;
	req.session.cantitate = cantitate;
    return res.render('cos', {produseDinCos: produseCos, cantitateProduse: cantitate, total: req.session.total, email: req.session.email, tip: req.session.tip});
});

/*app.get('/mytransfer', (req, res) => {
    let db = new sqlite3.Database('./store.db', (err) => {
		if (err) {
			console.error(err.message);
		}
		console.log('Inserare reusita in baza de date produse.');
	});

	let sql = `INSERT INTO products (tip, nume, descriere, poza, pret, culoare)
				VALUES (?, ?, ?, ?, ?, ?)`;
	
    for(var i=0; i < storeProducts.length; i++){
        db.run(
            `INSERT INTO products (tip, nume, descriere, poza, pret, culoare)
              VALUES (?, ?, ?, ?, ?, ?)`,
            [storeProducts[i].tip, storeProducts[i].nume, storeProducts[i].descriere, storeProducts[i].poza, storeProducts[i].pret, storeProducts[i].culoare])
    }
    
    // close the database connection
    db.close((err) => {
        if (err) {
            return console.error(err.message);
        }
        console.log('Close the database connection.');
    });
})*/
app.get('/inregistrare', (req, res) => {
	return res.render('inregistrare')
});

app.post('/cerere-inregistrare', (req, res) => {

	let db = new sqlite3.Database('./store.db', (err) => {
		if (err) {
			console.error(err.message);
		}
		console.log('Conectare reusita la baza de date.');
	});

    let sql = `INSERT INTO utilizatori(username, nume, prenume, email, parola, adresa)
				VALUES (?, ?, ?, ?, ?, ?)`;
	
	if(req.body.nume != 'admin'){
		let values = [req.body.username, req.body.nume, req.body.prenume, req.body.email, req.body.parola, req.body.adresa];

		db.all(sql, values, [], (err, rows) => {
			if (err) {
				throw err;
			}
		});
	}

	// close the database connection
	db.close((err) => {
		if (err) {
			return console.error(err.message);
		}
		console.log('Close the database connection.');
    });

	return res.render('autentificare')
});

app.get('/autentificare', (req, res) => {

	let db = new sqlite3.Database('./store.db', (err) => {
		if (err) {
			console.error(err.message);
		}
		console.log('Conectare reusita la baza de date.');
	});

    let sql = `CREATE TABLE IF NOT EXISTS utilizatori(
		id INTEGER PRIMARY KEY,
		username TEXT NOT NULL,
		nume TEXT NOT NULL,
		prenume TEXT NOT NULL,
		email TEXT NOT NULL,
		parola TEXT NOT NULL,
		adresa TEXT NOT NULL
	)`;

    db.all(sql, [], (err, rows) => {
		if (err) {
			throw err;
		}
	});

	// close the database connection
	db.close((err) => {
		if (err) {
			return console.error(err.message);
		}
		console.log('Close the database connection.');
    });

	return res.render('autentificare', {email: req.session.email, tip: req.session.tip})
});

app.post('/verificare-autentificare', (req, res) => {
	var listaUtilizatori = [];

	let db = new sqlite3.Database('./store.db', (err) => {
		if (err) {
			console.error(err.message);
		}
		console.log('Conectare reusita la baza de date.');
	});

	let sql = `SELECT * FROM utilizatori`;

	db.all(sql, [], (err, rows) => {
		if (err) {
			throw err;
		}
		rows.forEach((row) => {
			listaUtilizatori.push(row);
		});
		console.log('macar aiiiciii');
		console.log(listaUtilizatori);
		for(var i = 0; i < listaUtilizatori.length; i++){
			if (req.body.nume === listaUtilizatori[i].email || req.body.nume == listaUtilizatori[i].username){
				console.log('pe jumate')
				if (req.body.parola === listaUtilizatori[i].parola){
					console.log('complet')
					req.session.username = listaUtilizatori[i].username;
					req.session.nume = listaUtilizatori[i].nume;
					req.session.prenume = listaUtilizatori[i].prenume;
					req.session.email = listaUtilizatori[i].email;
					req.session.adresa = listaUtilizatori[i].adresa;
					req.session.tip = listaUtilizatori[i].tip;
					return res.render('cos', {produseDinCos: req.session.produseCos, cantitateProduse: req.session.cantitate, total: req.session.total, email: req.session.email, tip: req.session.tip})
				}
			}
		}
		req.session.save();
		return res.redirect('autentificare')
	});
	// close the database connection
	db.close((err) => {
		if (err) {
			return console.error(err.message);
		}
		console.log('Close the database connection.');
		});

	/*console.log('macar aiiiciii');
	console.log(listaUtilizatori);
	for(var i = 0; i < listaUtilizatori.length; i++){
		if (req.body.nume === listaUtilizatori[i].email || req.body.nume == listaUtilizatori[i].username){
			console.log('pe jumate')
			if (req.body.parola === listaUtilizatori[i].parola){
				console.log('complet')
				req.session.username = listaUtilizatori[i].username;
				req.session.nume = listaUtilizatori[i].nume;
				req.session.prenume = listaUtilizatori[i].prenume;
				req.session.email = listaUtilizatori[i].email;
				return res.render('cos', {numeU: req.session.username})
			}
		}
	}
	req.session.save();
	return res.redirect('autentificare')*/
});

function filterWine(item){
    if(item.tip == 'vin'){
        return true;
    }
    return false;
}

function filterCoffee(item){
    if(item.tip == 'cafea'){
        return true;
    }
    return false;
}

app.get('/display-wine', (req, res) => {
    req.session.currentProductDisplay = 'wine';
	req.session.listaVinuri = req.session.listaProduse.filter(filterWine);
    res.render('store', {produse: req.session.listaVinuri, email: req.session.email, tip: req.session.tip});
});

app.get('/display-coffee', (req, res) => {
    req.session.currentProductDisplay = 'coffee';
	req.session.listaCafele = req.session.listaProduse.filter(filterCoffee);
    res.render('store', {produse: req.session.listaCafele, email: req.session.email, tip: req.session.tip});
});

app.get('/sort-products', (req, res) => {
    if(req.session.currentProductDisplay == 'all'){
        if(req.query.sortare == 'sortare-pret-crescator'){
            res.render('store', {produse: req.session.listaProduse.sort((a, b) => parseFloat(a.pret) - parseFloat(b.pret)), email: req.session.email, tip: req.session.tip});
        } 
        else if(req.query.sortare == 'sortare-pret-descrescator'){
            res.render('store', {produse: req.session.listaProduse.sort((a, b) => parseFloat(b.pret) - parseFloat(a.pret)), email: req.session.email, tip: req.session.tip});
        } 
    } 
    else if(req.session.currentProductDisplay == 'wine'){
        if(req.query.sortare == 'sortare-pret-crescator'){
            res.render('store', {produse: req.session.listaVinuri.sort((a, b) => parseFloat(a.pret) - parseFloat(b.pret)), email: req.session.email, tip: req.session.tip});
        } 
        else if(req.query.sortare == 'sortare-pret-descrescator'){
            res.render('store', {produse: req.session.listaVinuri.sort((a, b) => parseFloat(b.pret) - parseFloat(a.pret)), email: req.session.email, tip: req.session.tip});
        } 
    }
    else if(req.session.currentProductDisplay == 'coffee'){
        if(req.query.sortare == 'sortare-pret-crescator'){
            res.render('store', {produse: req.session.listaCafele.sort((a, b) => parseFloat(a.pret) - parseFloat(b.pret)), email: req.session.email, tip: req.session.tip});
        } 
        else if(req.query.sortare == 'sortare-pret-descrescator'){
            res.render('store', {produse: req.session.listaCafele.sort((a, b) => parseFloat(b.pret) - parseFloat(a.pret)), email: req.session.email, tip: req.session.tip});
        } 
    }
});

app.post('/adaugare_cos', function(req, res){
	var sess = req.session;
	if(sess.cosulUtilizatorului === undefined){
		sess.cosulUtilizatorului = [];
	}
	
	sess.cosulUtilizatorului.push(req.body.id);
	console.log('PRODUSE: ' + sess.cosulUtilizatorului);
	sess.save();
})


app.post('/adaugare_cos', function(req, res){
	var sess = req.session;
	if(sess.cosulUtilizatorului === undefined){
		sess.cosulUtilizatorului = [];
	}
	
	sess.cosulUtilizatorului.push(req.body.id);
	console.log('PRODUSE: ' + sess.cosulUtilizatorului);
	sess.save();
})

app.get('/buy-this-item', function(req, res){
	req.session.cosulUtilizatorului = [];
	return res.send(`
	Multumim pentru cumparaturile facute, un colet va fi expediat catre ` + req.session.adresa  + `<br>, verificati de asemenea adresa de email ` + req.session.email + ` pentru confirmare. <br>
	<br><a href="./store">Continuati cumparaturile</a>
`);
	//res.render('Multumim pentru cumparaturile facute, un colet va fi expediat catre ' + req.session.adresa + '\n, verificati de asemenea adresa de email ' + req.session.email + 'pentru confirmare.')
})

app.get('/gestioneaza', (req, res) => {
    return res.render('gestioneaza', {email: req.session.email, tip: req.session.tip});
});


app.post('/inregistrare-produs', function(req, res){
	let db = new sqlite3.Database('./store.db', (err) => {
		if (err) {
			console.error(err.message);
		}
		console.log('Conectare reusita la baza de date.');
	});

    let sql = `INSERT INTO products(nume, descriere, pret, tip, poza, culoare)
				VALUES (?, ?, ?, ?, ?, ?)`;
	
	let values = [req.body.nume, req.body.descriere, req.body.pret, req.body.tip, req.body.poza, req.body.culaore];

    db.all(sql, values, [], (err, rows) => {
		if (err) {
			throw err;
		}
	});

	// close the database connection
	db.close((err) => {
		if (err) {
			return console.error(err.message);
		}
		console.log('Close the database connection.');
    });

	return res.render('store', {produse: req.session.listaProduse, email: req.session.email, tip: req.session.tip})
})

app.get('/delogare',function(req,res){
    sessionData = req.session;
    
    sessionData.destroy(function(err) {
        if(err){
            msg = 'Eroare la delogare';
			return res.render('autentificare', {mesaj: msg})
        }else{
            msg = 'Userul a fost delogat cu succes';
			return res.render('autentificare', {mesaj: msg})
        }
    });
});

app.listen(port, () => console.log(`Serverul rulează la adresa http://localhost:`));
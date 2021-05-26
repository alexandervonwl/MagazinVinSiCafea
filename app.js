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
app.get('/', (req, res) => res.render('index'));

app.get('/index', (req, res) => {
    res.render('index')
});

app.get('/store', (req, res) => {
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
		});
        console.log(req.session.listaProduse);
		res.render('store', {produse: req.session.listaProduse});
	});
    req.session.currentProductDisplay = 'all';
	// close the database connection
	db.close((err) => {
		if (err) {
			return console.error(err.message);
		}
		console.log('Close the database connection.');
    });
    /*const fs = require('fs')
	fs.readFile('products.json', (err, data) => {
		if (err) throw err;
		let listaProduse = JSON.parse(data);
        storeProducts = listaProduse;
		res.render('store', {produse: listaProduse});
	})
    req.session.currentProductDisplay = 'all';*/
});

app.get('/cos', (req, res) => {
    var idProduseCos = req.session.cosulUtilizatorului;
	var products = req.session.listaProduse;
	var produseCos = [];
	var cantitate = new Map();

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
		}
    }
    return res.render('cos', {produseDinCos: produseCos});
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
    res.render('store', {produse: req.session.listaVinuri});
});

app.get('/display-coffee', (req, res) => {
    req.session.currentProductDisplay = 'coffee';
	req.session.listaCafele = req.session.listaProduse.filter(filterCoffee);
    res.render('store', {produse: req.session.listaCafele});
});

app.get('/sort-products', (req, res) => {
    if(req.session.currentProductDisplay == 'all'){
        if(req.query.sortare == 'sortare-pret-crescator'){
            res.render('store', {produse: req.session.listaProduse.sort((a, b) => parseFloat(a.pret) - parseFloat(b.pret))});
        } 
        else if(req.query.sortare == 'sortare-pret-descrescator'){
            res.render('store', {produse: req.session.listaProduse.sort((a, b) => parseFloat(b.pret) - parseFloat(a.pret))});
        } 
    } 
    else if(req.session.currentProductDisplay == 'wine'){
        if(req.query.sortare == 'sortare-pret-crescator'){
            res.render('store', {produse: req.session.listaVinuri.sort((a, b) => parseFloat(a.pret) - parseFloat(b.pret))});
        } 
        else if(req.query.sortare == 'sortare-pret-descrescator'){
            res.render('store', {produse: req.session.listaVinuri.sort((a, b) => parseFloat(b.pret) - parseFloat(a.pret))});
        } 
    }
    else if(req.session.currentProductDisplay == 'coffee'){
        if(req.query.sortare == 'sortare-pret-crescator'){
            res.render('store', {produse: req.session.listaCafele.sort((a, b) => parseFloat(a.pret) - parseFloat(b.pret))});
        } 
        else if(req.query.sortare == 'sortare-pret-descrescator'){
            res.render('store', {produse: req.session.listaCafele.sort((a, b) => parseFloat(b.pret) - parseFloat(a.pret))});
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

app.listen(port, () => console.log(`Serverul rulează la adresa http://localhost:`));
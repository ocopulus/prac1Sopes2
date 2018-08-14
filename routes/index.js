var express = require('express');
var router = express.Router();
var fs = require('fs');

//Rutas Principales

router.get('/', function(req, res) {
	res.render('index');
});

router.get('/men', function(req, res){
	res.render('men');
});

router.get('/proc', function(req, res){
	var data = fs.readFileSync('/proc/proc_201404412', 'utf8');
	var recorrer = data.split('\n');
	var datos = [];
	var ejecucion = 0;
	var suspendidos = 0;
	var detenidos = 0;
	var zombie = 0;
	recorrer.forEach( function(valor, indice, array) {
	    if(valor!=""){
	    	let obj = JSON.parse(valor);
	    	datos.push(obj);
	    	if(obj['estado']=="Ejecucion"){
	    		ejecucion++;
	    	} else if(obj['estado']=="Dormido"){
	    		suspendidos++;
	    	} else if(obj['estado']=="Detenido"){
	    		detenidos++;
	    	} else if(obj['estado']=="Zombie"){
	    		zombie++;
	    	}
	    }
	});
	var contenido = {
		data:datos,
		totalProc: datos.length,
		ejecucion: ejecucion,
		suspendidos: suspendidos,
		detenidos: detenidos,
		zombie: zombie
	};
	res.render('proc', contenido);
});


//Apis de Obtencion de Datos
var aux1, aux2;
router.get('/cpu', function(req, res){
	/*var data = JSON.parse(fs.readFileSync('/proc/cpu_info', 'utf8'));
	res.send(data);*/
	/*var archivo = fs.readFileSync('/proc/cpu_info', 'utf8');
	var arreglo = archivo.split("\n");
	var porcentaje = 0;
	arreglo.forEach(function(valor, indice, array){
		if(valor!=""){
			let obj = JSON.parse(valor);
			porcentaje += obj['porcentaje'];
		}
	});
	porcentaje = porcentaje / 4;CPUUsado*/
	var archivo = fs.readFileSync('/proc/cpu_info', 'utf8');
	var obj = JSON.parse(archivo);
	var dato1 = obj.CPUUsado - aux1;
	var dato2 = obj.PorcentajeCPUUsado - aux2;
	var porcentaje = ((dato1 - dato2)/dato1)*100;
	aux1 = obj.CPUUsado;
	aux2 = obj.PorcentajeCPUUsado;
	res.send({porcentaje: porcentaje});
});

router.get('/men/info', function(req, res){
	var data = JSON.parse(fs.readFileSync('/proc/me_201404412', 'utf8'));
	res.send(data);
});

router.post('/kill', function(req, res) {
    var id = req.body.pid;
    const exec = require('child_process').exec;
    const child = exec('kill ' + id,
        (error, stdout, stderr) => {
        	console.log("Matando el proceso con el pid: "+id);
            console.log(`stdout: ${stdout}`);
            console.log(`stderr: ${stderr}`);
            if (error !== null) {
                console.log(`exec error: ${error}`);
            }
    });
    res.redirect('/proc');
});


module.exports = router;
//Scanners and Query:

function scanMaterias(table) {
  var parameters = {TableName: table};
  var dynamodb = new AWS.DynamoDB();
  dynamodb.scan(parameters, function (error, data) {
    if (error) {
      console.log(error);
    } else {
      buildMaterias(data.Items);
    }
  });
}

function query(table, values, expression, completionHandler) {
  var params = {
    ExpressionAttributeValues: values,
    KeyConditionExpression: expression,
    TableName: table
  };

  var dynamodb = new AWS.DynamoDB();
  dynamodb.query(params, function(error, data) {
   if (error) {
     console.log(error, error.stack);
   } else {
     console.log(data);
       console.log(completionHandler);
     completionHandler(data);
   }
 });
}

function scan1(table, completionHandler, errorHandler, filters, values, names) {
    var parameters = {TableName: table, FilterExpression: filters, ExpressionAttributeValues: values, ExpressionAttributeNames: names};
    var dynamodb = new AWS.DynamoDB();
    function onScan (error, data) {
        if (error) {
            console.log(error);
            errorHandler(error);
        } else {
            console.log(data);
            completionHandler(data.Items);
            console.log(data.LastEvaluatedKey);
            
            if (data.LastEvaluatedKey != undefined) {
                console.log("Scanning for more...");
                parameters.ExclusiveStartKey = data.LastEvaluatedKey;
                dynamodb.scan(parameters, onScan);
        }
            else{
                console.log("Nothing else to scan...");
            }
        }   
    }
    dynamodb.scan(parameters, onScan); 
    
}


//Loaders:

function loadInicio(){
    
    document.getElementById("userNameDiv").style.display = "flex"
    document.getElementById("userPhotoDiv").style.display = "block";
    document.getElementById("sectionMaterias").style.display = "none";
    document.getElementById("sectionTemas").style.display = "none";
    document.getElementById("sectionContenidos").style.display = "none";
    document.getElementById("sectionRender").style.display = "none";
    
    document.getElementById("blueStuff").style.height = "1000px !important";
    
}

function loadMaterias(){
    
    //Display Stuff:
    document.getElementById("userNameDiv").style.display = "none"
    document.getElementById("userPhotoDiv").style.display = "none";
    document.getElementById("sectionMaterias").style.display = "block";
    document.getElementById("sectionTemas").style.display = "none";
    document.getElementById("sectionContenidos").style.display = "none";
    document.getElementById("sectionRender").style.display = "none";
    
    scanMaterias("yoSiSaco10_data");
    
    document.getElementById("blueStuff").style.height = "10% !important";

}

function loadTemas(){
    
    document.getElementById("userNameDiv").style.display = "none"
    document.getElementById("userPhotoDiv").style.display = "none";
    document.getElementById("sectionMaterias").style.display = "none";
    document.getElementById("sectionTemas").style.display = "block";
    document.getElementById("sectionContenidos").style.display = "none";
    document.getElementById("sectionRender").style.display = "none";
    
}

function loadDashTemas(event){

    console.log(event);

    console.log("Se llama load Dash Temas")
    
    var materia = event.path[0].id;
    document.getElementById("currentSubject").value = materia;

    loadTemas();

    query('yoSiSaco10_data', {":subjectName": {S: materia}}, "subjectName = :subjectName", buildTemas);

    var headerMateria = materia.split('+').join(' ');

    console.log(materia);
    console.log(headerMateria);
    
}

function loadContent(event){
    
    console.log(event);
    
    var rawNameTema = event.path[0].id;
    console.log(rawNameTema);
    document.getElementById("currentTema").value = rawNameTema;
    
    document.getElementById("sectionContenidos").style.display = "block";
    document.getElementById("sectionTemas").style.display = "none";
    document.getElementById("sectionRender").style.display = "none";
    
    scan1('yoSiSaco10_contents', buildContent, function (){console.log("upsss Scan1");}, "topic = :topic", {":topic": {S: rawNameTema}});
    
}

function headMenuSelector(){
    
    console.log("se llama head Menu select");
    
    document.getElementById("sectionContenidos").style.display = "block";
    document.getElementById("sectionRender").style.display = "none";
    
}

//Builders:

function userBuilder(data){
    
    console.log(data);
    
    var userPic = data[8].Value;
    var userName = data[5].Value;
    
    if(userPic != "noProfilePic"){
        
        document.getElementById("userPhoto").style.backgroundImage = "url("+ userPic +")";
        
    }
    
    document.getElementById("userHello").innerHTML = "¡Hola " + userName + "!";
    
}

panelsMaterias = [];

function buildMaterias(data){
    
    console.log(data);

    panelsMaterias = [];

    //document.getElementById("sectionMaterias").innerHTML = "<h3 id='subjectHead'></h3>";
    //document.getElementById("subjectHead").innerHTML = document.getElementById("currentSubject").value.split('+').join(' ');

    if(data != undefined){
        
    var main = document.getElementById("sectionMaterias");
    var html = "<div class='row justify-content-center'>";

    for (var i = 0 ; i < data.length ; i++){

                var row = data[i];
                var realI = i + 1;

                console.log("Si entra build materias: " + i);
        
                if(i % 4 == 0 && i != 0){
                    
                    console.log("Se agrega una fila: " + i);
                    
                    html += "</div>"; //se cierra la fila anterior.
                    html += "<div class='row justify-content-center'>"; //se abre una nueva fila.
                    
                }
        
                console.log(data[i]);

                var rawMateria = data[i].subjectName.S;
                var replacedMateria = rawMateria.split('+').join(' ');
        
                panelsMaterias.push(rawMateria); //Se agrega a panelsMaterias
        
                html += "<div class='col-9 col-lg-2' id="+ rawMateria +" onclick='loadDashTemas(event)'><img src='atom.svg' class='icon' id="+ rawMateria +" onclick='loadDashTemas(event)'><h3 class='text-center font-weight-normal' id="+ rawMateria +" onclick='loadDashTemas(event)'>"+ replacedMateria +"</h3></div>";
        
                if(realI == data.length){
                    
                    console.log("Se termina de agregar materias: " + i);
                    
                   /* if(realI % 4 == 0){
                       
                       console.log("Fila nueva para el +");
                       html += "</div>"; //cierra la fila.
                       //html += "<div class='fila-t'><div class='add-materia' onclick='openModalTemas()'><img src='add.svg' alt=''></div></div>"; //Agrega una fila nueva con el +.
                       
                    }else{
                        
                        //html += "<div class='add-materia' onclick='openModalTemas()'><img src='add.svg' alt=''></div>"; //agrega el modal de crear materia.
                        //html += "</div>"; //cierra la fila.
                        
                    }*/
                    
                }


        }
        
        main.innerHTML = html;
        
        //document.getElementById("subjectHead").innerHTML = document.getElementById("currentSubject").value.split('+').join(' ');
        

        }else{

            document.getElementById("dash-t").innerHTML += "";

        }

}

var panelsTemas = [];

function buildTemas(datax){

    panelsTemas = [];

    if(datax.Items[0].topics != undefined){

    var data = datax.Items[0].topics.L;

    console.log(data);
        
    var main = document.getElementById("sectionTemas");
    var html = "<div class='row'><div class=''><h1 class='pb-5' id='subjectHeader'>Titulo materia</h1></div></div><div class='row justify-content-center'>";

    for (var i = 0 ; i < data.length ; i++){

                var row = data[i];
                var realI = i + 1;

                console.log("Si entra build temas: " + i);
        
                if(i % 4 == 0 && i != 0){
                    
                    console.log("Se agrega una fila: " + i);
                    
                    html += "</div>"; //se cierra la fila anterior.
                    html += "<div class='row justify-content-center'>"; //se abre una nueva fila.
                    
                }
        
                console.log(data[i]);

                var rawTema = data[i].M.topicName.S;
                var replacedTema = rawTema.split('+').join(' ');
        
                panelsTemas.push(rawTema); //Se agrega a panelsTemas
        
                html += "<div class='col-9 col-lg-2' onclick = 'loadContent(event)' id="+ rawTema +"><img src='atom.svg' class='icon' id="+ rawTema +"><h3 class='text-center font-weight-normal' id="+ rawTema +">"+ replacedTema +"</h3></div>";
        
                if(realI == data.length){
                    
                    console.log("Se termina de agregar temas: " + i);
                    
                    /*if(realI % 4 == 0){
                       
                       console.log("Fila nueva para el +");
                       html += "</div>"; //cierra la fila.
                       html += "<div class='fila-t'><div class='add-materia' onclick='openModalTemas()'><img src='add.svg' alt=''></div></div>"; //Agrega una fila nueva con el +.
                       
                    }else{
                        
                        html += "<div class='add-materia' onclick='openModalTemas()'><img src='add.svg' alt=''></div>"; //agrega el modal de crear materia.
                        html += "</div>"; //cierra la fila.
                        
                    }*/
                    
                }

        }
        
        main.innerHTML = html;
        
        document.getElementById("subjectHeader").innerHTML = document.getElementById("currentSubject").value.split('+').join(' ');
        

        }else{

        }

}

var panelsContent = [];

var currentData;

function buildContent(data){
    
    console.log(data);
    
    currentData = data;
    
    console.log(currentData);
    
    panelsContent = [];

    if(data[0] != undefined){
        
    var main = document.getElementById("sectionContenidos");
        
    var currentSubject = document.getElementById("currentSubject").value;
    var currentTema = document.getElementById("currentTema").value;
        
    main.innerHTML = "<h1 class='headerNav'><span class='route' onclick='loadTemas()'>"+ currentSubject.split('+').join(' ') +"</span> > <span>"+ currentTema.split('+').join(' ') +"</span></h1>";
        
    var html = "<div class='row justify-content-center'>";

    for (var i = 0 ; i < data.length ; i++){

                var row = data[i];
                var realI = i + 1;

                console.log("Si entra build contenidos: " + i);
        
                if(i % 6 == 0 && i != 0){
                    
                    console.log("Se agrega una fila: " + i);
                    
                    html += "</div>"; //se cierra la fila anterior.
                    html += "<div class='row justify-content-center'>"; //se abre una nueva fila.
                    
                }
        
                console.log(data[i]);

                var rawContentName = data[i].contentName.S;
                var replacedContentName = rawContentName.split('+').join(' ');
                var contentType = data[i].contentType.S;
                var contentImage;
                
                switch(contentType){
        
                    case "text":
                        contentImage = 'book.svg';
                        break;
                        
                    case "pdf":
                        contentImage = 'pdf.svg';
                        break;
                        
                    case "image":
                        contentImage = 'clipboard.svg';
                        break;
                        
                    case "video":
                        contentImage = 'play-button.svg';
                        break;
                        
                }
        
                console.log(contentType);
        
                panelsContent.push(rawContentName); //Se agrega a panelsTemas
        
                html += "<div class='col-9 col-lg-2' onclick='renderContent("+ i +")'><img src="+ contentImage +" class='icon'><h3 class='text-center font-weight-normal'>"+ replacedContentName +"</h3></div>";
        
                if(realI == data.length){
                    
                    console.log("Se termina de agregar contenidos: " + i);
                    
                    /*if(realI % 4 == 0){
                       
                       console.log("Fila nueva para el +");
                       html += "</div>"; //cierra la fila.
                       html += "<div class='fila-t'><div class='add-materia' onclick='openModalTemas()'><img src='add.svg' alt=''></div></div>"; //Agrega una fila nueva con el +.
                       
                    }else{
                        
                        html += "<div class='add-materia' onclick='openModalTemas()'><img src='add.svg' alt=''></div>"; //agrega el modal de crear materia.
                        html += "</div>"; //cierra la fila.
                        
                    }*/
                    
                }

        }
        
        main.innerHTML += html;

        }else{

        }
    
}

function renderContent(contentLocation){
    
    document.getElementById("sectionContenidos").style.display = "none";
    document.getElementById("sectionRender").style.display = "block";
    
    var renderData = currentData[contentLocation];
    
    console.log(renderData);
    
    var renderZone = document.getElementById("sectionRender");
    var currentSubject = document.getElementById("currentSubject").value;
    var currentTema = document.getElementById("currentTema").value;
    var contentName = renderData.contentName.S;
    var contentType = renderData.contentType.S;
    
    console.log(currentSubject);
    console.log(currentTema);
    console.log(contentName);
    
    renderZone.innerHTML = "<h1 class='headerNav'><span class='route' onclick='loadTemas()'>"+ currentSubject.split('+').join(' ') +"</span> > <span class='route' onclick='headMenuSelector()'>"+ currentTema.split('+').join(' ') +"</span> > <span>"+ contentName.split('+').join(' ') +"</span></h1>";
    
    switch(contentType){
                
        case "image":
            
            var content = renderData.content.S;
            renderZone.innerHTML += "<image class='contentImage' src='"+ content +"'></image>";
            
            break;
            
        case "video":
            
            var content = renderData.content.S;
            renderZone.innerHTML += "<iframe class='contentVideo' src='"+ content +"' allowfullscreen width='560'; height='315';></iframe>";
            
            break;
            
        case "pdf":
            
            var content = renderData.content.S;
            renderZone.innerHTML += "<embed class='contentPDF' src='"+ content +"#toolbar=0' width='900' height='700'>";
            
            break;
            
        case "text":
            
            var content = renderData.content.S;
            renderZone.innerHTML += content;
            
            break;
        
    }
    
}
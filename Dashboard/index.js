/* Cosas del Dragg and drop (si se necesita se modifica) */

var $fileInput = $('.file-input');
var $droparea = $('.file-drop-area');

// highlight drag area
$fileInput.on('dragenter focus click', function() {
  $droparea.addClass('is-active');
});

// back to normal state
$fileInput.on('dragleave blur drop', function() {
  $droparea.removeClass('is-active');
});

// change inner text
$fileInput.on('change', function() {
  var filesCount = $(this)[0].files.length;
  var $textContainer = $(this).prev();

  if (filesCount === 1) {
    // if single file is selected, show file name
    var fileName = $(this).val().split('\\').pop();
    $textContainer.text(fileName);
  } else {
    // otherwise show number of files
    $textContainer.text(filesCount + ' archivos seleccionados');
  }
});



/* JS Normal */
//s3 uploader (for profile photos):


function S3upload(event, picName) {
    console.log($fileInput[0].files[0]);
  var s3 = new AWS.S3();
  var file = $fileInput[0].files[0];

  console.log(file);

  if(file != undefined){

  var fileName = picName;
  var params = {
    Bucket: 'yosisaco10-userpics',
    Key: fileName,
    Body: file
  };
  s3.upload(params, function(err, data) {

    console.log(err, data);

    //console.log(event.target, data.Key);
    //event.target.dataset.filename = data.Key;

  });
  }

}



//Random file name:
function makeid() {

  var file = $fileInput[0].files[0];
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  if(file != undefined){

  for (var i = 0; i < 6; i++){
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  }

  document.getElementById("userPic").value = "https://s3.amazonaws.com/yosisaco10-userpics/" + text;

  } else{
      console.log("Entra al No User ELSE")

      text = "noUserPic";
      document.getElementById("userPic").value = text;

  }

  return text;
}

//dynamoDB Uploader:
//item:
//pic: https://s3.amazonaws.com/yosisaco10-userpics/<"aquí va el nombre">

function putObjectDynamo(item, table, completionHandler) {
  console.log("Si entra a Dynamo");
  var dynamodb = new AWS.DynamoDB();
  var params = {Item: item, ReturnConsumedCapacity: "TOTAL", TableName: table};

  dynamodb.putItem(params, function(error, data) {
      console.log("Si entra a putItem");
    if (error) {
      console.log("Si entra a Error");
      alert(error);
   } else {
     console.log("Si entra a Data");
     console.log(data);
     completionHandler();
   }});
}

//MODAL LOADERS:

function openModalCUser() {
  var modal = document.getElementById("modal-create-user");

  modal.style.display = "block";
    
  scanMaterias("yoSiSaco10_data", buildUserAccess);

}

function closeModalCUser() {
  var modal = document.getElementById("modal-create-user");

  modal.style.display = "none";

}

function openModalMaterias(){

    document.getElementById("modalCrearMateria").style.display = "block";

}

function closeModalMaterias(){

    document.getElementById("modalCrearMateria").style.display = "none";

}

function openModalTemas(){

    document.getElementById("modalCrearTema").style.display = "block";

}

function closeModalTemas(){

    document.getElementById("modalCrearTema").style.display = "none";

}

function loadModalCrearContenido(){
    
    document.getElementById("modalCrearContenidos").style.display = "block";
    
}

function closeModalCrearContenido(){
    
    document.getElementById("modalCrearContenidos").style.display = "none";
    
}

//DASH LOADERS:

function loadDashAlumnos(){

    if(document.getElementById("dash-a").style.display != "block"){

    document.getElementById("dash-t").style.display = "none";
    document.getElementById("sectionMaterias").style.display = "none";
    document.getElementById("dash-a").style.display = "block";

    scanUsers("yoSiSaco10_users");

    }

}

function loadDashMaterias(){

    if(document.getElementById("sectionMaterias").style.display != "block"){

    document.getElementById("dash-t").style.display = "none";
    document.getElementById("dash-a").style.display = "none";
    document.getElementById("sectionMaterias").style.display = "block";

    scanMaterias("yoSiSaco10_data", buildMaterias);

    }

}

function loadDashTemas(event){

    console.log(event);

    console.log("Se llama load Dash Temas")

    if(document.getElementById("dash-t").style.display != "block"){
    sleep(2000);
    var materia = event.path[0].id;
    document.getElementById("currentSubject").value = materia;

    document.getElementById("sectionMaterias").style.display = "none";
    document.getElementById("dash-t").style.display = "block";

    query('yoSiSaco10_data', {":subjectName": {S: materia}}, "subjectName = :subjectName", buildTemas);

    var headerMateria = materia.split('+').join(' ');

    console.log(materia);
    console.log(headerMateria);


    }

}

function loadDashContenidos(event){
    
    console.log(event);
    
    var rawNameTema = event.path[0].id;
    document.getElementById("currentTema").value = rawNameTema;
    
    document.getElementById("modalContenidos").style.display = "block";
    
    scan1('yoSiSaco10_contents', buildContent, function (){console.log("upsss Scan1");}, "topic = :topic", {":topic": {S: rawNameTema}});
    
}

function closeDashContenidos(){
    
        document.getElementById("modalContenidos").style.display = "none";
    
}

//USERS DISPLAY:

function scanUsers(table) {
  var parameters = {TableName: table};
  var dynamodb = new AWS.DynamoDB();
  dynamodb.scan(parameters, function (error, data) {
    if (error) {
      console.log(error);
    } else {
      buildUsers(data.Items);
    }
  });
}

var panels = [];
var currentUsersData;

function buildUsers(data){

    console.log(data);
    
    currentUsersData = data;

                for (var i = 0 ; i < data.length ; i++){

                var row = data[i];

                console.log("Si entra build user");

                    var userName = row.name.S;
                    var userEmail = row["email"].S;
                    var userGrade = row["grade"].S;
                    var userPic = row["profilePic"].S;

                    console.log(userName);
                    console.log(userEmail);
                    console.log(userGrade);
                    console.log(userPic);

                    //New User Cage:
                     panels.push(userName);

                      var main = document.getElementById("dash-a");
                      var html = "";

                      var ix = 0;
                      var userPicIds = [];
                      var userPicList = [];

                      for (var index in panels) {
                        var panel = panels[index];

                        if (index == 0 || index % 3 == 0) {
                          html += "<div class='fila-a'>";
                        }

                        console.log(data[ix].profilePic.S);

                        var backPic = "userPhoto" + ix;
                          
                        var userRealName = data[ix].name.S;

                        if(data[ix].profilePic.S != "noProfilePic"){

                            console.log("Entra a si hay foto");

                            html += "<div class='alumno' onclick='buildUsersInfo("+ ix +")'><div class='datos'><h4>"+ data[ix].userType.S.substring(0, 7).replace('#', '') +":</h4><h2>"+ userRealName +"</h2><h3>"+ data[ix].email.S +"</h3><h3>"+ data[ix].grade.S +"</h3></div><div class='line'></div><div class='photo' id="+ backPic +"></div></div>";

                            userPicIds.push(backPic);
                            userPicList.push(data[ix].profilePic.S);

                            //document.getElementById(backPic).style.backgroundImage = "url("+ data[ix].profilePic.S +")";

                        }else{

                            console.log("Entra a no hay foto");

                            html += "<div class='alumno' onclick='buildUsersInfo("+ ix +")'><div class='datos'><h4>"+ data[ix].userType.S.substring(0, 7).replace('#', '') +":</h4><h2>"+ userRealName +"</h2><h3>"+ data[ix].email.S +"</h3><h3>"+ data[ix].grade.S +"</h3></div><div class='line'></div><div class='photo'></div></div>";

                        }

                        if (index % 3 == 2) {
                          html += "</div>";
                        }

                        ix++;
                      }

                      if (panels.length % 3 != 0) {
                        html += "<div class='add-alumno' onclick='openModalCUser();'><img src='add.svg' alt=''></div>";
                        html += "</div>";
                      } else {
                        html += "<div class='fila-a'><div class='add-alumno' onclick='openModalCUser();'><img src='add.svg' alt=''></div></div>";
                      }

                      main.innerHTML = html;

                      for(var ixe = 0 ; ixe < userPicIds.length ; ixe++){

                          var id = userPicIds[ixe];
                          var photo = userPicList[ixe];

                          document.getElementById(id).style.backgroundImage = "url("+ photo +")";

                      }


        }
}

function crearMateria(){

    var nameMateria = document.getElementById("inputNameMateria").value;
    
    if(nameMateria != ''){

    var replacedMateria = nameMateria.split(' ').join('+');

    console.log(replacedMateria);

    console.log(panelsMaterias);

    var nameExists;

    if (panelsMaterias.indexOf(replacedMateria) > -1) {

    nameExists = true;

    } else {

    nameExists = false;

    }

    console.log(nameExists);

    if(replacedMateria != "" && nameExists == false){

       console.log("Si entra a crear materia.");

       var item = {"subjectName": {"S": replacedMateria}};

       putObjectDynamo(item, "yoSiSaco10_data", completionHandlerCrearMateria);

    }else{

        if(nameExists == true){

            alert("¡La materia " + nameMateria + " ya existe!");
        }else{

         alert("Necesitas proporcionar un nombre a la materia que quieras crear.");

        }

    }
    
}else{
    
    alert("Necesitas asignarle un nombre a la materia que quieres crear antes de crearla.");
    
}

}

function completionHandlerCrearMateria(){

    console.log("Se llama el completion Handler");
    scanMaterias("yoSiSaco10_data", buildMaterias);
    closeModalMaterias();

}

//Subjects Display:

function scanMaterias(table, builder) {
  var parameters = {TableName: table};
  var dynamodb = new AWS.DynamoDB();
  dynamodb.scan(parameters, function (error, data) {
    if (error) {
      console.log(error);
    } else {
      builder(data.Items);
    }
  });
}

var panelsMaterias = [];

function buildMaterias(data){

    console.log(data);

                for (var i = 0 ; i < data.length ; i++){

                var row = data[i];

                console.log("Si entra build materia");

                    var subjectName = row.subjectName.S;

                    //New User Cage:
                     panelsMaterias.push(subjectName);

                      var main = document.getElementById("sectionMaterias");
                      var html = "";

                      var ix = 0;

                      for (var index in panelsMaterias) {
                        if(data[ix] != undefined){
                        var panel = panelsMaterias[index];

                        if (index == 0 || index % 4 == 0) {

                          console.log("se agrega una fila");
                          html += "<div class='fila'>";
                        }
                            console.log(ix);
                            var rawMateria = data[ix].subjectName.S;
                            var replacedMateria = rawMateria.split('+').join(' ');

                            html += "<div class='materia' onclick='loadDashTemas(event)' id="+ data[ix].subjectName.S +"><h4 id="+ data[ix].subjectName.S +">Materia:</h4><h2 id="+ data[ix].subjectName.S +">"+ replacedMateria +"</h2></div>";


                        if (index % 4 == 3) {
                          html += "</div>";
                        }

                        ix++;

                        }
                      }

                      if (panelsMaterias.length % 4 != 0) {
                        html += "<div class='add-materia' onclick='openModalMaterias()'><img src='add.svg' alt=''></div>";
                        html += "</div>";
                      } else {
                        html += "<div class='fila'><div class='add-materia' onclick='openModalMaterias()'><img src='add.svg' alt=''></div></div>";
                      }

                      main.innerHTML = html;


        }
}


function crearTema(){

    var allTopicNames = [];

    var nameMateria = document.getElementById("currentSubject").value;

    var rawNameTema = document.getElementById("inputNameTema").value;
    
    if(rawNameTema != ''){
    
    var nameTema = rawNameTema.split(' ').join('+');
    //console.log(nameTema);

    console.log(panelsTemas);

    var nameExists;

    if (panelsTemas.indexOf(nameTema) > -1) {

    nameExists = true;

    } else {

    nameExists = false;

    }

    console.log(nameExists);


    if(nameTema != "" && nameExists == false){

       console.log("Si entra a crear tema.");

        //Kills overwrite:

        //[ { "M" : { "topicName" : { "S" : nameTema } } } ]

        for(var i = 0; i < panelsTemas.length; i++){

            var createdTopic = panelsTemas[i];

            allTopicNames.push({ "M" : { "topicName" : { "S" : createdTopic } } });


        }

        allTopicNames.push({ "M" : { "topicName" : { "S" : nameTema } } });

        console.log(allTopicNames);


       var item = {"subjectName": {"S": nameMateria}, "topics": { "L": allTopicNames}};

       putObjectDynamo(item, "yoSiSaco10_data", completionHandlerCrearTema);

    }else{



        if(nameExists == true){

            alert("¡El tema " + rawNameTema + " ya existe!");
        }else{

         alert("Necesitas proporcionar un nombre al tema que quieres crear.");

        }


    }

    allTopicNames = [];
    
}else{
    
    alert("Necesitas asignarle un nombre al tema que quieres crear antes de crearlo.");
    
}

}

function completionHandlerCrearTema(){

    console.log("Se llama el completion Handler Tema");
    var materia = document.getElementById("currentSubject").value;
    query('yoSiSaco10_data', {":subjectName": {S: materia}}, "subjectName = :subjectName", buildTemas);
    closeModalTemas();

}

//TEMAS DISPLAY:

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

var panelsTemas = [];

function buildTemas(datax){

    panelsTemas = [];

    document.getElementById("dash-t").innerHTML = "<h3 id='subjectHead'></h3>";
    document.getElementById("subjectHead").innerHTML = document.getElementById("currentSubject").value.split('+').join(' ');

    if(datax.Items[0].topics != undefined){

    var data = datax.Items[0].topics.L;

    console.log(data);
        
    var main = document.getElementById("dash-t");
    var html = "<h3 id='subjectHead'></h3><div class='fila-t'>";

    for (var i = 0 ; i < data.length ; i++){

                var row = data[i];
                var realI = i + 1;

                console.log("Si entra build temas: " + i);
        
                if(i % 4 == 0 && i != 0){
                    
                    console.log("Se agrega una fila: " + i);
                    
                    html += "</div>"; //se cierra la fila anterior.
                    html += "<div class='fila-t'>"; //se abre una nueva fila.
                    
                }
        
                console.log(data[i]);

                var rawTema = data[i].M.topicName.S;
                var replacedTema = rawTema.split('+').join(' ');
        
                panelsTemas.push(rawTema); //Se agrega a panelsTemas
        
                html += "<div class='tema' id="+ rawTema +" onclick='loadDashContenidos(event)'><h4 id="+ rawTema +">"+ replacedTema +"</h4><h2 id="+ rawTema +"> Número de contenidos: 0</h2></div>";
        
                if(realI == data.length){
                    
                    console.log("Se termina de agregar temas: " + i);
                    
                    if(realI % 4 == 0){
                       
                       console.log("Fila nueva para el +");
                       html += "</div>"; //cierra la fila.
                       html += "<div class='fila-t'><div class='add-materia' onclick='openModalTemas()'><img src='add.svg' alt=''></div></div>"; //Agrega una fila nueva con el +.
                       
                    }else{
                        
                        html += "<div class='add-materia' onclick='openModalTemas()'><img src='add.svg' alt=''></div>"; //agrega el modal de crear materia.
                        html += "</div>"; //cierra la fila.
                        
                    }
                    
                }
        
                
        
                
        
                    /*

                    var topicName = row.M.topicName.S;

                    //New Topic Cage:
                     panelsTemas.push(topicName);

                      var main = document.getElementById("dash-t");
                      var html = "<h3 id='subjectHead'></h3>";

                      var ix = 0;

                      for (var index in panelsTemas) {
                        if(data[ix] != undefined){
                        var panel = panelsTemas[index];

                        if (index == 0 || index % 4 == 0) {

                          console.log("se agrega una fila");
                          html += "<div class='fila-t'>";
                        }

                            console.log(data[ix]);

                            var rawTema = data[ix].M.topicName.S;
                            var replacedTema = rawTema.split('+').join(' ');
                            var topicContents = 0;
                            if(data[ix].M.topicContents){

                                topicContents = data[ix].M.topicContents.L.length;

                            }

                           -> html += "<div class='tema' id="+ rawTema +" onclick='loadDashContenidos(event)'><h4 id="+ rawTema +">"+ replacedTema +"</h4><h2 id="+ rawTema +"> Número de contenidos: "+ topicContents +"</h2></div>";


                        if (index % 4 == 3) {
                          html += "</div>";
                        }

                        ix++;

                        }
                      }

                      if (panelsMaterias.length % 4 != 0) {
                        html += "<div class='add-materia' onclick='openModalTemas()'><img src='add.svg' alt=''></div>";
                        html += "</div>";
                      } else {
                        html += "<div class='fila-t'><div class='add-materia' onclick='openModalTemas()'><img src='add.svg' alt=''></div></div>";
                      }

                      main.innerHTML = html;

                      document.getElementById("subjectHead").innerHTML = document.getElementById("currentSubject").value.split('+').join(' ');
*/

        }
        
        main.innerHTML = html;
        
        document.getElementById("subjectHead").innerHTML = document.getElementById("currentSubject").value.split('+').join(' ');
        

        }else{

            document.getElementById("dash-t").innerHTML += "<div class='fila-t'><div class='add-materia' onclick='openModalTemas()'><img src='add.svg' alt=''></div></div>";

        }

}

function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds){
      break;
    }
  }
}

//CONTENT CREATOR AND STUFF:

function onChangeContentType(contentType){
    
    console.log("Se llama onchange");
    console.log(contentType);
    
    document.getElementById("currentContentType").value = contentType;
    
    if(contentType == "pdf"){
        
        document.getElementById("pdfDropArea").style.display = "block";
        document.getElementById("imageDropArea").style.display = "none";
        document.getElementById("videoLinkSpan").style.display = "none";
        document.getElementById("textBox").style.display = "none";
        
    }
    
    if(contentType == "text"){
        
        document.getElementById("pdfDropArea").style.display = "none";
        document.getElementById("imageDropArea").style.display = "none";
        document.getElementById("videoLinkSpan").style.display = "none";
        document.getElementById("textBox").style.display = "block";
        
    }
    
    if(contentType == "video"){
        
        document.getElementById("pdfDropArea").style.display = "none";
        document.getElementById("imageDropArea").style.display = "none";
        document.getElementById("textBox").style.display = "none";
        document.getElementById("videoLinkSpan").style.display = "block";
        
    }
    
    if(contentType == "image"){
        
        document.getElementById("pdfDropArea").style.display = "none";
        document.getElementById("textBox").style.display = "none";
        document.getElementById("videoLinkSpan").style.display = "none";
        document.getElementById("imageDropArea").style.display = "block";
        
    }
    
}

function contentCreator(event){
    
    var contentName = document.getElementById("inputContentName").value;
    var contentType = document.getElementById("currentContentType").value;
    var tema = document.getElementById("currentTema").value;
    var materia = document.getElementById("currentSubject").value;
    var realContentName = contentName.split(' ').join('+');
    
    console.log(contentName);
    console.log(contentType);
    console.log(tema);
    console.log(materia);
    
    if(contentName != ''){
    
    if(contentType != ''){
    
    if(contentType == "text"){
       
       var htmlText = document.getElementById("textBox").value;
        
       if(htmlText != ''){
        
       console.log(htmlText);
       
       var item = {
        "content": {"S": htmlText},
        "contentName": {"S": realContentName},
        "contentType": {"S": contentType},
        "topic": {"S": tema}
       }; 
        
       putObjectDynamo(item, "yoSiSaco10_contents", contentCreatorCompletionH);
           
       }else{
           
           alert("El contenido de texto no puede estar vacío.");
           
       }
       
    }
    
    if(contentType == "video"){
       
       var videoLink = document.getElementById("videoLink").value;
       console.log(videoLink);
        
       var videoCode =  videoLink.substring(32);
        
       var realVideoLink = "https://www.youtube.com/embed/" + videoCode + "?rel=0&amp;showinfo=0";
        
       if(videoLink != ''){
        
       var item = {
        "content": {"S": realVideoLink},
        "contentName": {"S": realContentName},
        "contentType": {"S": contentType},
        "topic": {"S": tema}
       }; 
        
       putObjectDynamo(item, "yoSiSaco10_contents", contentCreatorCompletionH);
           
       }else{
           
           alert("Necesitas proporcionar un link de video para crear contenido tipo video.");
           
       }
       
    }
    
    if(contentType == "image"){
        
        console.log($fileInput[1].files[0]);
        
        if($fileInput[1].files[0] != undefined){
        
        var imageName = makeid2(1);
        var imageFile = $fileInput[1].files[0];
        var imageLink = "https://s3.amazonaws.com/yosisaco10-files/" + imageName;
        
        console.log(imageName);
        console.log(imageLink);
        
        S3upload2(imageName, imageFile, 'yosisaco10-files');
        
        var item = {
        "content": {"S": imageLink},
        "contentName": {"S": realContentName},
        "contentType": {"S": contentType},
        "topic": {"S": tema}
       }; 
        
        putObjectDynamo(item, "yoSiSaco10_contents", contentCreatorCompletionH);
        
    }else{
        
        alert("Necesitas seleccionar una imagen para poder crear el tipo de contenido imagen.");
        
    }
    }
        
        if(contentType == "pdf"){
        
        console.log($fileInput[2].files[0]);
        
        if($fileInput[2].files[0] != undefined){
        
        var pdfName = makeid2(2);
        var pdfFile = $fileInput[2].files[0];
        var pdfLink = "https://s3.amazonaws.com/yosisaco10-files/" + pdfName;
        
        console.log(pdfName);
        console.log(pdfLink);
        
        pdfUpload(pdfName, pdfFile, 'yosisaco10-files');
        
        var item = {
        "content": {"S": pdfLink},
        "contentName": {"S": realContentName},
        "contentType": {"S": contentType},
        "topic": {"S": tema}
       }; 
        
        putObjectDynamo(item, "yoSiSaco10_contents", contentCreatorCompletionH);
        
    }else{
        
        alert("Necesitas seleccionar un archivo PDF para poder crear el tipo de contenido PDF.");
        
    }
    }
        
}else{
    
    alert("Debes seleccionar un tipo de contenido, asignarle un nombre y subir / escribirlo para poder crearlo.");
    
}
        }else{
            
            alert("Debes de asignarle un nombre a el contenido antes de poder crearlo");
            
        }
    
}

function S3upload2(name, fileData, bucketName) {
    console.log(fileData);
  var s3 = new AWS.S3();
  var file = fileData;

  console.log(file);

  if(file != undefined){

  var fileName = name;
  var params = {
    Bucket: bucketName,
    Key: fileName,
    Body: file
  };
  s3.upload(params, function(err, data) {

    console.log(err, data);

    //console.log(event.target, data.Key);
    //event.target.dataset.filename = data.Key;

  });
  }

}

function pdfUpload(name, fileData, bucketName) {
    console.log(fileData);
  var s3 = new AWS.S3();
  var file = fileData;

  console.log(file);

  if(file != undefined){

  var fileName = name;
  var params = {
    Bucket: bucketName,
    Key: fileName,
    Body: file,
    ContentType : 'application/pdf'
  };
  s3.upload(params, function(err, data) {

    console.log(err, data);

    //console.log(event.target, data.Key);
    //event.target.dataset.filename = data.Key;

  });
  }

}

function makeid2(location) {

  var file = $fileInput[location].files[0];
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  if(file != undefined){

  for (var i = 0; i < 6; i++){
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  }

  } else{
      console.log("Entra al No document ELSE");
      
      text = "noDocument";

  }

  return text;
}

function contentCreatorCompletionH(){
    
    console.log("Se llama contentCreatorCompletionH");
    
    document.getElementById("inputContentName").value = '';
    document.getElementById("textBox").value = '';
    document.getElementById("videoLink").value = '';
    document.getElementById("imageDropArea").style.display = "none";
    document.getElementById("videoLinkSpan").style.display = "none";
    document.getElementById("textBox").style.display = "none";
    
    
    
    var topic = document.getElementById("currentTema").value;
    
    closeModalCrearContenido();
    
    scan1('yoSiSaco10_contents', buildContent, function (){console.log("upsss Scan1");}, "topic = :topic", {":topic": {S: topic}});
}

function buildContent(data){
    
    console.log("Entra buildContent");
    console.log(data);
    
    var cleanNameTema = document.getElementById("currentTema").value.split("+").join(' ');
    var area = document.getElementById("contentBox");
    var html = "<span class='close-modal w3-button' onclick='closeDashContenidos()'>&times;</span><h1 id='headNombreDelTema'>Nombre del Tema</h1>";
    
    for(var i = 0; i < data.length; i++){
        
        var name = data[i].contentName.S;
        var contentType = data[i].contentType.S;
        var realName = name.split('+').join(' ');
        
        html += "<div class='card'><h5 class='pt-3 pl-3'>"+ realName +"</h5><p class='pt-1 pl-3'>"+ contentType +"</p><button id="+ name +" type='button' class='delete' name='button' onclick='eraseContent(event)'><i class='fas fa-trash-alt'></i>Eliminar</button></div>";
        
    }
    
    html += "<button type='button' class='more4' onclick='loadModalCrearContenido()'>Nuevo Contenido</button>";
    
    area.innerHTML = html;
    
    document.getElementById("headNombreDelTema").innerHTML = cleanNameTema;
    
}

function eraseContent(event){
    
    console.log("Entra a eraseContent")
    console.log(event);
    
    var contentName = event.path[0].id;
    var topic = document.getElementById("currentTema").value;
    
    console.log(contentName);
    console.log(topic);
    
    deleteDynamoDB('yoSiSaco10_contents', contentName, topic);
    
}

function deleteDynamoDB(table, contentName, topic){
    
    var dynamodb = new AWS.DynamoDB();
    var docClient = new AWS.DynamoDB.DocumentClient();
    
    var params = {
    TableName: table,
    Key:{
        "contentName": contentName,
        "topic": topic
    }
};
    
    docClient.delete(params, function(err, data) {
        
    if (err) {
        console.error("Unable to delete item. Error JSON:", JSON.stringify(err, null, 2));
    } else {
        console.log("DeleteItem succeeded!!!");
        
        scan1('yoSiSaco10_contents', buildContent, function (){console.log("upsss Scan1");}, "topic = :topic", {":topic": {S: topic}});
        
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


function buildUsersInfo(userNumber){
    
    document.getElementById("userDisplayInfo").style.display = "block";
    
    var userData = currentUsersData[userNumber];
    
    console.log(userData);
    
    if(userData.profilePic.S != "noProfilePic"){
        
        var userPhoto = userData.profilePic.S;
        document.getElementById("displayUserPhoto").style.backgroundImage = "url("+ userPhoto +")";
        
    } else{
        
        document.getElementById("displayUserPhoto").style.backgroundImage = "";
        
    }
    
    document.getElementById("displayUserName").innerHTML = userData.name.S;
    document.getElementById("displayUserMail").innerHTML = userData.email.S;
    document.getElementById("displayUserGrade").innerHTML = userData.grade.S;
    document.getElementById("displayUserCountry").innerHTML = userData.country.S;
    document.getElementById("displayUserCity").innerHTML = userData.city.S;
    document.getElementById("displayUserSchool").innerHTML = userData.school.S;
    
}


function selectContentDisplay(){
    
    var checkbox = document.getElementById("todoCheck").checked;
    
    if(checkbox == true){
        
        document.getElementById("selectContentAccess").style.display = "none";
        
    } else{
        
        document.getElementById("selectContentAccess").style.display = "block";
        
    }
    
}

function buildUserAccess(data){
    
    console.log(data);
    
    var zone = document.getElementById("selectContentAccess");
    var html = "";
    
    for(var i = 0; i < data.length; i++){
        
     var subjectName = data[i].subjectName.S;
     var theFunction = "contentRestrictSelector('" + subjectName + "')";
        
     html += "<label><input type='checkbox' id='"+ data[i].subjectName.S +"' value='"+ data[i].subjectName.S +"' onclick=" + theFunction + ">"+ data[i].subjectName.S.split('+').join(' ') +"</label><br>";   
        
    } 
    
    zone.innerHTML = html;
}

function userTypeSelector(event){
    
    var userType = event.path[0].innerHTML;
    console.log(userType);
    
    if(userType == "Alumno"){
       
       document.getElementById("selectAccessDiv").style.display = "block";
       
       } else{
           
           document.getElementById("selectAccessDiv").style.display = "none";
           
           document.getElementById("currentUserCType").value = "userType";
           
       }
    
}

var currentUserCAccess = [];
function contentRestrictSelector(id){
    
    console.log(id);
    console.log(document.getElementById(id).checked);
    
    if(document.getElementById(id).checked == true){
        
        console.log(id);
        
        currentUserCAccess.push(id);
        
    }
    
    if(document.getElementById(id).checked == false){
        
        var index = currentUserCAccess.indexOf(id);
        if (index !== -1) {
            currentUserCAccess.splice(index, 1);
        }
        
        console.log("se quita");
        
    }
    
    console.log(currentUserCAccess);
    
}


var ALERT_TITLE = "Confirmar";
var ALERT_BUTTON_TEXT = "Ok";

if(document.getElementById) {
	window.alert = function(txt) {
		createCustomAlert(txt);
	}
}

function createCustomAlert(txt) {
	d = document;

	if(d.getElementById("modalContainer")) return;

	mObj = d.getElementsByTagName("body")[0].appendChild(d.createElement("div"));
	mObj.id = "modalContainer";
	mObj.style.height = d.documentElement.scrollHeight + "px";

	alertObj = mObj.appendChild(d.createElement("div"));
	alertObj.id = "alertBox";
	if(d.all && !window.opera) alertObj.style.top = document.documentElement.scrollTop + "px";
	alertObj.style.left = (d.documentElement.scrollWidth - alertObj.offsetWidth)/2 + "px";
	alertObj.style.visiblity="visible";

	h1 = alertObj.appendChild(d.createElement("h1"));
	h1.appendChild(d.createTextNode(ALERT_TITLE));

	msg = alertObj.appendChild(d.createElement("p"));
	//msg.appendChild(d.createTextNode(txt));
	msg.innerHTML = txt;

	btn = alertObj.appendChild(d.createElement("a"));
	btn.id = "closeBtn";
	btn.appendChild(d.createTextNode(ALERT_BUTTON_TEXT));
	btn.href = "#";
	btn.focus();
	btn.onclick = function() { removeCustomAlert();return false; }

	alertObj.style.display = "block";

}

function removeCustomAlert() {
	document.getElementsByTagName("body")[0].removeChild(document.getElementById("modalContainer"));
}
function ful(){
alert('Alert this pages');
}

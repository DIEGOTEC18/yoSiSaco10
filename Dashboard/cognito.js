function getUserPool() {
  var poolData = {UserPoolId: CognitoUserPoolId, ClientId: CognitoUserPoolAppClientId};
  var userPool = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool(poolData);

  return userPool;
}

function createUserUI(event) {
  console.log(event);
  var name = document.getElementById("createUserName").value;
  var email = document.getElementById("createUserEmail").value;
  var grade = document.getElementById("createUserGrade").value;
  var country = document.getElementById("createUserCountry").value;
  var city = document.getElementById("createUserCity").value;
  var school = document.getElementById("createUserSchool").value;
  var userType = event.path[1].childNodes[15].childNodes[3].firstElementChild.childNodes[0].data;
  var password = document.getElementById("createUserPassword").value;
    
  //Incert user content access here:
  
  var realUserType;
    
  if(userType == "Maestro"){
      
      realUserType = "Maestro";
      
  } else{
      
      console.log(currentUserCAccess);
      
      realUserType = "Alumno";
      
      if(document.getElementById("todoCheck").checked != true){
      
      for(var i = 0; i < currentUserCAccess.length; i++){
          
          console.log(currentUserCAccess[i]);
          
          realUserType += "#" + currentUserCAccess[i];
          
      }
      
      } else{
          
          realUserType += "#Todo";
          
      }
      
  }
    
  if(name != "" && email != ""){     

  createUser({"name": name, "email": email, "password": password, "grade": grade, "country": country, "city": city, "school": school, "userType": realUserType}, function () {
    
    closeModalCUser();
    
  });
      
    

    }
    else{
        
        alert("Necesitas proporcionar un nombre y un mail para poder registrar un usuario");
        
    }
    
  return false;
}

function loginUI(event) {
  var email = document.getElementById("dashboardUserLogInput").value;
  var password = document.getElementById("dashboardUserPassword").value;

  login({"email": email, "password": password}, function () {
      
      var user = getUserPool().getCurrentUser();

  if (user) {
    user.getSession(function (error, session) {
      if (error) {
        console.log(error);

        AWS.config.credentials = new AWS.CognitoIdentityCredentials({
          IdentityPoolId: CognitoIdentityPoolId
        });

        
      } else {
        user.getUserAttributes(function (error, attributes) {
          if (error) {
            console.log(error);

            AWS.config.credentials = new AWS.CognitoIdentityCredentials({
              IdentityPoolId: CognitoIdentityPoolId
            });

            errorHandler(error);
          } else {  
            console.log(window.location.pathname);
            console.log(attributes);
            
            var userType = attributes[0].Value;
              
            if(userType == "Maestro"){
                
                window.location = "index.html";
                
                //getCurrentUser(currentUserCompletionHandler, currentUserErrorHandler);
                
            }else{
                
                alert("¡Hey! " + attributes[5].Value + " no tienes acceso a este dashboard.");
                
            }
              
          }
        });

        //configureCredentials(session);
      }
    });
  } else {
    console.log("No user found");

    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
      IdentityPoolId: CognitoIdentityPoolId
    });

  }
      
    //window.location = "index.html";
      
      
  }, function () {
    //document.getElementById("confirmationview").style.display = "block";
  });

  return false;
}

function confirmUserUI(event) {
  var email = document.getElementById("generalEmail").value;
  var code = document.getElementById("code").value;
    
  console.log(email);

  confirmUser({"email": email, "code": code}, function () {
    alert("¡Usuario confirmado! Ya puedes iniciar sesión.");
    document.getElementById("confirmationview").style.display = "none";
    document.getElementById("modal-login-in").style.display = "block";
    document.getElementById("email").value = email;
  }, function() {alert("error");});

  return false;
}

function createUser(data, completionHandler) {
    
  var picture = "noProfilePic";
  var pictureLink = "noProfilePic"; //https://s3.amazonaws.com/yosisaco10-userpics/0hzSK8
  
  if($fileInput[0].files[0] != undefined){
      
      picture = makeid();
      pictureLink = "https://s3.amazonaws.com/yosisaco10-userpics/" + picture;
      
  }
    
  var poolData = {UserPoolId: CognitoUserPoolId, ClientId: CognitoUserPoolAppClientId};
  var userPool = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool(poolData);

  var dataName = {Name: 'name', Value: data.name};
  var dataEmail = {Name: 'email', Value: data.email};
  var dataPicture = {Name: 'picture', Value: pictureLink};
  var dataGrade = {Name: 'custom:custom:grade', Value: data.grade};
  var dataCountry = {Name: 'custom:country', Value: data.country};
  var dataCity = {Name: 'custom:city', Value: data.city};
  var dataSchool = {Name: 'custom:school', Value: data.school};
  var dataUserType = {Name: 'custom:userType', Value: data.userType};
  var attributeName = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserAttribute(dataName);
  var attributeEmail = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserAttribute(dataEmail);
  var attributePicture = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserAttribute(dataPicture);
  var attributeGrade = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserAttribute(dataGrade);
  var attributeCountry = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserAttribute(dataCountry);
  var attributeCity = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserAttribute(dataCity);
  var attributeSchool = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserAttribute(dataSchool);
  var attributeUserType = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserAttribute(dataUserType);
    
  var attributeList = [attributeName, attributeEmail, attributePicture, attributeGrade, attributeCountry, attributeCity, attributeSchool, attributeUserType];

  userPool.signUp(data.email, data.password, attributeList, null, function(error, result) {
    if (error) {
        
      var errorAlert;
      if(error == "InvalidParameterException: 1 validation error detected: Value at 'password' failed to satisfy constraint: Member must have length greater than or equal to 6"){
          
          errorAlert = "El password del usuario debe de tener por lo menos 8 caracteres";
          
      }
        
      if(error == "InvalidPasswordException: Password did not conform with policy: Password not long enough"){
          
          errorAlert = "El password del usuario debe de tener por lo menos 8 caracteres";
          
      }
    
      if(error == "InvalidPasswordException: Password did not conform with policy: Password must have uppercase characters"){
          
          errorAlert = "La contraseña debe de tener MAYÚSCULAS";
          
      }
        
      if(error == "InvalidPasswordException: Password did not conform with policy: Password must have lowercase characters"){
          
          errorAlert = "La contraseña debe de tener minúsculas";
          
      }
        
      if(error == "InvalidPasswordException: Password did not conform with policy: Password must have numeric characters"){
          
          errorAlert = "La contraseña debe de tener números";
          
      }
        
      if(error == "InvalidParameterException: Invalid email address format."){
          
          errorAlert = data.email + " no parece ser un mail válido. Por favor proporciona uno válido";
          
      }
        
      if(error == "InvalidParameterException: 2 validation errors detected: Value at 'username' failed to satisfy constraint: Member must satisfy regular expression pattern: [\p{L}\p{M}\p{S}\p{N}\p{P}]+; Value at 'username' failed to satisfy constraint: Member must have length greater than or equal to 1"){
          
          errorAlert = "Necesitas un mail para poder registrar un usuario";
          
      }
        
      if(error == "InvalidParameterException: 2 validation errors detected: Value at 'password' failed to satisfy constraint: Member must satisfy regular expression pattern: [\S]+; Value at 'password' failed to satisfy constraint: Member must have length greater than or equal to 6"){
          
          errorAlert = "Debes de proporcionar un password para el usuario";
          
      }
        
      if(error == "InvalidParameterException: 4 validation errors detected: Value at 'password' failed to satisfy constraint: Member must satisfy regular expression pattern: [\S]+; Value at 'password' failed to satisfy constraint: Member must have length greater than or equal to 6; Value at 'username' failed to satisfy constraint: Member must satisfy regular expression pattern: [\p{L}\p{M}\p{S}\p{N}\p{P}]+; Value at 'username' failed to satisfy constraint: Member must have length greater than or equal to 1"){
          
          errorAlert = "Primero proporciona los datos del usuario para poder registrarlo";
          
      }
    
      if(error.code == "UsernameExistsException"){
          
          errorAlert = "El usuario que intentas registrar ya existe.";
          
      }

        
      //alert(errorAlert);
      alert(error);
        
    } else {
      alert("Usuario creado exitosamente");
        
      //Duplica el registro en Dynamo:
        
        //Sube a S3:
        
        S3upload(event, picture);
        
        var profilePic = "noProfilePic";
        
        var file = $fileInput[0].files[0];
        
        if(file != undefined){
        
        profilePic = pictureLink;
            
        }
        console.log(profilePic);
        
        console.log("Current User Access:-->")
        console.log(currentUserCAccess);
        
        var realUserAccess = [];
        
        if(currentUserCAccess.length != 0){
        
        for(var i = 0; i < currentUserCAccess.length; i++){
            
            realUserAccess.push({"S": currentUserCAccess[i]});
            
        }
        } else{
            
            if(data.userType.includes("Maestro") || data.userType.includes("Alumno#Todo")){
                realUserAccess.push({"S": "TODO"});
            } else{
                
                realUserAccess.push({"S": "No tiene acceso a contenidos"});
                
            }
        }
        
        var item = {
            
                    "city": {"S": data.city},
                    "country": {"S": data.country},
                    "email": {"S": data.email},
                    "grade": {"S": data.grade},
                    "name": {"S": data.name},
                    "school": {"S": data.school},
                    "userType": {"S": data.userType},
                    "profilePic": {"S": profilePic},
                    "userAccess": {"L": realUserAccess}
        };
        
        putObjectDynamo(item, "yoSiSaco10_users", function (){console.log("Usuario Registrado en DynamoDB"); scanUsers("yoSiSaco10_users");});

        
      completionHandler();
    }
  });
}

function login(data, completionHandler, confirmationHandler) {
  var authenticationData = {Username : data.email, Password : data.password};
  var authenticationDetails = new AWSCognito.CognitoIdentityServiceProvider.AuthenticationDetails(authenticationData);
  var poolData = {UserPoolId : CognitoUserPoolId, ClientId : CognitoUserPoolAppClientId};
  var userPool = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool(poolData);

  var userData = {Username : data.email, Pool : userPool};
  var cognitoUser = new AWSCognito.CognitoIdentityServiceProvider.CognitoUser(userData);

  cognitoUser.authenticateUser(authenticationDetails, { onSuccess: function (result) {
    console.log(result);
    completionHandler();
    AWS.config.credentials = new AWS.CognitoIdentityCredentials({IdentityPoolId : CognitoIdentityPoolId, Logins : {"cognito-idp.us-east-1.amazonaws.com/us-east-1_ZQhF1ytAU": result.getIdToken().getJwtToken()}});
  }, onFailure: function(error) {
    if (error.code == "UserNotConfirmedException") {
      confirmationHandler();
    } else {
      var errorAlert;
      if(error.code == "UserNotFoundException"){
         
         errorAlert = "El usuario no existe. Inténtalo de nuevo.";
         
         }
    
      if(error.code == "NotAuthorizedException"){
         
         errorAlert = "El usuario o el password son incorrectos. Por favor inténtalo de nuevo.";
         
         }
        
      if(error.code == "InvalidParameterException"){
         
         errorAlert = "Por favor proporciona tu mail y password para poder iniciar sesión.";
         
         }
      alert(errorAlert);
      //alert(error);
    }
  }});
}

function confirmUser(data, completionHandler) {
  var poolData = {UserPoolId : CognitoUserPoolId, ClientId : CognitoUserPoolAppClientId};
  var userPool = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool(poolData);

  var userData = {Username : data.email, Pool : userPool};
  var cognitoUser = new AWSCognito.CognitoIdentityServiceProvider.CognitoUser(userData);
  cognitoUser.confirmRegistration(data.code, true, function(error, result) {
    if (error) {
        
      var errorAlert;
        
      if(errorAlert == "CodeMismatchException: Invalid verification code provided, please try again."){
         
         errorAlert = "El código es incorrecto. Por favor, vuélvelo a intentar";
         
         }    
      alert(errorAlert);    
      //alert(error);
    } else {
      completionHandler();
    }
  });
}


function configureCredentials(session) {
  AWS.config.credentials = new AWS.CognitoIdentityCredentials({IdentityPoolId: CognitoIdentityPoolId, Logins: {"cognito-idp.us-east-1.amazonaws.com/us-east-1_ZQhF1ytAU": session.getIdToken().getJwtToken()}});
  AWS.config.region = "us-east-1";

  AWS.config.credentials.refresh((error) => {
        if (error) {
            alert(error);
        } else {
            console.log('Successfully logged!');
        }
    });
}

function getCurrentUser(completionHandler, errorHandler) {
  console.log("si se llama getCurrentUser");
  var user = getUserPool().getCurrentUser();

  if (user) {
    user.getSession(function (error, session) {
      if (error) {
        console.log(error);

        AWS.config.credentials = new AWS.CognitoIdentityCredentials({
          IdentityPoolId: CognitoIdentityPoolId
        });

        errorHandler();
      } else {
        user.getUserAttributes(function (error, attributes) {
          if (error) {
            console.log(error);

            AWS.config.credentials = new AWS.CognitoIdentityCredentials({
              IdentityPoolId: CognitoIdentityPoolId
            });

            errorHandler(error);
          } else {  
            console.log(window.location.pathname);
            console.log(attributes);
            
            //Se pueden renderear cosas del usuario aquí.
              
            completionHandler(attributes);
          }
        });

        configureCredentials(session);
      }
    });
  } else {
    console.log("No user found");

    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
      IdentityPoolId: CognitoIdentityPoolId
    });

    errorHandler();
  }
}

function authenticateUser(email, password, completionHandler, errorHandler, newPasswordHandler) {
  var authData = {Username: email, Password: password};
  var authDetails = new AWSCognito.CognitoIdentityServiceProvider.AuthenticationDetails(authData);

  var userData = {Username: email, Pool: getUserPool()};
  var cognitoUser = new AWSCognito.CognitoIdentityServiceProvider.CognitoUser(userData);

  cognitoUser.authenticateUser(authDetails, {onSuccess: function (result) {
    AWS.config.region = "us-east-1";
    configureCredentials(result);
    completionHandler();
  }, onFailure: function (error) {
    console.log(error);
    errorHandler(error);
  }, newPasswordRequired: function (userAttributes, requiredAttributes) {
    newPasswordHandler(cognitoUser, userAttributes, requiredAttributes);
  }});
}

/*function confirmUser(email, code, completionHandler, errorHandler) {
  var userPool = getUserPool();
  var userData = {Username: email, Pool: userPool};

  var user = new AWSCognito.CognitoIdentityServiceProvider.CognitoUser(userData);
  user.confirmRegistration(code, true, function (error, result) {
    if (error) {
      console.log(error);
      errorHandler(error);
    } else {
      console.log(result);
      completionHandler();
    }
  });
}*/

function resendConfirmation(email, completionHandler, errorHandler) {
  var userPool = getUserPool();
  var userData = {Username: email, Pool: userPool};

  var user = new AWSCognito.CognitoIdentityServiceProvider.CognitoUser(userData);
  user.resendConfirmationCode(function (error, result) {
    if (error) {
      console.log(error);
      errorHandler(error);
    } else {
      console.log(result);
      completionHandler();
    }
  });
}

function registerUser(name, email, password, picture, userType, completionHandler, errorHandler) {
  var userPool = getUserPool();

  var emailData = {Name: "email", Value: email};
  var emailAttribute = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserAttribute(emailData);

  var nameData = {Name: "name", Value: name};
  var nameAttribute = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserAttribute(nameData);

  var attributes = [emailAttribute, nameAttribute];

  userPool.signUp(email, password, attributes, null, function (error, result) {
    if (error) {
      errorHandler(error);
    } else {
      completionHandler();
    }
  });
}

function updateAttribute(name, value, completionHandler, errorHandler) {
  var user = getUserPool().getCurrentUser();

  if (user) {
    user.getSession(function (error, session) {
      if (error) {
        console.log(error);
        errorHandler(error);
      } else {
        var attributeData = {Name: name, Value: value};
        var attribute = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserAttribute(attributeData);

        user.updateAttributes([attribute], function (error, result) {
          if (error) {
            errorHandler(error);
          } else {
            completionHandler(result);
          }
        });
    }
  });
  } else {
    errorHandler(error);
  }
}

function signOut() {
  var user = getUserPool().getCurrentUser();

  if (user) {
    user.signOut();
    window.location = "login.html"; 
  } else {
    console.log("error in log off")
  }
}

function currentUserCompletionHandler() {


}

function currentUserErrorHandler() {
    window.location = "login.html";
    //openModalLi();

}
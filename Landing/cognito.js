function getUserPool() {
  var poolData = {UserPoolId: CognitoUserPoolId, ClientId: CognitoUserPoolAppClientId};
  var userPool = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool(poolData);

  return userPool;
}


function loginUI(event) {
  var email = document.getElementById("userMail").value;
  var password = document.getElementById("userPassword").value;

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
            
            console.log(attributes);
            
            var userType = attributes[0].Value;
              
            window.location.assign("/landingMaterias/index.html");
              
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
              
            userBuilder(attributes);
              
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

function signOut() {
  var user = getUserPool().getCurrentUser();

  if (user) {
    user.signOut();
    window.location = "/index.html"; 
  } else {
    console.log("error in log off")
  }
}

function currentUserCompletionHandler() {


}

function currentUserErrorHandler() {
    console.log("Entra current user error handler");
    window.location = "/index.html";
    //openModalLi();

}
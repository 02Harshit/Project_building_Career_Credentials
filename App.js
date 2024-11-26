import React,{useEffect, useState} from 'react';
import axios from 'axios';
import './App.css';

//Login component :-
function Login({onSwitchToRegister,onLoginSuccess}) {
  const [email,setEmail] = useState('');
  const [password,setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const response = await axios.post('http://localhost:5000/login', {email,password});
      const {token} = response.data;

      localStorage.setItem('authToken', response.data.token); //storing user token in local storage

      const userDetailsResponse = await axios.get('http://localhost:5000/dashboard', {
        headers: {
          Authorization: token,
        },
      });
      onLoginSuccess(userDetailsResponse.data);
      
    } catch(error){
      if (error.response && error.response.status === 401) {
        alert('Incorrect email or password. Please try again.');
      } else {
        alert('Login failed. Please check your connection and try again.');
      }
    }
  };

  return (
    <div className="main-login">
      <h1>Login</h1>
      <div className="field">
        <p>Email:</p> 
        <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)}></input>
      </div>
      <div className="field">
        <p>Password:</p>
        <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)}></input> 
      </div>  
      <div className="button-container">
        <button className="submit-button" onClick={handleLogin}>Login</button>
      </div>
      <p className="register-now">Not registered?{' '}<span className="status-switch" onClick={onSwitchToRegister}>Click here to register now!</span></p>
    </div>
  )
}

//Register component:-
function Register({onSwitchToLogin}) {
  const [email,setEmail] = useState('');
  const [password,setPassword] = useState('');
  const [name,setName] = useState('');
  const [degree,setDegree] = useState('');
  const [branch,setBranch] = useState('');
  const [year,setYear] = useState('');
  const [registermessage,setRegisterMessage] = useState('');

  const handleRegister = async () => {
    try{
  
      if(!email || !password || !name || !degree ||!branch || !year) {
        setRegisterMessage("Kindly fill all details!")
        return;
      }

      const response = await axios.post('http://localhost:5000/register', {email,password,name,degree,branch,year});
      console.log(response.data);
      
      setRegisterMessage(response.data.message)

    } catch(error) {
      if(error.response){
        setRegisterMessage('Registration failed:', error.response.data ); //server error
      } else if(error.request) {
        setRegisterMessage('No response from the server : ',error.request); // network error
      } else {
        setRegisterMessage('Error setting up the request :', error.message); // any other error
      }
    }
  }
  return (
    <div className="main-login">
      <h1>Register</h1>
      <div className="field">
        <p>Email:</p> 
        <input className="input-field" required type="email" value={email} onChange={(e) => setEmail(e.target.value)}placeholder="example@gmail.com"></input>
      </div>
      <div className="field">
        <p>Password:</p>
        <input className="input-field" required type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Use strong password"></input> 
      </div>
      <div className="field">
        <p>Name:</p>
        <input className="input-field" required type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Harshit Mittal"></input>
      </div>
      <div className="field">
        <p>Degree:</p>
        <input className="input-field" required type="text" value={degree} onChange={(e) => setDegree(e.target.value)} placeholder="Ex: Btech"></input>
      </div>
      <div className="field">
        <p>Branch:</p>
        <input className="input-field" required type="text" value={branch} onChange={(e) => setBranch(e.target.value)} placeholder="Ex: CSE"></input>
      </div>
      <div className="field">
        <p>Year:</p>
        <input className="input-field" required type="number" value={year} onChange={(e) => setYear(e.target.value)} placeholder="Ex: 3"></input>
      </div>
      <div className="register-button">
        <button className="submit-button" onClick={handleRegister}>Register</button>
      </div>
      <p className="register-now">Already Registered?{' '}<span className="status-switch" onClick={onSwitchToLogin}>Click here to Login!</span></p>
      <p id="register-message">{registermessage}</p>
    </div>

  )

}

//dashboard component
function Dashboard( {userDetails}) {
  const [newpassword, setNewPassword] = useState('');
  const token  = localStorage.getItem('authToken');
  const [isEditing,setIsEditing] = useState({
    name: false,
    degree: false,
    branch: false,
    year: false
  });
  const [updatedDetails, setUpdatedDetails] = useState({...userDetails});

  const handleEditClick = (field) => {
    setIsEditing({...isEditing, [field]: true});
    
  };

  const handleSaveClick = async (field) => {
    try {
      const response = await axios.post('http://localhost:5000/update-user-info', 
      { [field]:updatedDetails[field], userid: userDetails.id},
      {
        headers:{
          Authorization:`Bearer: ${token}`,
        },
      }
      );
      alert(response.data.message);
      setIsEditing({...isEditing, [field]:false});
    } catch (error) {
      console.error("Failed to update user info:" , error.response ? error.response.data : error.message);
    }
  };

  const handleInputChange = (field,value) => {
    setUpdatedDetails({...updatedDetails,[field]:value});
  };


  const handlePasswordUpdate = async () => {
    try {
      if (!newpassword) {
        alert("Enter new password to update!");
        return;
      }
      console.log("User id:", userDetails.email);
      console.log("New Password :", newpassword);

      const response = await axios.post('http://localhost:5000/update-password', {
        userid: userDetails.email,
        newpassword, 
      }, {
        headers: {
          Authorization:`Bearer ${token}`,
        },
      });
      alert(response.data.message);
    } catch (error) {
      console.error("Failed to update passwword:",error.response ? error.response.data : error.message);
    }
  };


  const handleLogout = () => {
    localStorage.removeItem('authToken');
    window.location.reload();
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Welcome, {updatedDetails.name}!</h1>
      </header>
      <div className="user-info">
      <p><strong>Email:</strong> {userDetails.email}</p>

      <p><strong>Update Password:</strong>{' '}<input className="new-password-field" type="password" value={newpassword} onChange={(e) => setNewPassword(e.target.value)} placeholder='Enter new Password '></input>{'    '}<button className="update-button" onClick={handlePasswordUpdate}>Update</button></p>
      <p><strong>Name:</strong>{' '}
      {isEditing.name ? (<><input type="text" value={updatedDetails.name} onChange={(e)=>handleInputChange('name',e.target.value)}/> <button className="update-button" onClick={() => handleSaveClick('name')}>Save</button>
      </>) : (<> {updatedDetails.name}{' '} <button className="edit-button" onClick={() => handleEditClick('name')}></button></>)}
      </p>

      <p><strong>Degree:</strong> {isEditing.degree ? (<><input type="text" value={updatedDetails.degree} onChange={(e)=>handleInputChange('degree',e.target.value)}/> <button className="update-button" onClick={() => handleSaveClick('degree')}>Save</button>
      </>) : (<> {updatedDetails.degree}{' '} <button className="edit-button" onClick={() => handleEditClick('degree')}></button></>)}
      </p>
      
      <p><strong>Branch:</strong>{isEditing.branch ? (<><input type="text" value={updatedDetails.branch} onChange={(e)=>handleInputChange('branch',e.target.value)}/> <button className="update-button" onClick={() => handleSaveClick('branch')}>Save</button>
      </>) : (<> {updatedDetails.branch}{' '} <button className="edit-button" onClick={() => handleEditClick('branch')}></button></>)}
      </p>
      
      <p><strong>Year:</strong>{isEditing.year ? (<><input type="text" value={updatedDetails.year} onChange={(e)=>handleInputChange('year',e.target.value)}/> <button className="update-button" onClick={() => handleSaveClick('year')}>Save</button>
      </>) : (<> {updatedDetails.year}{' '} <button className="edit-button" onClick={() => handleEditClick('year')}></button></>)}
      </p>
      
      </div>
      <div className="logout-container">
      <button className="logout-button" onClick={handleLogout}>
          Logout
      </button>
      </div>
    </div>
  );
}


export default function App() {
  const [isLogging,setIsLogging] = useState(true);
  const [isLoggedIn,setIsLoggedIn] = useState(false);
  const [userDetails,setUserDetails] = useState(null);

  return (
    <>
      {isLoggedIn ? 
      (<Dashboard userDetails={userDetails} />) : isLogging ?
       (<Login onSwitchToRegister={() => setIsLogging(false)}
       onLoginSuccess={(user) => {
        setUserDetails(user);
        setIsLoggedIn(true);
       }}
       />
      ) : (
        <Register onSwitchToLogin={() => setIsLogging(true)} />
      )} 
    </>  
  );
}


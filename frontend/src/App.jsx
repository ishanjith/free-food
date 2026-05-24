
import { useState } from "react"
import AuthForm from "./AuthForm"
import Map from "./Map"  
import AdminPanel from "./AdminPanel"
import "./Map.css"


function App(){
  const[token,setToken]=useState(
  localStorage.getItem("token"))
  const[role, setRole] =useState(
    localStorage.getItem("role")
  )
  console.log(role)
  return(
    <div>
      
      {token? (
        <>
        <div className="navbar">
          <h1>Free Food Finder</h1>
        <button onClick={()=>{setToken(null) ;setRole(null)
          localStorage.removeItem("token")
          localStorage.removeItem("role")
        }}>Logout</button>
        </div>
        <Map token={token} role={role}/>
        {role==="admin" && (
          <AdminPanel token={token}/>
        )}
        </>
      ):(
        <AuthForm setToken={setToken} setRole={setRole} />
      )}
      
    </div>
  )
}
export default App
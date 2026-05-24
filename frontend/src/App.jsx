
import { useState } from "react"
import AuthForm from "./AuthForm"
import Map from "./Map"  
import AdminPanel from "./AdminPanel"


function App(){
  const[token,setToken]=useState(
  localStorage.getItem("token"))
  const[role, setRole] =useState(
    localStorage.getItem("role")
  )
  console.log(role)
  return(
    <div>
      <h1>Free Food Finder</h1>
      {token? (
        <>
        <button onClick={()=>{setToken(null) ;setRole(null)
          localStorage.removeItem("token")
          localStorage.removeItem("role")
        }}>Logout</button>
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
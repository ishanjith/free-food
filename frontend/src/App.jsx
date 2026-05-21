
import { useState } from "react"
import AuthForm from "./AuthForm"
import Map from "./Map"  
import AdminPanel from "./AdminPanel"


function App(){
  const[token,setToken]=useState(null)
  const[role, setRole] =useState(null)
  console.log(role)
  return(
    <div>
      <h1>Free Food Finder</h1>
      {token? (
        <>
        <button onClick={()=>{setToken(null) ;setRole(null)}}>Logout</button>
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
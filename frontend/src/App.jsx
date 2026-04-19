
import { useState } from "react"
import AuthForm from "./AuthForm"
import Map from "./Map"  


function App(){
  const[token,setToken]=useState(null)
  return(
    <div>
      <h1>Free Food Finder</h1>
      {token? (
        <>
        <button onClick={()=>setToken(null)}>Logout</button>
        <Map token={token}/>
        </>
      ):(
        <AuthForm setToken={setToken} />
      )}
      
    </div>
  )
}
export default App
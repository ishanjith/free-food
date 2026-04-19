import { useState  } from "react"


function AuthForm({setToken}){
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [isLogin, setIsLogin] = useState(true)
    const [error, setError] = useState(null)

    const handleSubmit = async(e)=> {
        e.preventDefault()
        setError(null)

        const endpoint = isLogin? "/login":"/register"
        try{
            const res =await fetch(`http://localhost:5000${endpoint}`,{
                method:"POST",
                headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          username,
          password
            })
        })
        const data = await res.json()
        if(!res.ok){
            setError(data.error|| "somethig went wrong")
        }
        if (isLogin){
            setToken(data.token)
        }
        else{
            setIsLogin(true)
        }
    }catch(err){
        setError("server erroir")
    }
}
return(
    <div>
        <h2>{isLogin? "login":"register"}</h2>
        <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <br />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <br />
        <button type="submit">
          {isLogin ? "Login" : "Register"}
        </button>
      </form>
      {error && <p style={{color:"red"}}>{error}</p>}
      <p>
        {isLogin? "Dont have an account?": "Already have an account?"}
        {" "}
        <span onClick={()=>{
            setIsLogin(!isLogin)
            setError(null)
        }}
        style={{color:"blue" , cursor:"pointer"}}>
            {isLogin? "register": "login"}
        </span>
      </p>
    </div>
)
}
export default AuthForm
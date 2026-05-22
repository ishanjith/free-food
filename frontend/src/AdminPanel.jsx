import { useState,useEffect } from "react";
function AdminPanel({token}){
    const[pendingSpots,setPendingspots] = useState([])
    useEffect(()=>{
        fetch(`${import.meta.env.VITE_API_URL}/admin/spots`,{headers:{
            Authorization: `Bearer ${token}`
        }})
        .then((res)=>res.json())
        .then((data)=>setPendingspots(data))
        .catch((err)=>console.log(err))
    },[])
    const handleApprove = async(id)=>{
        try{
            await fetch(`${import.meta.env.VITE_API_URL}/admin/spots/${id}/approve`,{
                method : "PUT",
                headers:{
                    Authorization:`Bearer ${token}`
                }
            })
            setPendingspots(pendingSpots.filter((spot)=>spot.id!==id))
        }catch(err){
            console.log(err)
        }
    }
    const handleReject = async (id) => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/admin/spots/${id}/reject`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      setPendingspots(
        pendingSpots.filter((spot) => spot.id !== id)
      )
    } catch (err) {
      console.log(err)
    }
  }
  return(
    <div>
        <h2>pending spots</h2>
        {pendingSpots.map((spot)=>(
            <div key={spot.id}>
                <h3>{spot.name}</h3>
                <p>{spot.description}</p>
                <button onClick={()=>handleApprove(spot.id)}>Approve</button>
                <button onClick={()=>handleReject(spot.id)}>Reject</button>
                </div>
        ))}
        
    </div>
  )
  
}
export default AdminPanel
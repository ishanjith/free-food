import {MapContainer,TileLayer,Marker,Popup} from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import {useState,useEffect} from 'react'
 function Map(){
    const [spots,SetSpots] = useState([])
    useEffect(()=>{
        fetch('http://127.0.0.1:5000/spots')
        .then(res => res.json())
        .then(data => {SetSpots(data)
            
        })
        
    },[])
    return(
        <MapContainer center={[10.85,76.27]} zoom={13} style={{height : "100vh", width : "100%"}}>
            
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="openstreet map"/>
            {spots.map(spot =>(
            <Marker key={spot.id} position={[spot.latitude,spot.longitude]}> 
                <Popup>
                    <b>{spot.name}</b><br/>
                    <b>{spot.description}</b><br/>
                    <b>{spot.type}</b>

                </Popup>
            </Marker>))}
        </MapContainer>
    )
 }
 export default Map
import {MapContainer,TileLayer,Marker,Popup, useMapEvents} from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import {useState,useEffect} from 'react'
import L from 'leaflet'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
import './Map.css'

L.Marker.prototype.options.icon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconAnchor: [12, 41],
})
 function ClickHandler({setClickedPos}){
    useMapEvents({
        click(e){
            const lat = e.latlng.lat
            const lng = e.latlng.lng
            setClickedPos({lat : lat,lng:lng})
            console.log(lat,lng)
        }
    })
    return null
 }
 function AddSpotForm({ clickedPos ,onSpotAdded,setClickedPos,token}) {
    const [name, setName] = useState('')
    const [type, setType] = useState('')
    const [description, setDescription] = useState('')

    function handleSubmit() {
        if(!name) {
            alert("name is empty")
            return
        }
        fetch(`${import.meta.env.VITE_API_URL}/spots`,{
            method : 'POST',
            headers : {'Content-Type' : 'application/json',
                        'Authorization': `Bearer ${token}`
            },
            body : JSON.stringify({name: name,
                                    type: type,
                                    description: description,
                        latitude: clickedPos.lat,
                        longitude: clickedPos.lng})
            
        })
        .then(res=> res.json())
            .then(data =>{onSpotAdded(data)
                setName('')
                setType('')
                setDescription('')
                setClickedPos(null)
            })
            .catch(err=>{
                alert("error submitting, pls retry")
            })
            

    }

    return (
        <div className="spot-form" onClick={e => e.stopPropagation()}>
            <input placeholder='Name' value={name} onChange={e => setName(e.target.value)} />
            <select value={type} onChange={e => setType(e.target.value)}>
                <option value="">Select type</option>
                <option value="annadhanam">Annadhanam</option>
                <option value="community kitchen">Community Kitchen</option>
                <option value="food bank">Food Bank</option>
                <option value="other">Other</option>
                </select>
            <input placeholder='Description' value={description} onChange={e => setDescription(e.target.value)} />
            <button onClick={handleSubmit}>Submit</button>
        </div>
    )
}
 
 function Map({token}){
    const [spots,SetSpots] = useState([])
    const [clickedPos, setClickedPos] = useState(null)
    const [filterType,setFilterType] = useState('all')
   
    
    useEffect(()=>{
        fetch(`${import.meta.env.VITE_API_URL}/spots`)
        .then(res => res.json())
        .then(data => {SetSpots(data)
    
        })
        
    },[])
    function handleNewSpot(newSpot){
    SetSpots(prev=> [...prev,newSpot])

 }
    
    return(<div className="map-page">
            <div className="map-controls">
        <select value={filterType} onChange={e=> setFilterType(e.target.value)}>

            <option value="all">All</option>
             <option value="annadhanam">Annadhanam</option>
            <option value="community kitchen">Community Kitchen</option>
            <option value="food bank">Food Bank</option>
            <option value="other">Other</option>
        </select>
        </div>
        <div className='map-wrapper'>
        <MapContainer center={[10.85,76.27]} zoom={13} style={{height : "100%", width : "100%"}}>
            
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="openstreet map"/>
            <ClickHandler setClickedPos={setClickedPos}></ClickHandler>
            {clickedPos && ( 
                <Popup position={[clickedPos.lat,clickedPos.lng]}>
                    <AddSpotForm clickedPos={clickedPos} onSpotAdded={handleNewSpot} setClickedPos={setClickedPos} token={token} />

                </Popup>
            )

            }
            {spots.filter(spot=> filterType==='all' || spot.type===filterType).map(spot =>(
            <Marker key={spot.id} position={[spot.latitude,spot.longitude]}> 
                <Popup>
                    <b>{spot.name}</b><br/>
                    <b>{spot.description}</b><br/>
                    <b>{spot.type}</b><br/>
                    <b><span>Last seen :{spot.last_seen}</span></b>

                </Popup>
            </Marker>))}
        </MapContainer></div></div>
    )
 }
 export default Map

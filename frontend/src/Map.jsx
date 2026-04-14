import {MapContainer,TileLayer,Marker,Popup, useMapEvents} from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import {useState,useEffect} from 'react'
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
 function AddSpotForm({ clickedPos ,onSpotAdded}) {
    const [name, setName] = useState('')
    const [type, setType] = useState('')
    const [description, setDescription] = useState('')

    function handleSubmit() {
        fetch('http://127.0.0.1:5000/spots',{
            method : 'POST',
            headers : {'Content-Type' : 'application/json'},
            body : JSON.stringify({name: name,
                                    type: type,
                                    description: description,
                        latitude: clickedPos.lat,
                        longitude: clickedPos.lng})
            
        })
        .then(res=> res.json())
            .then(data =>{onSpotAdded(data)})

    }

    return (
        <div onClick={e => e.stopPropagation()}>
            <input value={name} onChange={e => setName(e.target.value)} />
            <input value={type} onChange={e => setType(e.target.value)} />
            <input value={description} onChange={e => setDescription(e.target.value)} />
            <button onClick={handleSubmit}>Submit</button>
        </div>
    )
}
 
 function Map(){
    const [spots,SetSpots] = useState([])
    const [clickedPos, setClickedPos] = useState(null)
   
    
    useEffect(()=>{
        fetch('http://127.0.0.1:5000/spots')
        .then(res => res.json())
        .then(data => {SetSpots(data)
    
        })
        
    },[])
    function handleNewSpot(newSpot){
    SetSpots(prev=> [...prev,newSpot])

 }
    
    return(
        <MapContainer center={[10.85,76.27]} zoom={13} style={{height : "100vh", width : "100%"}}>
            
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="openstreet map"/>
            <ClickHandler setClickedPos={setClickedPos}></ClickHandler>
            {clickedPos && ( 
                <Popup position={[clickedPos.lat,clickedPos.lng]}>
                    <AddSpotForm clickedPos={clickedPos} onSpotAdded={handleNewSpot} />

                </Popup>
            )

            }
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

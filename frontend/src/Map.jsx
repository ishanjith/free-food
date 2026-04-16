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
 function AddSpotForm({ clickedPos ,onSpotAdded,setClickedPos}) {
    const [name, setName] = useState('')
    const [type, setType] = useState('')
    const [description, setDescription] = useState('')

    function handleSubmit() {
        if(!name) {
            alert("name is empty")
            return
        }
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
        <div onClick={e => e.stopPropagation()}>
            <input value={name} onChange={e => setName(e.target.value)} /><br/>
            <select value={type} onChange={e => setType(e.target.value)}>
                <option value="">Select type</option>
                <option value="annadhanam">Annadhanam</option>
                <option value="community kitchen">Community Kitchen</option>
                <option value="food bank">Food Bank</option>
                <option value="other">Other</option>
                </select> <br/>
            <input value={description} onChange={e => setDescription(e.target.value)} /><br/>
            <button onClick={handleSubmit}>Submit</button>
        </div>
    )
}
 
 function Map(){
    const [spots,SetSpots] = useState([])
    const [clickedPos, setClickedPos] = useState(null)
    const [filterType,setFilterType] = useState('all')
   
    
    useEffect(()=>{
        fetch('http://127.0.0.1:5000/spots')
        .then(res => res.json())
        .then(data => {SetSpots(data)
    
        })
        
    },[])
    function handleNewSpot(newSpot){
    SetSpots(prev=> [...prev,newSpot])

 }
    
    return(<div>
        <select value={filterType} onChange={e=> setFilterType(e.target.value)}>

            <option value="all">All</option>
             <option value="annadhanam">Annadhanam</option>
            <option value="community kitchen">Community Kitchen</option>
            <option value="food bank">Food Bank</option>
            <option value="other">Other</option>
        </select>
        
        <MapContainer center={[10.85,76.27]} zoom={13} style={{height : "100vh", width : "100%"}}>
            
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="openstreet map"/>
            <ClickHandler setClickedPos={setClickedPos}></ClickHandler>
            {clickedPos && ( 
                <Popup position={[clickedPos.lat,clickedPos.lng]}>
                    <AddSpotForm clickedPos={clickedPos} onSpotAdded={handleNewSpot} setClickedPos={setClickedPos} />

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
        </MapContainer></div>
    )
 }
 export default Map

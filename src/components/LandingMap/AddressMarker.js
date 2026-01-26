import { Marker, Popup } from 'react-leaflet';

const AddressMarker = ({ addressMarker }) => {
  if (!addressMarker) return null;

  return (
    <Marker position={addressMarker.position}>
      <Popup>
        <div className="demo-address-popup">
          <h4>📍 Dirección Encontrada</h4>
          <p className="demo-address-text">{addressMarker.address}</p>
          <p className="demo-popup-note">💡 Regístrate para conectar con vecinos de esta zona</p>
        </div>
      </Popup>
    </Marker>
  );
};

export default AddressMarker;
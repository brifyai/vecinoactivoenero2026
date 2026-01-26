import ListAltIcon from '@mui/icons-material/ListAlt';
import PlumbingIcon from '@mui/icons-material/Plumbing';
import ElectricalServicesIcon from '@mui/icons-material/ElectricalServices';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import CarpenterIcon from '@mui/icons-material/Carpenter';
import FormatPaintIcon from '@mui/icons-material/FormatPaint';
import YardIcon from '@mui/icons-material/Yard';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import BuildIcon from '@mui/icons-material/Build';
import CleaningServicesIcon from '@mui/icons-material/CleaningServices';
import HandymanIcon from '@mui/icons-material/Handyman';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import LightbulbIcon from '@mui/icons-material/Lightbulb';

export const directoryCategories = {
  serviceCategories: [
    { value: 'all', label: 'Todos', icon: <ListAltIcon />, color: '#6b7280' },
    { value: 'plomero', label: 'Plomeros', icon: <PlumbingIcon />, color: '#3b82f6' },
    { value: 'electricista', label: 'Electricistas', icon: <ElectricalServicesIcon />, color: '#f59e0b' },
    { value: 'gasfiter', label: 'Gasfiters', icon: <WaterDropIcon />, color: '#06b6d4' },
    { value: 'carpintero', label: 'Carpinteros', icon: <CarpenterIcon />, color: '#8b5cf6' },
    { value: 'pintor', label: 'Pintores', icon: <FormatPaintIcon />, color: '#ec4899' },
    { value: 'jardinero', label: 'Jardineros', icon: <YardIcon />, color: '#10b981' },
    { value: 'cerrajero', label: 'Cerrajeros', icon: <VpnKeyIcon />, color: '#f97316' },
    { value: 'tecnico', label: 'Técnicos', icon: <BuildIcon />, color: '#14b8a6' },
    { value: 'limpieza', label: 'Limpieza', icon: <CleaningServicesIcon />, color: '#a855f7' },
    { value: 'otro', label: 'Otros', icon: <HandymanIcon />, color: '#64748b' }
  ],

  businessCategories: [
    { value: 'all', label: 'Todos', icon: <ListAltIcon /> },
    { value: 'comercio', label: 'Comercio', icon: <ShoppingCartIcon />, color: '#3b82f6' },
    { value: 'servicio', label: 'Servicio', icon: <BuildIcon />, color: '#10b981' },
    { value: 'profesional', label: 'Profesional', icon: <MedicalServicesIcon />, color: '#8b5cf6' },
    { value: 'emprendimiento', label: 'Emprendimiento', icon: <LightbulbIcon />, color: '#f59e0b' }
  ]
};
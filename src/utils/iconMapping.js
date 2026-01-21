// Mapeo de iconos Material UI para toda la aplicación
import ListAltIcon from '@mui/icons-material/ListAlt';
import CampaignIcon from '@mui/icons-material/Campaign';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import CelebrationIcon from '@mui/icons-material/Celebration';
import WarningIcon from '@mui/icons-material/Warning';
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
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import HandshakeIcon from '@mui/icons-material/Handshake';
import SportsIcon from '@mui/icons-material/Sports';
import TheaterComedyIcon from '@mui/icons-material/TheaterComedy';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import FavoriteIcon from '@mui/icons-material/Favorite';
import SentimentVerySatisfiedIcon from '@mui/icons-material/SentimentVerySatisfied';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';
import TagFacesIcon from '@mui/icons-material/TagFaces';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import HotelIcon from '@mui/icons-material/Hotel';
import DescriptionIcon from '@mui/icons-material/Description';
import CreateIcon from '@mui/icons-material/Create';
import GroupsIcon from '@mui/icons-material/Groups';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import StarIcon from '@mui/icons-material/Star';
import MilitaryTechIcon from '@mui/icons-material/MilitaryTech';

// Iconos para categorías de posts
export const postCategoryIcons = {
  all: <ListAltIcon />,
  general: <DescriptionIcon />,
  anuncio: <CampaignIcon />,
  seguridad: <WarningIcon />,
  marketplace: <ShoppingCartIcon />,
  consulta: <HelpOutlineIcon />,
  evento: <CelebrationIcon />,
  emergencia: <WarningIcon />
};

// Iconos para servicios
export const serviceIcons = {
  all: <ListAltIcon />,
  plomero: <PlumbingIcon />,
  electricista: <ElectricalServicesIcon />,
  gasfiter: <WaterDropIcon />,
  carpintero: <CarpenterIcon />,
  pintor: <FormatPaintIcon />,
  jardinero: <YardIcon />,
  cerrajero: <VpnKeyIcon />,
  tecnico: <BuildIcon />,
  limpieza: <CleaningServicesIcon />,
  otro: <HandymanIcon />
};

// Iconos para tipos de eventos
export const eventTypeIcons = {
  oficial: <AccountBalanceIcon />,
  vecinal: <HomeWorkIcon />,
  servicio: <BuildIcon />,
  emergencia: <WarningIcon />,
  taller: <MenuBookIcon />,
  reunion: <HandshakeIcon />,
  deporte: <SportsIcon />,
  cultural: <TheaterComedyIcon />
};

// Iconos para sentimientos/emociones
export const feelingIcons = {
  feliz: <EmojiEmotionsIcon />,
  enamorado: <FavoriteIcon />,
  genial: <SentimentVerySatisfiedIcon />,
  triste: <SentimentVeryDissatisfiedIcon />,
  divertido: <TagFacesIcon />,
  celebrando: <CelebrationIcon />,
  motivado: <FitnessCenterIcon />,
  cansado: <HotelIcon />
};

// Iconos para badges/logros
export const badgeIcons = {
  FIRST_POST: <CreateIcon />,
  SOCIAL_BUTTERFLY: <GroupsIcon />,
  PROJECT_STARTER: <RocketLaunchIcon />,
  PROJECT_MASTER: <EmojiEventsIcon />,
  GOOD_SAMARITAN: <VolunteerActivismIcon />,
  EVENT_ORGANIZER: <CelebrationIcon />,
  SHARING_IS_CARING: <CardGiftcardIcon />,
  WEEK_STREAK: <LocalFireDepartmentIcon />,
  MONTH_STREAK: <StarIcon />,
  TOP_10: <MilitaryTechIcon />
};

const iconMappings = {
  postCategoryIcons,
  serviceIcons,
  eventTypeIcons,
  feelingIcons,
  badgeIcons
};

export default iconMappings;

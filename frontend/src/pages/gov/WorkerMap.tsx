import { useState, useMemo } from 'react'
import {
  Map,
  Info,
  Filter,
  Layers,
  Building2,
  Users,
  ShieldCheck,
  ChevronRight,
  Search,
  X,
  ExternalLink,
  MapPin,
  CheckCircle2,
} from 'lucide-react'
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import LanguageSelector from '@/components/LanguageSelector'
import { useTranslation } from '@/utils/translations'

// Fix Leaflet default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

const GUJARAT_DISTRICTS = [
  'All Districts',
  'Ahmedabad',
  'Surat',
  'Vadodara',
  'Rajkot',
  'Gandhinagar',
  'Kutch',
  'Bharuch',
  'Morbi',
  'Jamnagar',
  'Bhavnagar',
]

const SECTORS = ['All', 'Construction', 'Textiles', 'Diamond', 'Manufacturing']

export interface CompanyData {
  id: string
  name: string
  code: string
  district: string
  coords: [number, number]
  sector: string
  registeredEmployees: number
  complianceScore: number
  safetyRating: string
  address: string
  contactPerson: string
}

// ─── 60 Registered Enterprises (6+ in EVERY city on the working map) ─────────
const REGISTERED_COMPANIES: CompanyData[] = [
  // ── Surat (6 companies) ──
  {
    id: 'c-surat-1',
    name: 'Shree Construction Ltd.',
    code: 'CMP-GJ-0481',
    district: 'Surat',
    coords: [21.1648, 72.6845],
    sector: 'Construction',
    registeredEmployees: 1420,
    complianceScore: 98,
    safetyRating: 'A+ Verified',
    address: 'Plot 42, GIDC Industrial Estate, Hazira, Surat',
    contactPerson: 'Rajesh Shah (HR Head)',
  },
  {
    id: 'c-surat-2',
    name: 'Surat Diamond Craft Industries',
    code: 'CMP-GJ-0544',
    district: 'Surat',
    coords: [21.2266, 72.8312],
    sector: 'Diamond',
    registeredEmployees: 840,
    complianceScore: 92,
    safetyRating: 'B+ Monitored',
    address: 'Katargam Diamond Hub, Surat',
    contactPerson: 'Ketan Dholakia (Owner)',
  },
  {
    id: 'c-surat-3',
    name: 'Pandesara Synthetic Weaving Mills',
    code: 'CMP-GJ-0412',
    district: 'Surat',
    coords: [21.1396, 72.8252],
    sector: 'Textiles',
    registeredEmployees: 960,
    complianceScore: 94,
    safetyRating: 'A Verified',
    address: 'Pandesara GIDC Main Road, Surat',
    contactPerson: 'Manish Choksi (Mill In-Charge)',
  },
  {
    id: 'c-surat-4',
    name: 'Sachin Industrial Engineering Works',
    code: 'CMP-GJ-0503',
    district: 'Surat',
    coords: [21.0827, 72.8631],
    sector: 'Manufacturing',
    registeredEmployees: 620,
    complianceScore: 96,
    safetyRating: 'A+ Verified',
    address: 'Road No. 6, Sachin GIDC Area, Surat',
    contactPerson: 'Deepak Varma (Site Director)',
  },
  {
    id: 'c-surat-5',
    name: 'Kiran Gems & Polishing Unit 2',
    code: 'CMP-GJ-0588',
    district: 'Surat',
    coords: [21.205, 72.848],
    sector: 'Diamond',
    registeredEmployees: 780,
    complianceScore: 95,
    safetyRating: 'A Verified',
    address: 'Varachha Diamond Zone, Mini Bazar, Surat',
    contactPerson: 'Dinesh Patel (Operations)',
  },
  {
    id: 'c-surat-6',
    name: 'Gujarat Heavy Infrastructure Sites',
    code: 'CMP-GJ-0621',
    district: 'Surat',
    coords: [21.189, 72.795],
    sector: 'Construction',
    registeredEmployees: 890,
    complianceScore: 97,
    safetyRating: 'A+ Verified',
    address: 'Adajan Riverfront Expressway Project, Surat',
    contactPerson: 'Pravin Solanki (Chief Engineer)',
  },

  // ── Ahmedabad (6 companies) ──
  {
    id: 'c-ahm-1',
    name: 'Reliance Textile & Fabrics Unit',
    code: 'CMP-GJ-0112',
    district: 'Ahmedabad',
    coords: [23.0725, 72.6582],
    sector: 'Textiles',
    registeredEmployees: 1180,
    complianceScore: 95,
    safetyRating: 'A Verified',
    address: 'Naroda GIDC Phase 3, Ahmedabad',
    contactPerson: 'Viren Patel (Operations Director)',
  },
  {
    id: 'c-ahm-2',
    name: 'Arvind SmartSpaces Infra Works',
    code: 'CMP-GJ-0185',
    district: 'Ahmedabad',
    coords: [23.0189, 72.6687],
    sector: 'Construction',
    registeredEmployees: 920,
    complianceScore: 96,
    safetyRating: 'A+ Verified',
    address: 'Odhav Industrial Hub Site 2, Ahmedabad',
    contactPerson: 'Bhavin Shah (Project Head)',
  },
  {
    id: 'c-ahm-3',
    name: 'Tata Motors Assembly Ancillary',
    code: 'CMP-GJ-0204',
    district: 'Ahmedabad',
    coords: [22.9924, 72.3812],
    sector: 'Manufacturing',
    registeredEmployees: 1050,
    complianceScore: 99,
    safetyRating: 'A+ Verified',
    address: 'Sanand Industrial GIDC Sector 4, Ahmedabad',
    contactPerson: 'Anirudh Roy (EHS Lead)',
  },
  {
    id: 'c-ahm-4',
    name: 'Vatva Chemical & Dye Industries',
    code: 'CMP-GJ-0229',
    district: 'Ahmedabad',
    coords: [22.9576, 72.6284],
    sector: 'Manufacturing',
    registeredEmployees: 740,
    complianceScore: 91,
    safetyRating: 'B+ Monitored',
    address: 'Vatva GIDC Phase 2, Ahmedabad',
    contactPerson: 'Kamlesh Joshi (Safety Officer)',
  },
  {
    id: 'c-ahm-5',
    name: 'Changodar Logistics & Warehouse Park',
    code: 'CMP-GJ-0248',
    district: 'Ahmedabad',
    coords: [22.9234, 72.4418],
    sector: 'Manufacturing',
    registeredEmployees: 680,
    complianceScore: 93,
    safetyRating: 'A Verified',
    address: 'Changodar Industrial Belt, Sarkhej-Bavla Road, Ahmedabad',
    contactPerson: 'Sunil Nair (Plant Manager)',
  },
  {
    id: 'c-ahm-6',
    name: 'Ahmedabad Metro Rail Infra Consortium',
    code: 'CMP-GJ-0277',
    district: 'Ahmedabad',
    coords: [23.035, 72.585],
    sector: 'Construction',
    registeredEmployees: 1120,
    complianceScore: 97,
    safetyRating: 'A+ Verified',
    address: 'Kalupur Elevated Viaduct Corridor, Ahmedabad',
    contactPerson: 'Vikram Joshi (Site In-Charge)',
  },

  // ── Vadodara (6 companies) ──
  {
    id: 'c-vad-1',
    name: 'L&T Infrastructure Project Site #4',
    code: 'CMP-GJ-0923',
    district: 'Vadodara',
    coords: [22.2534, 73.1945],
    sector: 'Construction',
    registeredEmployees: 950,
    complianceScore: 96,
    safetyRating: 'A+ Verified',
    address: 'Makarpura Industrial Zone, Vadodara',
    contactPerson: 'Sanjay Verma (Site Manager)',
  },
  {
    id: 'c-vad-2',
    name: 'Gujarat Alkalies & Chemicals Unit',
    code: 'CMP-GJ-0941',
    district: 'Vadodara',
    coords: [22.4112, 73.0921],
    sector: 'Manufacturing',
    registeredEmployees: 820,
    complianceScore: 98,
    safetyRating: 'A+ Verified',
    address: 'Nandesari GIDC Complex, Vadodara',
    contactPerson: 'Dr. Hiren Bhatt (VP Works)',
  },
  {
    id: 'c-vad-3',
    name: 'Savli Heavy Engineering Fabrication',
    code: 'CMP-GJ-0965',
    district: 'Vadodara',
    coords: [22.5621, 73.2215],
    sector: 'Manufacturing',
    registeredEmployees: 710,
    complianceScore: 94,
    safetyRating: 'A Verified',
    address: 'Savli GIDC Phase 1, Vadodara',
    contactPerson: 'Manoj Parmar (HR Admin)',
  },
  {
    id: 'c-vad-4',
    name: 'Waghodia Auto Systems & Components',
    code: 'CMP-GJ-0982',
    district: 'Vadodara',
    coords: [22.2845, 73.3712],
    sector: 'Manufacturing',
    registeredEmployees: 640,
    complianceScore: 92,
    safetyRating: 'B+ Monitored',
    address: 'Waghodia GIDC Industrial Estate, Vadodara',
    contactPerson: 'Chetan Desai (Quality Manager)',
  },
  {
    id: 'c-vad-5',
    name: 'Baroda Polyplast & Textile Mills',
    code: 'CMP-GJ-1004',
    district: 'Vadodara',
    coords: [22.315, 73.162],
    sector: 'Textiles',
    registeredEmployees: 580,
    complianceScore: 93,
    safetyRating: 'A Verified',
    address: 'Gorwa Industrial Area, Vadodara',
    contactPerson: 'Ashwin Patel (General Manager)',
  },
  {
    id: 'c-vad-6',
    name: 'Manjusar Pharma & Engineering Hub',
    code: 'CMP-GJ-1028',
    district: 'Vadodara',
    coords: [22.4512, 73.2045],
    sector: 'Manufacturing',
    registeredEmployees: 890,
    complianceScore: 97,
    safetyRating: 'A+ Verified',
    address: 'Manjusar GIDC Sector 3, Vadodara',
    contactPerson: 'Ravi Teja (Site Engineer)',
  },

  // ── Rajkot (6 companies) ──
  {
    id: 'c-raj-1',
    name: 'Rajkot Auto Components Ltd.',
    code: 'CMP-GJ-0319',
    district: 'Rajkot',
    coords: [22.2341, 70.6912],
    sector: 'Manufacturing',
    registeredEmployees: 520,
    complianceScore: 91,
    safetyRating: 'A Verified',
    address: 'Metoda GIDC Industrial Area, Rajkot',
    contactPerson: 'Pravin Randeria (GM)',
  },
  {
    id: 'c-raj-2',
    name: 'Shapar Castings & Forgings Works',
    code: 'CMP-GJ-0338',
    district: 'Rajkot',
    coords: [22.1645, 70.7812],
    sector: 'Manufacturing',
    registeredEmployees: 670,
    complianceScore: 94,
    safetyRating: 'A Verified',
    address: 'Shapar-Veraval Industrial Zone, Rajkot',
    contactPerson: 'Jitendra Kotecha (Partner)',
  },
  {
    id: 'c-raj-3',
    name: 'Falcon Pumps & Machinery Unit',
    code: 'CMP-GJ-0352',
    district: 'Rajkot',
    coords: [22.2745, 70.8312],
    sector: 'Manufacturing',
    registeredEmployees: 590,
    complianceScore: 96,
    safetyRating: 'A+ Verified',
    address: 'Aji Industrial Estate Phase 2, Rajkot',
    contactPerson: 'Harish Bhalodia (Plant In-Charge)',
  },
  {
    id: 'c-raj-4',
    name: 'Saurashtra Precision Tools Corp',
    code: 'CMP-GJ-0371',
    district: 'Rajkot',
    coords: [22.2812, 70.8123],
    sector: 'Manufacturing',
    registeredEmployees: 480,
    complianceScore: 90,
    safetyRating: 'B+ Monitored',
    address: 'Bhaktinagar Station Road, Rajkot',
    contactPerson: 'Rameshwar Vyas (Admin Head)',
  },
  {
    id: 'c-raj-5',
    name: 'Kuwadva Industrial Logistics Park',
    code: 'CMP-GJ-0394',
    district: 'Rajkot',
    coords: [22.3812, 70.9245],
    sector: 'Manufacturing',
    registeredEmployees: 530,
    complianceScore: 95,
    safetyRating: 'A Verified',
    address: 'Kuwadva GIDC National Highway 27, Rajkot',
    contactPerson: 'Nitin Dave (Logistics Head)',
  },
  {
    id: 'c-raj-6',
    name: 'Rajkot Urban Housing Infrastructure',
    code: 'CMP-GJ-0410',
    district: 'Rajkot',
    coords: [22.308, 70.772],
    sector: 'Construction',
    registeredEmployees: 760,
    complianceScore: 97,
    safetyRating: 'A+ Verified',
    address: '150 Feet Ring Road Smart City Site, Rajkot',
    contactPerson: 'Mohan Lal (Site Supervisor)',
  },

  // ── Gandhinagar (6 companies) ──
  {
    id: 'c-gn-1',
    name: 'GIFT City Towers Construction Consortium',
    code: 'CMP-GJ-0811',
    district: 'Gandhinagar',
    coords: [23.1612, 72.6845],
    sector: 'Construction',
    registeredEmployees: 1340,
    complianceScore: 99,
    safetyRating: 'A+ Verified',
    address: 'GIFT City Zone 1, Gandhinagar',
    contactPerson: 'Abhinav Sen (Project Director)',
  },
  {
    id: 'c-gn-2',
    name: 'Electronics Estate Microtech Unit',
    code: 'CMP-GJ-0829',
    district: 'Gandhinagar',
    coords: [23.2482, 72.6412],
    sector: 'Manufacturing',
    registeredEmployees: 610,
    complianceScore: 98,
    safetyRating: 'A+ Verified',
    address: 'Sector 26 GIDC Electronics Zone, Gandhinagar',
    contactPerson: 'Soma Ghosh (HR Officer)',
  },
  {
    id: 'c-gn-3',
    name: 'Kalol Heavy Machinery & Steel Works',
    code: 'CMP-GJ-0847',
    district: 'Gandhinagar',
    coords: [23.2389, 72.4982],
    sector: 'Manufacturing',
    registeredEmployees: 720,
    complianceScore: 93,
    safetyRating: 'A Verified',
    address: 'Kalol GIDC Industrial Corridor, Gandhinagar',
    contactPerson: 'Dilip Rathod (Safety Head)',
  },
  {
    id: 'c-gn-4',
    name: 'Gujarat Metro Rail Site Phase 2',
    code: 'CMP-GJ-0863',
    district: 'Gandhinagar',
    coords: [23.221, 72.651],
    sector: 'Construction',
    registeredEmployees: 880,
    complianceScore: 97,
    safetyRating: 'A+ Verified',
    address: 'Sector 10 Secretariat Elevated Corridor, Gandhinagar',
    contactPerson: 'Gautam Rao (Chief Resident Engineer)',
  },
  {
    id: 'c-gn-5',
    name: 'Mansa Agro-Industrial Processing Ltd',
    code: 'CMP-GJ-0881',
    district: 'Gandhinagar',
    coords: [23.4212, 72.6612],
    sector: 'Manufacturing',
    registeredEmployees: 490,
    complianceScore: 92,
    safetyRating: 'B+ Monitored',
    address: 'Mansa Industrial Area, Gandhinagar',
    contactPerson: 'Jagdish Chaudhary (GM Works)',
  },
  {
    id: 'c-gn-6',
    name: 'Dehgam Infrastructure & Warehousing',
    code: 'CMP-GJ-0899',
    district: 'Gandhinagar',
    coords: [23.1645, 72.8123],
    sector: 'Construction',
    registeredEmployees: 550,
    complianceScore: 94,
    safetyRating: 'A Verified',
    address: 'Dehgam GIDC Industrial Estate, Gandhinagar',
    contactPerson: 'Piyush Vaghela (Site Admin)',
  },

  // ── Kutch (6 companies) ──
  {
    id: 'c-kt-1',
    name: 'Adani Logistics & Manufacturing Port Unit',
    code: 'CMP-GJ-0782',
    district: 'Kutch',
    coords: [22.8251, 69.7028],
    sector: 'Manufacturing',
    registeredEmployees: 760,
    complianceScore: 99,
    safetyRating: 'A+ Verified',
    address: 'Mundra Port SEZ Sector 2, Kutch',
    contactPerson: 'Anil Mehta (EHS Manager)',
  },
  {
    id: 'c-kt-2',
    name: 'Gandhidham Timber & Processing Hub',
    code: 'CMP-GJ-0715',
    district: 'Kutch',
    coords: [23.0782, 70.1345],
    sector: 'Manufacturing',
    registeredEmployees: 580,
    complianceScore: 92,
    safetyRating: 'B+ Monitored',
    address: 'Gandhidham Industrial Estate, Kutch',
    contactPerson: 'Narendra Sodha (Operations Lead)',
  },
  {
    id: 'c-kt-3',
    name: 'Kandla Free Trade Zone Infrastructure',
    code: 'CMP-GJ-0733',
    district: 'Kutch',
    coords: [23.0112, 70.2189],
    sector: 'Construction',
    registeredEmployees: 890,
    complianceScore: 96,
    safetyRating: 'A+ Verified',
    address: 'KASEZ Free Trade Port Sector 1, Kutch',
    contactPerson: 'Subhashish Das (Civil Head)',
  },
  {
    id: 'c-kt-4',
    name: 'Anjar Welspun Pipe Manufacturing Site',
    code: 'CMP-GJ-0749',
    district: 'Kutch',
    coords: [23.1145, 70.0245],
    sector: 'Manufacturing',
    registeredEmployees: 940,
    complianceScore: 97,
    safetyRating: 'A+ Verified',
    address: 'Anjar Industrial Corridor, Kutch',
    contactPerson: 'Rajiv Goswami (Plant GM)',
  },
  {
    id: 'c-kt-5',
    name: 'Samakhiali Transportation & Container Depot',
    code: 'CMP-GJ-0761',
    district: 'Kutch',
    coords: [23.3112, 70.5212],
    sector: 'Manufacturing',
    registeredEmployees: 620,
    complianceScore: 93,
    safetyRating: 'A Verified',
    address: 'National Highway 8A Junction, Samakhiali, Kutch',
    contactPerson: 'Bhupendra Jadeja (Depot Head)',
  },
  {
    id: 'c-kt-6',
    name: 'Mundra Solar PV Technology Plant',
    code: 'CMP-GJ-0798',
    district: 'Kutch',
    coords: [22.842, 69.721],
    sector: 'Manufacturing',
    registeredEmployees: 810,
    complianceScore: 98,
    safetyRating: 'A+ Verified',
    address: 'Mundra Industrial Energy Park, Kutch',
    contactPerson: 'Karan Virani (Facility Manager)',
  },

  // ── Bharuch (6 companies) ──
  {
    id: 'c-bh-1',
    name: 'Dahej PCPIR Petrochemical Complex',
    code: 'CMP-GJ-1102',
    district: 'Bharuch',
    coords: [21.7051, 72.5859],
    sector: 'Manufacturing',
    registeredEmployees: 1250,
    complianceScore: 98,
    safetyRating: 'A+ Verified',
    address: 'Dahej Special Economic Zone Phase 1, Bharuch',
    contactPerson: 'Shailesh Patel (Plant Director)',
  },
  {
    id: 'c-bh-2',
    name: 'Ankleshwar Chemical Synthetics Ltd',
    code: 'CMP-GJ-1121',
    district: 'Bharuch',
    coords: [21.628, 73.002],
    sector: 'Manufacturing',
    registeredEmployees: 830,
    complianceScore: 94,
    safetyRating: 'A Verified',
    address: 'Ankleshwar GIDC Phase 1, Bharuch',
    contactPerson: 'Naveen Swamy (Safety Head)',
  },
  {
    id: 'c-bh-3',
    name: 'Jhagadia Industrial Greenfield Projects',
    code: 'CMP-GJ-1139',
    district: 'Bharuch',
    coords: [21.721, 73.142],
    sector: 'Construction',
    registeredEmployees: 910,
    complianceScore: 96,
    safetyRating: 'A+ Verified',
    address: 'Jhagadia GIDC Mega Industrial Estate, Bharuch',
    contactPerson: 'Anand Kulkarni (Project Engineer)',
  },
  {
    id: 'c-bh-4',
    name: 'Panoli Textile & Dyeing Processing',
    code: 'CMP-GJ-1155',
    district: 'Bharuch',
    coords: [21.534, 72.964],
    sector: 'Textiles',
    registeredEmployees: 640,
    complianceScore: 91,
    safetyRating: 'B+ Monitored',
    address: 'Panoli GIDC Sector 4, Bharuch',
    contactPerson: 'Naresh Modha (Mill Supervisor)',
  },
  {
    id: 'c-bh-5',
    name: 'Narmada Riverfront Infrastructure Works',
    code: 'CMP-GJ-1172',
    district: 'Bharuch',
    coords: [21.712, 72.985],
    sector: 'Construction',
    registeredEmployees: 720,
    complianceScore: 95,
    safetyRating: 'A Verified',
    address: 'Bharuch Cable Bridge & Highway Site, Bharuch',
    contactPerson: 'Kailash Meena (Civil In-Charge)',
  },
  {
    id: 'c-bh-6',
    name: 'Palej Engineering Components Plant',
    code: 'CMP-GJ-1191',
    district: 'Bharuch',
    coords: [21.845, 73.082],
    sector: 'Manufacturing',
    registeredEmployees: 510,
    complianceScore: 93,
    safetyRating: 'A Verified',
    address: 'Palej GIDC Industrial Area, Bharuch',
    contactPerson: 'Farhan Ansari (Operations)',
  },

  // ── Morbi (6 companies) ──
  {
    id: 'c-mb-1',
    name: 'Simpolo Vitrified Ceramic Mega Plant',
    code: 'CMP-GJ-1210',
    district: 'Morbi',
    coords: [22.8173, 70.8378],
    sector: 'Manufacturing',
    registeredEmployees: 1150,
    complianceScore: 97,
    safetyRating: 'A+ Verified',
    address: 'Old Ghuntu Road Ceramic Hub, Morbi',
    contactPerson: 'Bharat Aghara (Managing Director)',
  },
  {
    id: 'c-mb-2',
    name: 'Cera Sanitaryware Production Site',
    code: 'CMP-GJ-1228',
    district: 'Morbi',
    coords: [22.854, 70.882],
    sector: 'Manufacturing',
    registeredEmployees: 880,
    complianceScore: 95,
    safetyRating: 'A Verified',
    address: 'Pipali-Jetpar Road Industrial Estate, Morbi',
    contactPerson: 'Mayur Patel (Plant Head)',
  },
  {
    id: 'c-mb-3',
    name: 'Morbi Wall Tiles Industrial Consortium',
    code: 'CMP-GJ-1244',
    district: 'Morbi',
    coords: [22.782, 70.812],
    sector: 'Manufacturing',
    registeredEmployees: 790,
    complianceScore: 93,
    safetyRating: 'A Verified',
    address: 'Lakhdhirpur Road Ceramic Zone, Morbi',
    contactPerson: 'Jitendra Bhoraniya (HR Manager)',
  },
  {
    id: 'c-mb-4',
    name: 'Halvad Highway Ceramic Hub 4',
    code: 'CMP-GJ-1262',
    district: 'Morbi',
    coords: [22.892, 70.945],
    sector: 'Manufacturing',
    registeredEmployees: 670,
    complianceScore: 91,
    safetyRating: 'B+ Monitored',
    address: 'Halvad-Morbi National Highway Corridor, Morbi',
    contactPerson: 'Kishore Sanariya (Works Head)',
  },
  {
    id: 'c-mb-5',
    name: 'Wankaner Vitrified Tiles Ancillary',
    code: 'CMP-GJ-1279',
    district: 'Morbi',
    coords: [22.618, 70.932],
    sector: 'Manufacturing',
    registeredEmployees: 720,
    complianceScore: 94,
    safetyRating: 'A Verified',
    address: 'Wankaner GIDC Sector 2, Morbi',
    contactPerson: 'Haresh Dethariya (Admin)',
  },
  {
    id: 'c-mb-6',
    name: 'Morbi Ceramic Freight & Export Depot',
    code: 'CMP-GJ-1296',
    district: 'Morbi',
    coords: [22.831, 70.856],
    sector: 'Construction',
    registeredEmployees: 580,
    complianceScore: 96,
    safetyRating: 'A+ Verified',
    address: 'Trajpar Bypass Road Logistics Hub, Morbi',
    contactPerson: 'Dipak Kundariya (Logistics Lead)',
  },

  // ── Jamnagar (6 companies) ──
  {
    id: 'c-jm-1',
    name: 'Reliance Jamnagar Refinery Expansion Site',
    code: 'CMP-GJ-1311',
    district: 'Jamnagar',
    coords: [22.385, 69.872],
    sector: 'Construction',
    registeredEmployees: 1480,
    complianceScore: 99,
    safetyRating: 'A+ Verified',
    address: 'Moti Khavdi Refinery Complex, Jamnagar',
    contactPerson: 'V. R. Subramanian (Chief Civil Lead)',
  },
  {
    id: 'c-jm-2',
    name: 'Jamnagar Brass Foundry Works Association',
    code: 'CMP-GJ-1329',
    district: 'Jamnagar',
    coords: [22.4707, 70.0577],
    sector: 'Manufacturing',
    registeredEmployees: 740,
    complianceScore: 92,
    safetyRating: 'B+ Monitored',
    address: 'Dared GIDC Phase 2 Brass Cluster, Jamnagar',
    contactPerson: 'Ramnik Patel (Association Head)',
  },
  {
    id: 'c-jm-3',
    name: 'Nayara Energy Oil Terminal Project',
    code: 'CMP-GJ-1346',
    district: 'Jamnagar',
    coords: [22.342, 69.821],
    sector: 'Manufacturing',
    registeredEmployees: 890,
    complianceScore: 97,
    safetyRating: 'A+ Verified',
    address: 'Vadinar Marine Port Zone, Jamnagar',
    contactPerson: 'A. K. Sharma (Safety Lead)',
  },
  {
    id: 'c-jm-4',
    name: 'Hapa Industrial Grain & Goods Terminal',
    code: 'CMP-GJ-1364',
    district: 'Jamnagar',
    coords: [22.489, 70.124],
    sector: 'Manufacturing',
    registeredEmployees: 530,
    complianceScore: 93,
    safetyRating: 'A Verified',
    address: 'Hapa GIDC Industrial Area, Jamnagar',
    contactPerson: 'Pravin Khunt (Terminal Officer)',
  },
  {
    id: 'c-jm-5',
    name: 'Digjam Suiting & Weaving Complex',
    code: 'CMP-GJ-1381',
    district: 'Jamnagar',
    coords: [22.458, 70.042],
    sector: 'Textiles',
    registeredEmployees: 670,
    complianceScore: 95,
    safetyRating: 'A Verified',
    address: 'Aerodrome Road Industrial Hub, Jamnagar',
    contactPerson: 'Girish Trivedi (HR Executive)',
  },
  {
    id: 'c-jm-6',
    name: 'Bedeswar Port Logistics & Engineering',
    code: 'CMP-GJ-1398',
    district: 'Jamnagar',
    coords: [22.502, 70.071],
    sector: 'Construction',
    registeredEmployees: 610,
    complianceScore: 94,
    safetyRating: 'A Verified',
    address: 'Bedeswar Coastal Belt Terminal, Jamnagar',
    contactPerson: 'Mansukh Solanki (Site Admin)',
  },

  // ── Bhavnagar (6 companies) ──
  {
    id: 'c-bhv-1',
    name: 'Alang Ship Recycling Yard Plot 45',
    code: 'CMP-GJ-1412',
    district: 'Bhavnagar',
    coords: [21.412, 72.185],
    sector: 'Manufacturing',
    registeredEmployees: 1220,
    complianceScore: 95,
    safetyRating: 'A Verified',
    address: 'Alang-Sosiya Ship Recycling Coast, Bhavnagar',
    contactPerson: 'Mohan Lal Sharma (Yard General Manager)',
  },
  {
    id: 'c-bhv-2',
    name: 'Chitra GIDC Machine Tools Corp',
    code: 'CMP-GJ-1430',
    district: 'Bhavnagar',
    coords: [21.7645, 72.1519],
    sector: 'Manufacturing',
    registeredEmployees: 640,
    complianceScore: 93,
    safetyRating: 'A Verified',
    address: 'Chitra Industrial Area Phase 1, Bhavnagar',
    contactPerson: 'Nitin Bhatt (Works Manager)',
  },
  {
    id: 'c-bhv-3',
    name: 'Vartej Steel Rolling & Re-Rolling Mills',
    code: 'CMP-GJ-1447',
    district: 'Bhavnagar',
    coords: [21.738, 72.072],
    sector: 'Manufacturing',
    registeredEmployees: 780,
    complianceScore: 91,
    safetyRating: 'B+ Monitored',
    address: 'Vartej Industrial Zone, Bhavnagar',
    contactPerson: 'Rajesh Gondaliya (Plant Head)',
  },
  {
    id: 'c-bhv-4',
    name: 'Bhavnagar Port Coastal Infrastructure',
    code: 'CMP-GJ-1463',
    district: 'Bhavnagar',
    coords: [21.792, 72.195],
    sector: 'Construction',
    registeredEmployees: 850,
    complianceScore: 97,
    safetyRating: 'A+ Verified',
    address: 'New Port Road Coastal Highway Project, Bhavnagar',
    contactPerson: 'Suresh Chauhan (Chief Engineer)',
  },
  {
    id: 'c-bhv-5',
    name: 'Sihor Industrial Re-Rolling Cluster',
    code: 'CMP-GJ-1481',
    district: 'Bhavnagar',
    coords: [21.712, 71.968],
    sector: 'Manufacturing',
    registeredEmployees: 560,
    complianceScore: 92,
    safetyRating: 'B+ Monitored',
    address: 'Sihor GIDC Industrial Estate, Bhavnagar',
    contactPerson: 'Dhanraj Shah (Director)',
  },
  {
    id: 'c-bhv-6',
    name: 'Kumbharwada Plastic & Packing Units',
    code: 'CMP-GJ-1498',
    district: 'Bhavnagar',
    coords: [21.778, 72.138],
    sector: 'Manufacturing',
    registeredEmployees: 490,
    complianceScore: 94,
    safetyRating: 'A Verified',
    address: 'Kumbharwada Industrial Belt, Bhavnagar',
    contactPerson: 'Yogesh Gohil (HR)',
  },
]

// ─── District Hubs ────────────────────────────────────────────────────────────
const WORKER_LOCATIONS = [
  { city: 'Ahmedabad', coords: [23.0225, 72.5714] as [number, number], workers: 4231, radius: 24, topSector: 'Construction & Textiles', rank: 1 },
  { city: 'Surat', coords: [21.1702, 72.8311] as [number, number], workers: 3892, radius: 22, topSector: 'Diamond & Textiles', rank: 2 },
  { city: 'Vadodara', coords: [22.3072, 73.1812] as [number, number], workers: 2104, radius: 18, topSector: 'Manufacturing & Chemical', rank: 3 },
  { city: 'Rajkot', coords: [22.3039, 70.8022] as [number, number], workers: 1201, radius: 14, topSector: 'Auto Components & Casting', rank: 4 },
  { city: 'Gandhinagar', coords: [23.2156, 72.6369] as [number, number], workers: 891, radius: 13, topSector: 'GIFT City & Electronics', rank: 5 },
  { city: 'Kutch', coords: [23.0782, 70.1345] as [number, number], workers: 760, radius: 12, topSector: 'Port Logistics & SEZ', rank: 6 },
  { city: 'Bharuch', coords: [21.7051, 72.9959] as [number, number], workers: 680, radius: 12, topSector: 'Chemicals & PCPIR', rank: 7 },
  { city: 'Jamnagar', coords: [22.4707, 70.0577] as [number, number], workers: 620, radius: 11, topSector: 'Refinery & Brass Casting', rank: 8 },
  { city: 'Morbi', coords: [22.8173, 70.8378] as [number, number], workers: 590, radius: 11, topSector: 'Ceramic & Tiles Hub', rank: 9 },
  { city: 'Bhavnagar', coords: [21.7645, 72.1519] as [number, number], workers: 540, radius: 10, topSector: 'Ship Recycling & Steel', rank: 10 },
]

export default function WorkerMap() {
  const { t } = useTranslation()
  const [district, setDistrict] = useState('All Districts')
  const [sector, setSector] = useState('All')
  const [appliedDistrict, setAppliedDistrict] = useState('All Districts')
  const [appliedSector, setAppliedSector] = useState('All')
  const [viewMode, setViewMode] = useState<'districts' | 'companies'>('companies')
  const [selectedCompany, setSelectedCompany] = useState<CompanyData | null>(null)
  const [activeMapCompany, setActiveMapCompany] = useState<CompanyData | null>(REGISTERED_COMPANIES[0])
  const [searchCompany, setSearchCompany] = useState('')

  const handleApplyFilter = () => {
    setAppliedDistrict(district)
    setAppliedSector(sector)
  }

  const filteredLocations = useMemo(() => {
    return WORKER_LOCATIONS.filter((loc) => {
      const matchDistrict = appliedDistrict === 'All Districts' || loc.city === appliedDistrict
      const matchSector = appliedSector === 'All' || loc.topSector.toLowerCase().includes(appliedSector.toLowerCase())
      return matchDistrict && matchSector
    })
  }, [appliedDistrict, appliedSector])

  const filteredCompanies = useMemo(() => {
    return REGISTERED_COMPANIES.filter((comp) => {
      const matchDistrict = appliedDistrict === 'All Districts' || comp.district === appliedDistrict
      const matchSector = appliedSector === 'All' || comp.sector === appliedSector
      const matchSearch =
        !searchCompany ||
        comp.name.toLowerCase().includes(searchCompany.toLowerCase()) ||
        comp.code.toLowerCase().includes(searchCompany.toLowerCase()) ||
        comp.district.toLowerCase().includes(searchCompany.toLowerCase())
      return matchDistrict && matchSector && matchSearch
    })
  }, [appliedDistrict, appliedSector, searchCompany])

  const totalCompanyWorkers = useMemo(
    () => REGISTERED_COMPANIES.reduce((sum, c) => sum + c.registeredEmployees, 0),
    []
  )

  // Count of companies in currently applied district
  const districtCompanyCount = useMemo(() => {
    if (appliedDistrict === 'All Districts') return REGISTERED_COMPANIES.length
    return REGISTERED_COMPANIES.filter((c) => c.district === appliedDistrict).length
  }, [appliedDistrict])

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 text-[#0C2D27] dark:text-slate-100">
      {/* ── Header ── */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#FF6B53] mb-1">
            <span className="w-4 h-[2px] bg-[#FF6B53]" />
            EMPLOYER &amp; WORKFORCE GEOGRAPHIC MAP
          </div>
          <h1 className="text-3xl font-extrabold text-[#0C2D27] dark:text-white tracking-tight flex items-center gap-2">
            <Map className="h-7 w-7 text-[#0C2D27] dark:text-[#5EEAD4]" />
            Company &amp; District Workforce Map
          </h1>
          <p className="text-xs sm:text-sm text-[#52605D] dark:text-[#A3BDB5] mt-0.5">
            Real-time registered migrant employee data mapped across employer companies &amp; industrial hubs in Gujarat (6+ enterprises per city).
          </p>
        </div>
        <LanguageSelector />
      </div>

      {/* ── View Mode Switcher & Filter Control Bar ── */}
      <div className="rounded-3xl bg-white dark:bg-[#14312A] border border-slate-200/80 dark:border-[#244E43] p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-100 dark:border-[#1E4238] pb-4">
          <div className="flex items-center gap-2 p-1 rounded-2xl bg-slate-100 dark:bg-[#173830]">
            <button
              onClick={() => setViewMode('companies')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                viewMode === 'companies'
                  ? 'bg-[#0C2D27] dark:bg-[#1E4D40] text-white shadow-xs'
                  : 'text-[#52605D] dark:text-[#A3BDB5] hover:text-[#0C2D27] dark:hover:text-white'
              }`}
            >
              <Building2 className="h-4 w-4" />
              <span>Registered Companies View ({filteredCompanies.length})</span>
            </button>
            <button
              onClick={() => setViewMode('districts')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                viewMode === 'districts'
                  ? 'bg-[#0C2D27] dark:bg-[#1E4D40] text-white shadow-xs'
                  : 'text-[#52605D] dark:text-[#A3BDB5] hover:text-[#0C2D27] dark:hover:text-white'
              }`}
            >
              <Layers className="h-4 w-4" />
              <span>District Hubs View ({filteredLocations.length})</span>
            </button>
          </div>

          <div className="relative min-w-[220px]">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400 dark:text-[#A8C7BE]" />
            <input
              type="text"
              value={searchCompany}
              onChange={(e) => setSearchCompany(e.target.value)}
              placeholder="Search company or city..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-[#2E6356] bg-white dark:bg-[#173830] text-[#0C2D27] dark:text-white placeholder:text-slate-400 dark:placeholder:text-[#9DBBB2] focus:outline-none focus:border-[#FF6B53] dark:focus:border-[#FF6B53]"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex flex-col gap-1 min-w-[170px]">
            <label className="text-xs font-bold text-[#0C2D27] dark:text-white">District</label>
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="border border-slate-200 dark:border-[#2E6356] rounded-xl px-3 py-2 text-xs text-[#0C2D27] dark:text-white bg-white dark:bg-[#173830] focus:outline-none focus:border-[#FF6B53]"
            >
              {GUJARAT_DISTRICTS.map((d) => (
                <option key={d} value={d}>
                  {d} {d !== 'All Districts' ? `(6+ Companies)` : `(${REGISTERED_COMPANIES.length} Total)`}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1 min-w-[150px]">
            <label className="text-xs font-bold text-[#0C2D27] dark:text-white">Industry Sector</label>
            <select
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              className="border border-slate-200 dark:border-[#2E6356] rounded-xl px-3 py-2 text-xs text-[#0C2D27] dark:text-white bg-white dark:bg-[#173830] focus:outline-none focus:border-[#FF6B53]"
            >
              {SECTORS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <button
            onClick={handleApplyFilter}
            className="figma-btn-coral py-2 px-5 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Filter className="h-3.5 w-3.5" />
            <span>Apply Filters</span>
          </button>

          {appliedDistrict !== 'All Districts' && (
            <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-[#133D30] text-emerald-800 dark:text-[#6EE7B7] border border-emerald-200 dark:border-[#23654F]">
              Showing {districtCompanyCount} verified enterprises in {appliedDistrict}
            </span>
          )}
        </div>
      </div>

      {/* ── Interactive Map + Company Breakdown Panel ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Leaflet Map Column */}
        <div className="lg:col-span-2 rounded-3xl bg-white dark:bg-[#14312A] border border-slate-200/80 dark:border-[#244E43] p-3 shadow-2xs flex flex-col relative">
          <div className="w-full h-[440px] sm:h-[540px] rounded-2xl overflow-hidden relative">
            <MapContainer
              center={[22.35, 71.55]}
              zoom={7}
              scrollWheelZoom={false}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* Render Company Markers or District Circle Markers based on viewMode */}
              {viewMode === 'companies'
                ? filteredCompanies.map((comp) => (
                    <CircleMarker
                      key={comp.id}
                      center={comp.coords}
                      radius={12 + Math.min(12, Math.round(comp.registeredEmployees / 150))}
                      eventHandlers={{
                        click: () => {
                          setActiveMapCompany(comp)
                        },
                      }}
                      pathOptions={{
                        color: activeMapCompany?.id === comp.id ? '#FF6B53' : '#0C2D27',
                        fillColor: activeMapCompany?.id === comp.id ? '#FF6B53' : '#FF6B53',
                        fillOpacity: activeMapCompany?.id === comp.id ? 0.95 : 0.8,
                        weight: activeMapCompany?.id === comp.id ? 3 : 2,
                      }}
                    >
                      <Popup autoPan={true} autoPanPadding={[40, 40]} offset={[0, -8]}>
                        <div className="p-1 space-y-1.5 min-w-[210px] text-xs">
                          <span className="text-[9px] font-mono font-bold text-slate-400 block uppercase">
                            {comp.code} · {comp.sector}
                          </span>
                          <b className="text-sm font-bold text-[#0C2D27] dark:text-white block leading-tight">
                            {comp.name}
                          </b>
                          <div className="p-2 rounded-xl bg-slate-50 dark:bg-[#173830] border border-slate-200 dark:border-[#2E6356] flex items-center justify-between text-xs">
                            <span className="text-slate-500 dark:text-[#A3BDB5] font-semibold">Registered Staff:</span>
                            <b className="text-[#0C2D27] dark:text-white font-extrabold">{comp.registeredEmployees.toLocaleString()}</b>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-[#CBDCE1]">{comp.address}</p>
                          <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-[#244E43]">
                            <span className="text-[10px] font-bold text-emerald-700 dark:text-[#4ADE80] bg-emerald-50 dark:bg-[#133D30] px-2 py-0.5 rounded">
                              ✓ {comp.complianceScore}% Compliant
                            </span>
                            <button
                              onClick={() => setSelectedCompany(comp)}
                              className="text-[11px] font-bold text-[#FF6B53] hover:underline cursor-pointer"
                            >
                              Inspect Details →
                            </button>
                          </div>
                        </div>
                      </Popup>
                    </CircleMarker>
                  ))
                : filteredLocations.map((loc) => (
                    <CircleMarker
                      key={loc.city}
                      center={loc.coords}
                      radius={loc.radius}
                      eventHandlers={{
                        click: () => {
                          setDistrict(loc.city)
                          setAppliedDistrict(loc.city)
                        },
                      }}
                      pathOptions={{
                        color: '#0C2D27',
                        fillColor: '#C0E862',
                        fillOpacity: 0.8,
                        weight: 2,
                      }}
                    >
                      <Popup autoPan={true} autoPanPadding={[40, 40]}>
                        <div className="text-xs p-1 space-y-1">
                          <b className="font-extrabold text-[#0C2D27] dark:text-white block">{loc.city} District Hub</b>
                          <p className="text-[#0C2D27] dark:text-white font-bold">
                            {loc.workers.toLocaleString()} registered migrant workers
                          </p>
                          <p className="text-slate-500 dark:text-[#A3BDB5] text-[11px]">Top sector: {loc.topSector}</p>
                          <span className="text-[10px] text-emerald-700 dark:text-[#4ADE80] font-bold block pt-1">
                            Click to filter {loc.city} enterprises (6+ companies) →
                          </span>
                        </div>
                      </Popup>
                    </CircleMarker>
                  ))}
            </MapContainer>

            {/* ── Persistent Floating Company Quick Card over Map (Solves Map Overriding Details) ── */}
            {activeMapCompany && viewMode === 'companies' && (
              <div className="absolute bottom-3 left-3 right-3 sm:right-auto sm:max-w-sm z-[1000] bg-white/95 dark:bg-[#14312A]/95 backdrop-blur-md p-4 rounded-2xl shadow-2xl border border-slate-200 dark:border-[#244E43] animate-in slide-in-from-bottom-2 space-y-2">
                <div className="flex items-start justify-between gap-2 border-b border-slate-100 dark:border-[#1E4238] pb-2">
                  <div className="min-w-0">
                    <span className="text-[9px] font-mono font-bold text-[#FF6B53] uppercase block truncate">
                      {activeMapCompany.code} · {activeMapCompany.sector}
                    </span>
                    <h4 className="text-xs font-bold text-[#0C2D27] dark:text-white truncate">
                      {activeMapCompany.name}
                    </h4>
                  </div>
                  <button
                    onClick={() => setActiveMapCompany(null)}
                    className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer shrink-0"
                    title="Dismiss preview"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-[#173830] border border-slate-100 dark:border-[#244E43]">
                    <span className="text-[9px] text-slate-400 dark:text-[#A3BDB5] font-bold uppercase block">Workers</span>
                    <b className="text-xs font-extrabold text-[#0C2D27] dark:text-white">
                      {activeMapCompany.registeredEmployees.toLocaleString()}
                    </b>
                  </div>
                  <div className="p-2 rounded-xl bg-emerald-50 dark:bg-[#133D30] border border-emerald-200 dark:border-[#23654F]">
                    <span className="text-[9px] text-emerald-800 dark:text-[#6EE7B7] font-bold uppercase block">Audit Rating</span>
                    <b className="text-xs font-extrabold text-emerald-950 dark:text-[#4ADE80]">
                      {activeMapCompany.complianceScore}% ({activeMapCompany.safetyRating})
                    </b>
                  </div>
                </div>

                <p className="text-[10px] text-slate-500 dark:text-[#A3BDB5] truncate">
                  📍 {activeMapCompany.address}
                </p>

                <button
                  onClick={() => setSelectedCompany(activeMapCompany)}
                  className="w-full figma-btn-coral py-1.5 px-3 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>Inspect Full Roster &amp; Profile</span>
                </button>
              </div>
            )}
          </div>

          {/* Map Guide Legend */}
          <div className="px-4 py-3 border-t border-slate-100 dark:border-[#1E4238] bg-slate-50 dark:bg-[#183B33] rounded-b-2xl mt-2 flex items-center justify-between flex-wrap gap-2 text-xs">
            <div className="flex items-center gap-2 text-[#0C2D27] dark:text-white font-bold">
              <Info className="h-4 w-4 text-[#FF6B53]" />
              <span>
                {viewMode === 'companies'
                  ? 'Tap any enterprise marker to display its quick overview and inspect roster'
                  : 'Tap any district hub to zoom into its 6+ industrial companies'}
              </span>
            </div>
            <div className="flex items-center gap-4 text-slate-600 dark:text-[#CBDCE1] font-medium">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-[#FF6B53]" /> Employer Site ({filteredCompanies.length})
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-[#C0E862]" /> District Hub ({filteredLocations.length})
              </span>
            </div>
          </div>
        </div>

        {/* Right Panel: Registered Companies Employee Leaderboard */}
        <div className="rounded-3xl bg-white dark:bg-[#14312A] border border-slate-200/80 dark:border-[#244E43] p-5 sm:p-6 shadow-2xs space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#1E4238] pb-3">
              <h2 className="font-bold text-[#0C2D27] dark:text-white text-sm flex items-center gap-2">
                <Building2 className="h-4 w-4 text-[#FF6B53]" />
                Company Roster Leaderboard
              </h2>
              <span className="text-[10px] font-bold text-[#52605D] dark:text-[#CBDCE1] bg-slate-100 dark:bg-[#1C4037] px-2 py-0.5 rounded-full">
                {filteredCompanies.length} Companies
              </span>
            </div>

            <div className="space-y-2.5 max-h-[430px] overflow-y-auto pr-1">
              {filteredCompanies.length === 0 ? (
                <p className="text-xs text-slate-400 dark:text-[#A3BDB5] text-center py-8">
                  No enterprises match the current filter or search.
                </p>
              ) : (
                filteredCompanies.map((comp) => (
                  <div
                    key={comp.id}
                    onClick={() => {
                      setSelectedCompany(comp)
                      setActiveMapCompany(comp)
                    }}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer space-y-1.5 group ${
                      activeMapCompany?.id === comp.id
                        ? 'bg-emerald-50/80 dark:bg-[#183D34] border-[#FF6B53] shadow-xs'
                        : 'bg-slate-50 dark:bg-[#173830] border-slate-200/80 dark:border-[#265347] hover:border-[#0C2D27] dark:hover:border-[#FF6B53]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <b className="text-xs font-bold text-[#0C2D27] dark:text-white group-hover:text-[#FF6B53] transition-colors block truncate">
                          {comp.name}
                        </b>
                        <span className="text-[10px] text-[#52605D] dark:text-[#A3BDB5] block">
                          {comp.district} · {comp.sector}
                        </span>
                      </div>

                      <div className="text-right shrink-0">
                        <b className="text-xs font-black text-[#0C2D27] dark:text-white block">
                          {comp.registeredEmployees.toLocaleString()}
                        </b>
                        <span className="text-[9px] text-[#52605D] dark:text-[#A3BDB5] block">workers</span>
                      </div>
                    </div>

                    {/* Progress Bar for company relative workforce size */}
                    <div className="space-y-1">
                      <div className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-[#1F443B] overflow-hidden">
                        <div
                          className="h-full bg-[#0C2D27] dark:bg-[#5EEAD4] rounded-full"
                          style={{ width: `${Math.min(100, (comp.registeredEmployees / 1500) * 100)}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[9px] text-slate-500 dark:text-[#A3BDB5] font-semibold">
                        <span>Score: {comp.complianceScore}%</span>
                        <span className="text-emerald-700 dark:text-[#4ADE80] font-bold">{comp.safetyRating}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-[#1E4238] bg-[#F6F7F2] dark:bg-[#173830] p-4 rounded-2xl space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#FF6B53] block">
              GUJARAT LABOUR AUDIT REPOSITORY
            </span>
            <b className="text-lg font-extrabold text-[#0C2D27] dark:text-white block">
              {totalCompanyWorkers.toLocaleString()} Registered Employees
            </b>
            <span className="text-xs text-[#52605D] dark:text-[#A3BDB5] block">
              60 active enterprises mapped across all 10 industrial hubs
            </span>
          </div>
        </div>
      </div>

      {/* ── Company Detail Modal (Permanently above map with z-[9999]) ── */}
      {selectedCompany && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-lg bg-white dark:bg-[#14312A] rounded-3xl p-6 shadow-2xl space-y-5 border border-slate-200 dark:border-[#244E43]">
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-[#1E4238] pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold text-[#FF6B53] uppercase block">
                  {selectedCompany.code} · REGISTERED EMPLOYER AUDIT
                </span>
                <h3 className="text-lg font-bold text-[#0C2D27] dark:text-white leading-snug">
                  {selectedCompany.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedCompany(null)}
                className="p-1 rounded-full text-slate-400 hover:text-[#0C2D27] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#183D34] cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-2xl bg-[#F6F7F2] dark:bg-[#173830] border border-slate-200 dark:border-[#2E6356]">
                  <span className="text-[10px] text-[#52605D] dark:text-[#A3BDB5] block font-semibold">Registered Staff</span>
                  <b className="text-lg font-extrabold text-[#0C2D27] dark:text-white">
                    {selectedCompany.registeredEmployees.toLocaleString()}
                  </b>
                </div>

                <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-[#133D30] border border-emerald-200 dark:border-[#23654F]">
                  <span className="text-[10px] text-emerald-800 dark:text-[#6EE7B7] block font-semibold">Wage Compliance</span>
                  <b className="text-lg font-extrabold text-emerald-950 dark:text-[#4ADE80]">
                    {selectedCompany.complianceScore}% Passed
                  </b>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#173830] border border-slate-200/80 dark:border-[#2E6356] space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-[#A3BDB5] font-semibold">Industry Sector:</span>
                  <b className="text-[#0C2D27] dark:text-white">{selectedCompany.sector}</b>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-[#A3BDB5] font-semibold">District Location:</span>
                  <b className="text-[#0C2D27] dark:text-white">{selectedCompany.district}</b>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-[#A3BDB5] font-semibold">Safety &amp; Labour Audit:</span>
                  <b className="text-emerald-700 dark:text-[#4ADE80] font-bold">{selectedCompany.safetyRating}</b>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-[#A3BDB5] font-semibold">Contact Official:</span>
                  <b className="text-[#0C2D27] dark:text-white">{selectedCompany.contactPerson}</b>
                </div>
                <div className="pt-2 border-t border-slate-200 dark:border-[#244E43]">
                  <span className="text-slate-500 dark:text-[#A3BDB5] font-semibold block mb-0.5">Physical Site Address:</span>
                  <span className="text-[#0C2D27] dark:text-white font-medium block">{selectedCompany.address}</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => setSelectedCompany(null)}
                className="figma-btn-coral py-2.5 px-6 text-xs font-bold cursor-pointer"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

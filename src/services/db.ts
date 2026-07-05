import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  orderBy
} from "firebase/firestore";
import { db, auth } from "../firebase/config";
import { Temple, Booking, UserProfile, PaymentRecord, NotificationRecord, FeedbackRecord } from "../types";

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

function isPermissionError(error: any): boolean {
  const msg = error instanceof Error ? error.message : String(error);
  const code = (error && typeof error === 'object' && 'code' in error) ? String(error.code) : '';
  return code.includes('permission-denied') || msg.toLowerCase().includes('permission-denied') || msg.toLowerCase().includes('insufficient permissions');
}

// Seed Temple Data
const DEFAULT_TEMPLES: Temple[] = [
  {
    templeId: "tirupati",
    name: "Tirupati Venkateswara Temple",
    location: "Tirumala, Tirupati",
    state: "Andhra Pradesh",
    type: "Vaishnavite",
    description: "Sri Venkateswara Temple is a landmark Vaishnavite temple situated in the hill town of Tirumala at Tirupati in Tirupati district of Andhra Pradesh, India. The Temple is dedicated to Lord Venkateswara, an incarnation of Vishnu.",
    history: "The temple's history dates back thousands of years. It is believed to have been established by Lord Vishnu himself to stay on earth during Kali Yuga. Major dynasties like the Pallavas, Cholas, and Vijayanagara empire made grand contributions to this temple, with King Krishnadevaraya contributing immense gold and wealth.",
    openingTime: "03:00 AM",
    closingTime: "11:30 PM",
    rating: 4.9,
    ticketPrice: 300,
    availableSlots: [
      "06:00 AM - 09:00 AM",
      "09:00 AM - 12:00 PM",
      "12:00 PM - 03:00 PM",
      "03:00 PM - 06:00 PM",
      "06:00 PM - 09:00 PM",
      "09:00 PM - 11:00 PM"
    ],
    darshanTypes: [
      { name: "Free Darshan (Sarvadarsanam)", price: 0, description: "General entry queue. Waiting time varies depending on the crowd." },
      { name: "Special Entry Darshan (Sheeghra Darshan)", price: 300, description: "Quick access ticket including 2 free Laddus. Reduced waiting time." },
      { name: "VIP Protocol Darshan", price: 1000, description: "Direct premium entry for special poojas and immediate holy sight." }
    ],
    rules: [
      "Dress Code: Traditional wear is mandatory. Dhoti/Kurta for men, Saree/Churidar with Dupatta for women.",
      "Mobile phones, cameras, and electronic gadgets are strictly prohibited inside.",
      "Footwear must be deposited at designated stands before entering the queue."
    ],
    facilities: [
      "Free Laddu Prasadam (with paid tickets)",
      "Locker Rooms & Cloak Rooms",
      "Free Annaprasadam (Dining Hall)",
      "Medical Centers & Drinking Water points",
      "Battery-operated internal shuttle transit"
    ],
    image: "emoji:🛕🙏🌸📿🪔",
    images: [
      "emoji:🛕🙏🌸📿🪔",
      "emoji:👑✨🔱☀️🏵️",
      "emoji:🕉️🙌🔔🕊️🌻"
    ],
    popular: true,
    latitude: 13.68297,
    longitude: 79.3483,
    complexPOIs: [
      { id: "tp-gopuram", name: "Mahadwaram Rajagopuram", description: "The majestic main entry tower to the inner temple complex.", latOffset: -0.0004, lngOffset: -0.0003, icon: "gopuram" },
      { id: "tp-sanctum", name: "Ananda Nilayam (Sanctum)", description: "The gold-plated vimana housing the self-manifested deity of Lord Venkateswara.", latOffset: 0.0, lngOffset: 0.0, icon: "sanctum" },
      { id: "tp-prasadam", name: "Srivari Laddu Counter", description: "Designated counter to redeem your delicious sacred laddu prasadam.", latOffset: 0.0003, lngOffset: 0.0004, icon: "prasadam" },
      { id: "tp-dining", name: "Tarigonda Vengamamba Hall", description: "The world's largest free dining hall serving hot sanctified meals.", latOffset: 0.0009, lngOffset: -0.0006, icon: "dining" },
      { id: "tp-katta", name: "Kalyana Katta (Tonsure Area)", description: "Sacred area for hair offering/tonsure rituals before taking bath.", latOffset: -0.0007, lngOffset: 0.0008, icon: "hair" }
    ]
  },
  {
    templeId: "srisailam",
    name: "Srisailam Mallikarjuna Swamy Temple",
    location: "Srisailam Hills, Nallamala Forest",
    state: "Andhra Pradesh",
    type: "Jyotirlinga & Shakti Peetha",
    description: "The Mallikarjuna Swamy Temple is dedicated to Lord Shiva and Goddess Parvati. It is unique as it is one of the twelve Jyotirlingas of Shiva and one of the eighteen Maha Shakti Peethas of Goddess Parvati.",
    history: "Mentioned in early Puranas and historically patronized by the Satavahana, Kakatiya, and Vijayanagara rulers. Chhatrapati Shivaji Maharaj also visited and constructed a magnificent gopuram here in 1674 AD.",
    openingTime: "04:30 AM",
    closingTime: "10:00 PM",
    rating: 4.8,
    ticketPrice: 150,
    availableSlots: [
      "05:30 AM - 08:30 AM",
      "08:30 AM - 11:30 AM",
      "11:30 AM - 02:30 PM",
      "04:30 PM - 07:30 PM",
      "07:30 PM - 10:00 PM"
    ],
    darshanTypes: [
      { name: "General Free Darshan", price: 0, description: "Standard darshan queue for all devotees." },
      { name: "Quick Darshan (Sheeghra Darshan)", price: 150, description: "Expedited queue with lower waiting times." },
      { name: "Sparsha Darshan (Touch the Jyotirlinga)", price: 500, description: "Special slot allowing devotees to physically touch the sacred Shiva Linga." }
    ],
    rules: [
      "Dresses must be conservative and respectful.",
      "Linga Sparsha requires traditional wear (Dhoti/Pancha for men, Saree for women).",
      "Carry identification card used during ticket booking."
    ],
    facilities: [
      "Srisailam Devasthanam Accommodations",
      "Nitya Annadanam (Free Meals)",
      "Cable Car to Pathala Ganga",
      "Prasadam Outlets"
    ],
    image: "emoji:🛕🙏🌸📿🪔",
    images: [
      "emoji:🛕🙏🌸📿🪔",
      "emoji:🌿🍃🔱🕉️🐚",
      "emoji:⛰️🐮🔔🌊🏔️"
    ],
    popular: true,
    latitude: 16.0741,
    longitude: 78.8681,
    complexPOIs: [
      { id: "sr-gopuram", name: "Shivaji Gopuram Entrance", description: "Built in 1674 AD, the historic entrance towering above Srisailam hills.", latOffset: -0.0005, lngOffset: -0.0004, icon: "gopuram" },
      { id: "sr-sanctum", name: "Mallikarjuna Jyotirlinga Sanctum", description: "The holy inner sanctum housing Lord Shiva's Swayambhu Jyotirlinga.", latOffset: 0.0, lngOffset: 0.0, icon: "sanctum" },
      { id: "sr-shakti", name: "Bhramaramba Shakti Peetha", description: "Revered Shakti temple representing the neck of Sati Devi.", latOffset: 0.0002, lngOffset: 0.0002, icon: "shakti" },
      { id: "sr-dining", name: "Nitya Annasamaradhana Hall", description: "Sacred dining complex offering free morning and evening prasadam meals.", latOffset: 0.0006, lngOffset: -0.0005, icon: "dining" }
    ]
  },
  {
    templeId: "yadadri",
    name: "Yadadri Lakshmi Narasimha Temple",
    location: "Yadagirigutta, Yadadri Bhuvanagiri",
    state: "Telangana",
    type: "Vaishnavite",
    description: "Yadadri is a magnificent cave temple dedicated to Lord Narasimha, an incarnation of Vishnu. The temple has been recently renovated into a grand, completely stone-crafted architectural marvel.",
    history: "In Tretayuga, Yadarishi, son of Maharishi Rishyasrunga, performed severe penance. Pleased with his devotion, Lord Narasimha appeared in five glorious forms (Pancha Narasimha). The cave temple houses these self-manifested forms.",
    openingTime: "04:00 AM",
    closingTime: "09:45 PM",
    rating: 4.7,
    ticketPrice: 150,
    availableSlots: [
      "06:00 AM - 09:00 AM",
      "09:00 AM - 12:00 PM",
      "12:00 PM - 03:00 PM",
      "04:00 PM - 07:00 PM",
      "07:00 PM - 09:30 PM"
    ],
    darshanTypes: [
      { name: "Dharma Darshan (Free)", price: 0, description: "Standard queue through the newly crafted stone corridors." },
      { name: "Special Entrance Darshan", price: 150, description: "Direct passage to the cave sanctum sanctorum." },
      { name: "VIP Break Darshan", price: 500, description: "Exclusive slot during morning and evening poojas with prasadam box." }
    ],
    rules: [
      "Modest clothing is requested.",
      "Footwear and bags are not allowed inside the main temple complex.",
      "Photography is strictly prohibited inside the main temple."
    ],
    facilities: [
      "Massive Multi-level Parking",
      "Free Escalator and Lift facility for elderly",
      "Annaprasada Hall",
      "New AC Guest Houses"
    ],
    image: "emoji:🛕🙏🌸📿🪔",
    images: [
      "emoji:🛕🙏🌸📿🪔",
      "emoji:🦁👑✨🔥🛡️",
      "emoji:🪨🏞️🕉️🙌🔔"
    ],
    popular: true,
    latitude: 17.5255,
    longitude: 78.9392,
    complexPOIs: [
      { id: "yd-gopuram", name: "Grand Stone Gopuram", description: "The newly sculpted majestic entrance made entirely of black granite.", latOffset: -0.0006, lngOffset: -0.0005, icon: "gopuram" },
      { id: "yd-sanctum", name: "Pancha Narasimha Cave Sanctum", description: "The ancient natural rock cave housing the self-manifested forms of Lord Narasimha.", latOffset: 0.0, lngOffset: 0.0, icon: "sanctum" },
      { id: "yd-prasadam", name: "AC Laddu & Pulihora Stalls", description: "Counter to pick up Yadadri's special delicious prasadam items.", latOffset: 0.0002, lngOffset: 0.0003, icon: "prasadam" },
      { id: "yd-dining", name: "Annaprasada Bhojana Shala", description: "New grand dining hall providing clean free meals for thousands daily.", latOffset: 0.0007, lngOffset: -0.0004, icon: "dining" }
    ]
  },
  {
    templeId: "bhadrachalam",
    name: "Bhadrachalam Seetha Ramachandra Swamy",
    location: "Bhadrachalam, Bhadradri Kothagudem",
    state: "Telangana",
    type: "Vaishnavite",
    description: "Located on the banks of the sacred Godavari River, this temple is dedicated to Lord Rama, Goddess Sita, and Lakshmana. It is a highly revered site closely associated with the epic Ramayana.",
    history: "Built in the 17th century by Kancharla Gopanna, popularly known as Bhakta Ramadasu, a local revenue official who used treasury funds to build the temple, was imprisoned, and miraculously released when Lord Rama paid his ransom to the Sultan.",
    openingTime: "04:30 AM",
    closingTime: "09:00 PM",
    rating: 4.6,
    ticketPrice: 100,
    availableSlots: [
      "05:00 AM - 08:00 AM",
      "08:00 AM - 11:30 AM",
      "11:30 AM - 02:00 PM",
      "04:00 PM - 06:30 PM",
      "06:30 PM - 08:30 PM"
    ],
    darshanTypes: [
      { name: "Free Darshan", price: 0, description: "Standard Godavari-river front queue entrance." },
      { name: "Quick Darshan", price: 100, description: "Shorter queue with free Laddu prasadam." },
      { name: "Suprabhatha Seva (Early Morning Pooja)", price: 250, description: "Auspicious early morning ritual entry with Vedic chanting." }
    ],
    rules: [
      "Decent dress is recommended for all devotees.",
      "Bathing in River Godavari is recommended before the sacred darshan.",
      "No leather items inside the temple."
    ],
    facilities: [
      "Godavari River Bathing Ghats",
      "Bhakta Ramadasu Dhyana Mandiram",
      "Kalyana Mandapam for weddings",
      "Annadanam Dining Hall"
    ],
    image: "emoji:🛕🙏🌸📿🪔",
    images: [
      "emoji:🛕🙏🌸📿🪔",
      "emoji:🏹👑🌳💧🐚",
      "emoji:🌊🐒🍃🪵🏰"
    ],
    popular: false,
    latitude: 17.6706,
    longitude: 80.8876,
    complexPOIs: [
      { id: "bc-gopuram", name: "Vaikunta Dwaram & Gopuram", description: "The spectacular northern entry tower facing the Godavari river.", latOffset: -0.0004, lngOffset: -0.0003, icon: "gopuram" },
      { id: "bc-sanctum", name: "Sita Ramachandra Swamy Sanctum", description: "Where Lord Rama sits in Chaturbhuja (four-armed) form alongside Goddess Sita and Lakshmana.", latOffset: 0.0, lngOffset: 0.0, icon: "sanctum" },
      { id: "bc-dhyana", name: "Bhakta Ramadasu Dhyana Mandiram", description: "Meditation hall displaying the historical chains and ancient coins of devotee Ramadasu.", latOffset: 0.0002, lngOffset: -0.0003, icon: "dhyana" },
      { id: "bc-ghats", name: "Godavari River Bathing Ghats", description: "Sacred ghat steps to take a holy dip in the river Godavari before entering.", latOffset: -0.0012, lngOffset: 0.0010, icon: "ghats" },
      { id: "bc-dining", name: "Annadanam Prasad Hall", description: "Offering daily free spiritual lunch prasadam to all visiting devotees.", latOffset: 0.0004, lngOffset: 0.0003, icon: "dining" }
    ]
  },
  {
    templeId: "kanaka-durga",
    name: "Vijayawada Kanaka Durga Temple",
    location: "Indrakeeladri Hill, Vijayawada",
    state: "Andhra Pradesh",
    type: "Shakti Peetha",
    description: "One of the most famous temples in Andhra Pradesh, located on Indrakeeladri hill on the banks of Krishna River. Goddess Kanaka Durga is Swayambhu (self-manifested) and extremely powerful.",
    history: "According to legend, Arjuna obtained the Pasupatastra from Lord Shiva on this Indrakeeladri hill. Goddess Durga killed the demon Mahishasura here and made Indrakeeladri her permanent abode.",
    openingTime: "04:00 AM",
    closingTime: "10:00 PM",
    rating: 4.7,
    ticketPrice: 100,
    availableSlots: [
      "05:00 AM - 08:00 AM",
      "08:00 AM - 11:00 AM",
      "11:00 AM - 02:00 PM",
      "03:00 PM - 06:00 PM",
      "06:00 PM - 09:30 PM"
    ],
    darshanTypes: [
      { name: "Dharma Darshan", price: 0, description: "Free general queue." },
      { name: "Special Darshan", price: 100, description: "Priority queue entry with fast movement." },
      { name: "Kumkumarchana Pooja (Special Ritual)", price: 300, description: "Traditional kumkum pooja entry for couples and individuals with prasadam." }
    ],
    rules: [
      "Saree or Salwar Kameez with Dupatta for women; Pancha or formal trousers for men.",
      "Cameras and cell phones must be submitted at the counters."
    ],
    facilities: [
      "Ghat Road transportation & free internal bus service",
      "Lifts & Escalators to the hilltop",
      "Prasadam stalls (Special Vijayawada Laddu & Puliora)",
      "Daily free food distribution"
    ],
    image: "emoji:🛕🙏🌸📿🪔",
    images: [
      "emoji:🛕🙏🌸📿🪔",
      "emoji:🔱🌺🦁🔥👑",
      "emoji:⚡🕉️🔱🔔🏵️"
    ],
    popular: true,
    latitude: 16.5162,
    longitude: 80.6053,
    complexPOIs: [
      { id: "kd-gopuram", name: "Indrakeeladri Hill Entrance", description: "The majestic archway marking the beginning of the hilltop ghat road.", latOffset: -0.0008, lngOffset: -0.0006, icon: "gopuram" },
      { id: "kd-sanctum", name: "Kanaka Durga Swayambhu Sanctum", description: "The sacred cave temple of self-manifested eight-armed Goddess Durga.", latOffset: 0.0, lngOffset: 0.0, icon: "sanctum" },
      { id: "kd-shiva", name: "Malleshwara Swamy Shrine", description: "Ancient hilltop shrine dedicated to Lord Shiva, located adjacent to Durga sanctum.", latOffset: 0.0002, lngOffset: 0.0002, icon: "shiva" },
      { id: "kd-prasadam", name: "Hilltop Laddu Distribution Counter", description: "Counter to purchase Vijayawada's highly famous special laddu prasadam.", latOffset: 0.0003, lngOffset: -0.0003, icon: "prasadam" }
    ]
  },
  {
    templeId: "simhachalam",
    name: "Simhachalam Varaha Narasimha Temple",
    location: "Simhachalam Hills, Visakhapatnam",
    state: "Andhra Pradesh",
    type: "Vaishnavite",
    description: "A beautiful 11th-century temple situated on a hill near Visakhapatnam, dedicated to Lord Varaha Narasimha. The deity is covered in a thick layer of sandalwood paste throughout the year.",
    history: "The temple's unique idol resembles a combination of a boar (Varaha) and a lion (Narasimha). Once a year, during the Chandanotsavam festival, the sandalwood paste is removed, and devotees can see the true form (Nijaroopa) of the deity.",
    openingTime: "07:00 AM",
    closingTime: "09:00 PM",
    rating: 4.5,
    ticketPrice: 100,
    availableSlots: [
      "07:00 AM - 10:00 AM",
      "10:00 AM - 01:00 PM",
      "01:00 PM - 04:00 PM",
      "04:00 PM - 07:00 PM",
      "07:00 PM - 09:00 PM"
    ],
    darshanTypes: [
      { name: "Free Dharma Darshan", price: 0, description: "Standard hilltop scenic route queue." },
      { name: "VIP Quick Ticket", price: 100, description: "Faster lane directly to the inner sanctum." },
      { name: "Chandanotsavam Special Seva (Festival Special)", price: 500, description: "Premium entry for specific Vedic rituals inside the shrine." }
    ],
    rules: [
      "Clean, respectful clothing is required.",
      "Avoid smoking, alcohol, or non-veg food prior to visiting."
    ],
    facilities: [
      "Scenic Hilltop Devasthanam Bus Service",
      "Kalyana Katta (Tonsure Area)",
      "Veda Patasala Complex",
      "Free Drinking Water and Annadanam"
    ],
    image: "emoji:🛕🙏🌸📿🪔",
    images: [
      "emoji:🛕🙏🌸📿🪔",
      "emoji:🪵🌳🏺🦁✨",
      "emoji:🍂🪔🍯🦁⚜️"
    ],
    popular: false,
    latitude: 17.7664,
    longitude: 83.2505,
    complexPOIs: [
      { id: "sc-gopuram", name: "Kalyana Gopuram Entrance", description: "The beautiful carved entrance tower overlooking Vizag valley.", latOffset: -0.0004, lngOffset: -0.0003, icon: "gopuram" },
      { id: "sc-sanctum", name: "Varaha Narasimha Sanctum", description: "The holy of holies where the deity remains covered in sandalwood paste.", latOffset: 0.0, lngOffset: 0.0, icon: "sanctum" },
      { id: "sc-sandal", name: "Sandalwood Paste Counter", description: "Dedicated shrine corner where devotees can offer premium sandalwood.", latOffset: 0.0001, lngOffset: 0.0002, icon: "sandalwood" },
      { id: "sc-dining", name: "Simhadri Annadanam Complex", description: "Prasadam dining hall serving tasty free lunch to hilltop pilgrims.", latOffset: 0.0005, lngOffset: -0.0003, icon: "dining" }
    ]
  }
];

// Memory/Local Storage Cache for Offline & Fallback
class LocalDbStore {
  temples: Record<string, Temple> = {};
  bookings: Record<string, Booking> = {};
  payments: Record<string, PaymentRecord> = {};
  notifications: Record<string, NotificationRecord> = {};
  users: Record<string, UserProfile> = {};
  feedback: Record<string, FeedbackRecord[]> = {};

  constructor() {
    this.loadFromLocalStorage();
  }

  loadFromLocalStorage() {
    try {
      this.temples = JSON.parse(localStorage.getItem("de_temples") || "{}");
      this.bookings = JSON.parse(localStorage.getItem("de_bookings") || "{}");
      this.payments = JSON.parse(localStorage.getItem("de_payments") || "{}");
      this.notifications = JSON.parse(localStorage.getItem("de_notifications") || "{}");
      this.users = JSON.parse(localStorage.getItem("de_users") || "{}");
      this.feedback = JSON.parse(localStorage.getItem("de_feedback") || "{}");

      // Populate default temples if empty or if image URLs are outdated
      let needsSave = false;
      if (Object.keys(this.temples).length === 0) {
        DEFAULT_TEMPLES.forEach(t => {
          this.temples[t.templeId] = t;
        });
        needsSave = true;
      } else {
        DEFAULT_TEMPLES.forEach(t => {
          const existing = this.temples[t.templeId];
          if (!existing) {
            this.temples[t.templeId] = t;
            needsSave = true;
          } else if (existing.image !== t.image || JSON.stringify(existing.images) !== JSON.stringify(t.images)) {
            existing.image = t.image;
            existing.images = t.images;
            needsSave = true;
          }
        });
      }
      if (needsSave) {
        this.save("de_temples", this.temples);
      }
    } catch (e) {
      console.error("Local storage not accessible, falling back to memory.", e);
    }
  }

  save(key: string, data: any) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.error("Could not write to local storage", e);
    }
  }

  saveAll() {
    this.save("de_temples", this.temples);
    this.save("de_bookings", this.bookings);
    this.save("de_payments", this.payments);
    this.save("de_notifications", this.notifications);
    this.save("de_users", this.users);
    this.save("de_feedback", this.feedback);
  }
}

const localStore = new LocalDbStore();

// Dynamic seeding for Firebase Firestore
export async function seedFirestore() {
  try {
    const querySnapshot = await getDocs(collection(db, "temples"));
    if (querySnapshot.empty) {
      console.log("Seeding temple data into Firebase Firestore...");
      for (const t of DEFAULT_TEMPLES) {
        await setDoc(doc(db, "temples", t.templeId), t);
      }
      console.log("Seeding temples complete!");
    } else {
      // Keep existing temple documents updated with correct image URLs
      for (const d of querySnapshot.docs) {
        const existing = d.data() as Temple;
        const defaultValue = DEFAULT_TEMPLES.find(t => t.templeId === existing.templeId);
        if (defaultValue && (existing.image !== defaultValue.image || JSON.stringify(existing.images) !== JSON.stringify(defaultValue.images))) {
          console.log(`Updating temple images for ${existing.templeId} in Firestore...`);
          await setDoc(doc(db, "temples", existing.templeId), {
            ...existing,
            image: defaultValue.image,
            images: defaultValue.images
          });
        }
      }
    }
  } catch (error) {
    console.warn("Firestore seeding skipped or not available offline. Fallback database handles query.", error);
  }
}

// Automatically seed on import
seedFirestore();

export const dbService = {
  // --- USER PROFILE OPERATIONS ---
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const snap = await getDoc(doc(db, "users", userId));
      if (snap.exists()) {
        const profile = snap.data() as UserProfile;
        localStore.users[userId] = profile;
        localStore.save("de_users", localStore.users);
        return profile;
      }
    } catch (e) {
      if (isPermissionError(e)) {
        handleFirestoreError(e, OperationType.GET, `users/${userId}`);
      }
      console.warn("Firestore error in getUserProfile, using local fallback", e);
    }
    return localStore.users[userId] || null;
  },

  async saveUserProfile(profile: UserProfile): Promise<void> {
    localStore.users[profile.userId] = profile;
    localStore.save("de_users", localStore.users);

    try {
      await setDoc(doc(db, "users", profile.userId), profile);
    } catch (e) {
      if (isPermissionError(e)) {
        handleFirestoreError(e, OperationType.WRITE, `users/${profile.userId}`);
      }
      console.warn("Firestore error in saveUserProfile, saved locally", e);
    }
  },

  async getAllUsers(): Promise<UserProfile[]> {
    try {
      const snap = await getDocs(collection(db, "users"));
      const users: UserProfile[] = [];
      snap.forEach(d => users.push(d.data() as UserProfile));
      if (users.length > 0) {
        users.forEach(u => localStore.users[u.userId] = u);
        localStore.save("de_users", localStore.users);
        return users;
      }
    } catch (e) {
      if (isPermissionError(e)) {
        handleFirestoreError(e, OperationType.LIST, "users");
      }
      console.warn("Firestore error in getAllUsers, using local fallback", e);
    }
    return Object.values(localStore.users);
  },

  // --- TEMPLE OPERATIONS ---
  async getTemples(): Promise<Temple[]> {
    try {
      const snap = await getDocs(collection(db, "temples"));
      const temples: Temple[] = [];
      snap.forEach(d => temples.push(d.data() as Temple));
      if (temples.length > 0) {
        temples.forEach(t => localStore.temples[t.templeId] = t);
        localStore.save("de_temples", localStore.temples);
        return temples;
      }
    } catch (e) {
      if (isPermissionError(e)) {
        handleFirestoreError(e, OperationType.LIST, "temples");
      }
      console.warn("Firestore error in getTemples, using local data", e);
    }
    return Object.values(localStore.temples);
  },

  async getTempleById(templeId: string): Promise<Temple | null> {
    try {
      const snap = await getDoc(doc(db, "temples", templeId));
      if (snap.exists()) {
        const temple = snap.data() as Temple;
        localStore.temples[templeId] = temple;
        localStore.save("de_temples", localStore.temples);
        return temple;
      }
    } catch (e) {
      if (isPermissionError(e)) {
        handleFirestoreError(e, OperationType.GET, `temples/${templeId}`);
      }
      console.warn("Firestore error in getTempleById, using local fallback", e);
    }
    return localStore.temples[templeId] || null;
  },

  async saveTemple(temple: Temple): Promise<void> {
    localStore.temples[temple.templeId] = temple;
    localStore.save("de_temples", localStore.temples);

    try {
      await setDoc(doc(db, "temples", temple.templeId), temple);
    } catch (e) {
      if (isPermissionError(e)) {
        handleFirestoreError(e, OperationType.WRITE, `temples/${temple.templeId}`);
      }
      console.warn("Firestore error in saveTemple, saved locally", e);
    }
  },

  async deleteTemple(templeId: string): Promise<void> {
    delete localStore.temples[templeId];
    localStore.save("de_temples", localStore.temples);

    try {
      await deleteDoc(doc(db, "temples", templeId));
    } catch (e) {
      if (isPermissionError(e)) {
        handleFirestoreError(e, OperationType.DELETE, `temples/${templeId}`);
      }
      console.warn("Firestore error in deleteTemple, deleted locally", e);
    }
  },

  // --- BOOKING OPERATIONS ---
  async getBookingsByUser(userId: string): Promise<Booking[]> {
    try {
      const q = query(collection(db, "bookings"), where("userId", "==", userId));
      const snap = await getDocs(q);
      const bookings: Booking[] = [];
      snap.forEach(d => bookings.push(d.data() as Booking));
      if (bookings.length > 0) {
        bookings.forEach(b => localStore.bookings[b.bookingId] = b);
        localStore.save("de_bookings", localStore.bookings);
        return bookings.sort((a,b) => b.createdAt.localeCompare(a.createdAt));
      }
    } catch (e) {
      if (isPermissionError(e)) {
        handleFirestoreError(e, OperationType.LIST, "bookings");
      }
      console.warn("Firestore error in getBookingsByUser, using local fallback", e);
    }
    return Object.values(localStore.bookings)
      .filter(b => b.userId === userId)
      .sort((a,b) => b.createdAt.localeCompare(a.createdAt));
  },

  async getAllBookings(): Promise<Booking[]> {
    try {
      const snap = await getDocs(collection(db, "bookings"));
      const bookings: Booking[] = [];
      snap.forEach(d => bookings.push(d.data() as Booking));
      if (bookings.length > 0) {
        bookings.forEach(b => localStore.bookings[b.bookingId] = b);
        localStore.save("de_bookings", localStore.bookings);
        return bookings.sort((a,b) => b.createdAt.localeCompare(a.createdAt));
      }
    } catch (e) {
      if (isPermissionError(e)) {
        handleFirestoreError(e, OperationType.LIST, "bookings");
      }
      console.warn("Firestore error in getAllBookings, using local fallback", e);
    }
    return Object.values(localStore.bookings).sort((a,b) => b.createdAt.localeCompare(a.createdAt));
  },

  async getBookingById(bookingId: string): Promise<Booking | null> {
    try {
      const snap = await getDoc(doc(db, "bookings", bookingId));
      if (snap.exists()) {
        const booking = snap.data() as Booking;
        localStore.bookings[bookingId] = booking;
        localStore.save("de_bookings", localStore.bookings);
        return booking;
      }
    } catch (e) {
      if (isPermissionError(e)) {
        handleFirestoreError(e, OperationType.GET, `bookings/${bookingId}`);
      }
      console.warn("Firestore error in getBookingById, using local fallback", e);
    }
    return localStore.bookings[bookingId] || null;
  },

  async saveBooking(booking: Booking): Promise<void> {
    localStore.bookings[booking.bookingId] = booking;
    localStore.save("de_bookings", localStore.bookings);

    try {
      await setDoc(doc(db, "bookings", booking.bookingId), booking);
    } catch (e) {
      if (isPermissionError(e)) {
        handleFirestoreError(e, OperationType.WRITE, `bookings/${booking.bookingId}`);
      }
      console.warn("Firestore error in saveBooking, saved locally", e);
    }
  },

  // --- PAYMENT OPERATIONS ---
  async savePayment(payment: PaymentRecord): Promise<void> {
    localStore.payments[payment.paymentId] = payment;
    localStore.save("de_payments", localStore.payments);

    try {
      await setDoc(doc(db, "payments", payment.paymentId), payment);
    } catch (e) {
      if (isPermissionError(e)) {
        handleFirestoreError(e, OperationType.WRITE, `payments/${payment.paymentId}`);
      }
      console.warn("Firestore error in savePayment, saved locally", e);
    }
  },

  async getPayments(): Promise<PaymentRecord[]> {
    try {
      const snap = await getDocs(collection(db, "payments"));
      const payments: PaymentRecord[] = [];
      snap.forEach(d => payments.push(d.data() as PaymentRecord));
      if (payments.length > 0) {
        payments.forEach(p => localStore.payments[p.paymentId] = p);
        localStore.save("de_payments", localStore.payments);
        return payments;
      }
    } catch (e) {
      if (isPermissionError(e)) {
        handleFirestoreError(e, OperationType.LIST, "payments");
      }
      console.warn("Firestore error in getPayments, using local fallback", e);
    }
    return Object.values(localStore.payments);
  },

  // --- NOTIFICATION OPERATIONS ---
  async getNotificationsByUser(userId: string): Promise<NotificationRecord[]> {
    try {
      const q = query(collection(db, "notifications"), where("userId", "==", userId));
      const snap = await getDocs(q);
      const notifications: NotificationRecord[] = [];
      snap.forEach(d => notifications.push(d.data() as NotificationRecord));
      if (notifications.length > 0) {
        notifications.forEach(n => localStore.notifications[n.notificationId] = n);
        localStore.save("de_notifications", localStore.notifications);
        return notifications.sort((a,b) => b.time.localeCompare(a.time));
      }
    } catch (e) {
      if (isPermissionError(e)) {
        handleFirestoreError(e, OperationType.LIST, "notifications");
      }
      console.warn("Firestore error in getNotificationsByUser, using local fallback", e);
    }
    return Object.values(localStore.notifications)
      .filter(n => n.userId === userId)
      .sort((a,b) => b.time.localeCompare(a.time));
  },

  async createNotification(notification: NotificationRecord): Promise<void> {
    localStore.notifications[notification.notificationId] = notification;
    localStore.save("de_notifications", localStore.notifications);

    try {
      await setDoc(doc(db, "notifications", notification.notificationId), notification);
    } catch (e) {
      if (isPermissionError(e)) {
        handleFirestoreError(e, OperationType.WRITE, `notifications/${notification.notificationId}`);
      }
      console.warn("Firestore error in createNotification, created locally", e);
    }
  },

  async markNotificationAsRead(notificationId: string): Promise<void> {
    if (localStore.notifications[notificationId]) {
      localStore.notifications[notificationId].read = true;
      localStore.save("de_notifications", localStore.notifications);
    }

    try {
      await updateDoc(doc(db, "notifications", notificationId), { read: true });
    } catch (e) {
      if (isPermissionError(e)) {
        handleFirestoreError(e, OperationType.UPDATE, `notifications/${notificationId}`);
      }
      console.warn("Firestore error in markNotificationAsRead, updated locally", e);
    }
  },

  // --- FEEDBACK / REVIEWS OPERATIONS ---
  async getFeedbackByTemple(templeId: string): Promise<FeedbackRecord[]> {
    try {
      const q = query(collection(db, "feedback"), where("templeId", "==", templeId));
      const snap = await getDocs(q);
      const feedback: FeedbackRecord[] = [];
      snap.forEach(d => feedback.push(d.data() as FeedbackRecord));
      if (feedback.length > 0) {
        localStore.feedback[templeId] = feedback;
        localStore.save("de_feedback", localStore.feedback);
        return feedback.sort((a,b) => b.createdAt.localeCompare(a.createdAt));
      }
    } catch (e) {
      if (isPermissionError(e)) {
        handleFirestoreError(e, OperationType.LIST, "feedback");
      }
      console.warn("Firestore error in getFeedbackByTemple, using local fallback", e);
    }
    return (localStore.feedback[templeId] || []).sort((a,b) => b.createdAt.localeCompare(a.createdAt));
  },

  async saveFeedback(feedback: FeedbackRecord): Promise<void> {
    const templeId = feedback.templeId;
    if (!localStore.feedback[templeId]) {
      localStore.feedback[templeId] = [];
    }
    localStore.feedback[templeId].push(feedback);
    localStore.save("de_feedback", localStore.feedback);

    try {
      await setDoc(doc(db, "feedback", feedback.feedbackId), feedback);
    } catch (e) {
      if (isPermissionError(e)) {
        handleFirestoreError(e, OperationType.WRITE, `feedback/${feedback.feedbackId}`);
      }
      console.warn("Firestore error in saveFeedback, saved locally", e);
    }
  }
};

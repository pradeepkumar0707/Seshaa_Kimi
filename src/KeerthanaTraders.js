import React, { useState, useEffect,useCallback } from 'react';
import { Home, Users, Store, Search, Plus, Trash2, FileText, Loader, AlertCircle, RefreshCw, Edit, X, Lock } from 'lucide-react';
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyCBpjg8nuRri2z4EwzzYyQptEUDikucNEE",
  authDomain: "keerthana-traders.firebaseapp.com",
  projectId: "keerthana-traders",
  storageBucket: "keerthana-traders.firebasestorage.app",
  messagingSenderId: "44538960020",
  appId: "1:44538960020:web:34c741f0516219c189fc81"
};

// Single authentication password - change this to your desired password
const APP_PASSWORD = "seshaa123";

const KeerthanaTraders = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState('home');
  const [farmers, setFarmers] = useState([]);
  const [dealers, setDealers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [firebaseReady, setFirebaseReady] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const [fromDate, setFromDate] = useState("");
const [toDate, setToDate] = useState("");
const [statusFilter, setStatusFilter] = useState("Completed"); 
const [statementData, setStatementData] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    date: new Date().toISOString().split('T')[0],
    things: '',
    numberOfBags: '',
    kilos: '',
    pricePerKilo: '',
    totalAmount: '',
    pendingAmount: '',
    status: 'Incomplete',
    company: '',
    notes: "",
    brokerName: '',
    weighbridgeName: '',
  });

  // Firebase state
  const [db, setDb] = useState(null);
  const [firestoreFunctions, setFirestoreFunctions] = useState(null);
  const [searchDate, setSearchDate] = useState('');
  const [statementType, setStatementType] = useState("All");


  const generateStatement = () => {
  if (!fromDate) {
    alert("Please select From Date");
    return;
  }

  const clearStatementFilters = () => {
  setFromDate("");
  setToDate("");
  setStatusFilter("Completed");   // change to "All" if you want
  setStatementType("All");
  setStatementData([]);
};


  const start = fromDate;
  const end = toDate || fromDate;

  const statusMatch = (status) => {
    if (statusFilter === "All") return true;
    if (statusFilter === "Completed") return status === "Completed";
    return status !== "Completed";
  };

  const mapRow = (r, type) => ({
    Date: r.date,
    Name: r.name,
    Address: r.address,
    Type: type,
    Status: r.status,
    Item: r.things,
    Kilos: r.kilos,
    Amount: r.totalAmount,
  });

  let data = [];

  if (statementType === "All" || statementType === "Farmer") {
    data.push(
      ...farmers
        .filter(r =>
          statusMatch(r.status) &&
          r.date >= start &&
          r.date <= end
        )
        .map(r => mapRow(r, "Farmer"))
    );
  }

  if (statementType === "All" || statementType === "Dealer") {
    data.push(
      ...dealers
        .filter(r =>
          statusMatch(r.status) &&
          r.date >= start &&
          r.date <= end
        )
        .map(r => mapRow(r, "Dealer"))
    );
  }

  setStatementData(data);
};

const clearStatementFilters = () => {
  setFromDate("");
  setToDate("");
  setStatusFilter("Completed"); // or "All"
  setStatementType("All");
  setStatementData([]);
};



const downloadExcel = () => {
  if (statementData.length === 0) {
    alert("No data to export");
    return;
  }

  const ws = XLSX.utils.json_to_sheet(statementData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Statement");

  const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const blob = new Blob([buffer], { type: "application/octet-stream" });
// All | Farmer | Dealer


  saveAs(blob, "Statement.xlsx");
};



  // Check if user was previously authenticated
  useEffect(() => {
    const savedAuth = localStorage.getItem('keerthana_authenticated');
    if (savedAuth === 'true') {
      setIsAuthenticated(true);
      initFirebase();
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    setLoginError('');

    if (password === APP_PASSWORD) {
      setIsAuthenticated(true);
      localStorage.setItem('keerthana_authenticated', 'true');
      initFirebase();
    } else {
      setLoginError('Invalid password. Please try agai.');
      setPassword('');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('keerthana_authenticated');
    setPassword('');
  };

  const initFirebase = async () => {
    setLoading(true);
    setConnectionError(null);

    try {
      // Load Firebase modules
      const firebaseApp = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js');
      const firebaseFirestore = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

      const app = firebaseApp.initializeApp(FIREBASE_CONFIG);
      const database = firebaseFirestore.getFirestore(app);

      // Store Firestore functions
      const functions = {
        collection: firebaseFirestore.collection,
        addDoc: firebaseFirestore.addDoc,
        getDocs: firebaseFirestore.getDocs,
        deleteDoc: firebaseFirestore.deleteDoc,
        updateDoc: firebaseFirestore.updateDoc,
        doc: firebaseFirestore.doc
      };

      setDb(database);
      setFirestoreFunctions(functions);

      // Try to fetch data to verify connection
      await loadData(database, functions);

      setFirebaseReady(true);
      setConnectionError(null);
    } catch (err) {
      console.error('Firebase initialization error:', err);

      let errorMessage = 'Failed to connect to Firebase.';

      if (err.message.includes('permission-denied') || err.message.includes('API has not been used')) {
        errorMessage = '⚠️ Firestore API is not enabled. Please enable it in Firebase Console.';
        setConnectionError('api-disabled');
      } else if (err.message.includes('network') || err.message.includes('fetch')) {
        errorMessage = '⚠️ Network error. Please check your internet connection.';
        setConnectionError('network');
      } else {
        errorMessage = `Error: ${err.message}`;
        setConnectionError('unknown');
      }

      setError(errorMessage);
      setFirebaseReady(false);
      setLoading(false);
    }
  };

  const items = [
    "பாசி",
    "உளுந்து",
    "சீவப்பு சோளம்",
    "நெட்டை சோளம்",
    "கம்பு",
    "எள்ளு",
    "மக்கா சோளம்",
    "கொ. முத்து",
    "பருத்தி ",
    "சூரியகாந்தி",
    "சிவப்பு வத்தல்",
    "வேப்ப முத்து",
    "மல்லி",
    "குதிரைவாலி",
    "Others"
  ];

  const [showOthers, setShowOthers] = useState(false);
  const [customThing, setCustomThing] = useState("");


  const handleThingSelect = (item) => {
    let selected = formData.things ? formData.things.split(",") : [];

    if (item === "Others") {
      if (showOthers) {
        // If Already selected → unselect
        setShowOthers(false);
        setCustomThing("");

        // Remove custom value from list
        const updated = selected.filter(
          (val) => !val || !val.trim() || items.includes(val)
        );

        setFormData({ ...formData, things: updated.join(",") });
      } else {
        // If not selected → select
        setShowOthers(true);
      }
      return;
    }

    // Normal items
    if (selected.includes(item)) {
      selected = selected.filter((i) => i !== item);
    } else {
      selected.push(item);
    }

    setFormData({ ...formData, things: selected.join(",") });
  };


  const handleCustomThing = (value) => {
    setCustomThing(value);

    let selected = formData.things ? formData.things.split(",") : [];

    // Remove old custom value (anything not in items list)
    selected = selected.filter((val) => items.includes(val));

    // If user typed something → add it
    if (value.trim() !== "") {
      selected.push(value.trim());
    }

    setFormData({ ...formData, things: selected.join(",") });
  };





  const loadData = async (database, functions) => {
    try {
      // Fetch farmers
      const farmersSnapshot = await functions.getDocs(functions.collection(database, 'farmers'));
      const farmersData = farmersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Fetch dealers
      const dealersSnapshot = await functions.getDocs(functions.collection(database, 'dealers'));
      const dealersData = dealersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setFarmers(farmersData);
      setDealers(dealersData);
      setError(null);
      setLoading(false);
    } catch (err) {
      console.error('Error loading data:', err);
      throw err; // Re-throw to be caught by initFirebase
    }
  };

  const saveToFirebase = async (type, data) => {
    if (!db || !firestoreFunctions) {
      alert('⚠️ Firebase is not connected. Please refresh the page or check the error message above.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const collectionName = type === 'farmer' ? 'farmers' : 'dealers';

      const docRef = await firestoreFunctions.addDoc(
        firestoreFunctions.collection(db, collectionName),
        {
          ...data,
          createdAt: new Date().toISOString(),
          timestamp: Date.now()
        }
      );

      const newRecord = { ...data, id: docRef.id };

      if (type === 'farmer') {
        setFarmers([...farmers, newRecord]);
      } else {
        setDealers([...dealers, newRecord]);
      }

      alert('✅ Record saved successfully!');
      resetForm();
    } catch (err) {
      console.error('Error saving to Firebase:', err);

      let errorMsg = 'Failed to save record.';
      if (err.message.includes('permission-denied')) {
        errorMsg = 'Permission denied. Please check Firebase security rules.';
      } else if (err.message.includes('API has not been used')) {
        errorMsg = 'Firestore API not enabled. Please enable it in Firebase Console.';
      }

      setError(errorMsg);
      alert(`❌ ${errorMsg}\n\nError: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const updateInFirebase = async (type, id, data) => {
    if (!db || !firestoreFunctions) {
      alert('⚠️ Firebase is not connected. Please refresh the page.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const collectionName = type === 'farmer' ? 'farmers' : 'dealers';

      await firestoreFunctions.updateDoc(
        firestoreFunctions.doc(db, collectionName, id),
        {
          ...data,
          updatedAt: new Date().toISOString()
        }
      );

      // Update local state
      if (type === 'farmer') {
        setFarmers(farmers.map(f => f.id === id ? { ...f, ...data } : f));
      } else {
        setDealers(dealers.map(d => d.id === id ? { ...d, ...data } : d));
      }

      alert('✅ Record updated successfully!');
      cancelEdit();
    } catch (err) {
      console.error('Error updating in Firebase:', err);

      let errorMsg = 'Failed to update record.';
      if (err.message.includes('permission-denied')) {
        errorMsg = 'Permission denied. Please check Firebase security rules.';
      }

      setError(errorMsg);
      alert(`❌ ${errorMsg}\n\nError: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.address) {
      alert('⚠️ Please fill in Name and Address (required fields)');
      return;
    }

    if (editingRecord) {
      const type = activeTab === 'farmers' ? 'farmer' : 'dealer';
      updateInFirebase(type, editingRecord.id, formData);
    } else {
      if (activeTab === 'farmers') {
        saveToFirebase('farmer', formData);
      } else {
        saveToFirebase('dealer', formData);
      }
    }
  };
const clean = (str) => {
  if (!str) return "";
  return str.trim();
};

let allBrokerNames = [];

if (activeTab === "farmers") {
  allBrokerNames = [
    ...new Set(
      farmers
        .map(f => clean(f.brokerName))
        .filter(b => b !== "")
    )
  ];
} else if (activeTab === "dealers") {
  allBrokerNames = [
    ...new Set(
      dealers
        .map(d => clean(d.brokerName))
        .filter(b => b !== "")
    )
  ];
}



  const [searchBroker, setSearchBroker] = useState("");


  const handleEdit = (record) => {
    setSearchTerm('');
    setSearchDate('');
    setEditingRecord(record);
    setFormData({
      name: record.name || '',
      address: record.address || '',
      date: record.date || new Date().toISOString().split('T')[0],
      things: record.things || '',
      numberOfBags: record.numberOfBags || '',
      kilos: record.kilos || '',
      pricePerKilo: record.pricePerKilo || '',
      totalAmount: record.totalAmount || '',
      pendingAmount: record.pendingAmount || '',
      status: record.status || 'Incomplete',
      company: record.company || '',
      notes: record.notes || "",
      brokerName: record.brokerName || "",
      weighbridgeName: record.weighbridgeName || ""

    });
    setShowAddForm(true);
  };

  const cancelEdit = () => {
    setEditingRecord(null);
    resetForm();
  };

  const handleDelete = async (id, type) => {
    if (!db || !firestoreFunctions) {
      alert('⚠️ Firebase is not connected. Please refresh the page.');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this record from Firebase?')) {
      return;
    }

    try {
      const collectionName = type === 'farmer' ? 'farmers' : 'dealers';
      await firestoreFunctions.deleteDoc(firestoreFunctions.doc(db, collectionName, id));

      if (type === 'farmer') {
        setFarmers(farmers.filter(f => f.id !== id));
      } else {
        setDealers(dealers.filter(d => d.id !== id));
      }

      alert('✅ Record deleted successfully!');
    } catch (err) {
      console.error('Error deleting:', err);
      alert(`❌ Failed to delete: ${err.message}`);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      address: '',
      date: new Date().toISOString().split('T')[0],
      things: '',
      numberOfBags: '',
      kilos: '',
      pricePerKilo: '',
      totalAmount: '',
      pendingAmount: '',
      status: 'Incomplete',
      company: ''
    });
    setShowAddForm(false);
    setEditingRecord(null);
  };

  const printRecord = (record) => {

  const header = `<b>         
    கீர்த்தனா டிரேடர்ஸ்   
    1-6A, Police Station Road, 
    Pudur - 628905     
    📞 9442355882 , 8778367316 
    ------------------------------------------------
  </b>`;

  const getWidth = (text) => {
    let width = 0;
    for (let ch of text) {
      width += ch.charCodeAt(0) > 256 ? 2 : 1;
    }
    return width;
  };

  const COLON_COLUMN = 2;

  const makeLine = (label, value) => {
    const labelWidth = getWidth(label);
    let spaces = COLON_COLUMN - labelWidth;
    if (spaces < 1) spaces = 1;

    return `<span style="font-weight:700;">${label}</span>${" ".repeat(spaces)}: <span style="font-weight:700;">${value}</span>\n`;
  };

  const formatIndianDate = (dateStr) => {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split("-");
  return `${day}-${month}-${year}`;
};

let priceText = (record.pricePerKilo || "")
  .replace(/[\r\n]/g, "")   // remove hidden newlines
  .replace(/\s+/g, " ")     // remove unwanted spaces
  .trim();

const formatThingsLine = (things) => {
  if (!things) return `<b>பொருள் : -\n</b>`;

  // single item → same line
  if (!things.includes(",")) {
    return `<b>பொருள் : ${things}\n</b>`;
  }

  // multiple items → next line, indented
  return `<b>பொருள் :\n     ${things}\n</b>`;
};




const thingsLine = formatThingsLine(record.things);

  const text = `${header}
    ${makeLine("பெயர்", record.name)}
    ${makeLine("முகவரி", record.address)}
    ${makeLine("தேதி", formatIndianDate(record.date))}
    ${thingsLine}
    ${record.numberOfBags ? makeLine("பை எண்ணிக்கை", record.numberOfBags) : ""}
    ${makeLine("எடை", record.kilos || "-")}
    ${record.pricePerKilo ? (
    priceText.includes(",")
    ? `<b>ஒரு குவிண்டால் விலை :\n    ${priceText.replace(/,/g, ",\n    ")}\n</b>`
    : `<b>ஒரு குவிண்டால் விலை : ${priceText}\n</b>`
) : ""}
    ${makeLine("மொத்த தொகை", "" + (record.totalAmount || "0"))}
    ${makeLine("நிலுவை தொகை", "" + (record.pendingAmount || "0"))}
    ${makeLine("Status", record.status)}
    ${record.company ? makeLine("Company", record.company) : ""}
    ${record.brokerName ? makeLine("தரகர் பெயர்", record.brokerName) : ""}
    ${record.weighbridgeName ? makeLine("Weighbridge Name", record.weighbridgeName) : ""}
    ${record.notes ? makeLine("Notes", record.notes) : ""}
    ------------------------------------------------
    <b> நன்றி! மீண்டும் வருக </b>
  `;

  const win = window.open("", "", "fullscreen=yes");
  win.document.write(`
    <pre style="font-size:14px; font-family:monospace; white-space:pre; margin:0; padding:0;">
${text}
    </pre>
    <script>window.onload = () => window.print();</script>
  `);
  win.document.close();
};


  const filteredFarmers = farmers
    .filter(f => {
      const matchesText =
        f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.address.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDate = searchDate ? f.date === searchDate : true;

      const matchesBroker = searchBroker ? f.brokerName === searchBroker : true;

      return matchesText && matchesDate && matchesBroker;
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));   // <-- LATEST FIRST


  const filteredDealers = dealers
    .filter(d => {
      const matchesText =
        d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.address.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDate = searchDate ? d.date === searchDate : true;

      const matchesBroker = searchBroker ? d.brokerName === searchBroker : true;

      return matchesText && matchesDate && matchesBroker;
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));   // <-- LATEST FIRST


  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="text-white font-bold text-2xl">KT</div>
            </div>
            <h1 className="text-3xl font-bold text-gray-800">KEERTHANA TRADERS</h1>
            <p className="text-gray-600 mt-2">Enter password to access the system</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent text-lg"
                  required
                />
              </div>
              {loginError && (
                <p className="text-red-600 text-sm mt-2 flex items-center">
                  <AlertCircle size={16} className="mr-1" />
                  {loginError}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition font-semibold text-lg"
            >
              🔐 Login
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            <p>Secure access required</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="animate-spin text-green-600 mx-auto mb-4" size={48} />
          <p className="text-gray-600 text-lg">Loading application...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                <div className="text-green-600 font-bold text-2xl">KT</div>
              </div>
              <div>
                <h1 className="text-4xl font-bold">கீர்த்தனா டிரேடர்ஸ்</h1>
                <p className="text-green-100 text-sm">நவதானிய வியாபாரம்</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="bg-white text-green-600 px-4 py-2 rounded-lg hover:bg-green-50 transition font-medium flex items-center space-x-2"
            >
              <Lock size={16} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Connection Error Alert */}
      {connectionError === 'api-disabled' && (
        <div className="container mx-auto px-4 pt-4">
          <div className="bg-orange-50 border-l-4 border-orange-500 p-6 rounded-lg shadow-md">
            <div className="flex items-start">
              <AlertCircle className="text-orange-500 mr-3 mt-1 flex-shrink-0" size={24} />
              <div className="flex-1">
                <h3 className="text-orange-800 font-bold text-lg mb-2">⚠️ Firestore API Not Enabled</h3>
                <p className="text-orange-700 mb-3">
                  The Cloud Firestore API needs to be enabled for your Firebase project. Please follow these steps:
                </p>
                <ol className="text-orange-700 space-y-2 mb-4 ml-4 list-decimal">
                  <li>Click this link: <a href="https://console.developers.google.com/apis/api/firestore.googleapis.com/overview?project=keerthana-traders" target="_blank" rel="noopener noreferrer" className="underline font-medium">Enable Firestore API</a></li>
                  <li>Click the "ENABLE" button</li>
                  <li>Go to <a href="https://console.firebase.google.com/project/keerthana-traders/firestore" target="_blank" rel="noopener noreferrer" className="underline font-medium">Firebase Console</a></li>
                  <li>Create a Firestore Database (choose "Start in test mode")</li>
                  <li>Wait 2-3 minutes, then click the "Retry Connection" button below</li>
                </ol>
                <button
                  onClick={initFirebase}
                  className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition"
                >
                  <RefreshCw size={16} />
                  Retry Connection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* General Error Alert */}
      {error && connectionError !== 'api-disabled' && (
        <div className="container mx-auto px-4 pt-4">
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <AlertCircle className="text-red-500 mr-3" size={24} />
                <div>
                  <p className="text-red-800 font-medium">Error</p>
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              </div>
              <button
                onClick={initFirebase}
                className="ml-4 flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded text-sm"
              >
                <RefreshCw size={14} />
                Retry
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="bg-white shadow-md sticky top-0 z-10">
        <div className="container mx-auto px-4">
          <div className="flex justify-center space-x-1">
            {[
              { id: 'home', label: 'Home', icon: Home },
              { id: 'farmers', label: 'Farmer', icon: Users },
              { id: 'dealers', label: 'Dealer', icon: Store }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setShowAddForm(false); setEditingRecord(null); }}
                className={`flex items-center space-x-2 px-8 py-4 border-b-2 transition ${activeTab === tab.id
                  ? 'border-green-600 text-green-600 bg-green-50'
                  : 'border-transparent text-gray-600 hover:text-green-600 hover:bg-green-50'
                  }`}
              >
                <tab.icon size={20} />
                <span className="font-medium text-lg">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
       {activeTab === 'home' && (
  <div className="bg-white p-6 rounded-xl shadow space-y-4">

    <h2 className="text-2xl font-bold">📑 Statement</h2>

    {/* Status Filter */}
    <div className="flex gap-3">
      {["Completed", "Incompleted", "All"].map(s => (
        <button
          key={s}
          onClick={() => setStatusFilter(s)}
          className={`px-4 py-1 rounded-full border
            ${statusFilter === s
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-700"}`}
        >
          {s}
        </button>
      ))}
    </div>

    {/* Farmer / Dealer Filter */}
<div className="flex gap-3">
  {["All", "Farmer", "Dealer"].map(t => (
    <button
      key={t}
      onClick={() => setStatementType(t)}
      className={`px-4 py-1 rounded-full border
        ${statementType === t
          ? "bg-purple-600 text-white"
          : "bg-white text-gray-700"}`}
    >
      {t}
    </button>
  ))}
</div>


    {/* Date Inputs */}
    <div className="flex gap-4">
      <input
        type="date"
        value={fromDate}
        onChange={(e) => setFromDate(e.target.value)}
        className="border px-3 py-2 rounded"
      />

      <input
        type="date"
        value={toDate}
        onChange={(e) => setToDate(e.target.value)}
        className="border px-3 py-2 rounded"
      />

     <div className="flex gap-3">
  <button
    onClick={generateStatement}
    className="bg-blue-600 text-white px-4 py-2 rounded"
  >
    Enter
  </button>

  <button
    onClick={clearStatementFilters}
    className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
  >
    Clear
  </button>
</div>

    </div>

    {/* Statement Table */}
    {statementData.length > 0 && (
      <>
        <div className="overflow-auto border rounded">
          <table className="w-full border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-2">Date</th>
                <th className="border p-2">Name</th>
                <th className="border p-2">Type</th>
                <th className="border p-2">Status</th>
                <th className="border p-2">Item</th>
                <th className="border p-2">Kilos</th>
                <th className="border p-2">Amount</th>
                <th className="border p-2">Address</th>
              </tr>
            </thead>
            <tbody>
              {statementData.map((r, i) => (
                <tr key={i}>
                  <td className="border p-2">{r.Date}</td>
                  <td className="border p-2">{r.Name}</td>
                  <td className="border p-2">{r.Type}</td>
                  <td className="border p-2">{r.Status}</td>
                  <td className="border p-2">{r.Item}</td>
                  <td className="border p-2">{r.Kilos}</td>
                  <td className="border p-2">₹{r.Amount}</td>
                  <td className="border p-2">{r.Address}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button
          onClick={downloadExcel}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          ⬇ Download Excel
        </button>
      </>
    )}
  </div>
)}



        {(activeTab === 'farmers' || activeTab === 'dealers') && (
          <div className="space-y-6">
            <div className="flex justify-between items-center gap-3">

              {/* SEARCH BAR WITH BROKER + DATE */}
              <div className="flex items-center gap-3 w-full max-w-3xl border border-gray-300 rounded-xl bg-white px-3">

                {/* Search Icon */}
                <Search className="text-gray-400" size={20} />

                {/* Search Input */}
                <input
                  type="text"
                  placeholder={`Search ${activeTab}...`}
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setShowAddForm(false);
                    setEditingRecord(null);
                  }}
                  className="flex-1 py-3 text-base outline-none focus:border-gray-300"

                />

                {/* Broker Dropdown with Clear Option */}
                {allBrokerNames.length > 0 && (
                  <select
                    value={searchBroker}
                    onChange={(e) => {
                      setSearchBroker(e.target.value); // "" clears the filter
                      setShowAddForm(false);
                      setEditingRecord(null);
                    }}
                    className="border border-gray-300 rounded-md bg-white text-sm px-2 py-2"
                  >
                    {/* Clear Filter Option */}
                    <option value="">All Brokers</option>

                    {/* Real Brokers */}
                    {allBrokerNames.map((b, idx) => (
                      <option key={idx} value={b}>{b}</option>
                    ))}
                  </select>
                )}

                {/* Date Input */}
                <input
                  type="date"
                  value={searchDate}
                  onChange={(e) => {
                    setSearchDate(e.target.value);
                    setShowAddForm(false);
                    setEditingRecord(null);
                  }}
                  className="border border-gray-300 rounded-md bg-white text-sm px-2 py-2 w-[120px]"
                />
              </div>



              {/* ADD BUTTON – keep exactly as before */}
              <button
                onClick={() => setShowAddForm(true)}
                disabled={saving || !firebaseReady}
                className={`flex items-center space-x-2 ${activeTab === 'farmers' ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-purple-600 hover:bg-purple-700'
                  } text-white px-6 py-3 rounded-lg transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <Plus size={20} />
                <span>Add {activeTab === 'farmers' ? 'Farmer' : 'Dealer'}</span>
              </button>
            </div>



            {(showAddForm || editingRecord) && searchTerm === "" && (
              <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-green-600">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-2xl font-bold text-gray-800">
                    {editingRecord ? 'Edit' : 'Add New'} {activeTab === 'farmers' ? 'Farmer' : 'Dealer'}
                  </h3>
                  {editingRecord && (
                    <button
                      onClick={cancelEdit}
                      className="text-gray-500 hover:text-gray-700 p-1 rounded"
                    >
                      <X size={24} />
                    </button>
                  )}
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="பெயர்* (Required)"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600"
                    required
                  />
                  <input
                    type="text"
                    placeholder="முகவரி* (Required)"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600"
                    required
                  />
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600"
                  />
                  <div className="col-span-2 space-y-2">

                    <label className="font-medium">பொருள்</label>

                    {/* Checkbox List */}
                    <div className="grid grid-cols-2 gap-2">
                      {items.map((item, idx) => (
                        <label key={idx} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={
                              formData.things.split(",").includes(item) ||
                              (item === "Others" && showOthers)
                            }
                            onChange={() => handleThingSelect(item)}
                          />
                          {item}
                        </label>
                      ))}
                    </div>

                    {/* Others Input */}
                    {showOthers && (
                      <input
                        type="text"
                        placeholder="Enter custom item"
                        value={customThing}
                        onChange={(e) => handleCustomThing(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 w-full"
                      />
                    )}

                    {/* Show final comma-separated */}
                    <input
                      type="text"
                      value={formData.things}
                      readOnly
                      className="px-4 py-2 border border-gray-300 rounded-lg bg-gray-100"
                    />
                  </div>

                  <input
  type="text"
  placeholder="பை எண்ணிக்கை"
  value={formData.numberOfBags}
  onChange={(e) => setFormData({ ...formData, numberOfBags: e.target.value })}
  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600"
/>

                  {activeTab === 'dealers' && (
                    <input
                      type="text"
                      placeholder="Company"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600"
                    />
                  )}
                  <input
                    type="text"
                    placeholder="எடை"
                    value={formData.kilos}
                    onChange={(e) => setFormData({ ...formData, kilos: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600"
                  />
                  <input
                    type="text"
                    placeholder="ஒரு குவிண்டால் விலை (₹)"
                    value={formData.pricePerKilo}
                    onChange={(e) => setFormData({ ...formData, pricePerKilo: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600"
                  />
                  <input
                    type="number"
                    placeholder="மொத்த தொகை (₹)"
                    value={formData.totalAmount}
                    onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600"
                  />
                  <input
                    type="number"
                    placeholder="நிலுவை தொகை (₹)"
                    value={formData.pendingAmount}
                    onChange={(e) => setFormData({ ...formData, pendingAmount: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600"
                  />
                  <input
                    type="text"
                    placeholder="தரகர் பெயர்(Optional)"
                    value={formData.brokerName}
                    onChange={(e) => setFormData({ ...formData, brokerName: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600"
                  />

                  <input
                    type="text"
                    placeholder="Weighbridge Name (Optional)"
                    value={formData.weighbridgeName}
                    onChange={(e) =>
                      setFormData({ ...formData, weighbridgeName: e.target.value })
                    }
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600"
                  />
                  <textarea
                    placeholder="Notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 col-span-2 h-24"
                  />

                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600"
                  >
                    <option value="Incomplete">Incomplete</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
                <div className="flex space-x-3 mt-6">
                  <button
                    onClick={handleSubmit}
                    disabled={saving || !firebaseReady}
                    className="flex-1 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {saving ? (
                      <>
                        <Loader className="animate-spin mr-2" size={20} />
                        {editingRecord ? 'Updating...' : 'Saving to Firebase...'}
                      </>
                    ) : (
                      editingRecord ? '💾 Update Record' : '💾 Save to Firebase'
                    )}
                  </button>
                  <button
                    onClick={resetForm}
                    disabled={saving}
                    className="flex-1 bg-gray-300 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-400 transition font-medium disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="grid gap-4">
              {(activeTab === 'farmers' ? filteredFarmers : filteredDealers).map(record => (
                <div key={record.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 grid md:grid-cols-3 gap-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-800 mb-1">{record.name}</h3>
                        <p className="text-gray-600 text-sm">{record.address}</p>
                        <p className="text-gray-500 text-sm mt-1">Date: {record.date}</p>
                      </div>
                      <div>
                        <p className="text-gray-600"><span className="font-medium">பொருள்:</span> {record.things || '-'}</p>
                        {record.numberOfBags && <p className="text-gray-600"><span className="font-medium">பை எண்ணிக்கை:</span> {record.numberOfBags}</p>}
                        {record.company && <p className="text-gray-600"><span className="font-medium">Company:</span> {record.company}</p>}
                        {record.brokerName && (
                          <p className="text-gray-600"><span className="font-medium">தரகர்:</span> {record.brokerName}</p>
                        )}

                        {record.weighbridgeName && (
                          <p className="text-gray-600"><span className="font-medium">Weighbridge:</span> {record.weighbridgeName}</p>
                        )}

                        <p className="text-gray-600"><span className="font-medium">எடை:</span> {record.kilos || '-'}</p>
                        {record.pricePerKilo && <p className="text-gray-600"><span className="font-medium">ஒரு குவிண்டால் விலை:</span> ₹{record.pricePerKilo}</p>}
                      </div>
                      <div>
                        <p className="text-gray-800 font-bold text-lg">மொத்த தொகை: ₹{record.totalAmount || '0'}</p>
                        <p className="text-orange-600 font-medium">நிலுவை தொகை: ₹{record.pendingAmount || '0'}</p>
                        <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${record.status === 'Completed'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                          }`}>
                          {record.status}
                        </span>
                        {record.notes && (
                          <p className="text-gray-600"><span className="font-medium">Notes:</span> {record.notes}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() => handleEdit(record)}
                        disabled={!firebaseReady}
                        className="text-green-600 hover:text-green-800 p-2 hover:bg-green-50 rounded transition disabled:opacity-50"
                        title="Edit"
                      >
                        <Edit size={20} />
                      </button>
                      <button
                        onClick={() => printRecord(record)}
                        className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded transition"
                        title="Print"
                      >
                        <FileText size={20} />
                      </button>
                      <button
                        onClick={() => handleDelete(record.id, activeTab === 'farmers' ? 'farmer' : 'dealer')}
                        disabled={!firebaseReady}
                        className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded transition disabled:opacity-50"
                        title="Delete"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {((activeTab === 'farmers' && filteredFarmers.length === 0) ||
              (activeTab === 'dealers' && filteredDealers.length === 0)) && (
                <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                  <p className="text-gray-500 text-lg">
                    No {activeTab} found. {firebaseReady ? `Click "Add ${activeTab === 'farmers' ? 'Farmer' : 'Dealer'}" to create a new record.` : 'Please connect to Firebase first.'}
                  </p>
                </div>
              )}
          </div>
        )}
      </main>
    </div>
  );
};

export default KeerthanaTraders;
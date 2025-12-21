import React, { useState, useEffect } from 'react';
import { Download, Search, Plus, Trash2, FileText, Database, Home, Users, Truck } from 'lucide-react';
import { collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyCBpjg8nuRri2z4EwzzYyQptEUDikucNEE",
  authDomain: "keerthana-traders.firebaseapp.com",
  projectId: "keerthana-traders",
  storageBucket: "keerthana-traders.firebasestorage.app",
  messagingSenderId: "44538960020",
  appId: "1:44538960020:web:34c741f0516219c189fc81",
  measurementId: "G-BJ3PQ115X7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const analytics = getAnalytics(app);

// PDF Generator Functions
const generateProductsPDF = (products) => {
  const doc = new jsPDF();
  doc.setFontSize(24);
  doc.setTextColor(22, 163, 74);
  doc.text('KEERTHANA TRADERS', 105, 20, { align: 'center' });
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text('Products Report', 105, 28, { align: 'center' });
  doc.text(`Date: ${new Date().toLocaleDateString('en-IN')}`, 105, 35, { align: 'center' });
  
  doc.autoTable({
    startY: 45,
    head: [['#', 'Product', 'Category', 'Price (₹)', 'Stock', 'Value (₹)']],
    body: products.map((p, i) => [
      i + 1,
      p.name,
      p.category,
      p.price,
      p.stock,
      p.price * p.stock
    ]),
    theme: 'grid',
    headStyles: { fillColor: [22, 163, 74] }
  });
  
  doc.save('keerthana-traders-products.pdf');
};

const generateFarmersPDF = (farmers) => {
  const doc = new jsPDF();
  doc.setFontSize(24);
  doc.setTextColor(59, 130, 246);
  doc.text('KEERTHANA TRADERS', 105, 20, { align: 'center' });
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text('Farmers Report', 105, 28, { align: 'center' });
  doc.text(`Date: ${new Date().toLocaleDateString('en-IN')}`, 105, 35, { align: 'center' });
  
  doc.autoTable({
    startY: 45,
    head: [['#', 'Name', 'Address', 'Date', 'Products', 'Bags', 'Kilos', 'Total (₹)', 'Pending (₹)', 'Status']],
    body: farmers.map((f, i) => [
      i + 1,
      f.name,
      f.address,
      f.date,
      f.things,
      f.numberOfBags,
      f.kilos,
      f.totalAmount,
      f.pendingAmount,
      f.status
    ]),
    theme: 'grid',
    headStyles: { fillColor: [59, 130, 246] }
  });
  
  doc.save('keerthana-traders-farmers.pdf');
};

const generateDealersPDF = (dealers) => {
  const doc = new jsPDF();
  doc.setFontSize(24);
  doc.setTextColor(147, 51, 234);
  doc.text('KEERTHANA TRADERS', 105, 20, { align: 'center' });
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text('Dealers Report', 105, 28, { align: 'center' });
  doc.text(`Date: ${new Date().toLocaleDateString('en-IN')}`, 105, 35, { align: 'center' });
  
  doc.autoTable({
    startY: 45,
    head: [['#', 'Name', 'Address', 'Date', 'Products', 'Total (₹)', 'Kilos', 'Pending (₹)', 'Status']],
    body: dealers.map((d, i) => [
      i + 1,
      d.name,
      d.address,
      d.date,
      d.things,
      d.totalAmount,
      d.kilos,
      d.pendingAmount,
      d.status
    ]),
    theme: 'grid',
    headStyles: { fillColor: [147, 51, 234] }
  });
  
  doc.save('keerthana-traders-dealers.pdf');
};

// Excel Export Functions
const exportProductsToExcel = (products) => {
  const data = products.map((p, i) => ({
    'S.No': i + 1,
    'Product Name': p.name,
    'Category': p.category,
    'Price (₹)': p.price,
    'Stock': p.stock,
    'Total Value (₹)': p.price * p.stock
  }));
  
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Products');
  XLSX.writeFile(wb, 'keerthana-traders-products.xlsx');
};

const exportFarmersToExcel = (farmers) => {
  const data = farmers.map((f, i) => ({
    'S.No': i + 1,
    'Name': f.name,
    'Address': f.address,
    'Date': f.date,
    'Products': f.things,
    'Number of Bags': f.numberOfBags,
    'Kilos': f.kilos,
    'Total Amount (₹)': f.totalAmount,
    'Pending Amount (₹)': f.pendingAmount,
    'Status': f.status
  }));
  
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Farmers');
  XLSX.writeFile(wb, 'keerthana-traders-farmers.xlsx');
};

const exportDealersToExcel = (dealers) => {
  const data = dealers.map((d, i) => ({
    'S.No': i + 1,
    'Name': d.name,
    'Address': d.address,
    'Date': d.date,
    'Products': d.things,
    'Total Amount (₹)': d.totalAmount,
    'Kilos': d.kilos,
    'Pending Amount (₹)': d.pendingAmount,
    'Status': d.status
  }));
  
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Dealers');
  XLSX.writeFile(wb, 'keerthana-traders-dealers.xlsx');
};

// Main Component
const KeerthanaTraders = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [products, setProducts] = useState([]);
  const [farmers, setFarmers] = useState([]);
  const [dealers, setDealers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showAddFarmer, setShowAddFarmer] = useState(false);
  const [showAddDealer, setShowAddDealer] = useState(false);
  
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: '',
    price: '',
    stock: '',
    description: ''
  });

  const [newFarmer, setNewFarmer] = useState({
    name: '',
    address: '',
    date: new Date().toISOString().split('T')[0],
    things: '',
    numberOfBags: '',
    kilos: '',
    totalAmount: '',
    pendingAmount: '',
    status: 'Incomplete'
  });

  const [newDealer, setNewDealer] = useState({
    name: '',
    address: '',
    date: new Date().toISOString().split('T')[0],
    things: '',
    totalAmount: '',
    kilos: '',
    pendingAmount: '',
    status: 'Incomplete'
  });

  // Load data from Firebase
  useEffect(() => {
    loadProducts();
    loadFarmers();
    loadDealers();
  }, []);

  // Firebase Functions
  const loadProducts = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'products'));
      const productsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProducts(productsData);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const loadFarmers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'farmers'));
      const farmersData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setFarmers(farmersData);
    } catch (error) {
      console.error('Error loading farmers:', error);
    }
  };

  const loadDealers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'dealers'));
      const dealersData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setDealers(dealersData);
    } catch (error) {
      console.error('Error loading dealers:', error);
    }
  };

  const handleAddProduct = async () => {
    if (newProduct.name && newProduct.price && newProduct.stock) {
      try {
        const productData = {
          ...newProduct,
          price: parseFloat(newProduct.price),
          stock: parseInt(newProduct.stock),
          createdAt: serverTimestamp()
        };
        
        const docRef = await addDoc(collection(db, 'products'), productData);
        setProducts([...products, { id: docRef.id, ...productData }]);
        setNewProduct({ name: '', category: '', price: '', stock: '', description: '' });
        setShowAddProduct(false);
      } catch (error) {
        console.error('Error adding product:', error);
        alert('Error adding product. Please try again.');
      }
    }
  };

  const handleAddFarmer = async () => {
    if (newFarmer.name && newFarmer.address) {
      try {
        const farmerData = {
          ...newFarmer,
          numberOfBags: parseInt(newFarmer.numberOfBags) || 0,
          kilos: parseFloat(newFarmer.kilos) || 0,
          totalAmount: parseFloat(newFarmer.totalAmount) || 0,
          pendingAmount: parseFloat(newFarmer.pendingAmount) || 0,
          date: newFarmer.date || new Date().toISOString().split('T')[0],
          createdAt: serverTimestamp()
        };
        
        const docRef = await addDoc(collection(db, 'farmers'), farmerData);
        setFarmers([...farmers, { id: docRef.id, ...farmerData }]);
        setNewFarmer({
          name: '',
          address: '',
          date: new Date().toISOString().split('T')[0],
          things: '',
          numberOfBags: '',
          kilos: '',
          totalAmount: '',
          pendingAmount: '',
          status: 'Incomplete'
        });
        setShowAddFarmer(false);
      } catch (error) {
        console.error('Error adding farmer:', error);
        alert('Error adding farmer. Please try again.');
      }
    }
  };

  const handleAddDealer = async () => {
    if (newDealer.name && newDealer.address) {
      try {
        const dealerData = {
          ...newDealer,
          totalAmount: parseFloat(newDealer.totalAmount) || 0,
          kilos: parseFloat(newDealer.kilos) || 0,
          pendingAmount: parseFloat(newDealer.pendingAmount) || 0,
          date: newDealer.date || new Date().toISOString().split('T')[0],
          createdAt: serverTimestamp()
        };
        
        const docRef = await addDoc(collection(db, 'dealers'), dealerData);
        setDealers([...dealers, { id: docRef.id, ...dealerData }]);
        setNewDealer({
          name: '',
          address: '',
          date: new Date().toISOString().split('T')[0],
          things: '',
          totalAmount: '',
          kilos: '',
          pendingAmount: '',
          status: 'Incomplete'
        });
        setShowAddDealer(false);
      } catch (error) {
        console.error('Error adding dealer:', error);
        alert('Error adding dealer. Please try again.');
      }
    }
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteDoc(doc(db, 'products', id));
        setProducts(products.filter(p => p.id !== id));
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Error deleting product. Please try again.');
      }
    }
  };

  const handleDeleteFarmer = async (id) => {
    if (window.confirm('Are you sure you want to delete this farmer?')) {
      try {
        await deleteDoc(doc(db, 'farmers', id));
        setFarmers(farmers.filter(f => f.id !== id));
      } catch (error) {
        console.error('Error deleting farmer:', error);
        alert('Error deleting farmer. Please try again.');
      }
    }
  };

  const handleDeleteDealer = async (id) => {
    if (window.confirm('Are you sure you want to delete this dealer?')) {
      try {
        await deleteDoc(doc(db, 'dealers', id));
        setDealers(dealers.filter(d => d.id !== id));
      } catch (error) {
        console.error('Error deleting dealer:', error);
        alert('Error deleting dealer. Please try again.');
      }
    }
  };

  const printFarmerData = (farmer) => {
    generateFarmersPDF([farmer]);
  };

  const printDealerData = (dealer) => {
    generateDealersPDF([dealer]);
  };

  const filteredFarmers = farmers.filter(f =>
    f.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.address?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredDealers = dealers.filter(d =>
    d.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.address?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                <h1 className="text-3xl font-bold">KEERTHANA TRADERS</h1>
                <p className="text-green-100 text-sm">Agricultural Products & Solutions</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => generateProductsPDF(products)}
                className="flex items-center space-x-2 bg-white text-green-600 px-4 py-2 rounded-lg hover:bg-green-50 transition"
              >
                <FileText size={20} />
                <span>Generate PDF</span>
              </button>
              <button
                onClick={() => exportProductsToExcel(products)}
                className="flex items-center space-x-2 bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition"
              >
                <Download size={20} />
                <span>Export Excel</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white shadow-md sticky top-0 z-10">
        <div className="container mx-auto px-4">
          <div className="flex space-x-1">
            {[
              { id: 'home', label: 'Home', icon: Home },
              { id: 'products', label: 'Products', icon: Database },
              { id: 'farmers', label: 'Farmers', icon: Users },
              { id: 'dealers', label: 'Dealers', icon: Truck }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-4 border-b-2 transition ${
                  activeTab === tab.id
                    ? 'border-green-600 text-green-600 bg-green-50'
                    : 'border-transparent text-gray-600 hover:text-green-600 hover:bg-green-50'
                }`}
              >
                <tab.icon size={20} />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Home Tab */}
        {activeTab === 'home' && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-green-600">
                <h3 className="text-gray-600 text-sm font-medium">Total Products</h3>
                <p className="text-4xl font-bold text-green-600 mt-2">{products.length}</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-blue-600">
                <h3 className="text-gray-600 text-sm font-medium">Total Farmers</h3>
                <p className="text-4xl font-bold text-blue-600 mt-2">{farmers.length}</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-purple-600">
                <h3 className="text-gray-600 text-sm font-medium">Total Dealers</h3>
                <p className="text-4xl font-bold text-purple-600 mt-2">{dealers.length}</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-emerald-600">
                <h3 className="text-gray-600 text-sm font-medium">Total Stock Value</h3>
                <p className="text-4xl font-bold text-emerald-600 mt-2">
                  ₹{products.reduce((sum, p) => sum + (p.price * p.stock), 0).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Welcome to Keerthana Traders</h2>
              <p className="text-gray-600 mb-4">
                Your complete agricultural products management system. This application helps you manage:
              </p>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                  <span>Product inventory with real-time stock tracking</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                  <span>Farmer management and transaction tracking</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                  <span>Dealer management and order processing</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                  <span>PDF reports and Excel export capabilities</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                  <span>Firebase backend for secure data storage</span>
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                />
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => generateProductsPDF(products)}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition"
                >
                  <FileText size={20} />
                  <span>PDF Report</span>
                </button>
                <button
                  onClick={() => setShowAddProduct(true)}
                  className="flex items-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition shadow-lg"
                >
                  <Plus size={20} />
                  <span>Add Product</span>
                </button>
              </div>
            </div>

            {showAddProduct && (
              <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-green-600">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Add New Product</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Product Name"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600"
                  />
                  <input
                    type="text"
                    placeholder="Category"
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600"
                  />
                  <input
                    type="number"
                    placeholder="Price (₹)"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600"
                  />
                  <input
                    type="number"
                    placeholder="Stock Quantity"
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600"
                  />
                  <input
                    type="text"
                    placeholder="Description"
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 md:col-span-2"
                  />
                </div>
                <div className="flex space-x-3 mt-4">
                  <button
                    onClick={handleAddProduct}
                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                  >
                    Save Product
                  </button>
                  <button
                    onClick={() => setShowAddProduct(false)}
                    className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.filter(p =>
                p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.category?.toLowerCase().includes(searchTerm.toLowerCase())
              ).map(product => (
                <div key={product.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">{product.name}</h3>
                      <span className="text-sm text-gray-500">{product.category}</span>
                    </div>
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="text-red-500 hover:text-red-700 transition"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">{product.description}</p>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-2xl font-bold text-green-600">₹{product.price}</p>
                      <p className="text-sm text-gray-500">Stock: {product.stock} units</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Farmers Tab */}
        {activeTab === 'farmers' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search farmers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                />
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => generateFarmersPDF(farmers)}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition"
                >
                  <FileText size={20} />
                  <span>PDF Report</span>
                </button>
                <button
                  onClick={() => setShowAddFarmer(true)}
                  className="flex items-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition shadow-lg"
                >
                  <Plus size={20} />
                  <span>Add Farmer</span>
                </button>
              </div>
            </div>

            {showAddFarmer && (
              <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-green-600">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Add New Farmer</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Farmer Name"
                    value={newFarmer.name}
                    onChange={(e) => setNewFarmer({ ...newFarmer, name: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600"
                  />
                  <input
                    type="text"
                    placeholder="Address"
                    value={newFarmer.address}
                    onChange={(e) => setNewFarmer({ ...newFarmer, address: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600"
                  />
                  <input
                    type="date"
                    placeholder="Date"
                    value={newFarmer.date}
                    onChange={(e) => setNewFarmer({ ...newFarmer, date: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600"
                  />
                  <input
                    type="text"
                    placeholder="Things/Products"
                    value={newFarmer.things}
                    onChange={(e) => setNewFarmer({ ...newFarmer, things: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600"
                  />
                  <input
                    type="number"
                    placeholder="Number of Bags"
                    value={newFarmer.numberOfBags}
                    onChange={(e) => setNewFarmer({ ...newFarmer, numberOfBags: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600"
                  />
                  <input
                    type="number"
                    placeholder="Kilos"
                    value={newFarmer.kilos}
                    onChange={(e) => setNewFarmer({ ...newFarmer, kilos: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600"
                  />
                  <input
                    type="number"
                    placeholder="Total Amount (₹)"
                    value={newFarmer.totalAmount}
                    onChange={(e) => setNewFarmer({ ...newFarmer, totalAmount: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600"
                  />
                  <input
                    type="number"
                    placeholder="Pending Amount (₹)"
                    value={newFarmer.pendingAmount}
                    onChange={(e) => setNewFarmer({ ...newFarmer, pendingAmount: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600"
                  />
                  <select
                    value={newFarmer.status}
                    onChange={(e) => setNewFarmer({ ...newFarmer, status: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 md:col-span-2"
                  >
                    <option value="Incomplete">Incomplete</option>
                    <option value="Complete">Complete</option>
                  </select>
                </div>
                <div className="flex space-x-3 mt-4">
                  <button
                    onClick={handleAddFarmer}
                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                  >
                    Save Farmer
                  </button>
                  <button
                    onClick={() => setShowAddFarmer(false)}
                    className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-green-600 text-white">
                    <tr>
                      <th className="px-6 py-4 text-left">Name</th>
                      <th className="px-6 py-4 text-left">Address</th>
                      <th className="px-6 py-4 text-left">Date</th>
                      <th className="px-6 py-4 text-left">Products</th>
                      <th className="px-6 py-4 text-left">Bags</th>
                      <th className="px-6 py-4 text-left">Kilos</th>
                      <th className="px-6 py-4 text-left">Total (₹)</th>
                      <th className="px-6 py-4 text-left">Pending (₹)</th>
                      <th className="px-6 py-4 text-left">Status</th>
                      <th className="px-6 py-4 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredFarmers.map((farmer, index) => (
                      <tr key={farmer.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                        <td className="px-6 py-4 font-medium text-gray-800">{farmer.name}</td>
                        <td className="px-6 py-4 text-gray-600">{farmer.address}</td>
                        <td className="px-6 py-4 text-gray-600">{farmer.date}</td>
                        <td className="px-6 py-4 text-gray-600">{farmer.things}</td>
                        <td className="px-6 py-4 text-gray-600">{farmer.numberOfBags}</td>
                        <td className="px-6 py-4 text-gray-600">{farmer.kilos}</td>
                        <td className="px-6 py-4 font-bold text-green-600">₹{farmer.totalAmount}</td>
                        <td className="px-6 py-4 font-bold text-red-600">₹{farmer.pendingAmount}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            farmer.status === 'Complete' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {farmer.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => printFarmerData(farmer)}
                              className="text-blue-600 hover:text-blue-800 transition"
                              title="Print Farmer Data"
                            >
                              <FileText size={18} />
                            </button>
                            <button
                              onClick={() => handleDeleteFarmer(farmer.id)}
                              className="text-red-600 hover:text-red-800 transition"
                              title="Delete Farmer"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Dealers Tab */}
        {activeTab === 'dealers' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search dealers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                />
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => generateDealersPDF(dealers)}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition"
                >
                  <FileText size={20} />
                  <span>PDF Report</span>
                </button>
                <button
                  onClick={() => setShowAddDealer(true)}
                  className="flex items-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition shadow-lg"
                >
                  <Plus size={20} />
                  <span>Add Dealer</span>
                </button>
              </div>
            </div>

            {showAddDealer && (
              <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-green-600">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Add New Dealer</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Dealer Name"
                    value={newDealer.name}
                    onChange={(e) => setNewDealer({ ...newDealer, name: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600"
                  />
                  <input
                    type="text"
                    placeholder="Address"
                    value={newDealer.address}
                    onChange={(e) => setNewDealer({ ...newDealer, address: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600"
                  />
                  <input
                    type="date"
                    placeholder="Date"
                    value={newDealer.date}
                    onChange={(e) => setNewDealer({ ...newDealer, date: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600"
                  />
                  <input
                    type="text"
                    placeholder="Things/Products"
                    value={newDealer.things}
                    onChange={(e) => setNewDealer({ ...newDealer, things: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600"
                  />
                  <input
                    type="number"
                    placeholder="Total Amount (₹)"
                    value={newDealer.totalAmount}
                    onChange={(e) => setNewDealer({ ...newDealer, totalAmount: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600"
                  />
                  <input
                    type="number"
                    placeholder="Kilos"
                    value={newDealer.kilos}
                    onChange={(e) => setNewDealer({ ...newDealer, kilos: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600"
                  />
                  <input
                    type="number"
                    placeholder="Pending Amount (₹)"
                    value={newDealer.pendingAmount}
                    onChange={(e) => setNewDealer({ ...newDealer, pendingAmount: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600"
                  />
                  <select
                    value={newDealer.status}
                    onChange={(e) => setNewDealer({ ...newDealer, status: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600"
                  >
                    <option value="Incomplete">Incomplete</option>
                    <option value="Complete">Complete</option>
                  </select>
                </div>
                <div className="flex space-x-3 mt-4">
                  <button
                    onClick={handleAddDealer}
                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                  >
                    Save Dealer
                  </button>
                  <button
                    onClick={() => setShowAddDealer(false)}
                    className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-green-600 text-white">
                    <tr>
                      <th className="px-6 py-4 text-left">Name</th>
                      <th className="px-6 py-4 text-left">Address</th>
                      <th className="px-6 py-4 text-left">Date</th>
                      <th className="px-6 py-4 text-left">Products</th>
                      <th className="px-6 py-4 text-left">Total (₹)</th>
                      <th className="px-6 py-4 text-left">Kilos</th>
                      <th className="px-6 py-4 text-left">Pending (₹)</th>
                      <th className="px-6 py-4 text-left">Status</th>
                      <th className="px-6 py-4 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDealers.map((dealer, index) => (
                      <tr key={dealer.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                        <td className="px-6 py-4 font-medium text-gray-800">{dealer.name}</td>
                        <td className="px-6 py-4 text-gray-600">{dealer.address}</td>
                        <td className="px-6 py-4 text-gray-600">{dealer.date}</td>
                        <td className="px-6 py-4 text-gray-600">{dealer.things}</td>
                        <td className="px-6 py-4 font-bold text-green-600">₹{dealer.totalAmount}</td>
                        <td className="px-6 py-4 text-gray-600">{dealer.kilos}</td>
                        <td className="px-6 py-4 font-bold text-red-600">₹{dealer.pendingAmount}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            dealer.status === 'Complete' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {dealer.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => printDealerData(dealer)}
                              className="text-blue-600 hover:text-blue-800 transition"
                              title="Print Dealer Data"
                            >
                              <FileText size={18} />
                            </button>
                            <button
                              onClick={() => handleDeleteDealer(dealer.id)}
                              className="text-red-600 hover:text-red-800 transition"
                              title="Delete Dealer"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default KeerthanaTraders;
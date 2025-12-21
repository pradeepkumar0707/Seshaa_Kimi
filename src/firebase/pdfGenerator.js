import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const generateProductsPDF = (products) => {
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

export const generateFarmersPDF = (farmers) => {
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

export const generateDealersPDF = (dealers) => {
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
import { formatDateToDDMMYY } from "./dateConvertion";

export function printBill({
  orderId,
  items,
  subtotal,
  tax,
  total,
  user,
  tableName,
  headerText = 'Restaurant Bill',
  footerText = 'Thank you for dining with us!',
}) {
  if (!orderId) return;
  const billItems = Array.isArray(items) ? items : [];
  if (billItems.length === 0) return;

  const now = new Date();
  const formattedDate = now.toLocaleDateString();
  const formattedTime = now.toLocaleTimeString();
  const cashierName = user?.name || user?.email || 'Cashier';
  const billNo = String(orderId).slice(-6).toUpperCase();

  const computedSubtotal = typeof subtotal === 'number' ? subtotal : billItems.reduce((s, i) => s + Number(i.price) * Number(i.qty), 0);
  const computedTax = typeof tax === 'number' ? tax : 0;
  const computedTotal = typeof total === 'number' ? total : computedSubtotal + computedTax;

  const subtotalStr = computedSubtotal.toFixed(2);
  const cgst = (computedTax / 2).toFixed(2);
  const sgst = (computedTax / 2).toFixed(2);
  const totalStr = computedTotal.toFixed(2);

  const rowsHtml = billItems
    .map((i) => {
      const lineTotal = (Number(i.price) * Number(i.qty)).toFixed(2);
      return `
          <tr>
            <td class="text">${i.name}</td>
            <td class="num">${i.qty}</td>
            <td class="num">${Number(i.price).toFixed(2)}</td>
            <td class="num">${lineTotal}</td>
          </tr>`;
    })
    .join('');

  const html = `
      <html>
      <head>
        <meta charset="utf-8" />
        <title>Bill #${billNo}</title>
        <style>
          * { box-sizing: border-box; }
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; margin: 0; }
          .receipt { width: 280px; padding: 10px 12px; }
          .center { text-align: center; }
          .muted { color: #555; font-size: 11px; }
          hr { border: 0; border-top: 1px dashed #ccc; margin: 8px 0; }
          table { width: 100%; border-collapse: collapse; }
          th, td { font-size: 12px; padding: 4px 0; }
          th { text-align: left; border-bottom: 1px solid #000; }
          .num { text-align: right; }
          .text { max-width: 140px; }
          .title { font-weight: 700; font-size: 13px; }
          .total { font-weight: 700; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="center title">${headerText}</div>
          <div class="muted" style="margin-top:6px">
            Name: <br/>
            Date: ${formattedDate} ${formattedTime}<br/>
            Cashier: ${cashierName} &nbsp;&nbsp; Bill No.: ${billNo}<br/>
            ${tableName ? `Table: ${tableName}` : ''}
          </div>
          <hr/>
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th class="num">Qty</th>
                <th class="num">Price</th>
                <th class="num">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
          <hr/>
          <table>
            <tbody>
              <tr><td>Total Qty:</td><td class="num" colspan="3">${billItems.reduce((s, i) => s + Number(i.qty), 0)}</td></tr>
              <tr><td>Sub Total</td><td class="num" colspan="3">${subtotalStr}</td></tr>
              <tr><td>CGST</td><td class="num" colspan="3">${cgst}</td></tr>
              <tr><td>SGST</td><td class="num" colspan="3">${sgst}</td></tr>
            </tbody>
          </table>
          <hr/>
          <div class="total">Grand Total  ₹ ${totalStr}</div>
          <hr/>
          <div class="center muted">${footerText}</div>
        </div>
        <script>
          window.onload = function(){ window.print(); setTimeout(()=>window.close(), 300); };
        </script>
      </body>
      </html>
    `;

  const w = window.open('', '_blank', 'width=360,height=600');
  w.document.open();
  w.document.write(html);
  w.document.close();
}


export const printKotBill = ({
  kotData,
  restaurant,
  taxRate = 0,
  discount = 0,
}) => {
  if (!kotData || !kotData.items || kotData.items.length === 0) {
    throw new Error('No bill data to print');
  }

  // Bill details
  const billNumber = kotData.orderId?.orderNumber || 'N/A';
  const tableName = kotData.tableName || 'N/A';
  const dateTime = formatDateToDDMMYY(new Date());
  const items = kotData.items || [];
  const subtotal = items.reduce((sum, item) => sum + (item?.price * item.quantity), 0);
  const tax = subtotal * taxRate;
  const grandTotal = subtotal + tax - discount;

  // Generate HTML content
  const printContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Bill - ${billNumber}</title>
      <style>
        body {
          font-family: 'Courier New', monospace;
          font-size: 12px;
          line-height: 1.4;
          margin: 0;
          padding: 10px;
          width: 300px; /* Thermal printer width */
          max-width: 100%;
        }
        .header {
          text-align: center;
          border-bottom: 1px solid #000;
          padding-bottom: 10px;
          margin-bottom: 10px;
        }
        .header h1 {
          font-size: 16px;
          margin: 0;
          font-weight: bold;
        }
        .header p {
          margin: 2px 0;
        }
        .bill-details {
          margin-bottom: 10px;
        }
        .bill-details p {
          margin: 2px 0;
        }
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 10px;
        }
        .items-table th, .items-table td {
          text-align: left;
          padding: 2px 0;
          border-bottom: 1px dotted #ccc;
        }
        .items-table th {
          font-weight: bold;
          border-bottom: 1px solid #000;
        }
        .items-table .qty, .items-table .price, .items-table .total {
          text-align: right;
        }
        .totals {
          border-top: 1px solid #000;
          padding-top: 5px;
        }
        .totals p {
          margin: 2px 0;
          display: flex;
          justify-content: space-between;
        }
        .footer {
          text-align: center;
          border-top: 1px solid #000;
          padding-top: 10px;
          margin-top: 10px;
          font-size: 10px;
        }
        @media print {
          body {
            width: 100%;
            margin: 0;
            padding: 5px;
          }
          .no-print {
            display: none;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${restaurant?.name}</h1>
        <p>${restaurant?.address || ''}</p>
        <p>Phone: ${restaurant?.phone || ''}</p>
      </div>
      
      <div class="bill-details">
        <p><strong>Bill No:</strong> ${billNumber}</p>
        <p><strong>Date/Time:</strong> ${dateTime}</p>
        <p><strong>Table:</strong> ${tableName}</p>
      </div>
      
      <table class="items-table">
        <thead>
          <tr>
            <th>Item</th>
            <th class="qty">Qty</th>
            <th class="price">Price</th>
            <th class="total">Total</th>
          </tr>
        </thead>
        <tbody>
          ${items.map(item => `
            <tr>
              <td>${item.name}</td>
              <td class="qty">${item.quantity}</td>
              <td class="price">₹${item?.price ? item?.price.toFixed(2) : 0}</td>
              <td class="total">₹${(item?.price * item?.quantity).toFixed(2)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      <div class="totals">
        <p><span>Subtotal:</span> <span>₹${subtotal.toFixed(2)}</span></p>
        <p><span>Tax (${(taxRate * 100).toFixed(0)}%):</span> <span>₹${tax.toFixed(2)}</span></p>
        ${discount > 0 ? `<p><span>Discount:</span> <span>-₹${discount.toFixed(2)}</span></p>` : ''}
        <p><strong><span>Grand Total:</span> <span>₹${grandTotal.toFixed(2)}</span></strong></p>
      </div>
      
      <div class="footer">
        <p>Thank you for dining with us!</p>
        <p>Visit again soon.</p>
        <p class="no-print">Printed on ${new Date().toLocaleDateString()}</p>
      </div>
    </body>
    </html>
  `;

  // Open print window
  const printWindow = window.open('', '_blank');
  printWindow.document.write(printContent);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
  printWindow.close(); // Optional: close after print
};


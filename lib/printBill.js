export function printBill({
  orderId,
  items,
  subtotal,
  tax,
  total,
  user,
  tableName,
  headerText = 'Test Header',
  footerText = 'Test Footer',
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



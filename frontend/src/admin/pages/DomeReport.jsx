import React, { useMemo, useState } from 'react';

const reportData = {
  'Technology Dome': {
    location: 'Mumbai',
    totalStalls: 50,
    bookedStalls: 30,
    totalRevenue: 80000,
    bookings: [
      { id: 101, user: 'Raj', stall: 'A1', date: '12/02', status: 'PAID', amount: 20000 },
      { id: 103, user: 'Neha', stall: 'C5', date: '14/02', status: 'PENDING', amount: 12000 },
      { id: 108, user: 'Anil', stall: 'B3', date: '11/02', status: 'PAID', amount: 16000 },
      { id: 116, user: 'Kiran', stall: 'D2', date: '15/02', status: 'PAID', amount: 18000 },
      { id: 124, user: 'Manav', stall: 'A7', date: '09/02', status: 'PENDING', amount: 14000 }
    ]
  },
  'Lifestyle Dome': {
    location: 'Pune',
    totalStalls: 40,
    bookedStalls: 21,
    totalRevenue: 57000,
    bookings: [
      { id: 201, user: 'Aisha', stall: 'L2', date: '10/02', status: 'PAID', amount: 18000 },
      { id: 205, user: 'Vikram', stall: 'R1', date: '13/02', status: 'PENDING', amount: 12000 },
      { id: 209, user: 'Tina', stall: 'C3', date: '12/02', status: 'PAID', amount: 13000 },
      { id: 214, user: 'Sahil', stall: 'C7', date: '15/02', status: 'PENDING', amount: 14000 }
    ]
  }
};

const formatInr = (value) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);

const formatDate = (value) =>
  new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(value);

const toTitleCase = (value) => value.charAt(0) + value.slice(1).toLowerCase();

const parseShortDate = (dateText) => {
  const [day, month] = dateText.split('/').map((item) => Number.parseInt(item, 10));
  return new Date(2026, month - 1, day).getTime();
};

const DomeReport = () => {
  const domeOptions = Object.keys(reportData);
  const [selectedDome, setSelectedDome] = useState(domeOptions[0]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('DATE_DESC');

  const metrics = useMemo(() => {
    const current = reportData[selectedDome];

    return {
      ...current,
      availableStalls: Math.max(current.totalStalls - current.bookedStalls, 0)
    };
  }, [selectedDome]);

  const visibleBookings = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    const filtered = metrics.bookings.filter((booking) => {
      const matchesStatus = statusFilter === 'ALL' || booking.status === statusFilter;
      const matchesSearch =
        normalizedSearch.length === 0 ||
        booking.user.toLowerCase().includes(normalizedSearch) ||
        booking.stall.toLowerCase().includes(normalizedSearch) ||
        String(booking.id).includes(normalizedSearch);

      return matchesStatus && matchesSearch;
    });

    return filtered.sort((a, b) => {
      if (sortBy === 'DATE_ASC') return parseShortDate(a.date) - parseShortDate(b.date);
      if (sortBy === 'AMOUNT_DESC') return b.amount - a.amount;
      return parseShortDate(b.date) - parseShortDate(a.date);
    });
  }, [metrics.bookings, searchTerm, sortBy, statusFilter]);

  const handleDomeChange = (event) => {
    setSelectedDome(event.target.value);
    setStatusFilter('ALL');
    setSearchTerm('');
    setSortBy('DATE_DESC');
  };

  const handleExportPdf = () => {
    const divider = '-------------------------------------------------------';
    const header = '=======================================================';
    const generatedOn = formatDate(new Date());

    const bookingLines = visibleBookings.length
      ? visibleBookings.map(
          (booking) =>
            `${booking.id} | ${booking.user} | ${booking.stall} | ${booking.date} | ${toTitleCase(booking.status)} | ${formatInr(booking.amount)}`
        )
      : ['No bookings found for current filters'];

    const reportText = [
      header,
      '           TradeFairBook',
      header,
      '',
      'Dome Report',
      '',
      `Dome Name: ${selectedDome}`,
      `Location: ${metrics.location}`,
      `Generated On: ${generatedOn}`,
      '',
      divider,
      'SUMMARY',
      divider,
      `Total Stalls     : ${metrics.totalStalls}`,
      `Booked Stalls    : ${metrics.bookedStalls}`,
      `Available Stalls : ${metrics.availableStalls}`,
      `Total Revenue    : ${formatInr(metrics.totalRevenue)}`,
      '',
      divider,
      'BOOKING DETAILS',
      divider,
      'ID | User | Stall | Date | Status | Amount',
      divider,
      ...bookingLines,
      ''
    ].join('\n');

    const escapedReport = reportText.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.setAttribute('aria-hidden', 'true');

    document.body.appendChild(iframe);

    const frameDoc = iframe.contentWindow?.document;
    if (!frameDoc || !iframe.contentWindow) {
      document.body.removeChild(iframe);
      alert('Unable to prepare PDF document.');
      return;
    }

    frameDoc.open();
    frameDoc.write(`
      <html>
        <head>
          <title>TradeFair Book - Dome Report</title>
          <style>
            @page { margin: 16mm; }
            body {
              margin: 0;
              color: #111;
              background: #fff;
              font-family: "Courier New", monospace;
            }
            pre {
              white-space: pre-wrap;
              line-height: 1.55;
              font-size: 14px;
              margin: 0;
            }
          </style>
        </head>
        <body>
          <pre>${escapedReport}</pre>
        </body>
      </html>
    `);
    frameDoc.close();

    setTimeout(() => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();

      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1200);
    }, 150);
  };

  return (
    <div className="report-card">
      <h2 className="report-title">Dome Report</h2>

      <div className="input-group report-select-group">
        <label>Select Dome</label>
        <select value={selectedDome} onChange={handleDomeChange}>
          {domeOptions.map((dome) => (
            <option key={dome} value={dome}>
              {dome}
            </option>
          ))}
        </select>
      </div>

      <div className="report-metrics-grid">
        <button type="button" className="report-metric-card report-metric-button" onClick={() => setStatusFilter('ALL')}>
          <span>Total Stalls</span>
          <strong>{metrics.totalStalls}</strong>
        </button>
        <button type="button" className="report-metric-card report-metric-button" onClick={() => setStatusFilter('PAID')}>
          <span>Booked Stalls</span>
          <strong>{metrics.bookedStalls}</strong>
        </button>
        <div className="report-metric-card">
          <span>Available Stalls</span>
          <strong>{metrics.availableStalls}</strong>
        </div>
        <div className="report-metric-card">
          <span>Total Revenue</span>
          <strong className="metric-revenue">{formatInr(metrics.totalRevenue)}</strong>
        </div>
      </div>

      <div className="report-filters-row">
        <input
          type="text"
          placeholder="Search by booking ID, user, or stall"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />
        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
          <option value="ALL">All Status</option>
          <option value="PAID">Paid</option>
          <option value="PENDING">Pending</option>
        </select>
        <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
          <option value="DATE_DESC">Date: Newest</option>
          <option value="DATE_ASC">Date: Oldest</option>
          <option value="AMOUNT_DESC">Amount: High to Low</option>
        </select>
      </div>

      <div className="report-table-wrapper">
        <table className="report-table">
          <thead>
            <tr>
              <th>Booking ID</th>
              <th>User</th>
              <th>Stall</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {visibleBookings.length > 0 ? (
              visibleBookings.map((booking) => (
                <tr key={booking.id}>
                  <td>{booking.id}</td>
                  <td>{booking.user}</td>
                  <td>{booking.stall}</td>
                  <td>{booking.date}</td>
                  <td>
                    <span className={`report-status-pill ${booking.status.toLowerCase()}`}>{booking.status}</span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="report-empty-cell" colSpan="5">
                  No bookings match current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <button className="report-export-btn" onClick={handleExportPdf}>
        Export PDF
      </button>
    </div>
  );
};

export default DomeReport;

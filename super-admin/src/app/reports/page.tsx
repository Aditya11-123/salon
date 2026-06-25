"use client";

import { useState, useEffect, useMemo } from "react";
import { 
  FileSpreadsheet, 
  FileText, 
  Download, 
  Calendar, 
  Filter, 
  Activity, 
  Users, 
  Scissors, 
  Store, 
  Sparkles, 
  CreditCard,
  ChevronDown,
  Search
} from "lucide-react";

// ============================================================================
// MOCK DATA: EASILY REPLACEABLE WITH API CALLS
// When the backend is ready, replace the useEffect data fetching logic 
// with actual API calls (e.g., using axios).
// ============================================================================
type ReportType = 'revenue' | 'salon' | 'staff' | 'customer' | 'ai' | 'subscription';

const TABS: { id: ReportType; label: string; icon: React.ReactNode }[] = [
  { id: 'revenue', label: 'Revenue', icon: <CreditCard className="w-4 h-4" /> },
  { id: 'salon', label: 'Salon', icon: <Store className="w-4 h-4" /> },
  { id: 'staff', label: 'Staff', icon: <Scissors className="w-4 h-4" /> },
  { id: 'customer', label: 'Customer', icon: <Users className="w-4 h-4" /> },
  { id: 'ai', label: 'AI Usage', icon: <Sparkles className="w-4 h-4" /> },
  { id: 'subscription', label: 'Subscriptions', icon: <Activity className="w-4 h-4" /> },
];

const MOCK_DATA: Record<ReportType, { columns: string[], rows: any[] }> = {
  revenue: {
    columns: ["Date", "Transaction ID", "Salon Name", "Amount", "Method", "Status"],
    rows: [
      { id: 1, col1: "25 Jun 2026", col2: "TXN-908123", col3: "Elite Style Studio", col4: "₹4,500", col5: "Razorpay", col6: "Completed" },
      { id: 2, col1: "25 Jun 2026", col2: "TXN-908124", col3: "Glamour Cuts", col4: "₹1,200", col5: "Stripe", col6: "Completed" },
      { id: 3, col1: "24 Jun 2026", col2: "TXN-908101", col3: "Urban Men's Grooming", col4: "₹850", col5: "UPI", col6: "Failed" },
      { id: 4, col1: "24 Jun 2026", col2: "TXN-908099", col3: "Luxe Salon & Spa", col4: "₹12,400", col5: "Razorpay", col6: "Completed" },
      { id: 5, col1: "23 Jun 2026", col2: "TXN-908050", col3: "Elite Style Studio", col4: "₹3,100", col5: "Cashfree", col6: "Refunded" },
    ]
  },
  salon: {
    columns: ["Salon Name", "Owner ID", "Total Staff", "Total Appointments", "Avg Rating"],
    rows: [
      { id: 1, col1: "Elite Style Studio", col2: "USR-001", col3: "12", col4: "1,204", col5: "4.8" },
      { id: 2, col1: "Glamour Cuts", col2: "USR-042", col3: "5", col4: "432", col5: "4.5" },
      { id: 3, col1: "Urban Men's Grooming", col2: "USR-112", col3: "8", col4: "890", col5: "4.9" },
    ]
  },
  staff: {
    columns: ["Staff Name", "Salon", "Role", "Appointments Done", "Revenue Gen."],
    rows: [
      { id: 1, col1: "Rahul Sharma", col2: "Elite Style Studio", col3: "Senior Stylist", col4: "145", col5: "₹45,000" },
      { id: 2, col1: "Anita Desai", col2: "Glamour Cuts", col3: "Colorist", col4: "82", col5: "₹62,400" },
    ]
  },
  customer: {
    columns: ["Customer Name", "Phone", "Total Visits", "Total Spend", "Last Visit"],
    rows: [
      { id: 1, col1: "Vikram Singh", col2: "+91 9876543210", col3: "14", col4: "₹12,500", col5: "12 Jun 2026" },
      { id: 2, col1: "Priya Patel", col2: "+91 9988776655", col3: "4", col4: "₹18,200", col5: "24 Jun 2026" },
    ]
  },
  ai: {
    columns: ["Salon Name", "AI Consultations", "Tokens Used", "Image Gens", "Cost Estimate"],
    rows: [
      { id: 1, col1: "Elite Style Studio", col2: "342", col3: "1.2M", col4: "85", col5: "$45.20" },
      { id: 2, col1: "Luxe Salon & Spa", col2: "890", col3: "3.5M", col4: "210", col5: "$112.50" },
    ]
  },
  subscription: {
    columns: ["Salon Name", "Plan", "Status", "Next Billing", "Amount"],
    rows: [
      { id: 1, col1: "Elite Style Studio", col2: "Enterprise", col3: "Active", col4: "15 Jul 2026", col5: "₹5,000" },
      { id: 2, col1: "Glamour Cuts", col2: "Starter", col3: "Expiring", col4: "28 Jun 2026", col5: "₹999" },
    ]
  }
};
// ============================================================================

export default function ReportsAnalytics() {
  const [activeTab, setActiveTab] = useState<ReportType>('revenue');
  const [isLoading, setIsLoading] = useState(false);
  const [tableData, setTableData] = useState<{ columns: string[], rows: any[] }>({ columns: [], rows: [] });
  const [dateRange, setDateRange] = useState("This Month");

  // Simulate Data Fetching when filters or tabs change
  useEffect(() => {
    const fetchReportData = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('admin_token');
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/admin/reports/${activeTab}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (res.ok) {
          const data = await res.json();
          // Fallback if data is empty
          if (data && data.rows && data.rows.length > 0) {
            setTableData(data);
          } else {
            setTableData(MOCK_DATA[activeTab] || { columns: [], rows: [] });
          }
        } else {
          setTableData(MOCK_DATA[activeTab] || { columns: [], rows: [] });
        }
      } catch (err) {
        console.error("Failed to fetch report data", err);
        setTableData(MOCK_DATA[activeTab] || { columns: [], rows: [] });
      } finally {
        setIsLoading(false);
      }
    };

    fetchReportData();
  }, [activeTab, dateRange]);

  const handleExport = (format: 'Excel' | 'PDF') => {
    if (format === 'PDF') {
      // For PDF, the simplest frontend mock is triggering the print dialog.
      // We have added print:hidden classes to the UI so only the data table prints.
      window.print();
      return;
    }

    // For CSV and Excel, we generate a real CSV file from the current table data
    const headers = tableData.columns.join(',');
    const rows = tableData.rows.map(row => {
      // Extract values from the row object (ignoring the 'id' field)
      const values = Object.keys(row)
        .filter(key => key !== 'id')
        .map(key => `"${row[key]}"`); // wrap in quotes to handle commas
      return values.join(',');
    });
    
    const csvContent = [headers, ...rows].join('\n');
    // Add \uFEFF (Byte Order Mark) so Excel correctly parses UTF-8 characters like the Rupee (₹) symbol
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    // If Excel, use .csv (Excel opens CSVs natively and BOM ensures symbols are correct)
    link.setAttribute('download', `${activeTab}_report_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (value: string) => {
    return <span className="font-medium text-gray-800">{value}</span>;
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto min-h-screen space-y-6 print:p-0 print:m-0 print:space-y-4">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Reports & Analytics</h1>
          <p className="text-gray-500 mt-1 text-sm">Generate, analyze, and export platform-wide performance data.</p>
        </div>
        
        {/* Export Actions */}
        <div className="flex items-center space-x-2">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mr-2 hidden sm:block">Export As:</div>
          <button onClick={() => handleExport('Excel')} className="cursor-pointer flex items-center space-x-1.5 px-3 py-2 bg-white border border-emerald-200 hover:bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium transition shadow-sm hover:shadow">
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Excel</span>
          </button>
          <button onClick={() => handleExport('PDF')} className="cursor-pointer flex items-center space-x-1.5 px-3 py-2 bg-[#1877f2] hover:bg-[#166fe5] text-white rounded-lg text-sm font-medium transition shadow-sm hover:shadow">
            <Download className="w-4 h-4" />
            <span>PDF</span>
          </button>
        </div>
      </div>

      {/* Print Only Header */}
      <div className="hidden print:block mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{TABS.find(t=>t.id===activeTab)?.label} Report</h1>
        <p className="text-gray-500 text-sm">Generated on: {new Date().toLocaleDateString()}</p>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden flex flex-col lg:flex-row print:shadow-none print:border-0 print:block">
        
        {/* Sidebar Tabs */}
        <div className="w-full lg:w-64 bg-gray-50/50 border-r border-gray-100 p-4 lg:p-6 flex-shrink-0 print:hidden">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 px-3">Report Types</h3>
          <nav className="flex flex-row lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`cursor-pointer flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
                    isActive 
                      ? 'bg-white text-[#1877f2] shadow-sm border border-gray-100' 
                      : 'text-gray-600 hover:bg-gray-100/80 hover:text-gray-900 border border-transparent'
                  }`}
                >
                  <div className={`p-1.5 rounded-lg ${isActive ? 'bg-[#1877f2]/10' : 'bg-transparent'}`}>
                    {tab.icon}
                  </div>
                  <span>{tab.label} Reports</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Data Area */}
        <div className="flex-1 flex flex-col min-w-0 print:block">
          
          {/* Filter Toolbar */}
          <div className="p-4 sm:p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white print:hidden">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3.5 top-2.5 text-gray-400" />
              <input 
                type="text" 
                placeholder={`Search in ${TABS.find(t=>t.id===activeTab)?.label}...`} 
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1877f2]/20 focus:border-[#1877f2] transition-all"
              />
            </div>
            
            <div className="flex items-center space-x-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-none">
                <select 
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="w-full appearance-none pl-9 pr-10 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#1877f2]/20 transition-all"
                >
                  <option>Today</option>
                  <option>Last 7 Days</option>
                  <option>This Month</option>
                  <option>Last Month</option>
                  <option>Custom Range...</option>
                </select>
                <Calendar className="w-4 h-4 absolute left-3 top-2.5 text-gray-400 pointer-events-none" />
                <ChevronDown className="w-4 h-4 absolute right-3 top-2.5 text-gray-400 pointer-events-none" />
              </div>
              
              <button className="cursor-pointer p-2 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 transition-colors">
                <Filter className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Table Container */}
          <div className="flex-1 overflow-x-auto bg-white relative print:overflow-visible">
            {isLoading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-10 print:hidden">
                <div className="flex flex-col items-center space-y-3">
                  <div className="w-8 h-8 border-4 border-[#1877f2]/20 border-t-[#1877f2] rounded-full animate-spin"></div>
                  <p className="text-sm font-semibold text-gray-500 animate-pulse">Generating Report...</p>
                </div>
              </div>
            ) : null}

            <table className="w-full text-left border-collapse min-w-[800px] print:min-w-0 print:w-full">
              <thead>
                <tr 
                  className="bg-gray-50/80 border-b border-gray-100 print:bg-[#f0f2f5] print:border-gray-300" 
                  style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}
                >
                  {tableData.columns.map((col, idx) => (
                    <th key={idx} className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap print:px-3 print:py-3 print:text-gray-800 print:border-b print:border-gray-300">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 print:divide-gray-300">
                {tableData.rows.length > 0 ? (
                  tableData.rows.map((row, idx) => (
                    <tr key={row.id} className="hover:bg-blue-50/30 transition-colors group print:hover:bg-transparent">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium print:px-2 print:py-2">
                        {getStatusBadge(row.col1)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 print:px-2 print:py-2">
                        {getStatusBadge(row.col2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 print:px-2 print:py-2">
                        {getStatusBadge(row.col3)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold print:px-2 print:py-2">
                        {getStatusBadge(row.col4)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 print:px-2 print:py-2">
                        {getStatusBadge(row.col5)}
                      </td>
                      {tableData.columns.length > 5 && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm print:px-2 print:py-2">
                          {getStatusBadge(row.col6)}
                        </td>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={tableData.columns.length} className="px-6 py-12 text-center text-gray-500">
                      No data found for the selected period.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination Footer */}
          <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-white text-sm text-gray-500 print:hidden">
            <span>Showing <span className="font-semibold text-gray-900">{tableData.rows.length}</span> results</span>
            <div className="flex space-x-1">
              <button className="cursor-pointer px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed" disabled>Previous</button>
              <button className="cursor-pointer px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50">Next</button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

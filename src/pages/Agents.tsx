import React, { useState, useEffect, useMemo } from 'react';
import { Download, Search, Users, Phone, Mail, ShieldAlert, Loader2, Filter, IdCard, RefreshCw, MessageSquare, MessageCircle, ExternalLink } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import Papa from 'papaparse';
import { cn } from '../lib/utils';

const SHEET_ID = '1f6cGi1jKQoFvS4URB4oAR6RpFdfKmLFKuh2QygGnDTU';

const CARD_COLORS = [
  {
    border: 'border-red-200 hover:border-red-300',
    blob: 'from-red-50',
    iconBg: 'bg-red-50',
    iconBorder: 'border-red-100',
    iconText: 'text-red-600',
    titleHover: 'group-hover:text-red-700',
  },
  {
    border: 'border-blue-200 hover:border-blue-300',
    blob: 'from-blue-50',
    iconBg: 'bg-blue-50',
    iconBorder: 'border-blue-100',
    iconText: 'text-blue-600',
    titleHover: 'group-hover:text-blue-700',
  },
  {
    border: 'border-green-200 hover:border-green-300',
    blob: 'from-green-50',
    iconBg: 'bg-green-50',
    iconBorder: 'border-green-100',
    iconText: 'text-green-600',
    titleHover: 'group-hover:text-green-700',
  },
  {
    border: 'border-purple-200 hover:border-purple-300',
    blob: 'from-purple-50',
    iconBg: 'bg-purple-50',
    iconBorder: 'border-purple-100',
    iconText: 'text-purple-600',
    titleHover: 'group-hover:text-purple-700',
  },
  {
    border: 'border-orange-200 hover:border-orange-300',
    blob: 'from-orange-50',
    iconBg: 'bg-orange-50',
    iconBorder: 'border-orange-100',
    iconText: 'text-orange-600',
    titleHover: 'group-hover:text-orange-700',
  },
  {
    border: 'border-teal-200 hover:border-teal-300',
    blob: 'from-teal-50',
    iconBg: 'bg-teal-50',
    iconBorder: 'border-teal-100',
    iconText: 'text-teal-600',
    titleHover: 'group-hover:text-teal-700',
  },
  {
    border: 'border-pink-200 hover:border-pink-300',
    blob: 'from-pink-50',
    iconBg: 'bg-pink-50',
    iconBorder: 'border-pink-100',
    iconText: 'text-pink-600',
    titleHover: 'group-hover:text-pink-700',
  },
  {
    border: 'border-indigo-200 hover:border-indigo-300',
    blob: 'from-indigo-50',
    iconBg: 'bg-indigo-50',
    iconBorder: 'border-indigo-100',
    iconText: 'text-indigo-600',
    titleHover: 'group-hover:text-indigo-700',
  },
];

interface Agent {
  name: string;
  type: string;
  id: string;
  mobile: string;
  email: string;
}

export function Agents() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('All');
  
  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    setLoading(true);
    setError('');
    try {
      const timestamp = new Date().getTime();
      const response = await fetch(`https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&t=${timestamp}`, { cache: 'no-store' });
      if (!response.ok) {
        throw new Error('Failed to fetch data from Google Sheets.');
      }
      const csvText = await response.text();
      
      Papa.parse(csvText, {
        header: false,
        skipEmptyLines: true,
        complete: (results) => {
          const rows = results.data as string[][];
          
          // Assuming row 0 is header, start from row 1
          // Columns: B(1) Name, C(2) Type, D(3) ID, E(4) Mobile, F(5) Email
          const parsedAgents: Agent[] = [];
          for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            if (row.length >= 6 && row[1]?.trim()) {
              parsedAgents.push({
                name: row[1]?.trim() || 'N/A',
                type: row[2]?.trim() || 'N/A',
                id: row[3]?.trim() || 'N/A',
                mobile: row[4]?.trim() || 'N/A',
                email: row[5]?.trim() || 'N/A',
              });
            }
          }
          setAgents(parsedAgents);
          setLoading(false);
        },
        error: (err: any) => {
          setError('Failed to parse agent data.');
          setLoading(false);
        }
      });
    } catch (err: any) {
      setError(err.message || 'Error fetching data. Ensure the Google Sheet is accessible.');
      setLoading(false);
    }
  };

  const agentTypes = useMemo(() => {
    const types = new Set(agents.map(a => a.type));
    return ['All', ...Array.from(types).filter(t => t !== 'N/A')].sort();
  }, [agents]);

  const filteredAgents = useMemo(() => {
    return agents.filter(agent => {
      const matchesSearch = agent.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            agent.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = selectedType === 'All' || agent.type === selectedType;
      return matchesSearch && matchesType;
    });
  }, [agents, searchQuery, selectedType]);

  const exportPDF = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(220, 38, 38); // India Post Red
    doc.text('India Post - Dhenkanal RS SO', 14, 22);
    
    doc.setFontSize(14);
    doc.setTextColor(50, 50, 50);
    doc.text('Agent Details Report', 14, 32);
    
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 40);
    
    const tableColumn = ["Agent Name", "Agent ID", "Type", "Mobile No.", "Email ID"];
    const tableRows = filteredAgents.map(agent => [
      agent.name,
      agent.id,
      agent.type,
      agent.mobile,
      agent.email
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 45,
      theme: 'grid',
      headStyles: { fillColor: [220, 38, 38], textColor: [255, 255, 255] },
      alternateRowStyles: { fillColor: [250, 240, 240] },
      styles: { fontSize: 9, cellPadding: 3 },
    });

    doc.save('Agent_Details_Report.pdf');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header Section */}
      <div className="bg-white rounded-[2rem] shadow-xl border border-neutral-100 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-600 opacity-5 rounded-bl-[100px] z-0 pointer-events-none"></div>
        
        <div className="p-8 sm:p-10 relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <div className="inline-flex items-center space-x-2 bg-red-50 text-red-700 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4 border border-red-100">
              <Users className="w-4 h-4" />
              <span>Directory</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-neutral-900 tracking-tight">Agent Details</h1>
            <p className="text-neutral-500 mt-2 text-lg font-medium">Comprehensive database of all registered agents.</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <a
              href="https://agentcodedetails.edgeone.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-neutral-900 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-neutral-800 transition-colors shadow-sm"
            >
              <ExternalLink className="w-5 h-5" />
              Data Submit
            </a>
            <button
              onClick={() => fetchAgents()}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white border border-neutral-200 text-neutral-700 px-5 py-2.5 rounded-xl font-bold hover:bg-neutral-50 hover:text-red-600 transition-colors shadow-sm"
              disabled={loading}
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><RefreshCw className="w-5 h-5" /> Sync Data</>}
            </button>
            <button
              onClick={exportPDF}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-red-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-red-700 transition-colors shadow-md hover:shadow-red-600/30"
              disabled={filteredAgents.length === 0}
            >
              <Download className="w-5 h-5" />
              Export PDF
            </button>
          </div>
        </div>
        
        {/* Filters Section */}
        <div className="bg-neutral-50 p-6 border-t border-neutral-100 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:max-w-xs">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-neutral-400" />
            </div>
            <input
              type="text"
              placeholder="Search by Name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full px-4 py-2.5 bg-white border border-neutral-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm font-medium"
            />
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Filter className="w-5 h-5 text-neutral-500 hidden sm:block" />
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full sm:w-auto px-4 py-2.5 bg-white border border-neutral-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm font-medium"
            >
              {agentTypes.map(type => (
                <option key={type} value={type}>{type === 'All' ? 'All Agent Types' : type}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl flex items-start shadow-sm">
          <ShieldAlert className="w-5 h-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
          <div className="text-red-800 text-sm font-medium">
            <p className="font-bold mb-1">Error Loading Data</p>
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && agents.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2rem] border border-neutral-100 shadow-sm">
          <Loader2 className="w-12 h-12 text-red-600 animate-spin mb-4" />
          <p className="text-neutral-500 font-medium">Fetching agent records from Google Sheets...</p>
        </div>
      )}

      {/* Agents Grid */}
      {!loading && filteredAgents.length === 0 && !error && (
        <div className="text-center py-16 bg-white rounded-[2rem] border border-neutral-100 shadow-sm">
          <Users className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-neutral-900 mb-2">No Agents Found</h3>
          <p className="text-neutral-500">Try adjusting your search criteria or filters.</p>
        </div>
      )}

      {filteredAgents.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredAgents.map((agent, index) => {
            const color = CARD_COLORS[index % CARD_COLORS.length];
            return (
            <div 
              key={index}
              className={`bg-white rounded-2xl p-6 border-2 shadow-sm ${color.border} hover:shadow-lg transition-all group relative overflow-hidden`}
            >
              <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl ${color.blob} to-transparent opacity-50 rounded-bl-full z-0`}></div>
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 rounded-xl ${color.iconBg} border ${color.iconBorder} ${color.iconText} flex items-center justify-center font-bold text-lg shadow-sm`}>
                      {agent.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className={`text-lg font-bold text-neutral-900 leading-tight ${color.titleHover} transition-colors`}>{agent.name}</h3>
                      <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider mt-0.5">{agent.type}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mt-5 pt-5 border-t border-neutral-100">
                  <div className="flex items-center text-sm">
                    <div className="w-8 h-8 rounded-lg bg-neutral-50 flex items-center justify-center mr-3 border border-neutral-100">
                      <IdCard className="w-4 h-4 text-neutral-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] uppercase font-bold text-neutral-400">Agent ID</p>
                      <p className="font-semibold text-neutral-800 break-all">{agent.id}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-sm">
                    <div className="w-8 h-8 rounded-lg bg-neutral-50 flex items-center justify-center mr-3 border border-neutral-100">
                      <Phone className="w-4 h-4 text-neutral-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] uppercase font-bold text-neutral-400">Mobile</p>
                      <p className="font-semibold text-neutral-800 break-all">{agent.mobile}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-sm">
                    <div className="w-8 h-8 rounded-lg bg-neutral-50 flex items-center justify-center mr-3 border border-neutral-100">
                      <Mail className="w-4 h-4 text-neutral-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] uppercase font-bold text-neutral-400">Email</p>
                      <p className="font-semibold text-neutral-800 break-words">{agent.email}</p>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="mt-5 pt-5 border-t border-neutral-100 flex items-center justify-between gap-2">
                  <a href={`tel:${agent.mobile}`} className="flex-1 flex items-center justify-center py-2.5 bg-neutral-50 hover:bg-red-50 text-neutral-600 hover:text-red-600 rounded-xl transition-colors border border-transparent hover:border-red-100" title="Call">
                    <Phone className="w-4 h-4" />
                  </a>
                  <a href={`sms:${agent.mobile}`} className="flex-1 flex items-center justify-center py-2.5 bg-neutral-50 hover:bg-blue-50 text-neutral-600 hover:text-blue-600 rounded-xl transition-colors border border-transparent hover:border-blue-100" title="SMS">
                    <MessageSquare className="w-4 h-4" />
                  </a>
                  <a href={`https://wa.me/91${agent.mobile.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center py-2.5 bg-neutral-50 hover:bg-green-50 text-neutral-600 hover:text-green-600 rounded-xl transition-colors border border-transparent hover:border-green-100" title="WhatsApp">
                    <MessageCircle className="w-4 h-4" />
                  </a>
                  <a href={`mailto:${agent.email}`} className="flex-1 flex items-center justify-center py-2.5 bg-neutral-50 hover:bg-yellow-50 text-neutral-600 hover:text-yellow-600 rounded-xl transition-colors border border-transparent hover:border-yellow-100" title="Email">
                    <Mail className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          );
          })}
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect, useMemo } from 'react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { 
  Search, 
  MapPin, 
  Phone, 
  Copy, 
  CheckCircle2, 
  Building2, 
  Users, 
  Download,
  AlertCircle,
  Mail,
  Navigation,
  ExternalLink
} from 'lucide-react';
import { cn } from '../lib/utils';

interface BranchOffice {
  slNo: string;
  name: string;
  officeId: string;
  solId: string;
  bpmName: string;
  bpmMobile: string;
  deliveryStaffName: string;
  deliveryStaffMobile: string;
  mailCarrierName: string;
  mailCarrierMobile: string;
  digipin: string;
  longitude: string;
  latitude: string;
}

const SHEET_URL = 'https://docs.google.com/spreadsheets/d/1oJCKMDVJdnbO4rdUXB1jCxKvIJrC3wbSzl-65E8rEhs/export?format=csv&gid=642131382';

// Caching in memory during the session
let cachedData: BranchOffice[] | null = null;

export function BranchOffices() {
  const [data, setData] = useState<BranchOffice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'officeId' | 'bpmName' | 'solId'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (cachedData) {
        setData(cachedData);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(SHEET_URL);
        if (!response.ok) throw new Error('Failed to fetch data');
        const csvText = await response.text();
        
        Papa.parse(csvText, {
          skipEmptyLines: true,
          complete: (results) => {
            const rows = results.data as string[][];
            // Skip header row
            const parsedData: BranchOffice[] = rows.slice(1).map((row) => ({
              slNo: row[0]?.trim() || '',
              name: row[1]?.trim() || '',
              officeId: row[2]?.trim() || '',
              solId: row[3]?.trim() || '',
              bpmName: row[4]?.trim() || '',
              bpmMobile: row[5]?.trim() || '',
              deliveryStaffName: row[6]?.trim() || '',
              deliveryStaffMobile: row[7]?.trim() || '',
              mailCarrierName: row[8]?.trim() || '',
              mailCarrierMobile: row[9]?.trim() || '',
              digipin: row[10]?.trim() || '',
              longitude: row[11]?.trim() || '',
              latitude: row[12]?.trim() || '',
            }));
            
            cachedData = parsedData;
            setData(parsedData);
            setLoading(false);
          },
          error: (err: any) => {
            console.error('CSV Parsing Error:', err);
            setError('Unable to parse Branch Office data.');
            setLoading(false);
          }
        });
      } catch (err) {
        console.error('Fetch Error:', err);
        setError('Unable to fetch Branch Office data.\nPlease try again later.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCopy = (text: string, id: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExport = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredAndSortedData.map(bo => ({
      'Sl No': bo.slNo,
      'Branch Office Name': bo.name,
      'Office ID': bo.officeId,
      'BO SOL ID': bo.solId,
      'Name of BPM': bo.bpmName,
      'Mobile Number of BPM': bo.bpmMobile,
      'Name of Delivery Staff': bo.deliveryStaffName,
      'Mobile Number of Delivery Staff': bo.deliveryStaffMobile,
      'Name of Mail Carrier': bo.mailCarrierName,
      'Mobile Number of Mail Carrier': bo.mailCarrierMobile,
      'DIGIPIN': bo.digipin,
      'Longitude': bo.longitude,
      'Latitude': bo.latitude
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Branch Offices');
    XLSX.writeFile(workbook, 'Branch_Offices.xlsx');
  };

  const filteredAndSortedData = useMemo(() => {
    let result = [...data];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(bo => 
        bo.name.toLowerCase().includes(q) ||
        bo.bpmName.toLowerCase().includes(q) ||
        bo.officeId.toLowerCase().includes(q) ||
        bo.solId.toLowerCase().includes(q) ||
        bo.digipin.toLowerCase().includes(q) ||
        bo.bpmMobile.includes(q) ||
        bo.deliveryStaffMobile.includes(q) ||
        bo.mailCarrierMobile.includes(q)
      );
    }

    result.sort((a, b) => {
      let valA = a[sortBy].toLowerCase();
      let valB = b[sortBy].toLowerCase();
      
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [data, searchQuery, sortBy, sortOrder]);

  const stats = useMemo(() => {
    return {
      total: data.length,
      bpms: data.filter(d => d.bpmName).length,
      deliveryStaff: data.filter(d => d.deliveryStaffName).length,
      mailCarriers: data.filter(d => d.mailCarrierName).length,
    };
  }, [data]);

  const toggleSort = (field: 'name' | 'officeId' | 'bpmName' | 'solId') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight flex items-center gap-2">
            <Building2 className="h-8 w-8 text-red-600" />
            Branch Offices
          </h1>
          <p className="text-neutral-500 mt-2 font-medium flex flex-wrap items-center gap-2">
            Directory and contact details of all connected branch offices.
            <span className="text-xs bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded font-bold border border-neutral-200">Data Sheet Access - User ID: 10166284 | Pass: Dop@1234</span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <a 
            href="https://docs.google.com/spreadsheets/d/1oJCKMDVJdnbO4rdUXB1jCxKvIJrC3wbSzl-65E8rEhs/edit?gid=642131382#gid=642131382"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-neutral-900 text-white hover:bg-neutral-800 font-bold px-4 py-2 rounded-lg shadow-sm transition-colors w-full md:w-auto self-start"
          >
            <ExternalLink className="h-4 w-4" /> Data Sheet
          </a>
          <button 
            onClick={handleExport}
            className="flex items-center justify-center gap-2 bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50 hover:text-red-600 font-bold px-4 py-2 rounded-lg shadow-sm transition-colors w-full md:w-auto self-start"
          >
            <Download className="h-4 w-4" /> Export to Excel
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-neutral-100 flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0 text-red-600">
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-neutral-500 uppercase">Total Offices</p>
            <p className="text-2xl font-black text-neutral-800">{stats.total}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-neutral-100 flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0 text-blue-600">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-neutral-500 uppercase">Total BPMs</p>
            <p className="text-2xl font-black text-neutral-800">{stats.bpms}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-neutral-100 flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0 text-green-600">
            <Mail className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-neutral-500 uppercase">Delivery Staff</p>
            <p className="text-2xl font-black text-neutral-800">{stats.deliveryStaff}</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-neutral-100 flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-orange-50 flex items-center justify-center flex-shrink-0 text-orange-600">
            <Navigation className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-neutral-500 uppercase">Mail Carriers</p>
            <p className="text-2xl font-black text-neutral-800">{stats.mailCarriers}</p>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-neutral-100">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-neutral-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-3 border border-neutral-200 rounded-lg bg-neutral-50 focus:bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors text-neutral-900 font-medium"
            placeholder="Search by Name, Office ID, SOL ID, DIGIPIN, or Mobile Number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="mt-4 flex flex-wrap gap-2 items-center text-sm">
          <span className="font-bold text-neutral-500 uppercase mr-2">Sort By:</span>
          {[
            { id: 'name', label: 'Branch Name' },
            { id: 'officeId', label: 'Office ID' },
            { id: 'bpmName', label: 'BPM Name' },
            { id: 'solId', label: 'SOL ID' }
          ].map(opt => (
            <button
              key={opt.id}
              onClick={() => toggleSort(opt.id as any)}
              className={cn(
                "px-3 py-1.5 rounded-md font-bold transition-colors",
                sortBy === opt.id 
                  ? "bg-red-100 text-red-700" 
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
              )}
            >
              {opt.label} {sortBy === opt.id && (sortOrder === 'asc' ? '↑' : '↓')}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-neutral-500">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600 mb-4"></div>
          <p className="font-bold text-lg">Loading Branch Offices...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 flex flex-col items-center justify-center text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mb-3" />
          <p className="text-red-700 font-bold text-lg whitespace-pre-line">{error}</p>
        </div>
      ) : filteredAndSortedData.length === 0 ? (
        <div className="bg-white border border-neutral-100 rounded-xl p-12 text-center shadow-sm">
          <Building2 className="h-12 w-12 text-neutral-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-neutral-800">No Branch Offices Found</h3>
          <p className="text-neutral-500 mt-1">Try adjusting your search criteria.</p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden lg:block bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-neutral-50 border-b border-neutral-200 text-xs uppercase tracking-wider text-neutral-500 font-bold sticky top-0 z-10">
                    <th className="px-4 py-4">Branch Details</th>
                    <th className="px-4 py-4">BPM</th>
                    <th className="px-4 py-4">Delivery Staff</th>
                    <th className="px-4 py-4">Mail Carrier</th>
                    <th className="px-4 py-4">Location</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 align-top">
                  {filteredAndSortedData.map((bo, idx) => (
                    <tr key={idx} className="hover:bg-neutral-50/50 transition-colors">
                      <td className="px-4 py-4">
                        <div className="font-extrabold text-neutral-900 text-sm mb-1">{bo.name}</div>
                        <div className="flex items-center gap-3 text-xs">
                          <div className="flex items-center text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded">
                            <span className="font-bold mr-1 text-neutral-400">ID:</span> {bo.officeId}
                            <button onClick={() => handleCopy(bo.officeId, `${bo.officeId}-id`)} className="ml-1.5 text-neutral-400 hover:text-red-600">
                              {copiedId === `${bo.officeId}-id` ? <CheckCircle2 className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                            </button>
                          </div>
                          <div className="flex items-center text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded">
                            <span className="font-bold mr-1 text-neutral-400">SOL:</span> {bo.solId}
                            <button onClick={() => handleCopy(bo.solId, `${bo.officeId}-sol`)} className="ml-1.5 text-neutral-400 hover:text-red-600">
                              {copiedId === `${bo.officeId}-sol` ? <CheckCircle2 className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                            </button>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        {bo.bpmName ? (
                          <>
                            <div className="font-bold text-blue-900 text-sm">{bo.bpmName}</div>
                            {bo.bpmMobile && (
                              <div className="flex items-center gap-1.5 mt-1.5">
                                <a href={`tel:${bo.bpmMobile}`} className="inline-flex items-center gap-1 text-xs font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 px-2 py-1 rounded transition-colors">
                                  <Phone className="h-3 w-3" /> {bo.bpmMobile}
                                </a>
                              </div>
                            )}
                          </>
                        ) : (
                          <span className="text-neutral-400 text-xs italic">Not assigned</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        {bo.deliveryStaffName ? (
                          <>
                            <div className="font-bold text-green-900 text-sm">{bo.deliveryStaffName}</div>
                            {bo.deliveryStaffMobile && (
                              <div className="flex items-center gap-1.5 mt-1.5">
                                <a href={`tel:${bo.deliveryStaffMobile}`} className="inline-flex items-center gap-1 text-xs font-bold bg-green-50 text-green-700 hover:bg-green-100 px-2 py-1 rounded transition-colors">
                                  <Phone className="h-3 w-3" /> {bo.deliveryStaffMobile}
                                </a>
                              </div>
                            )}
                          </>
                        ) : (
                          <span className="text-neutral-400 text-xs italic">Not assigned</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        {bo.mailCarrierName ? (
                          <>
                            <div className="font-bold text-orange-900 text-sm">{bo.mailCarrierName}</div>
                            {bo.mailCarrierMobile && (
                              <div className="flex items-center gap-1.5 mt-1.5">
                                <a href={`tel:${bo.mailCarrierMobile}`} className="inline-flex items-center gap-1 text-xs font-bold bg-orange-50 text-orange-700 hover:bg-orange-100 px-2 py-1 rounded transition-colors">
                                  <Phone className="h-3 w-3" /> {bo.mailCarrierMobile}
                                </a>
                              </div>
                            )}
                          </>
                        ) : (
                          <span className="text-neutral-400 text-xs italic">Not assigned</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div className="space-y-2">
                          {bo.digipin && (
                            <div className="flex items-center text-purple-700 bg-purple-50 px-2 py-1 rounded w-max text-xs font-bold border border-purple-100">
                              <span className="uppercase text-purple-500 mr-1.5 text-[10px]">DIGIPIN</span> {bo.digipin}
                              <button onClick={() => handleCopy(bo.digipin, `${bo.officeId}-pin`)} className="ml-2 text-purple-400 hover:text-purple-700">
                                {copiedId === `${bo.officeId}-pin` ? <CheckCircle2 className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                              </button>
                            </div>
                          )}
                          {bo.latitude && bo.longitude && bo.latitude !== '0' && bo.longitude !== '0' ? (
                            <a 
                              href={`https://www.google.com/maps?q=${bo.latitude},${bo.longitude}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs font-bold bg-neutral-900 text-white hover:bg-neutral-800 px-2.5 py-1.5 rounded transition-colors"
                            >
                              <MapPin className="h-3 w-3" /> View Map
                            </a>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-bold bg-neutral-100 text-neutral-400 px-2.5 py-1.5 rounded cursor-not-allowed">
                              <MapPin className="h-3 w-3" /> No Map Data
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:hidden">
            {filteredAndSortedData.map((bo, idx) => (
              <div key={idx} className="bg-white rounded-xl shadow-sm border border-neutral-200 p-5 space-y-4">
                <div className="border-b border-neutral-100 pb-3">
                  <h3 className="font-extrabold text-neutral-900 text-lg">{bo.name}</h3>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <div className="flex items-center text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded text-xs">
                      <span className="font-bold mr-1 text-neutral-400">ID:</span> {bo.officeId}
                      <button onClick={() => handleCopy(bo.officeId, `${bo.officeId}-m-id`)} className="ml-1.5 text-neutral-400 hover:text-red-600">
                        {copiedId === `${bo.officeId}-m-id` ? <CheckCircle2 className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                      </button>
                    </div>
                    <div className="flex items-center text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded text-xs">
                      <span className="font-bold mr-1 text-neutral-400">SOL:</span> {bo.solId}
                      <button onClick={() => handleCopy(bo.solId, `${bo.officeId}-m-sol`)} className="ml-1.5 text-neutral-400 hover:text-red-600">
                        {copiedId === `${bo.officeId}-m-sol` ? <CheckCircle2 className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {/* BPM */}
                  <div>
                    <p className="text-[10px] font-black uppercase text-blue-500 tracking-wider mb-0.5">BPM</p>
                    {bo.bpmName ? (
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-blue-900 text-sm">{bo.bpmName}</span>
                        {bo.bpmMobile && (
                          <a href={`tel:${bo.bpmMobile}`} className="inline-flex items-center justify-center bg-blue-50 text-blue-700 hover:bg-blue-100 h-8 w-8 rounded-full transition-colors shrink-0">
                            <Phone className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                    ) : <span className="text-neutral-400 text-xs italic">Not assigned</span>}
                  </div>

                  {/* Delivery Staff */}
                  <div>
                    <p className="text-[10px] font-black uppercase text-green-500 tracking-wider mb-0.5">Delivery Staff</p>
                    {bo.deliveryStaffName ? (
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-green-900 text-sm">{bo.deliveryStaffName}</span>
                        {bo.deliveryStaffMobile && (
                          <a href={`tel:${bo.deliveryStaffMobile}`} className="inline-flex items-center justify-center bg-green-50 text-green-700 hover:bg-green-100 h-8 w-8 rounded-full transition-colors shrink-0">
                            <Phone className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                    ) : <span className="text-neutral-400 text-xs italic">Not assigned</span>}
                  </div>

                  {/* Mail Carrier */}
                  <div>
                    <p className="text-[10px] font-black uppercase text-orange-500 tracking-wider mb-0.5">Mail Carrier</p>
                    {bo.mailCarrierName ? (
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-orange-900 text-sm">{bo.mailCarrierName}</span>
                        {bo.mailCarrierMobile && (
                          <a href={`tel:${bo.mailCarrierMobile}`} className="inline-flex items-center justify-center bg-orange-50 text-orange-700 hover:bg-orange-100 h-8 w-8 rounded-full transition-colors shrink-0">
                            <Phone className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                    ) : <span className="text-neutral-400 text-xs italic">Not assigned</span>}
                  </div>
                </div>

                <div className="pt-3 border-t border-neutral-100 flex flex-wrap items-center justify-between gap-3">
                  {bo.digipin && (
                    <div className="flex items-center text-purple-700 bg-purple-50 px-2.5 py-1.5 rounded text-xs font-bold border border-purple-100">
                      <span className="uppercase text-purple-500 mr-2 text-[10px]">DIGIPIN</span> {bo.digipin}
                      <button onClick={() => handleCopy(bo.digipin, `${bo.officeId}-m-pin`)} className="ml-2 text-purple-400 hover:text-purple-700">
                        {copiedId === `${bo.officeId}-m-pin` ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  )}
                  {bo.latitude && bo.longitude && bo.latitude !== '0' && bo.longitude !== '0' ? (
                    <a 
                      href={`https://www.google.com/maps?q=${bo.latitude},${bo.longitude}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold bg-neutral-900 text-white hover:bg-neutral-800 px-3 py-2 rounded-lg transition-colors ml-auto"
                    >
                      <MapPin className="h-3.5 w-3.5" /> Map
                    </a>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-neutral-100 text-neutral-400 px-3 py-2 rounded-lg cursor-not-allowed ml-auto">
                      <MapPin className="h-3.5 w-3.5" /> No Map
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

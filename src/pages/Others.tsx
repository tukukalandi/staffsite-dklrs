import { FolderOpen, ExternalLink, QrCode, Receipt, Mail, Wrench, X, Copy, Download } from 'lucide-react';
import { useState } from 'react';

function LinkCard({ 
  title, 
  description, 
  link, 
  icon: Icon, 
  bgColor, 
  borderColor,
  themeColor
}: { 
  title: string, 
  description: string, 
  link: string, 
  icon: any, 
  bgColor: string, 
  borderColor: string,
  themeColor: string
}) {
  const [showQR, setShowQR] = useState(false);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(link);
    alert('Link copied to clipboard!');
  };

  const handleDownload = () => {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(link)}`;
    
    fetch(qrUrl)
      .then(response => response.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `${title.replace(/\s+/g, '_').toLowerCase()}_qr.png`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      })
      .catch(() => alert('Failed to download QR code.'));
  };

  return (
    <>
      <div className={`${bgColor} p-6 rounded-3xl border ${borderColor} flex flex-col hover:shadow-md transition-all relative`}>
        <div className="flex justify-between items-start mb-4">
          <div className="h-12 w-12 bg-white/20 text-white rounded-xl flex items-center justify-center shadow-sm backdrop-blur-sm">
            <Icon className="h-6 w-6" />
          </div>
          <a href={link} target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white transition-colors p-1">
            <ExternalLink className="h-5 w-5" />
          </a>
        </div>
        
        <h3 className="text-lg font-extrabold text-white mb-1 tracking-tight">
          {title}
        </h3>
        <p className="text-white/80 text-[13px] font-medium mb-6">
          {description}
        </p>
        
        <div className="border-t border-dashed border-white/20 w-full mb-4"></div>
        
        <div className="flex justify-between items-center">
          <button 
            onClick={() => setShowQR(true)}
            className="flex items-center gap-2 bg-white px-4 py-2 rounded-full text-xs font-bold text-neutral-700 shadow-sm border border-neutral-100 hover:bg-neutral-50 transition-colors"
          >
            <QrCode className="h-4 w-4 text-neutral-500" /> View QR Code
          </button>
          
          <a 
            href={link} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-white font-bold text-[13px] tracking-wide hover:text-white/80 transition-colors pr-2 uppercase"
          >
            Visit Site
          </a>
        </div>
      </div>

      {showQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-[2rem] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="h-2 w-full" style={{ backgroundColor: themeColor }}></div>
            <div className="p-6 relative">
              <button 
                onClick={() => setShowQR(false)}
                className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-full transition-colors"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="flex flex-col items-center text-center mt-2 mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-10 w-10 text-white rounded-xl flex items-center justify-center shadow-sm" style={{ backgroundColor: themeColor }}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h2 className="text-xl font-extrabold text-[#1a2b3c] tracking-tight">{title}</h2>
                </div>
                <p className="text-neutral-500 text-sm font-medium px-4">
                  {description}
                </p>
              </div>

              <div className="bg-neutral-50 p-6 rounded-3xl flex items-center justify-center mb-6">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(link)}`} 
                  alt={`${title} QR Code`} 
                  className="w-48 h-48 object-contain rounded-xl"
                />
              </div>

              <div className="bg-neutral-50 rounded-2xl p-4 text-center mb-6 border border-neutral-100">
                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1">Target Address</p>
                <p className="text-sm font-medium text-neutral-700 truncate">{link}</p>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={handleCopy}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-neutral-200 text-sm font-bold text-neutral-700 hover:bg-neutral-50 transition-colors"
                >
                  <Copy className="h-4 w-4" /> Copy Link
                </button>
                <button 
                  onClick={handleDownload}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white shadow-sm transition-opacity hover:opacity-90"
                  style={{ backgroundColor: themeColor }}
                >
                  <Download className="h-4 w-4" /> Save QR
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function Others() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-neutral-200">
        <div>
          <h1 className="text-3xl font-extrabold text-neutral-900 flex items-center gap-3">
            <FolderOpen className="h-8 w-8 text-red-600" />
            Others
          </h1>
          <p className="text-neutral-500 mt-2 font-medium">
            Miscellaneous resources, guidelines, and additional links.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <LinkCard 
          title="TD BILL GENERATOR"
          description="Generate TD commission bills automatically."
          link="https://td-commission-bill-generator.vercel.app/"
          icon={Receipt}
          bgColor="bg-[#742A87]"
          borderColor="border-[#8b34a1]"
          themeColor="#742A87"
        />
        <LinkCard 
          title="ePOST"
          description="Send electronic messages as physical letters."
          link="https://epost-indiapost.gov.in/Home.aspx"
          icon={Mail}
          bgColor="bg-[#0a9b60]"
          borderColor="border-[#0eac6b]"
          themeColor="#0a9b60"
        />
        <LinkCard 
          title="PMV Tkt Raise"
          description="Access the PMV Toolkit for utility tools."
          link="https://pmv-toolkit.vercel.app/"
          icon={Wrench}
          bgColor="bg-[#2563eb]"
          borderColor="border-[#1d4ed8]"
          themeColor="#2563eb"
        />
      </div>
    </div>
  );
}

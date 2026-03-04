
import React from 'react';
import { Camera, ScanLine, Search } from 'lucide-react';

interface SearchSectionProps {
  searchInputRef: React.RefObject<HTMLInputElement | null>;
  searchPhone: string;
  setSearchPhone: (val: string) => void;
  executeSearch: (term?: string) => void;
  setShowScanner: (val: boolean) => void;
  errorMsg: string;
}

export const SearchSection: React.FC<SearchSectionProps> = ({
  searchInputRef, searchPhone, setSearchPhone, executeSearch, setShowScanner, errorMsg
}) => {
  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
      <div className="glass-dark rounded-3xl p-6 shadow-2xl border border-white/10 backdrop-blur-2xl">
        <div className="relative mb-4">
          <ScanLine className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 w-5 h-5" />
          <input
            ref={searchInputRef}
            placeholder="手机号后4位或确认码 Phone (Last 4) or Confirmation ID"
            className="w-full pl-12 pr-4 py-5 bg-white/5 rounded-2xl font-bold text-lg sm:text-xl text-white outline-none border-2 border-transparent focus:border-cny-gold focus:bg-white/10 transition-all placeholder:font-normal placeholder:text-white/30 placeholder:text-sm sm:placeholder:text-base shadow-inner"
            value={searchPhone}
            onChange={e => setSearchPhone(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && executeSearch()}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => setShowScanner(true)} className="flex items-center justify-center gap-2 py-4 bg-white/10 text-white rounded-2xl font-bold transition active:scale-95 tracking-widest hover:bg-white/20 shadow-lg border border-white/5">
            <Camera className="w-5 h-5 text-gray-300" /> 扫码 <span className="text-lg">Scan QR</span>
          </button>
          <button onClick={() => executeSearch()} className="flex items-center justify-center gap-2 py-4 bg-cny-gold text-cny-dark rounded-2xl font-bold transition active:scale-95 tracking-widest hover:shadow-cny-gold/40 shadow-lg shadow-cny-gold/20">
            <Search className="w-5 h-5" /> 搜索 <span className="text-lg">Search</span>
          </button>
        </div>
        {errorMsg && <p className="text-center text-red-400 text-xs font-bold mt-4 uppercase animate-shake drop-shadow-md">{errorMsg}</p>}
      </div>
    </div>
  );
};

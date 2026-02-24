
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
      <div className="bg-white rounded-3xl p-6 shadow-2xl border-t-8 border-cny-red">
        <div className="relative mb-4">
          <ScanLine className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5" />
          <input 
            ref={searchInputRef}
            placeholder="手机号或ID (Phone or ID)" 
            className="w-full pl-12 pr-4 py-5 bg-gray-50 rounded-2xl font-bold text-xl outline-none border-2 border-transparent focus:border-cny-red transition-all placeholder:font-normal placeholder:text-gray-300"
            value={searchPhone}
            onChange={e => setSearchPhone(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && executeSearch()}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => setShowScanner(true)} className="flex items-center justify-center gap-2 py-4 bg-gray-900 text-white rounded-2xl font-bold text-sm uppercase transition active:scale-95 tracking-widest hover:bg-black">
            <Camera className="w-4 h-4" /> 扫码扫描
          </button>
          <button onClick={() => executeSearch()} className="flex items-center justify-center gap-2 py-4 bg-cny-red text-white rounded-2xl font-bold text-sm uppercase transition active:scale-95 tracking-widest hover:bg-cny-dark">
            <Search className="w-4 h-4" /> 搜索记录
          </button>
        </div>
        {errorMsg && <p className="text-center text-red-500 text-xs font-bold mt-4 uppercase animate-shake">{errorMsg}</p>}
      </div>
    </div>
  );
};


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
    <div className="animate-in fade-in slide-in-from-bottom-4 px-1 pb-4">
      <div className="relative flex items-center group">
        <Search className="absolute left-5 text-white/40 w-6 h-6 pointer-events-none group-focus-within:text-cny-gold transition-colors" />
        <input
          ref={searchInputRef}
          placeholder="Phone (Last 4) or ID..."
          className="w-full pl-14 pr-[72px] py-4 sm:py-5 bg-black/40 backdrop-blur-2xl rounded-full font-bold text-lg sm:text-xl text-white outline-none border border-white/15 focus:border-cny-gold focus:bg-black/60 transition-all placeholder:font-normal placeholder:text-white/40 placeholder:text-sm sm:placeholder:text-base shadow-2xl"
          value={searchPhone}
          onChange={e => setSearchPhone(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && executeSearch()}
        />
        <button
          onClick={() => setShowScanner(true)}
          className="absolute right-2 flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-cny-red text-white rounded-full hover:bg-cny-dark transition-all shadow-lg active:scale-95 z-10"
          title="Scan QR Code"
        >
          <Camera className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>
      {errorMsg && (
        <p className="text-center text-red-400 text-[10px] sm:text-xs font-black mt-4 uppercase tracking-[0.2em] animate-shake drop-shadow-md bg-black/40 rounded-full py-2 w-max mx-auto px-6 backdrop-blur-md border border-red-500/30 shadow-2xl">
          {errorMsg}
        </p>
      )}
    </div>
  );
};
